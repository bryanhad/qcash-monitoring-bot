import "dotenv/config"
import chalk from "chalk"
import express from "express"
import {
    LOADING_ANIMATION_FILE_ID,
    setWebHook,
    TELEGRAM_API,
    URI_FOR_TELEGRAM,
} from "./lib/telegram.js"
import { env } from "./lib/index.js"
import { telegramRequestBodySchema } from "../schemas/telegram.js"
import ky from "ky"
import getQcashGrafanaData from "./bot/qcash-grafana.js"
import getDBDetails from "./bot/db-grafana.js"

const PORT = env.PORT || 5000

const app = express()
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

const telegramOptions = {
    QCASH_GRAFANA: "/qcash-grafana",
    DB_GRAFANA: "/qcash-db",
}

const init = async () => {
    const res = await setWebHook()
    console.log("🏁", chalk.greenBright(res.data.description))
}

/**
 *
 * @param {string} chatId
 */
async function sendTypingAction(chatId) {
    ky.post(TELEGRAM_API + "/sendChatAction", {
        json: {
            chat_id: chatId,
            action: "typing",
        },
    })
}

/**
 * @param {string} chatId
 * @param {string} msgId
 *
 * @returns {Promise<string>} the message id of the sent animation
 */
async function sendLoadingAnimation(chatId) {
    const { result } = await ky
        .post(TELEGRAM_API + "/sendAnimation", {
            json: {
                chat_id: chatId,
                animation: LOADING_ANIMATION_FILE_ID,
            },
        })
        .json()
    console.log({ loadingAnimationRes: result })
    return result.message_id
}

/**
 * @param {string} chatId
 * @param {string} msgId
 */
async function deleteMessage(chatId, msgId) {
    await ky.post(TELEGRAM_API + "/deleteMessage", {
        json: {
            chat_id: chatId,
            message_id: msgId,
        },
    })
}

/**
 * @param { {message?: {chat: {id:string}, text: string, message_id: number}
 *          ,edited_message?: {chat: {id:string}, text: string, message_id: number}}} data
 */
export function getChatData(data) {
    const messageObj = data.message ?? data.edited_message

    return {
        chatId: messageObj.chat.id,
        text: messageObj.text,
        msgId: messageObj.message_id,
    }
}

/**
 * Handle comminicating with telegram's server
 * For every message our bot receives, telegram's server will hit our server to this POST endpoint! neat!
 *
 * We can just handle what to do when we receive a message to our bot here..
 *
 * We send back a message to the user using the sendMessage telegram's api.
 * @see https://core.telegram.org/bots/api#sendmessage
 */
app.post(URI_FOR_TELEGRAM, async (req, res) => {
    let botResponse = ""
    let loadingMsgID = ""
    const { success, data, error } = telegramRequestBodySchema.safeParse(
        req.body
    )
    console.log(req.body)

    if (success) {
        const { chatId, text } = getChatData(data)
        try {
            await sendTypingAction(chatId)
            loadingMsgID = await sendLoadingAnimation(chatId)

            switch (text) {
                case telegramOptions.QCASH_GRAFANA:
                    botResponse = await getQcashGrafanaData()
                    break
                case telegramOptions.DB_GRAFANA:
                    botResponse = await getDBDetails()
                    break
                default:
                    botResponse = "Ndas mu!"
                    break
            }
        } catch (err) {
            console.log(err)
            botResponse = err.message ?? "Something went wrong!"
        } finally {
            await ky.post(TELEGRAM_API + "/sendMessage", {
                json: { chat_id: chatId, text: botResponse },
            })
            await deleteMessage(chatId, loadingMsgID)
        }
    } else {
        // log what makes zod's safeParse mad
        console.log(error.errors)
        await ky.post(TELEGRAM_API + "/sendMessage", {
            json: {
                chat_id: req.body.message.chat.id,
                text: "Please send a text message instead..",
            },
        })
    }

    return res.send()
})

app.listen(PORT, async () => {
    console.log(`🚀 Bot is running on port ${chalk.magentaBright(PORT)}`)
    try {
        await init()
    } catch (err) {
        console.log(`🙉 ${chalk.redBright("ERROR")}:\n${console.error(err)}`)
    }
})
