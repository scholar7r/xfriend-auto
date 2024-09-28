import axios, { AxiosRequestConfig } from 'axios'

interface Urls {
    base: string
    urls: { [key: string]: string }
}

interface WebApiUrls {
    [key: string]: Urls
}

export interface RequestResponse<T> {
    data: T
    success: boolean
    error?: string
    regeocode?: {
        formatted_address: string
        addressComponent: {
            adcode: string
        }
    }
    msg?: string
}

const webApiUrls: WebApiUrls = {
    traineePlatform: {
        base: 'https://xcx.xybsyw.com/',
        urls: {
            accountLogin: 'login/login.action',
            accountDetail: 'account/LoadAccountInfo.action',
            clockDefault: 'student/clock/GetPlan!getDefault.action',
            clockDetail: 'student/clock/GetPlan!detail.action',
            clock: 'student/clock/PostNew.action',
            clockHistory: 'student/clock/PunchIn!historyList.action',
            clockUpdate: 'student/clock/Post!updateClock.action',
        },
    },
    map: {
        base: 'https://restapi.amap.com/',
        urls: {
            location: 'v3/geocode/regeo',
        },
    },
    qmsg: {
        base: 'https://qmsg.zendee.cn/',
        urls: {
            send: 'send',
            sendGroup: 'group',
        },
    },
}

export const selectUrl = (
    codeName: keyof WebApiUrls,
    urlName: string,
    apiKey?: string
): string => {
    const service = webApiUrls[codeName]

    if (!service) {
        throw new Error(`服务 ${codeName} 不存在`)
    }

    if (!(urlName in service.urls)) {
        throw new Error(`在 ${codeName} 中未定义 ${urlName} 接口`)
    }

    if (codeName === 'qmsg' && apiKey) {
        return `${service.base}${service.urls[urlName]}/${apiKey}`
    } else if (codeName === 'qmsg' && !apiKey) {
        throw new Error(`调用 ${codeName} 服务需要提供 apiKey`)
    }

    return `${service.base}${service.urls[urlName]}`
}

export const request = <T>(
    codeName: keyof WebApiUrls,
    urlName: string,
    axiosConfig?: AxiosRequestConfig,
    apiKey?: string
): Promise<T> => {
    return new Promise((resolve, reject) => {
        if (codeName === 'qmsg' && !apiKey) {
            reject(new Error(`调用 ${codeName} 服务需要提供 apiKey`))
        }

        const url = selectUrl(codeName, urlName, apiKey)

        axios({
            ...axiosConfig,
            url,
        })
            .then(response => {
                resolve(response.data)
            })
            .catch(error => {
                const errorMessage = error.response
                    ? `请求失败: ${error.response.status} ${error.response.statusText} - ${error.response.data}`
                    : `请求失败: ${error.message}`

                console.error(error.response.data)

                reject(new Error(errorMessage))
            })
    })
}
