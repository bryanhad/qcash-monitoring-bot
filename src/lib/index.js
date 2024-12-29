import { fileURLToPath } from "url"
import { dirname } from "path"
import path from "path"
import boxen from "boxen"
import puppeteer, { Browser, Page } from "puppeteer"
import ora from "ora"

export const __filename = fileURLToPath(import.meta.url)
export const __dirname = dirname(__filename)

export const outputPath = path.join(process.cwd(), "template", "output.html")

export const env = {
    QCASH_MAIN_GRAFANA_USER: process.env.QCASH_MAIN_GRAFANA_USER,
    QCASH_MAIN_GRAFANA_PASSWORD: process.env.QCASH_MAIN_GRAFANA_PASSWORD,
    QCASH_MAIN_GRAFANA_URL: process.env.QCASH_MAIN_GRAFANA_URL,
    DB_GRAFANA_USER: process.env.DB_GRAFANA_USER,
    DB_GRAFANA_PASSWORD: process.env.DB_GRAFANA_PASSWORD,
    DB_GRAFANA_URL: process.env.DB_GRAFANA_URL,
}

/**
 * @param {string} fileName The file name of the ejs file relative to ./template dir
 * @returns {string} The file path to the ejs file. e.g. [cwd]/template/[fileName].ejs
 */
export function getTemplateFilePath(fileName) {
    return path.join(process.cwd(), "template", `${fileName}.ejs`)
}

/**
 * @param {Record<string, string>} data A key-value pair object to be printed out to the cli in a box
 * @param {string|undefined} boxTitle
 */
export function printPrettifiedData(data, boxTitle) {
    let stringifiedDummyData = ""
    for (const [key, value] of Object.entries(data)) {
        stringifiedDummyData += `• ${key}: ${value}\n`
    }

    console.log(
        boxen(stringifiedDummyData, {
            title: boxTitle ?? `SCRAPED AT ${getCurrentTimeStamp()}`,
            titleAlignment: "left",
            padding: 1,
        })
    )
}

export function getCurrentTimeStamp() {
    const now = new Date()
    const hours = now.getHours() // Gets the hour (0-23)
    const minutes = now.getMinutes() // Gets the minutes (0-59)
    const seconds = now.getSeconds() // Gets the seconds (0-59)

    // Format it as HH:mm
    const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    return formattedTime
}

/**
 *  @param {import("puppeteer").LaunchOptions} browserOptions
 * @returns {{browser: Browser, page: Page, spinner: import("ora").Ora}}
 */
export async function bootBrowser(browserOptions) {
    const spinner = ora(`booting up headless browser..`).start()
    const browser = await puppeteer.launch(browserOptions)
    const page = await browser.newPage()
    return { browser, page, spinner }
}
