import chalk from "chalk"
import { getPanelValues, waitForPanelsToLoad } from "../lib/grafana.js"
import { bootBrowser, env, printPrettifiedData } from "../lib/index.js"
import ora from "ora"

const URL = env.QCASH_MAIN_GRAFANA_URL
const PANELS = {
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
    const spinner = ora(`booting up headless browser..`).start()
    const { browser, page } = await bootBrowser()
    try {
        spinner.text = `Navigating to ${chalk.magentaBright(URL)}..`

        await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 })
        await page.setViewport({ width: 1920, height: 3080 })

        await login(page, spinner)

        spinner.text = "Waiting dashboard page to load.."
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 60000 })

        spinner.text = "Waiting panels data to load.."
        await waitForPanelsToLoad(page, PANELS, getGrafanaValueSelector)

        spinner.text = "Fetching monitoring values.."
        const data = await getPanelValues(page, PANELS, getGrafanaValueSelector)

        // await page.screenshot({
        //     path: "screenshots/test.png",
        // })
        // console.log("Screenshot taken!")

        spinner.succeed(` ${chalk.greenBright("Successfuly scraped data")}`)
        printPrettifiedData(data)
    } catch (err) {
        console.log(err)
        spinner.fail(chalk.red(err.message ?? "Something went wrong!"))
    } finally {
        await browser.close()
    }
}

/**
 * @param {Page} page
 * @param {import("ora").Ora} spinner
 */
async function login(page, spinner) {
    spinner.text = "Inputing credentials.."
    await page.type('input[name="user"]', env.QCASH_MAIN_GRAFANA_USER)
    await page.type('input[name="password"]', env.QCASH_MAIN_GRAFANA_PASSWORD)
    spinner.text = "Logging in.."
    // click login
    await Promise.all([
        page.waitForNavigation(),
        await page.click('[aria-label="Login button"]'),
    ])
    spinner.text = "Log in successful"
}

/**
 * @param {string} title
 */
function getGrafanaValueSelector(title) {
    return `div[aria-label="Panel container title ${title}"] :nth-child(2) div div div div div div span`
}

export default {
    printData,
}
