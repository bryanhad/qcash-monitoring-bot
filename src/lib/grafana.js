import { Page } from "puppeteer"

/**
 * @param {string} title
 */
function getGrafanaValueSelector(title) {
    return `div[aria-label="Panel container title ${title}"] :nth-child(2) div div div div div div span`
}

/**
 *
 * @param {string} selector
 * @returns {boolean}
 */
function getElement(selector) {
    const element = document.querySelector(selector)
    return element && element.textContent.trim() !== ""
}

/**
 * @param {Page} page
 * @param {string} title The title of the dynamic content
 * @param {puppeteer.FrameWaitForFunctionOptions} options
 */
async function waitForGrafanaValueToLoad(
    page,
    title,
    options = { timeout: 60_000 }
) {
    await page.waitForFunction(
        getElement,
        options,
        getGrafanaValueSelector(title)
    )
}

/**
 * @param {Page} page
 * @param {Array<string>} titles The titles of the monitoring contents to be awaited
 * @param {puppeteer.FrameWaitForFunctionOptions} options
 */
async function waitForFetchingMonitoringToLoad(
    page,
    titles,
    options = { timeout: 60_000 }
) {
    for (const title of titles) {
        await waitForGrafanaValueToLoad(page, title, options)
    }
}

/**
 * @param {Page} page
 * @param {string} title The title of the dynamic contents
 */
async function getMonitoringValue(page, title) {
    const value = await page.$eval(getGrafanaValueSelector(title), (el) =>
        el.textContent.trim()
    )
    return value
}

/**
 * @param {Page} page
 * @param {Record<string,string>} titlesObj an object where the values of each field is the title of monitoring
 *
 * @returns {Promise<Record<string, string>>}
 */
async function getMonitoringValues(page, titlesObj) {
    const obj = {}
    for (const [key, value] of Object.entries(titlesObj)) {
        const v = await getMonitoringValue(page, value)
        obj[key] = v
    }
    return obj
}

/**
 *  @param {Page} page
 *  @param {string} url
 *  @param {Array<string>} titles The titles of the monitoring contents to be awaited
 *  @param {import("ora").Ora} spinner
 */
async function goToPageAndWaitToLoad(page, url, titles, spinner) {
    await page.goto(url, { timeout: 60000 })
    await page.setViewport({ width: 1920, height: 1080 })

    spinner.text = "Inputing credentials.."
    await page.type('input[name="user"]', env.QCASH_MAIN_GRAFANA_USER)
    await page.type('input[name="password"]', env.QCASH_MAIN_GRAFANA_PASSWORD)

    // click login
    await Promise.all([
        page.waitForNavigation(),
        await page.click('[aria-label="Login button"]'),
    ])
    spinner.text = "Log in successful"

    spinner.text = "Waiting dashboard page to load.."
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 60000 }) // Wait for network to be idle

    spinner.text = "Waiting dynamic values to load.."
    // await waitForGrafanaValuesToLoad(page, Object.values(CAPTURES))
    await grafanaHelper.waitForFetchingMonitoringToLoad(page, titles)
}

const grafanaHelper = {
    waitForFetchingMonitoringToLoad,
    getMonitoringValues,
    goToPageAndWaitToLoad,
}

export default grafanaHelper
