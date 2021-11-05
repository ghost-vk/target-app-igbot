const Response = require('./response')
const i18n = require('./../i18n.config')
const config = require('./config')
const interest = 'consultation'

module.exports = class Consultation {
  static async handlePayload(payload, user) {
    switch (payload) {
      case 'CON_START': {
        await user.saveInterest(interest)
        return Response.genQuickReply(i18n.__('ig.any.pick_action'), [
          {
            title: i18n.__('ig.consultation.get_consultation'),
            payload: 'CON_GET_CONSULTATION',
          },
          {
            title: i18n.__('ig.any.learn_more'),
            payload: 'CON_LEARN_MORE',
          },
          {
            title: i18n.__('ig.any.show_reviews'),
            payload: 'CON_SHOW_REVIEWS',
          },
          {
            title: i18n.__('ig.any.ask_question'),
            payload: 'CON_ASK_QUESTION',
          },
          {
            title: i18n.__('ig.any.show_menu'),
            payload: 'START_MENU',
          },
        ])
      }
      case 'CON_GET_CONSULTATION': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/consultation.png`,
          'Оставьте заявку на сайте',
          'Стоимость консультации можно узнать на сайте Насти',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true&source=%D0%9F%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
              title: 'Получить консультацию',
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'CON_START',
            },
          ]
        )
      }
      case 'CON_LEARN_MORE': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.consultation.learn_more_1')),
          Response.genText(i18n.__('ig.consultation.learn_more_2')),
          Response.genText(i18n.__('ig.consultation.learn_more_3')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/consultation.png`,
            'Консультация',
            'Записаться на консультацию можно на сайте',
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}?lead_form=true&source=%D0%9F%D0%BE%D0%BB%D1%83%D1%87%D0%B8%D1%82%D1%8C%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D1%8E%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
                title: i18n.__('ig.any.gen_lead'),
              },
              {
                type: 'web_url',
                url: `${config.websiteUrl}/service?price=consultation&show_node=at_price`,
                title: 'Узнать стоимость',
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'CON_START',
              },
            ]
          ),
        ]
      }
      case 'CON_ASK_QUESTION': {
        await user.saveInterest(interest)
        return Response.genQuickReply(
          i18n.__('ig.consultation.let_tell_about'),
          [
            {
              title: i18n.__('ig.any.tell_me'),
              payload: 'CON_LEARN_MORE',
            },
            {
              title: i18n.__('ig.any.disagree'),
              payload: 'CON_FORCE_QUESTION',
            },
          ]
        )
      }
      case 'CON_FORCE_QUESTION': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.any.direct_overload')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/consultation.png`,
            i18n.__('ig.any.ask_question'),
            'Оставьте заявку на сайте, вам быстро ответят',
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}?lead_form=true&source=Задать вопрос по консультации (из директа)%D0%97%D0%B0%D0%B4%D0%B0%D1%82%D1%8C%20%D0%B2%D0%BE%D0%BF%D1%80%D0%BE%D1%81%20%D0%BF%D0%BE%20%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D0%B8%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
                title: i18n.__('ig.any.gen_lead'),
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'CON_START',
              },
            ]
          ),
        ]
      }
      case 'CON_SHOW_REVIEWS': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/consultation.png`,
          i18n.__('ig.any.nastya_reviews'),
          'Ознакомьтесь с отзывами тех, кто уже прошел консультацию',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?reviews_category=consultation&show_node=at_reviews`,
              title: i18n.__('ig.any.show_reviews'),
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'CON_START',
            },
          ]
        )
      }
    }
  }
}
