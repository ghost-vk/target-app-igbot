const Response = require('./response'),
  i18n = require('./../i18n.config'),
  config = require('./config')

module.exports = class AnyMessages {
  static handlePayload(payload) {
    switch (payload) {
      case 'ANY_GET_CONTACTS': {
        return Response.genText(i18n.__('ig.profile.contacts'))
      }
      case 'ANY_GEN_LEAD': {
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/common.png`,
          'Оставьте заявку на сайте',
          'Самый быстрый способ обратной связи',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true`,
              title: 'Оставить заявку',
            },
            {
              type: 'postback',
              title: 'Продолжить чат',
              payload: 'START_MENU'
            }
          ]
        )
      }
      case 'ANY_CALL_OPERATOR': {
        return Response.genText(i18n.__('ig.any.please_waiting'))
      }
      case 'ANY_TRY_CALL_OPERATOR': {
        return [
          Response.genText(i18n.__('ig.any.direct_overload')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/common.png`,
            i18n.__('ig.any.ask_question'),
            'Лучше оставить заявку - так быстрее, но можно позвать Настю здесь',
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}?lead_form=true&source=Задать вопрос по консультации (из директа)`,
                title: 'Оставить заявку',
              },
              {
                type: 'postback',
                title: 'Позвать Настю',
                payload: 'ANY_CALL_OPERATOR'
              },
              {
                type: 'postback',
                title: 'Продолжить чат',
                payload: 'START_MENU'
              }
            ]
          )
        ]
      }
    }
  }
}
