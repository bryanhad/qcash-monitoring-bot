import { printPrettifiedData, env, getCurrentTimeStamp } from "../lib/index.js"
import grafanaHelper from "../lib/grafana.js"
import ora from "ora"
import chalk from "chalk"
import puppeteer from "puppeteer"

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

async function printData() {
    try {
        const spinner = ora(`booting up headless browser..`).start()
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        spinner.text = `Waiting ${chalk.magentaBright(URL)} to load..`

        await grafanaHelper.goToPageAndWaitToLoad(
            page,
            URL,
            Object.values(CAPTURES),
            spinner
        )
        spinner.text = "Fetching monitoring values.."
        const data = await grafanaHelper.getMonitoringValues(page, CAPTURES)
        // await page.screenshot({
        //     path: "screenshots/test.png",
        // })
        // console.log("Screenshot taken!")

        spinner.succeed(` ${chalk.greenBright("Successfuly scraped data")}`)

        printPrettifiedData(data, `SCRAPED AT ${getCurrentTimeStamp()}`)

        await browser.close()
    } catch (err) {
        console.error(err)
        spinner.fail(err.message ?? "Something went wrong")
    }
}

export default {
    printData,
}
