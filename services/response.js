const i18n = require('../i18n.config')

module.exports = class Response {
  static genQuickReply(text, quickReplies) {
    let response = {
      text: text,
      quick_replies: [],
    }

    for (let quickReply of quickReplies) {
      response['quick_replies'].push({
        content_type: 'text',
        title: quickReply['title'],
        payload: quickReply['payload'],
      })
    }

    return response
  }

  static genText(text) {
    let response = {
      text: text,
    }

    return response
  }

  static genStartMenu() {
    return this.genQuickReply('Выбери интересующий вопрос 👇', [
      {
        title: i18n.__('ig.menu.target'),
        payload: 'TARGET_START',
      },
      {
        title: i18n.__('ig.menu.consultation'),
        payload: 'CON_START',
      },
      {
        title: i18n.__('ig.menu.telegram_chat'),
        payload: 'TG_START',
      },
      {
        title: i18n.__('ig.menu.lid_magnet'),
        payload: 'LID_MAGNET',
      },
      {
        title: i18n.__('ig.any.call_nastya'),
        payload: 'ANY_TRY_CALL_OPERATOR',
      },
    ])
  }

  static genArbitraryMessage() {
    return this.genQuickReply(i18n.__('ig.any.arbitrary_message'), [
      {
        title: i18n.__('ig.any.gen_lead'),
        payload: 'ANY_GEN_LEAD',
      },
      {
        title: i18n.__('ig.any.call_nastya'),
        payload: 'ANY_CALL_OPERATOR',
      },
      {
        title: i18n.__('ig.any.show_menu'),
        payload: 'START_MENU',
      },
    ])
  }

  static genUnsupportedMessageReaction() {
    return this.genQuickReply(i18n.__('ig.any.arbitrary_message'), [
      {
        title: 'Материалы с рекламы',
        payload: 'LID_MAGNET',
      },
      {
        title: i18n.__('ig.any.gen_lead'),
        payload: 'ANY_GEN_LEAD',
      },
      {
        title: i18n.__('ig.any.call_nastya'),
        payload: 'ANY_CALL_OPERATOR',
      },
    ])
  }

  static genStoryReaction() {
    return this.genText(i18n.__('ig.profile.story_reaction'))
  }

  static genHello(name) {
    const userName = name ? `, ${name}` : ''
    return this.genText(i18n.__('ig.profile.greeting', { userName }))
  }

  static genGenericTemplate(image_url, title, subtitle, buttons) {
    let response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: title,
              subtitle: subtitle,
              image_url: image_url,
              buttons: buttons,
            },
          ],
        },
      },
    }

    return response
  }
}
