import axios, { AxiosRequestConfig } from 'axios'

interface Urls {
    base: string
    urls: { [key: string]: string }
}

interface WebApiUrls {
    [key: string]: Urls
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
        },
    },
    map: {
        base: 'https://restapi.amap.com/',
        urls: {
            location: 'v3/geocode/regeo',
        },
    },
}

export const selectUrl = (
    codeName: keyof WebApiUrls,
    urlName: string
): string => {
    const service = webApiUrls[codeName]

    if (!service) {
        throw new Error(`服务 ${codeName} 不存在`)
    }

    if (!(urlName in service.urls)) {
        throw new Error(`在 ${codeName} 中未定义 ${urlName} 接口`)
    }

    return `${service.base}${service.urls[urlName]}`
}

export const request = (
    codeName: keyof WebApiUrls,
    urlName: string,
    axiosConfig?: AxiosRequestConfig
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const url = selectUrl(codeName, urlName)

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

                reject(new Error(errorMessage))
            })
    })
}
