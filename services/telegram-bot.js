const TelegramBot = require('node-telegram-bot-api')
const { telegramBotToken, telegramChatId } = require('./config')
const bot = new TelegramBot(telegramBotToken, { polling: true })

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

module.exports = { notify }
