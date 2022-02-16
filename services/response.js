const i18n = require('../i18n.config')
const db = require('./../db')
const debug = require('debug')('service:response')
const Answer = require('./answer')

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

  static async genStartMenu() {
    try {
      const answer = new Answer('START_MENU')

      const fetched = await answer.getAnswerByPayload()

      return fetched.answer
    } catch (e) {
      debug('Error when generating start menu markup:\n%O', e)
      throw new Error(e)
    }
  }

  static async genBotTakeThreadControlMessage() {
    try {
      const menuMarkup = await this.genStartMenu()

      return [
        this.genText(i18n.__('ig.any.bot_take_control')),
        menuMarkup
      ]
    } catch (e) {
      debug('Error when generating bot take control message:\n%O', e)
      throw new Error(e)
    }
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

  static genHello() {
    return this.genText(i18n.__('ig.profile.greeting'))
  }

  static genGenericTemplate(image_url, title, subtitle, buttons) {
    return {
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
  }
}
