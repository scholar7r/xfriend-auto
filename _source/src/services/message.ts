export interface MessageServiceType {
    Qmsg
}

export class MessageService {
    private _apiKey: string

    set apiKey(apiKey: string) {
        this._apiKey = apiKey
    }
}
