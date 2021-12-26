const i18n = require('./../i18n.config')
const GraphApi = require('./graph-api')
const Response = require('./response')
const LidMagnet = require('./lidmagnet')
const AnyMessage = require('./any-messages')
const Consultation = require('./consultation')
const TelegramChat = require('./telegram')
const Target = require('./target')
const { log, warn } = require('./../utils/log')
const { notify } = require('./telegram-bot')

module.exports = class Receive {
  constructor(user, webhookEvent) {
    this.user = user
    this.webhookEvent = webhookEvent
  }

  async handleMessage() {
    let event = this.webhookEvent
    let responses
    try {
      // app isn't owner of thread
      await this.user.saveLastIncome()
      if (!this.user.isAppThreadOwner) {
        let wakeUp = false
        if (event?.message?.text?.trim().toLowerCase().includes('bot')) {
          wakeUp = true
        }
        // let app take the thread control after 30 minutes or get message 'bot'
        if (
          Math.abs((this.user.lastEcho - this.user.lastIncome) / 1000 / 60) >
            30 ||
          wakeUp
        ) {
          await GraphApi.takeThreadControl(this.user.igsid)
          await this.user.saveThreadOwner(true)

          if (wakeUp) {
            responses = Response.genBotTakeThreadControlMessage()
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
          await this.sendMessage(response, 1800)
        }
      } else {
        await this.sendMessage(responses)
      }

      return true
    } catch (e) {
      warn(['🔴 Error on message handling', e])
      responses = Response.genText(
        `Произошла ошибка, в скором времени мы ее устраним!`
      )
      await this.sendMessage(responses)
      return true
    }
  }

  // Handle message events with quick replies
  async handleQuickReply() {
    try {
      // Get the payload of the quick reply
      let payload = this.webhookEvent?.message?.quick_reply?.payload
      const responses = await this.handlePayload(payload)
      return responses
    } catch (e) {
      warn('🔴 Error when handling message with quick replies')
    }
  }

  async handlePostback() {
    try {
      const responses = await this.handlePayload(
        this.webhookEvent.postback.payload.toUpperCase()
      )
      return responses
    } catch (e) {
      warn('🔴 Error when handling message with postback')
    }
  }

  async handlePayload(payload) {
    log(`🔵 Received Payload: ${payload} for user ${this.user.igsid}`)
    let response
    try {
      // Set the response based on the payload
      if (payload === 'LID_MAGNET') {
        response = LidMagnet.handlePayload(payload)
      } else if (payload.includes('ANY_')) {
        response = await AnyMessage.handlePayload(payload, this.user)
      } else if (payload.includes('CON_')) {
        response = await Consultation.handlePayload(payload, this.user)
      } else if (payload.includes('TG_')) {
        response = await TelegramChat.handlePayload(payload, this.user)
      } else if (payload.includes('TARGET_')) {
        response = await Target.handlePayload(payload, this.user)
      } else if (payload.includes('START_MENU')) {
        response = Response.genStartMenu()
      }
      return response
    } catch (e) {
      throw new Error(e)
    }
  }

  // Handles messages events with text
  async handleTextMessage() {
    try {
      log([
        `🔵 Received text from user '${this.user.name}' (${this.user.igsid}):`,
        this.webhookEvent.message.text,
      ])

      let message = this.webhookEvent.message.text.trim().toLowerCase()
      let response

      if (message.includes('спасиб')) {
        response = Response.genYouWelcome()
      } else if (message.includes('материалы') || message.includes('+')) {
        response = LidMagnet.handlePayload('LID_MAGNET')
      } else if (message.includes('start')) {
        response = Response.genStartMenu()
      } else {
        if (!this.user.profilePic) {
          const profilePic = await GraphApi.getUser(
            this.user.igsid,
            'profile_pic'
          )
          this.user.setProfilePic(profilePic)
        }
        await notify(this.user.name, this.webhookEvent.message.text, this.user.profilePic)
        response = Response.genArbitraryMessage()
      }

      return response
    } catch (e) {
      warn(['❌ Error in handling text message', e])
    }
  }

  handleAttachmentMessage() {
    let responses = []
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
      console.error(e)
    }
  }

  async sendMessage(response, delay = 0) {
    try {
      if (!response) {
        log('🔵 No response from app. Maybe app pass control to IG inbox.')
        return false
      }
      // Check if there is delay in the response
      if ('delay' in response) {
        delay = response['delay']
        delete response['delay']
      }
      // Construct the message body
      let requestBody = {
        recipient: { id: this.user.igsid },
        message: response,
      }

      await this.callApi(requestBody, delay)
    } catch (e) {
      warn([`❌ Error when send message to user: ${this.user.igsid}`, e])
      throw new Error(e)
    }
  }

  async callApi(requestBody, delay) {
    return new Promise((resolve, reject) => {
      try {
        setTimeout(async () => {
          await GraphApi.callSendApi(requestBody)
          await this.user.saveLastEcho()
          if (requestBody?.message?.text === i18n.__('ig.any.please_waiting')) {
            await GraphApi.passThreadControl(this.user.igsid)
            await this.user.saveThreadOwner(false)
          }
          resolve(true)
        }, delay)
      } catch (e) {
        throw new Error(e)
      }
    })
  }
}
