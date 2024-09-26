import { createHash } from 'crypto'
import { readFile } from './services/file'
import { LoggerFactory } from './services/logger'
import { request } from './services/webApi'
import { mstv } from './services/mstv'
import { currentDate, DateLevel } from './utilities/currentDate'
import { calendar } from './services/calendar'

const CONFIGURATION_FILE = '../../xfriend.config.json'
const logger = LoggerFactory('Main')

interface UserProfile {
    enabled: boolean
    enableForceClock: boolean
    phoneNumber: string
    cipherWord: string
    location: string
    deviceName: string
}

const main = async () => {
    // 提示 XFriend Auto 服务已启动
    logger.info(`XFriend Auto 服务启动`)

    // 获取 CONFIGURATION_FILE 中定义的配置
    const userProfiles: UserProfile[] = readFile(
        CONFIGURATION_FILE
    ) as UserProfile[]

    // 遍历 userProfiles 进行用户操作
    for (const userProfile of userProfiles) {
        // 登录获取 sessionId 和 loginerId
        const account = await request('traineePlatform', 'accountLogin', {
            params: {
                username: userProfile.phoneNumber,
                password: createHash('md5')
                    .update(userProfile.cipherWord)
                    .digest('hex'),
            },
        })
        const { sessionId, loginerId } = account.data

        logger.debug(`获取到用户的 Loginer 标识符为: ${loginerId}`)
        logger.debug(`获取到用户的 Session 标识符为: ${sessionId}`)

        // 根据获取的 sessionId 拼接 cookie
        const cookie = `JSESSIONID=${sessionId}`

        // 查询用户信息获取 loginer
        const accountDetail = await request(
            'traineePlatform',
            'accountDetail',
            {
                headers: { cookie },
            }
        )
        const { loginer } = accountDetail.data

        logger.debug(`获取到用户的用户名为: ${loginer}`)

        // 检查用户的签到开启设置
        const isClockEnabled = userProfile.enabled || false
        if (isClockEnabled) {
            // 获取默认签到的 traineeId
            const clock = await request('traineePlatform', 'clockDefault', {
                headers: { cookie },
            })
            const { traineeId } = clock.data.clockVo
            logger.debug(`获取到默认签到的 traineeId 为: ${traineeId}`)

            // 获取默认签到的 postInfo
            const clockDetail = await request(
                'traineePlatform',
                'clockDetail',
                {
                    headers: { cookie },
                    params: {
                        traineeId,
                    },
                }
            )
            const { clockInfo } = clockDetail.data
            // 通过 clockInfo 中的 inTime 字段判断今日是否已签到
            const inTime = clockInfo || ''
            if (!!inTime) {
                // 解析 location 经纬度
                const location = await request('map', 'location', {
                    params: {
                        key: 'c222383ff12d31b556c3ad6145bb95f4',
                        location: userProfile.location,
                        s: 'rsx',
                    },
                })
                const [address, adcode] = [
                    location.regeocode.formatted_address,
                    location.regeocode.addressComponent.adcode,
                ]
                logger.debug(`经纬度解析地址为: ${address}, 邮编为: ${adcode}`)

                // 分离经纬度
                const [lng, lat] = userProfile.location.split(',').map(Number)

                // 签到表单
                const clockForm = {
                    traineeId,
                    adcode,
                    lat,
                    lng,
                    address,
                    deviceName: userProfile.deviceName,
                    punchInStatus: '1',
                    clockStatus: '2', // 1 为签退，2 为签到
                    addressId: null,
                    imgUrl: '',
                    reason: '',
                }

                // 进行签到
                const clockResult = await request('traineePlatform', 'clock', {
                    headers: { cookie, ...mstv(clockForm) },
                    params: { ...clockForm },
                })
                const { msg } = clockResult
                logger.debug(msg)
            } else {
                logger.info(`今日已签到`)
            }

            // 查询签到历史信息形成当月预览矩阵
            const currentMonth = currentDate('-', DateLevel.MONTH)
            const clockHistory = await request(
                'traineePlatform',
                'clockHistory',
                {
                    headers: { cookie },
                    params: {
                        traineeId,
                        months: currentMonth,
                    },
                }
            )

            const [daysInMonth, clockedDays, clockHistoryCalendar] = calendar(
                clockHistory.data.clockHistoryList
            )
            logger.info(
                `${loginer} ${currentMonth} 月的签到历史\n[${clockedDays} / ${daysInMonth}]\n${clockHistoryCalendar}\n`
            )
        } else {
            logger.warn(`用户未开启签到`)
        }
    }
}

main().then(() => {
    logger.info('当前所有任务已执行结束\n')
})
