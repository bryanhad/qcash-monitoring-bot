import "dotenv/config"

import chalk from "chalk"
import Enquirer from "enquirer"
import qcashGrafana from "./functions/qcash-grafana.js"
import dbGrafana from "./functions/db-grafana.js"

const cliOptions = {
    SCRAPE_QCASH_GRAFANA_MONITORING_PAGE:
        "scrape QCASH grafana monitoring page",
    SCRAPE_DB_GRAFANA_MONITORING_PAGE: "scrape DB grafana monitoring page",
    EXIT: "exit",
}

async function main() {
    let firstTime = true
    let exit = false

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
                case cliOptions.SCRAPE_DB_GRAFANA_MONITORING_PAGE:
                    await dbGrafana.printData()
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
