interface ClockHistoryEntry {
    clockCostHours: number
    clockCostMinutes: number
    clockDate: string // 格式 'YYYY-MM-DD'
    clockInAddress: string
    clockInDevice: string
    clockInImgUrl: string | null
    clockInStatus: number
    clockInStatusDesc: string
    clockInTime: string
    clockOutAddress: string | null
    clockOutDevice: string | null
    clockOutImgUrl: string | null
    clockOutStatus: number
    clockOutStatusDesc: string | null
    clockOutTime: string | null
    clockRuleType: number
    clockStatus: number
    explanation: string | null
    physicalSymptoms: string | null
    situationUpload: boolean
    testResult: string | null
}

type ClockHistoryList = ClockHistoryEntry[]

export const calendar = (
    clockHistoryList: ClockHistoryList
): [number, number, string] => {
    if (clockHistoryList.length === 0) return [0, 0, '']

    const firstEntryDate = clockHistoryList[0].clockDate

    const [currentYear, currentMonth] = firstEntryDate.split('-').map(Number)
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    const clockedDays = Array.from(
        new Set(
            clockHistoryList.map(entry => Number(entry.clockDate.split('-')[2]))
        )
    )
    const calendarMatrix = Array.from({ length: 5 }, () => Array(7).fill('□'))

    for (let dayCounter = 1; dayCounter <= daysInMonth; dayCounter++) {
        const weekIndex = Math.floor((dayCounter - 1) / 7)
        const dayIndex = (dayCounter - 1) % 7

        calendarMatrix[weekIndex][dayIndex] = clockedDays.includes(dayCounter)
            ? '■'
            : '□'
    }

    const lastRowIndex = Math.floor((daysInMonth - 1) / 7)
    const actualDaysInLastRow = daysInMonth % 7
    if (actualDaysInLastRow > 0) {
        calendarMatrix[lastRowIndex] = calendarMatrix[lastRowIndex].slice(
            0,
            actualDaysInLastRow
        )
    }

    return [
        calendarMatrix.flat().length,
        clockedDays.length,
        calendarMatrix.map(row => row.join(' ')).join('\n'),
    ]
}
