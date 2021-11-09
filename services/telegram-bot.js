const TelegramBot = require('node-telegram-bot-api')
const { telegramBotToken, telegramChatId } = require('./config')
const bot = new TelegramBot(telegramBotToken, { polling: true })

const notify = async (name = null, message = null) => {
  try {
    const action = message ? 'пишет' : 'просит обратную связь'
    let response = `Снова кто-то ${action} в Direct 💬\n`
    if (name) {
      response += `Имя: ${name}\n\n`
    }
    if (message) {
      response += `*Сообщение*\n${message}`
    }
    await bot.sendMessage(telegramChatId, response, { parse_mode: 'markdown' })
    return true
  } catch (e) {
    console.warn('🔴 Failed notify')
  }
}

module.exports = { notify }
