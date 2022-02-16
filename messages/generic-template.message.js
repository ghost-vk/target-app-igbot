/**
 * @typedef {object} GenericTemplateMessageButton
 * @property {( 'web_url' | 'postback' )} type
 * @property {string} title
 * @property {string} payload
 * @property {string} url
 */

/**
 * @class
 */
class GenericTemplateMessage {
  /**
   * @type {string}
   */
  title

  /**
   * @type {string}
   */
  subtitle

  /**
   * @type {string}
   */
  imageUrl

  /**
   * @type {GenericTemplateMessageButton[]}
   */
  buttons

  /**
   * @param {object} msg
   * @param {string} msg.title
   * @param {string} msg.subtitle
   * @param {string} msg.image_url
   * @param {GenericTemplateMessageButton[]} msg.buttons
   */
  constructor(msg) {
    this.title = msg.title
    this.subtitle = msg.subtitle
    this.imageUrl = msg.image_url
    this.buttons = msg.buttons
  }

  /**
   * @returns {object} - GenericTemplateMessage markup
   */
  render() {
    return {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: this.title,
              subtitle: this.subtitle,
              image_url: this.imageUrl,
              buttons: this.buttons,
            },
          ],
        },
      },
    }
  }
}

module.exports = GenericTemplateMessage