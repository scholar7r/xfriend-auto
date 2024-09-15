export const calendar = (clockHistoryList): string => {
    const currentDate = new Date(clockHistoryList[0].clockDate)
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() + 1
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    const matrix = []
    const clockedDays = clockHistoryList.map(entry =>
        parseInt(entry.clockDate.split('-')[2])
    )

    let day = 1
    let result = ''
    for (let i = 0; i < Math.ceil(daysInMonth / 7); i++) {
        const week = []
        for (let j = 0; j < 7; j++) {
            if (day > daysInMonth) {
                break
            }
            if (day > daysInMonth) {
                week.push('□')
            } else if (clockedDays.includes(day)) {
                week.push('■')
            } else {
                week.push('□')
            }
            day++
        }
        matrix.push(week)
        result += week.join(' ') + '\n'
    }

    return result
}
