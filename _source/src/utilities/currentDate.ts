export enum DateLevel {
    YEAR,
    MONTH,
    DAY,
}

export const currentDate = (delimiter: string, level: DateLevel): string => {
    const date = new Date()

    switch (level) {
        case DateLevel.YEAR:
            return date.getFullYear().toString()
        case DateLevel.MONTH:
            return `${date.getFullYear()}${delimiter}${(date.getMonth() + 1).toString().padStart(2, '0')}`
        case DateLevel.DAY:
            return `${date.getFullYear()}${delimiter}${(date.getMonth() + 1).toString().padStart(2, '0')}${delimiter}${date.getDate().toString().padStart(2, '0')}`
        default:
            throw new Error('无效的日期级别')
    }
}
