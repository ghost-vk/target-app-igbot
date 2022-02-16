/**
 * @typedef { object } QuickReplyItem
 * @property {string} text
 * @property {string} payload - Example: START_MENU
 */

/**
 * @typedef { object } QuickReplyMessageMarkup
 * @property { string } text
 * @property { QuickReplyItem[] } quick_replies
 * @property {( 'text' )} content_type
 */

/**
 * @class
 */
class QuickReplyMessage {
  /**
   * @type {string}
   */
  text

  /**
   * @type {QuickReplyItem[]}
   */
  quick_replies

  /**
   * @param {object} msg
   * @param {string} msg.text
   * @param { QuickReplyItem[] } msg.quick_replies
   */
  constructor(msg) {
    this.text = msg.text
    this.quick_replies = msg.quick_replies.map((q) => {
      return {
        ...q,
        content_type: 'text',
      }
    })
  }

  /**
   * @returns {QuickReplyMessageMarkup}
   */
  render() {
    return {
      text: this.text,
      quick_replies: this.quick_replies,
    }
  }
}

module.exports = QuickReplyMessage
