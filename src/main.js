import 'dotenv/config'
import chalk from 'chalk'
import express from 'express'
import {
    getChatData,
    LOADING_ANIMATION_FILE_ID,
    setWebHook,
    TELEGRAM_API,
    URI_FOR_TELEGRAM,
} from './lib/telegram.js'
import { env } from './lib/index.js'
import { telegramRequestBodySchema } from '../schemas/telegram.js'
import ky from 'ky'

const PORT = env.PORT || 5000

const app = express()
app.use(express.json()) // Parse JSON bodies
app.use(express.urlencoded({ extended: true })) // Parse URL-encoded bodies

const init = async () => {
    const res = await setWebHook()
    console.log('🏁', chalk.greenBright(res.data.description))
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
    console.log(req.body)
    const { success, data, error } = telegramRequestBodySchema.safeParse(
        req.body
    )

    if (success) {
        console.log(data)
        const { chat_id, text } = getChatData(data)

        try {
            await ky.post(TELEGRAM_API + '/sendChatAction', {
                json: {
                    chat_id,
                    action: 'typing',
                },
            })
            const loadingAnimationRes = await ky
                .post(TELEGRAM_API + '/sendAnimation', {
                    json: {
                        chat_id,
                        animation: LOADING_ANIMATION_FILE_ID,
                    },
                })
                .json()
            console.log(loadingAnimationRes)

            // await new Promise((res) => setTimeout(res, 5000))

            await ky.post(TELEGRAM_API + '/sendMessage', {
                json: { chat_id, text },
            })
            // Delete the loading GIF
            await ky.post(TELEGRAM_API + '/deleteMessage', {
                json: {
                    chat_id,
                    message_id: loadingAnimationRes.result.message_id,
                },
            })
        } catch (err) {
            console.log(err)
            await ky.post(TELEGRAM_API + '/sendMessage', {
                json: { chat_id, text: 'Something went wrong!' },
            })
        }
    } else {
        // log what makes zod's safeParse mad
        console.log(error.errors)
        await ky.post(TELEGRAM_API + '/sendMessage', {
            json: { chat_id, text: 'Please send a text message instead..' },
        })
    }

    return res.send()
})

app.listen(PORT, async () => {
    console.log(`🚀 Bot is running on port ${chalk.magentaBright(PORT)}`)
    try {
        await init()
    } catch (err) {
        console.log(`🙉 ${chalk.redBright('ERROR')}:\n${console.error(err)}`)
    }
})
