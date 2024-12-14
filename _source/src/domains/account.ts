export interface AccountType {
    loginer: string
    sessionId: string
}

export class Account {
    public loginer: string | undefined
    public sessionId: number

    constructor(sessionId: number) {
        this.sessionId = sessionId
    }

    set setLoginer(loginer: string) {
        this.loginer = loginer
    }

    public createCookie() {
        return `JSESSIONID=${this.sessionId}`
    }
}
