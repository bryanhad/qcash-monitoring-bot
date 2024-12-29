import { printPrettifiedData, env } from "../lib/index.js"
import grafanaHelper from "../lib/grafana.js"
import ora from "ora"
import chalk from "chalk"

const URL = env.QCASH_MAIN_GRAFANA_URL
const CAPTURES = {
    SALES_VOLUME: "Today Sales Volume",
    FEE: "Today Fee",
    ACTIVE_USER: "Active User",
    TOTAL_COMPANY: "Total Company",
    FAILED_TRX: "Today Failed Financial Transaction",
    FAILED_SYSTEM_TRX: "Today Error System Financial Transaction",
    TODAY_SUCCESS_TRX: "Today Success Financial Transaction",
    ALL_TRX: "Today All Financial Transaction",
    SUCCESS_RATE: "Today Success Rate ",
}
const MODULE_NAME = "MAIN GRAFANA QCASH"

/**
 *  @param {puppeteer.Page} page
 */
async function getGrafanaDetails(page) {
    console.log(`START CAPTURE ${MODULE_NAME}`)
    console.log(`Opening '${MODULE_NAME}' page..`)
    await page.goto(URL, { timeout: 60000 })
    await page.setViewport({ width: 1920, height: 1080 })

    console.log("Inputing credentials..")
    // input credentials
    await page.type('input[name="user"]', env.QCASH_MAIN_GRAFANA_USER)
    await page.type('input[name="password"]', env.QCASH_MAIN_GRAFANA_PASSWORD)
    // click login
    await Promise.all([
        page.waitForNavigation(),
        await page.click('[aria-label="Login button"]'),
    ])
    console.log("Log in successful!")
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 60000 }) // Wait for network to be idle

    console.log("Waiting dynamic values to load..")
    await waitForGrafanaValuesToLoad(page, Object.values(CAPTURES))
    // await grafanaHelper.waitForFetchingMonitoringToLoad()

    console.log("Fetching monitoring values..")
    const obj = await getGrafanaValues(page, CAPTURES)
    // const obj = await grafanaHelper.getMonitoringValues(page, CAPTURES)
    console.log(obj)

    await page.screenshot({
        path: "screenshots/test.png",
    })
    console.log("Screenshot taken!")

    console.log(`END CAPTURE ${MODULE_NAME}`)
}

/**
 *  @param {puppeteer.Page} page
 */
async function printData(page) {
    try {
        const spinner = ora(`Opening ${chalk.magentaBright(URL)}..`).start()
        await grafanaHelper.goToPageAndWaitToLoad(
            page,
            URL,
            Object.values(CAPTURES),
            spinner
        )
        spinner.text = "Fetching monitoring values.."
        // const obj = await getGrafanaValues(page, CAPTURES)
        const data = await grafanaHelper.getMonitoringValues(page, CAPTURES)
        spinner.succeed(` ${chalk.greenBright("Successfuly scraped data")}`)

        printPrettifiedData(data)
    } catch (err) {
        console.error(err)
        spinner.fail(err.message ?? "Something went wrong")
    }
}

// /**
//  * @param {string} title
//  */
// function getGrafanaValueSelector(title) {
//     return `div[aria-label="Panel container title ${title}"] :nth-child(2) div div div div div div span`
// }

// /**
//  *
//  * @param {string} selector
//  * @returns {boolean}
//  */
// function getElement(selector) {
//     const element = document.querySelector(selector)
//     return element && element.textContent.trim() !== ""
// }

// /**
//  * @param {puppeteer.Page} page
//  * @param {string} title The title of the dynamic content
//  * @param {puppeteer.FrameWaitForFunctionOptions} options
//  */
// async function waitForGrafanaValueToLoad(
//     page,
//     title,
//     options = { timeout: 60_000 }
// ) {
//     await page.waitForFunction(
//         getElement,
//         options,
//         getGrafanaValueSelector(title)
//     )
// }

// /**
//  * @param {puppeteer.Page} page
//  * @param {Array<string>} titles The titles of the dynamic contents to be awaited
//  * @param {puppeteer.FrameWaitForFunctionOptions} options
//  */
// async function waitForGrafanaValuesToLoad(
//     page,
//     titles,
//     options = { timeout: 60_000 }
// ) {
//     for (const title of titles) {
//         await waitForGrafanaValueToLoad(page, title, options)
//     }
// }

// /**
//  * @param {puppeteer.Page} page
//  * @param {string} title The title of the dynamic contents
//  */
// async function getGrafanaValue(page, title) {
//     const value = await page.$eval(getGrafanaValueSelector(title), (el) =>
//         el.textContent.trim()
//     )
//     return value
// }

// /**
//  * @param {puppeteer.Page} page
//  * @param {Record<string,string>} titlesObj an object where the values of each field is the title of monitoring
//  *
//  * @returns {Promise<Record<string, string>>}
//  */
// async function getGrafanaValues(page, titlesObj) {
//     const obj = {}
//     for (const [key, value] of Object.entries(titlesObj)) {
//         const v = await getGrafanaValue(page, value)
//         obj[key] = v
//     }
//     return obj
// }

export default {
    printData,
    getGrafanaDetails
}