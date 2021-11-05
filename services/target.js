const Response = require('./response')
const i18n = require('./../i18n.config')
const config = require('./config')
const interest = 'target'

module.exports = class Target {
  static async handlePayload(payload, user) {
    switch (payload) {
      case 'TARGET_START': {
        await user.saveInterest(interest)
        return Response.genQuickReply(i18n.__('ig.any.pick_action'), [
          {
            title: i18n.__('ig.any.gen_lead'),
            payload: 'TARGET_LEAD',
          },
          {
            title: i18n.__('ig.any.show_reviews'),
            payload: 'TARGET_REVIEWS',
          },
          {
            title: i18n.__('ig.target.want_cases'),
            payload: 'TARGET_CASES',
          },
          {
            title: i18n.__('ig.any.learn_more'),
            payload: 'TARGET_LEARN_MORE',
          },
          {
            title: i18n.__('ig.target.want_steps'),
            payload: 'TARGET_STEPS',
          },
          {
            title: i18n.__('ig.any.ask_question'),
            payload: 'ANY_TRY_CALL_OPERATOR',
          },
          {
            title: i18n.__('ig.any.show_menu'),
            payload: 'START_MENU',
          },
        ])
      }
      case 'TARGET_LEAD': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/target.png`,
          i18n.__('ig.target.title'),
          i18n.__('ig.target.subtitle'),
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?lead_form=true&source=%D0%97%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D1%82%D0%B0%D1%80%D0%B3%D0%B5%D1%82%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
              title: i18n.__('ig.any.gen_lead'),
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'TARGET_START',
            },
          ]
        )
      }
      case 'TARGET_REVIEWS': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/target.png`,
          i18n.__('ig.any.nastya_reviews'),
          'Ознакомьтесь с отзывами тех, кто уже запускал рекламу с Настей',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}?reviews_category=target-setup&show_node=at_reviews`,
              title: i18n.__('ig.any.show_reviews'),
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'TARGET_START',
            },
          ]
        )
      }
      case 'TARGET_CASES': {
        await user.saveInterest(interest)
        return Response.genGenericTemplate(
          `${config.websiteUrl}/public/igbot/target.png`,
          'Кейсы Насти',
          'Ознакомьтесь с кейсами Насти на сайте',
          [
            {
              type: 'web_url',
              url: `${config.websiteUrl}/cases`,
              title: i18n.__('ig.any.go_to'),
            },
            {
              type: 'postback',
              title: i18n.__('ig.any.continue_chat'),
              payload: 'TARGET_START',
            },
          ]
        )
      }
      case 'TARGET_LEARN_MORE': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.target.learn_more_1')),
          Response.genText(i18n.__('ig.target.learn_more_2')),
          Response.genText(i18n.__('ig.target.learn_more_3')),
          Response.genText(i18n.__('ig.target.learn_more_4')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/target.png`,
            i18n.__('ig.target.title'),
            i18n.__('ig.target.subtitle'),
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}?lead_form=true&source=%D0%97%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D1%82%D0%B0%D1%80%D0%B3%D0%B5%D1%82%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
                title: i18n.__('ig.any.gen_lead'),
              },
              {
                type: 'postback',
                title: 'Узнать этапы запуска рекламы',
                payload: 'TARGET_STEPS',
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'TARGET_START',
              },
            ]
          ),
        ]
      }
      case 'TARGET_STEPS': {
        await user.saveInterest(interest)
        return [
          Response.genText(i18n.__('ig.target.steps')),
          Response.genGenericTemplate(
            `${config.websiteUrl}/public/igbot/target.png`,
            i18n.__('ig.target.title'),
            i18n.__('ig.target.subtitle'),
            [
              {
                type: 'web_url',
                url: `${config.websiteUrl}?lead_form=true&source=%D0%97%D0%B0%D1%8F%D0%B2%D0%BA%D0%B0%20%D0%BD%D0%B0%20%D1%82%D0%B0%D1%80%D0%B3%D0%B5%D1%82%20%28%D0%B8%D0%B7%20%D0%B4%D0%B8%D1%80%D0%B5%D0%BA%D1%82%D0%B0%29`,
                title: i18n.__('ig.any.gen_lead'),
              },
              {
                type: 'postback',
                title: i18n.__('ig.any.continue_chat'),
                payload: 'TARGET_START',
              },
            ]
          ),
        ]
      }
    }
  }
}
