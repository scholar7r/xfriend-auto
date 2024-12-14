export interface UserProfileType {
    enabled: boolean
    enableForceClock: boolean
    phoneNumber: number
    cipherWord: string
    location: string
    deviceName: string
}

export interface GlobalSettingsType {
    apiKeys: {
        map: string
        qmsg: string
    }
}
