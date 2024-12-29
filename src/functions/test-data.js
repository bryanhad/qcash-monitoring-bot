import open from "open"
import {
    env,
    getTemplateFilePath,
    outputPath,
    printPrettifiedData,
} from "../lib/index.js"
import ora from "ora"
import chalk from "chalk"
import fs from "fs/promises"
import ejs from "ejs"
import { setTimeout } from "timers/promises"

const EJS_TEMPLATE_PATH = getTemplateFilePath("test-template")

const data = {
    title: "My Dynamic Page",
    message: "Hello, EJS is awesome!",
    items: ["Item 1", "Item 2", "Item 3"],
}

async function generateHTML() {
    const spinner = ora(
        `Generating ${chalk.magentaBright("test HTML")}..`
    ).start()
    try {
        await setTimeout(5_000)
        const html = await ejs.renderFile(EJS_TEMPLATE_PATH, data)
        await fs.writeFile(outputPath, html)
        await open(outputPath)
        spinner.succeed(` ${chalk.greenBright("Successfuly generated HTML")}`)
    } catch (err) {
        console.error(err)
        spinner.fail(err.message ?? "Something went wrong")
    }
}

async function printData() {
    const spinner = ora(
        `Scrapping relevant data from ${chalk.magentaBright("database")}..`
    ).start()
    try {
        await setTimeout(5_000)
        spinner.succeed(` ${chalk.greenBright("Successfuly scraped data")}`)
        const dummyData = {
            data1: "bebek",
            data2: "kudanil",
            data3: "kuchink",
            user: env.QCASH_MAIN_GRAFANA_USER,
            password: env.QCASH_MAIN_GRAFANA_PASSWORD,
        }

        printPrettifiedData(dummyData)
    } catch (err) {
        console.error(err)
        spinner.fail(err.message ?? "Something went wrong")
    }
}

const testData = {
    generateHTML,
    printData,
}
export default testData
