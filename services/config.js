require('dotenv').config()
const isProduction = process.env.NODE_ENV === 'production'
const isLocalhost = process.env.PRODUCTION_CLIENT_URL === 'http://localhost'

// Required environment variables
const ENV_VARS = [
  'PAGE_ID',
  'APP_ID',
  'PAGE_ACCESS_TOKEN',
  'APP_SECRET',
  'VERIFY_TOKEN',
]

module.exports = {
  // Messenger Platform API
  apiDomain: 'https://graph.facebook.com',
  apiVersion: 'v12.0',

  // Page and Application information
  pageId: process.env.PAGE_ID,
  appId: process.env.APP_ID,
  pageAccesToken: process.env.PAGE_ACCESS_TOKEN,
  appSecret: process.env.APP_SECRET,
  verifyToken: process.env.VERIFY_TOKEN,
  websiteUrl: process.env.IG_APP_URL || 'https://anastasi-target.ru',
  instagramInboxAppId: 1217981644879628,

  // URL of your app domain. Will be automatically updated.
  appUrl: process.env.APP_URL || '<App URL>',

  // Preferred port
  port: process.env.IG_CHATBOT_PORT || 8443,

  // Base URL for Messenger Platform API calls
  get apiUrl() {
    return `${this.apiDomain}/${this.apiVersion}`
  },

  // URL of webhook endpoint
  get webhookUrl() {
    return `${this.appUrl}/webhook`
  },

  checkEnvVariables() {
    ENV_VARS.forEach((key) => {
      if (!process.env[key]) {
        console.warn(`WARNING: Missing required environment variable ${key}`)
      }
    })
  },
}
