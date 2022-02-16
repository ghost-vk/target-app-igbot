const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../.env') })
const debug = require('debug')('service:config')

const ENV_VARS = [
  'PAGE_ID',
  'APP_ID',
  'PAGE_ACCESS_TOKEN',
  'APP_SECRET',
  'VERIFY_TOKEN',
]

module.exports = {
  apiDomain: 'https://graph.facebook.com',
  apiVersion: 'v12.0',

  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,
  websiteUrl: process.env.IG_APP_URL || 'https://anastasi-target.ru',
  instagramInboxAppId: 1217981644879628,

  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChatId: process.env.TELEGRAM_CHAT_ID,
  telegramTechChatId: process.env.TELEGRAM_TECH_CHAT_ID,

  appUrl: process.env.APP_URL || '<App URL>',

  port: process.env.IG_CHATBOT_PORT || 8443,

  get apiUrl() {
    return `${this.apiDomain}/${this.apiVersion}`
  },

  get webhookUrl() {
    return `${this.appUrl}/webhook`
  },

  checkEnvVariables() {
    ENV_VARS.forEach((key) => {
      if (!process.env[key]) {
        debug('WARNING: Missing required environment variable %s', key)
      }
    })
  },
}
