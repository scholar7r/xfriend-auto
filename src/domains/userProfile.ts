export interface UserProfileType {
    enable: boolean
    enableForceClock: boolean
    phoneNumber: number
    cipherWord: string
    location: string
    deviceName: string
}

/**
 * @deprecated
 */
export class UserProfile {
    enable: boolean
    enableForceClock: boolean
    phoneNumber: number
    cipherWord: string
    location: string
    deviceName: string

    constructor(
        enable: boolean,
        enableForceClock: boolean,
        phoneNumber: number,
        cipherWord: string,
        location: string,
        deviceName: string
    ) {
        this.enable = enable
        this.enableForceClock = enableForceClock
        this.phoneNumber = phoneNumber
        this.cipherWord = cipherWord
        this.location = location
        this.deviceName = deviceName
    }
}
