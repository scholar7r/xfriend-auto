import { createLogger, format, Logger, transports } from 'winston'
import 'winston-daily-rotate-file'

const formatWithLabel = (label: string) => {
    return format.combine(
        format.colorize(),
        format.label({ label }),
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        format.printf(({ level, message, timestamp, stack }) => {
            return `${timestamp} ${level} [${label}] ${message} ${
                stack ? stack : ''
            }`
        })
    )
}

const fileFormatWithLabel = (label: string) => {
    return format.combine(
        format.label({ label }),
        format.timestamp({ format: 'YYYY-MM-DD hh:mm:ss' }),
        format.json(),
        format.prettyPrint()
    )
}

const loggerInstances = new Map<string, Logger>()

const LoggerFactory = (label: string) => {
    let logger = loggerInstances.get(label)
    if (logger != null) return logger

    logger = createLogger({
        level: 'debug',

        transports: [
            new transports.Console({
                format: formatWithLabel(label),
            }),
            new transports.DailyRotateFile({
                format: fileFormatWithLabel(label),
                level: 'info',
                filename: './logs/xfriend-auto-%DATE%.log',
                datePattern: 'YYYY-MM-DD-HH',
                maxSize: '20m',
                maxFiles: '14d',
            }),
        ],
    })
    loggerInstances.set(label, logger)

    return logger
}

export { LoggerFactory }
