/**
 * @typedef {Object} From
 * @property {number} id
 * @property {boolean} is_bot
 * @property {string} first_name
 * @property {string} language_code
 */

/**
 * @typedef {Object} Chat
 * @property {number} id
 * @property {string} first_name
 * @property {string} type
 */

/**
 * @typedef {Object} Entity
 * @property {string} type
 * @property {number} offset
 * @property {number} length
 */

/**
 * @typedef {Object} Message
 * @property {number} message_id
 * @property {From} from
 * @property {Chat} chat
 * @property {number} date
 * @property {string} text
 * @property {Entity[]} entities
 */

/**
 * @typedef {Object} TelegramRequestBody
 * @property {number} update_id
 * @property {Message} message
 */

/**
 * @typedef {Object} SetWebHook
 * @property {boolean} ok
 * @property {boolean} result
 * @property {string} description
 */

export {}
