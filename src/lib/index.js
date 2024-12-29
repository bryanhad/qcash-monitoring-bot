import { fileURLToPath } from "url"
import { dirname } from "path"
import path from "path"
import boxen from "boxen"

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

export const outputPath = path.join(process.cwd(), "template", "output.html")

export const env = {
    QCASH_MAIN_GRAFANA_USER: process.env.QCASH_MAIN_GRAFANA_USER,
    QCASH_MAIN_GRAFANA_PASSWORD: process.env.QCASH_MAIN_GRAFANA_PASSWORD,
    QCASH_MAIN_GRAFANA_URL: process.env.QCASH_MAIN_GRAFANA_URL,
}

/**
 * @param {string} fileName The file name of the ejs file relative to ./template dir
 * @returns {string} The file path to the ejs file. e.g. [cwd]/template/[fileName].ejs
 */
export function getTemplateFilePath(fileName) {
    return path.join(process.cwd(), "template", `${fileName}.ejs`)
}

/**
 * @param {Record<string, string>} obj A key-value pair object to be printed out to the cli in a box
 */
export function printPrettifiedData(obj) {
    let stringifiedDummyData = ""
    for (const [key, value] of Object.entries(obj)) {
        stringifiedDummyData += `• ${key}: ${value}\n`
    }

    console.log(
        boxen(stringifiedDummyData, {
            title: "Test Data",
            titleAlignment: "left",
            padding: 1,
        })
    )
}
