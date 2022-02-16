const i18n = require('./../i18n.config')
const config = require('./config')
const GraphApi = require('./graph-api')
const { notify } = require('./telegram-bot')
const Response = require('./response')


module.exports = class AnyMessages {
  static async handlePayload(payload, user) {
    switch (payload) {
      case 'ANY_GEN_LEAD': {
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/common.png`,
          'Оставьте заявку на сайте',
          'Самый быстрый способ обратной связи',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true&source=InstagramDirect`,
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
        if (!user.profilePic) {
          const profilePic = await GraphApi.getUser(
            user.igsid,
            'profile_pic'
          )
          user.setProfilePic(profilePic)
        }

        await notify(user.name, null, user.profilePic)

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
                url: `${config.websiteUrl}?lead_form=true&source=InstagramDirect`,
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
