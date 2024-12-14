import { createHash } from 'crypto'
import { readFile } from './services/file'
import { LoggerFactory } from './services/logger'
import { request, RequestResponse } from './services/webApi'
import { mstv } from './services/mstv'
import { currentDate, DateLevel } from './utilities/currentDate'
import { calendar, ClockHistoryEntry } from './services/calendar'
import { ClockFormType } from './domains/clockForm'
import { GlobalSettingsType, UserProfileType } from './domains/userProfile'
import axios from 'axios'

const CONFIGURATION_FILE = '../../xfriend.config.json'
const logger = LoggerFactory('Main')
axios.defaults.withCredentials = true

const main = async () => {
    // 提示 XFriend Auto 服务已启动
    logger.info(`XFriend Auto 服务启动`)

    // 获取 CONFIGURATION_FILE 中定义的配置
    const configuration = readFile(CONFIGURATION_FILE)
    const [userProfiles, globalSettings]: [
        UserProfileType[],
        GlobalSettingsType,
    ] = configuration as [UserProfileType[], GlobalSettingsType]

    // 所有推送信息
    const messages: string[] = []

    // 遍历 userProfiles 进行用户操作
    for (const userProfile of userProfiles) {
        // 登录获取 sessionId
        // const account: RequestResponse<{ sessionId: string }> = await request(
        //     'traineePlatform',
        //     'accountLogin',
        //     {
        //         params: {
        //             username: userProfile.phoneNumber,
        //             password: createHash('md5')
        //                 .update(userProfile.cipherWord)
        //                 .digest('hex'),
        //         },
        //     }
        // )
        console.info(userProfile)
        let sessionId = ''
        const account = await axios
            .request({
                url: 'https://www.xybsyw.com/login/login.action',
                params: {
                    username: userProfile.phoneNumber,
                    password: createHash('md5')
                        .update(userProfile.cipherWord)
                        .digest('hex'),
                    loginType: 'NORMAL',
                    userType: 'PERSON',
                },
            })
            .then(response => {
                sessionId =
                    response.headers['set-cookie']
                        ?.find(cookie => cookie.startsWith('JSESSIONID'))
                        ?.split(';')[0] || ''
                return response.data
            })
            .catch(error => console.error(error))
        console.info(account)
        // const { sessionId } = account.data

        logger.debug(`获取到用户的 Session 标识符为: ${sessionId}`)

        // 根据获取的 sessionId 拼接 cookie
        const cookie = `${sessionId}`

        // 查询用户信息获取 loginer
        const accountDetail: RequestResponse<{ loginer: string }> =
            await request('traineePlatform', 'accountDetail', {
                headers: { cookie },
            })
        const { loginer } = accountDetail.data

        logger.debug(`获取到用户的用户名为: ${loginer}`)

        // 检查用户的签到开启设置
        const isClockEnabled = userProfile.enabled || false
        if (isClockEnabled) {
            // 获取默认签到的 traineeId
            const clock: RequestResponse<{ clockVo: { traineeId: string } }> =
                await request('traineePlatform', 'clockDefault', {
                    headers: { cookie },
                })
            const { traineeId } = clock.data.clockVo
            logger.debug(`获取到默认签到的 traineeId 为: ${traineeId}`)

            // 获取默认签到的 postInfo
            const clockDetail: RequestResponse<{
                clockInfo: { inTime: string }
            }> = await request('traineePlatform', 'clockDetail', {
                headers: { cookie },
                params: {
                    traineeId,
                },
            })

            // 通过 clockInfo 中的 inTime 字段判断今日是否已签到
            const { inTime } = clockDetail.data.clockInfo || null

            // 解析 location 经纬度
            const location: RequestResponse<{
                regeocode: {
                    formatted_address: string
                    addressComponent: { adcode: string }
                }
            }> = await request('map', 'location', {
                params: {
                    key: globalSettings.apiKeys.map,
                    location: userProfile.location,
                    s: 'rsx',
                },
            })
            const { regeocode } = location
            const formatted_address = regeocode?.formatted_address
            const addressComponent = regeocode?.addressComponent
            const adcode = addressComponent?.adcode
            logger.debug(
                `经纬度解析地址为: ${formatted_address}, 邮编为: ${adcode}`
            )

            // 分离经纬度
            const [lng, lat] = userProfile.location.split(',').map(Number)

            // 签到表单
            const clockForm: ClockFormType = {
                traineeId,
                adcode: adcode || '',
                lat,
                lng,
                address: formatted_address || '',
                deviceName: userProfile.deviceName,
                punchInStatus: '1',
                clockStatus: '2', // 1 为签退，2 为签到
                addressId: null,
                imgUrl: '',
                reason: '',
            }

            // 进行签到
            const clockResult: RequestResponse<{ msg: string }> = await request(
                'traineePlatform',
                'clock',
                {
                    headers: { cookie, ...mstv(clockForm) },
                    params: { ...clockForm },
                }
            )
            const msg = clockResult.msg

            // 当 enableForceClock 启用时进行重新签到
            if (msg === 'success') {
                logger.info(`签到成功`)
            } else if (msg === '已经签到' && userProfile.enableForceClock) {
                logger.info(`重新签到已启用，正在重新签到`)

                const forceClockResult: RequestResponse<{ msg: string }> =
                    await request('traineePlatform', 'clockUpdate', {
                        headers: { cookie, ...mstv(clockForm) },
                        params: { ...clockForm },
                    })
                const msg = forceClockResult.msg

                if (msg === 'success') {
                    logger.info(`重新签到成功`)
                } else {
                    logger.error(`签到失败`)
                }
            } else {
                logger.warn(`已于 ${inTime} 已签到，无需再次签到`)
            }

            // 查询签到历史信息形成当月预览矩阵
            const currentMonth = currentDate('-', DateLevel.MONTH)
            const clockHistory: RequestResponse<{
                clockHistoryList: ClockHistoryEntry[]
            }> = await request('traineePlatform', 'clockHistory', {
                headers: { cookie },
                params: {
                    traineeId,
                    months: currentMonth,
                },
            })

            const [daysInMonth, clockedDays, clockHistoryCalendar] = calendar(
                clockHistory.data.clockHistoryList
            )
            logger.info(
                `${loginer} ${currentMonth} 月的签到历史\n[${clockedDays} / ${daysInMonth}]\n${clockHistoryCalendar}`
            )
            const message = `${loginer} (${clockedDays} / ${daysInMonth})\n${clockHistoryCalendar}`
            messages.push(message)

            logger.info(`${loginer}签到任务执行完成\n`)
        } else {
            logger.warn(`用户未开启签到`)
        }
    }

    // 发送签到完成通知信息
    const timeout = 6800
    const sendMessages = async () => {
        for (let i = 0; i < messages.length; i++) {
            // 为第一次之后的所有发信添加等待时间
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, timeout))
            }
            const message = messages[i]
            const { success }: RequestResponse<{ success: boolean }> =
                await request(
                    'qmsg',
                    'send',
                    {
                        params: {
                            msg: message,
                        },
                    },
                    globalSettings.apiKeys.qmsg
                )
            if (success) {
                logger.info(`信息 ${i + 1} 发信状态: 发信成功`)
            } else {
                logger.info(`信息 ${i + 1} 发信状态: 发信失败`)
            }
        }
    }

    // 等待所有信息发送完成
    await sendMessages()
}

main().then(() => {
    logger.info('当前所有任务已执行结束\n')
})
