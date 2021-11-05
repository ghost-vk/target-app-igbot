const Response = require('./response')
const i18n = require('./../i18n.config')
const config = require('./config')
const interest = 'telegram'

module.exports = class TelegramChat {
  static async handlePayload(payload, user) {
    switch (payload) {
      case 'TG_START': {
        await user.saveInterest(interest)
        return Response.genQuickReply(i18n.__('ig.any.pick_action'), [
          {
            title: i18n.__('ig.telegram.want_enter'),
            payload: 'TG_ENTER',
          },
          {
            title: i18n.__('ig.any.learn_more'),
            payload: 'TG_LEARN_MORE',
          },
          {
            title: i18n.__('ig.telegram.want_compare'),
            payload: 'TG_COMPARE',
          },
          {
            title: i18n.__('ig.any.show_reviews'),
            payload: 'TG_REVIEWS',
          },
          {
            title: i18n.__('ig.any.show_menu'),
            payload: 'START_MENU',
          },
        ])
      }
      case 'TG_ENTER': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/telegram.png`,
          'Вступить в чат',
          'Чтобы вступить в чат нужно оставить заявку на сайте',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true&source=Telegram%20%D1%87%D0%B0%D1%82%20%D1%82%D0%B0%D1%80%D0%B8%D1%84%20PRO%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
              title: 'Тариф PRO',
            },
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true&source=Telegram%20%D1%87%D0%B0%D1%82%20%D1%82%D0%B0%D1%80%D0%B8%D1%84%20Lite%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
              title: 'Тариф Lite',
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'TG_START',
            },
          ]
        )
      }
      case 'TG_LEARN_MORE': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.telegram.description')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/telegram.png`,
            'Telegram чат',
            'Более подробное описание доступно на сайте',
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}/education?show_node=telegramchat`,
                title: 'Посмотреть на сайте',
              },
              {
                type: 'postback',
                title: 'Вступить в Telegram чат',
                payload: 'TG_ENTER',
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'TG_START',
              },
            ]
          ),
        ]
      }
      case 'TG_COMPARE': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.telegram.compare_0')),
          Response.genText(i18n.__('ig.telegram.compare_1')),
          Response.genText(i18n.__('ig.telegram.compare_2')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/telegram.png`,
            'Telegram чат',
            'Вступить в чат, посмотреть отзывы, или продолжить общение',
            [
              {
                type: 'postback',
                title: 'Вступить в Telegram чат',
                payload: 'TG_ENTER',
              },
              {
                type: 'postback',
                title: 'Посмотреть отзывы',
                payload: 'TG_REVIEWS',
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'TG_START',
              },
            ]
          ),
        ]
      }
      case 'TG_REVIEWS': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/telegram.png`,
          i18n.__('ig.any.nastya_reviews'),
          'Ознакомьтесь с отзывами тех, кто уже является участниками чата',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?reviews_category=telegram-chat&show_node=at_reviews`,
              title: i18n.__('ig.any.show_reviews'),
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'TG_START',
            },
          ]
        )
      }
    }
  }
}
