/**
 * @module Answer
 */

const db = require('./../db')
const i18n = require('./../i18n.config')
const MessageModel = require('./../models/message.model')
const { notifyError } = require('./../services/telegram-bot')

/**
 * @class
 */
class Answer {
  /**
   * @type {number}
   */
  id

  /**
   * @type {string}
   */
  payload

  /**
   * @type {object}
   */
  answer

  /**
   * @param {string} payload
   */
  constructor(payload) {
    this.payload = payload?.toUpperCase()
  }

  /**
   * @return {Promise<{answer: Object, payload: string, id: number}>}
   */
  async getAnswerByPayload() {
    try {
      if (!this.payload) {
        throw new Error(
          'Try to get answer by payload in AnswerModel, but payload not provided in constructor.'
        )
      }

      const dbResponse = await db.query(
        `SELECT * FROM answers WHERE payload = $1`,
        [this.payload]
      )

      if (dbResponse.rows.length === 0) {
        await notifyError(`Не найдена запись в БД для ответа на payload="${this.payload}"`)

        const unknownPayloadMessage = new MessageModel({
          type: 'quick_reply',
          data: {
            text: i18n.__('payload_not_resolved'),
            quick_replies: [
              {
                title: 'Открыть меню',
                payload: 'START_MENU'
              },
              {
                title: 'Позвать Настю',
                payload: 'ANY_CALL_OPERATOR'
              }
            ]
          },
        })

        this.answer = unknownPayloadMessage.message

        return {
          id: 0,
          payload: this.payload,
          answer: this.answer,
        }
      }

      this.id = Number(dbResponse.rows[0].id)

      const answer = JSON.parse(dbResponse.rows[0].answer)

      if (Array.isArray(answer)) {
        this.answer = []

        answer.forEach((item) => {
          const message = new MessageModel({ type: item.type, data: item.data })
          this.answer.push(message.message)
        })

        return {
          id: this.id,
          payload: this.payload,
          answer: this.answer,
        }
      }

      const singleMessage = new MessageModel({
        type: answer.type,
        data: answer.data,
      })
      this.answer = singleMessage.message

      return {
        id: this.id,
        payload: this.payload,
        answer: this.answer,
      }
    } catch (e) {
      throw new Error(e)
    }
  }
}

module.exports = Answer