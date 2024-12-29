import chalk from "chalk"
import { Page } from "puppeteer"
import { getPanelValues, waitForPanelsToLoad } from "../lib/grafana.js"
import { bootBrowser, env, printPrettifiedData } from "../lib/index.js"

const URL = env.DB_GRAFANA_URL
const PANELS = {
    POSTGRES_CPU_USAGE: 194,
    POSTGRES_RAM_USAGE: 190,
    POSTGRES_STORAGE_USAGE: 214,
}

async function printData() {
    const { browser, page, spinner } = await bootBrowser({
        args: [
            "--ignore-certificate-errors",
            "--ignore-certificate-errors-spki-list",
        ],
    })
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

        // Take a screenshot after bypassing
        await page.screenshot({
            path: "screenshots/test.png",
        })

        spinner.succeed(` ${chalk.greenBright("Successfuly scraped data")}`)
        printPrettifiedData(data)
    } catch (err) {
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
    await page.type('input[name="user"]', env.DB_GRAFANA_USER)
    await page.type('input[name="password"]', env.DB_GRAFANA_PASSWORD)
    spinner.text = "Logging in.."
    // click login button and wait
    await Promise.all([
        page.waitForNavigation(),
        await page.click('[aria-label="Login button"]'),
    ])
    spinner.text = "Log in successful"
}

/**
 * @param {number} panelId
 */
function getGrafanaValueSelector(panelId) {
    return `#panel-${panelId} > div > div:nth-child(1) > div > div.panel-content > div > plugin-component > panel-plugin-graph > grafana-panel > ng-transclude > div > div.graph-legend > div > div.view > div > div > div`
}

export default {
    printData,
}
