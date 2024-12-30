import 'dotenv/config'
import TelegramBot from "node-telegram-bot-api"
import { env } from "./lib/index.js"
import qcashGrafana from "./functions/qcash-grafana.js"
import dbGrafana from './functions/db-grafana.js'

const bot = new TelegramBot(env.TELEGRAM_API_KEY, { polling: true })

const botOptions = {
    SCRAPE_QCASH_GRAFANA_MONITORING_PAGE: "/qcash_monitoring",
    SCRAPE_DB_GRAFANA_MONITORING_PAGE: "/db_monitoring",
}

let msg = ""

function main() {
    console.log("Bot is listening for messages...")

    bot.on("message", async (input) => {
        const chatId = input.chat.id
        const messageText = input.text

        try {
            switch (messageText) {
                case botOptions.SCRAPE_QCASH_GRAFANA_MONITORING_PAGE:
                    msg = await qcashGrafana.printData()
                    break
                case botOptions.SCRAPE_DB_GRAFANA_MONITORING_PAGE:
                    msg = await dbGrafana.printData()
                    break
                default:
                    msg = "Ndas mu!"
                    exit = true
                    break
            }
        } catch (err) {
            msg = "Errrorrrrr!"
        } finally {
            bot.sendMessage(chatId, msg)
        }
    })
}

main()
