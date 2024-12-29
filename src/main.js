import "dotenv/config"

import chalk from "chalk"
import Enquirer from "enquirer"
import qcashGrafana from "./functions/qcash-grafana.js"

const cliOptions = {
    // GENERATE_ALL_MONITORING_CAPTURES: "generate all monitoring captures",
    // GET_QCASH_GRAFANA_DETAILS: "get qcash grafana details",
    SCRAPE_QCASH_GRAFANA_MONITORING_PAGE:
        "scrape QCASH grafana monitoring page",
    // GENERATE_TEST_HTML: "generate test html",
    // SEE_TEST_DATA: "see test data",
    // SEE_MAIN_GRAFANA_MONITORING: "see main grafana monitoring",
    // SEE_OTHER_MONITORING: "see other monitoring",
    EXIT: "exit",
}

async function main() {
    let firstTime = true
    let exit = false
    let browser
    let page

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
                case cliOptions.SCRAPE_QCASH_GRAFANA_MONITORING_PAGE:
                    await qcashGrafana.printData()
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
        }
    }

    console.log(chalk.greenBright("😊 Happy monitoring!"))
}

main()
