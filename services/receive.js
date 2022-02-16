const i18n = require('./../i18n.config')
const GraphApi = require('./graph-api')
const Response = require('./response')
const Answer = require('./answer')
const AnyMessage = require('./any-messages')
const debug = require('debug')('service:receive')
const { notify } = require('./telegram-bot')
const sleep = require('./../utils/sleep')
const db = require('../db')
const { quiet } = require('nodemon/lib/utils')

/**
 * @typedef {object} TextNeedleRow
 * @property {string} needle
 * @property {string} payload
 */

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  async handleMessage() {
    let event = this.webhookEvent
    let responses

    try {
      await this.user.saveLastIncome()

      if (!this.user.isAppThreadOwner) {
        let wakeUp = false

        if (event?.message?.text?.trim().toLowerCase().includes('bot')) {
          wakeUp = true
        }

        // let app take the thread control after 30 minutes or get message 'bot'
        const isAfter30Minutes =
          Math.abs((this.user.lastEcho - this.user.lastIncome) / 1000 / 60) > 30

        if (isAfter30Minutes || wakeUp) {
          await GraphApi.takeThreadControl(this.user.igsid)

          await this.user.saveThreadOwner(true)

          if (wakeUp) {
            responses = await Response.genBotTakeThreadControlMessage()
          }
        } else {
          return false
        }
      }

      if (event.message && !responses) {
        let message = event.message

        if (message.is_echo) {
          return
        } else if (message.quick_reply) {
          responses = await this.handleQuickReply()
        } else if (message.attachments) {
          responses = this.handleAttachmentMessage()
        } else if (message?.reply_to?.story) {
          responses = this.handleReplyToStory()
        } else if (message.text) {
          responses = await this.handleTextMessage()
        } else if (message.is_deleted) {
          responses = false
        } else if (message.is_unsupported) {
          responses = Response.genUnsupportedMessageReaction()
        } else {
          responses = false
        }
      } else if (event.postback) {
        responses = await this.handlePostback()
      }

      if (!responses) {
        return false
      }

      if (Array.isArray(responses)) {
        for (let response of responses) {
          await this.sendMessage(response, 1500)
        }
      } else {
        await this.sendMessage(responses)
      }

      return true
    } catch (e) {
      debug('🔴 Error on message handling:\n%O', e)

      responses = Response.genText(
        `Произошла ошибка, в скором времени мы ее устраним!`
      )

      await this.sendMessage(responses)

      return true
    }
  }

  async handleQuickReply() {
    try {
      const responses = await this.handlePayload(
        this.webhookEvent?.message?.quick_reply?.payload?.toUpperCase()
      )

      return responses
    } catch (e) {
      debug('🔴 Error when handling message with quick replies:\n%O', e)

      throw new Error(e)
    }
  }

  async handlePostback() {
    try {
      return await this.handlePayload(
        this.webhookEvent.postback.payload.toUpperCase()
      )
    } catch (e) {
      debug('🔴 Error when handling message with postback', e)
    }
  }

  async handlePayload(payload) {
    debug('🔵 Received Payload: "%s".', payload)
    debug('For user: %s', this.user.igsid)

    try {
      if (payload.includes('ANY_')) {
        return await AnyMessage.handlePayload(payload, this.user)
      }

      const answer = new Answer(payload)
      const fetched = await answer.getAnswerByPayload()

      return fetched.answer
    } catch (e) {
      throw new Error(e)
    }
  }

  async handleTextMessage() {
    try {
      debug('🔵 Received text from User.\nUsername: %s', this.user.name)
      debug('IGSID: %s\n', this.user.igsid)
      debug('Text: %s', this.webhookEvent.message.text)

      const message = this.webhookEvent.message.text.trim().toLowerCase()

      // content only for followers
      if (message.startsWith('#')) {
        const isUserFollowBusiness = await GraphApi.getUser(
          this.user.igsid,
          'is_user_follow_business'
        )

        if (!isUserFollowBusiness) {
          debug('🔵 User not follow business', isUserFollowBusiness)

          const answer = new Answer('ONLY_FOR_FOLLOWERS')
          const fetched = await answer.getAnswerByPayload()

          return fetched.answer
        }
      }

      let response

      /**
       * @type {object}
       * @property {TextNeedleRow[]} rows
       */
      const dbResponse = await db.query('SELECT * FROM text_needles')

      if (dbResponse.rows.length > 0) {
        let row
        for (row of dbResponse.rows) {
          const needles = row.needle.split('|')

          let pattern

          for (pattern of needles) {
            // strict
            if (message.includes('#') && message.includes(pattern)) {
              if (message === pattern) {
                const answer = new Answer(row.payload)
                const fetched = await answer.getAnswerByPayload()

                return fetched.answer
              }
            } else if (message.includes(pattern)) {
              const answer = new Answer(row.payload)
              const fetched = await answer.getAnswerByPayload()

              return fetched.answer
            }
          }
        }
      }

      if (message.includes('start')) {
        return await Response.genStartMenu()
      }

      if (!this.user.profilePic) {
        const profilePic = await GraphApi.getUser(
          this.user.igsid,
          'profile_pic'
        )

        this.user.setProfilePic(profilePic)
      }

      await notify(
        this.user.name,
        this.webhookEvent.message.text,
        this.user.profilePic
      )

      return Response.genArbitraryMessage()
    } catch (e) {
      debug('❌ Error in handling text message: %O', e)

      throw new Error(e)
    }
  }

  handleAttachmentMessage() {
    const responses = []
    let isStoryMention = false
    let isAnyFile = false

    this.webhookEvent.message.attachments.forEach((a) => {
      if (a.type === 'story_mention') {
        isStoryMention = true
      } else {
        isAnyFile = true
      }
    })

    if (isStoryMention) {
      responses.push(Response.genText(i18n.__('ig.any.thanks_story_mention')))
    }

    if (isAnyFile) {
      responses.push(
        Response.genQuickReply(i18n.__('ig.any.fallback_attachment'), [
          {
            title: i18n.__('ig.any.gen_lead'),
            payload: 'ANY_GEN_LEAD',
          },
          {
            title: i18n.__('ig.any.call_nastya'),
            payload: 'ANY_CALL_OPERATOR',
          },
        ])
      )
    }

    return responses
  }

  async handleReplyToStory() {
    try {
      const message = this.webhookEvent.message.text

      if (message.split(' ').length > 1) {
        if (!this.user.profilePic) {
          const profilePic = await GraphApi.getUser(
            this.user.igsid,
            'profile_pic'
          )

          this.user.setProfilePic(profilePic)
        }

        await notify(this.user.name, message, this.user.profilePic)
      }

      return Response.genStoryReaction()
    } catch (e) {
      debug('Error when handle reply to story, %O', e)

      throw new Error(e)
    }
  }

  async sendMessage(response, delay = 0) {
    try {
      if (!response) {
        debug('🔵 No response from app. Maybe app pass control to IG inbox.')

        return false
      }

      if ('delay' in response) {
        delay = response['delay']
        delete response['delay']
      }

      let requestBody = {
        recipient: { id: this.user.igsid },
        message: response,
      }

      await this.callApi(requestBody, delay)
    } catch (e) {
      debug('❌ Send message to User.\nIGSID: %s', this.user.igsid)
      debug('Error:\n%O', e)

      throw new Error(e)
    }
  }

  async callApi(requestBody, delay) {
    try {
      await GraphApi.callSendApi(requestBody)

      await this.user.saveLastEcho()

      if (requestBody?.message?.text === i18n.__('ig.any.please_waiting')) {
        await GraphApi.passThreadControl(this.user.igsid)
        await this.user.saveThreadOwner(false)
      }

      await sleep(delay)

      return true
    } catch (e) {
      throw new Error(e)
    }
  }
}
