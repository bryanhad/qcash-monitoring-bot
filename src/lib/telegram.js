import ky from 'ky'
import { env } from './index.js'
import { setWebHookSchema } from '../../schemas/telegram.js'

export const TELEGRAM_API = `https://api.telegram.org/bot${env.TELEGRAM_TOKEN}`
export const URI_FOR_TELEGRAM = `/webhook/${env.TELEGRAM_TOKEN}`
const WEBHOOK_URL = env.SERVER_URL + URI_FOR_TELEGRAM

export const LOADING_ANIMATION_FILE_ID =
    'CAACAgIAAxkBAAMlZ3OMJ6nB0Bsq8qcrRqz5ryuBc30AAhQSAALaOGlIepQCUJ5LybU2BA'

export async function setWebHook() {
    const res = await ky
        .get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`)
        .json()
    return setWebHookSchema.safeParse(res)
}

/**
 * @param {{message: {chat: {id:string}, text: string}}} data
 */
export function getChatData(data) {
    return {
        chat_id: data.message.chat.id,
        text: data.message.text,
    }
}
