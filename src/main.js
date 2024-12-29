import "dotenv/config"

import chalk from "chalk"
import Enquirer from "enquirer"
import testData from "./functions/test-data.js"
import qcashGrafana from "./functions/qcash-grafana.js"
import puppeteer from "puppeteer"
import ora from "ora"

const cliOptions = {
    GENERATE_ALL_MONITORING_CAPTURES: "generate all monitoring captures",
    GET_QCASH_GRAFANA_DETAILS: "get qcash grafana details",
    SCRAPE_QCASH_GRAFANA_MONITORING: "scrape QCASH grafana monitoring",
    GENERATE_TEST_HTML: "generate test html",
    SEE_TEST_DATA: "see test data",
    SEE_MAIN_GRAFANA_MONITORING: "see main grafana monitoring",
    SEE_OTHER_MONITORING: "see other monitoring",
    EXIT: "exit",
}

async function main() {
    let firstTime = true
    let exit = false
    let browser
    let page

    try {
        const spinner = ora(`booting up headless browser..`).start()
        browser = await puppeteer.launch()
        page = await browser.newPage()
        spinner.stop()
    } catch (err) {
        console.log(chalk.red("Something went wrong!"))
        console.error(err)
    }

    console.log(`Welcome to ${chalk.blueBright("QCASH Monitoring CLI")}!`)

    while (!exit) {
        try {
            const choice = await new Enquirer.Select({
                name: "home",
                message: firstTime
                    ? "What do you want to do?"
                    : "Anything else you want to do?",
                choices: Object.values(cliOptions),
            }).run()

            if (firstTime) firstTime = false

            switch (choice) {
                case cliOptions.GENERATE_ALL_MONITORING_CAPTURES:
                    console.log("Choice:", choice)
                    break
                case cliOptions.GET_QCASH_GRAFANA_DETAILS:
                    await qcashGrafana.getGrafanaDetails(page)
                    break
                case cliOptions.SCRAPE_QCASH_GRAFANA_MONITORING:
                    await qcashGrafana.printData(page)
                    break
                case cliOptions.GENERATE_TEST_HTML:
                    await testData.generateHTML()
                    break
                case cliOptions.SEE_TEST_DATA:
                    await testData.printData()
                    break
                default:
                    exit = true
                    break
            }
            if (!exit) {
                console.log("\n")
            }
        } catch (err) {
            console.log(chalk.red("Something went wrong!"))
            console.error(err)
            exit = true // Exit on error
        } finally {
            await browser.close()
        }
    }

    console.log(chalk.greenBright("😊 Happy monitoring!"))
}

main()
