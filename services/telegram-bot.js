const debug = require('debug')('service:telegram-bot')
const TelegramBot = require('node-telegram-bot-api')
const {
  telegramBotToken,
  telegramChatId,
  telegramTechChatId,
} = require('./config')
const bot = new TelegramBot(telegramBotToken, { polling: false })

/**
 *
 * @param {string} name
 * @param {string} message
 * @param profilePic
 * @return {Promise<boolean>}
 */
const notify = async (name = null, message = null, profilePic = null) => {
  try {
    const action = message ? 'пишет' : 'просит обратную связь'

    let response = `Снова кто-то ${action} в Direct 💬\n`

    if (message) {
      response += `*Сообщение*\n${message}\n`
    }

    if (name) {
      response += `*Имя*\n${name}`
    }

    await bot.sendMessage(telegramChatId, response, { parse_mode: 'markdown' })

    if (profilePic) {
      const caption = name ? name : 'Фото к сообщению выше'
      await bot.sendPhoto(telegramChatId, profilePic, { caption })
    }

    return true
  } catch (e) {
    console.warn('🔴 Failed notify')
  }
}

/**
 * @param {string} error
 * @return {Promise<void>}
 */
const notifyError = async (error) => {
  try {
    await bot.sendMessage(telegramTechChatId, `Сообщение об ошибке.\n${error}`)
  } catch (e) {
    debug('Error when notify about error:\n%O', e)
  }
}

module.exports = { notify, notifyError }
