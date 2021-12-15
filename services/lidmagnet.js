const Response = require('./response')
const i18n = require('./../i18n.config')
const config = require('./config')

module.exports = class LidMagnet {
  static handlePayload(payload) {
    if (payload === 'LID_MAGNET') {
      return [
        Response.genText(i18n.__('ig.lid_magnet.thanks')),
        Response.genText(i18n.__('ig.lid_magnet.figma_lesson')),
        Response.genText(i18n.__('ig.lid_magnet.video_substitution')),
        Response.genText(i18n.__('ig.lid_magnet.calculating_budget')),
        Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/common.png`,
          i18n.__('ig.lid_magnet.more_materials'),
          i18n.__('ig.lid_magnet.in_telegram'),
          [
            {
              type: 'web_url',
              url: 'https://t.me/at_payment_bot',
              title: 'Хочу еще',
            },
            {
              type: 'postback',
              title: 'Продолжить чат',
              payload: 'START_MENU',
            },
          ]
        ),
      ]
    }
  }
}
