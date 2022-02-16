/**
 * @class
 */
class TextMessage {
  /**
   * @type {string}
   */
  text

  /**
   * @param { object } msg
   * @param { string } msg.text
   */
  constructor(msg) {
    this.text = msg.text
  }

  /**
   * @return {{text: string}}
   */
  render() {
    return {
      text: this.text
    }
  }
}

module.exports = TextMessage