import { readFileSync } from 'fs'
import { resolve } from 'path'

export const readFile = (filePath: string) => {
    const fileContent = readFileSync(resolve(__dirname, filePath), 'utf8')
    const contentObject = JSON.parse(fileContent)

    return Object.values(contentObject)
}
