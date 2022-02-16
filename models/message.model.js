const TextMessage = require('./../messages/text.message')
const QuickReplyMessage = require('./../messages/quick-reply.message')
const GenericTemplateMessage = require('./../messages/generic-template.message')

class MessageModel {
  /**
   * @type {( 'text' | 'quick_reply' | 'generic_template' )}
   */
  type

  /**
   * @type {object} - one of
   */
  data

  /**
   * @param {object} msg
   * @param {( 'text' | 'quick_reply' | 'generic_template' )} msg.type
   * @param {object} msg.data
   */
  constructor(msg) {
    this.type = msg.type
    this.data = msg.data
  }

  /**
   * @return {object} - message markup
   */
  get message() {
    if (!this.type || !this.data) {
      throw new Error('No type/no data in getter message of MessageModel.')
    }

    let message

    switch (this.type) {
      case 'text': {
        message = new TextMessage(this.data)
        break
      }

      case 'quick_reply': {
        message = new QuickReplyMessage(this.data)
        break
      }

      case 'generic_template': {
        message = new GenericTemplateMessage(this.data)
        break
      }

      default: {
        throw new Error(
          `Try to get message of MessageModel, but provided type "${this.type}" is wrong.`
        )
      }
    }

    return message.render()
  }
}

module.exports = MessageModel
