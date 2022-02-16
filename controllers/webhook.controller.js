const config = require('./../services/config')
const Receive = require('./../services/receive')
const User = require('./../services/user')
const ApiError = require('./../exceptions/api-error')
const GraphApi = require('./../services/graph-api')
const UsersStore = require('./../services/users-store')
const Response = require('./../services/response')
const debug = require('debug')('controller:webhook')

class WebhookController {
  verifyWebhook(req, res) {
    debug('🔵 Got /webhook. Query: %O', req.query)

    const mode = req.query['hub.mode']
    const token = req.query['hub.verify_token']
    const challenge = req.query['hub.challenge']

    if (mode && token) {
      if (mode === 'subscribe' && token === config.verifyToken) {
        debug('🔵 WEBHOOK_VERIFIED')
        res.status(200).send(challenge)
      } else {
        res.sendStatus(403)
      }
    } else {
      debug('Got /webhook but without needed parameters.')
    }
  }

  handleInstagramActions(req, res, next) {
    let body = req.body

    debug('🟢 Received webhook:\n%O', body)

    try {
      if (body.object !== 'instagram') {
        return next(
          ApiError.NotFound(
            `Unrecognized POST to webhook or Received Messenger "page" object instead of "instagram" message webhook.`
          )
        )
      }

      res.status(200).send('EVENT_RECEIVED')

      body.entry.forEach(async (entry) => {
        if (!('messaging' in entry)) {
          debug('No messaging field in entry. Possibly a webhook test.')
          return
        }

        for (const webhookEvent of entry.messaging) {
          if (
            'message' in webhookEvent &&
            webhookEvent.message.is_echo === true
          ) {
            const recipientUser = await UsersStore.getUserByIgsid(
              webhookEvent.recipient.id
            )

            if (recipientUser['igsid'] !== undefined) {
              await recipientUser.saveLastEcho()
            }

            continue
          }

          const senderIgsid = webhookEvent.sender.id
          let user = await UsersStore.getUserByIgsid(senderIgsid)
          let receive

          if (!('igsid' in user)) {
            const newUser = new User(senderIgsid)
            const userName = await GraphApi.getUser(senderIgsid, 'name')

            newUser.setName(userName)

            user = await UsersStore.saveNewUser(newUser)

            receive = new Receive(user, webhookEvent)
            await receive.sendMessage(Response.genHello())
          }

          receive =
            receive instanceof Receive
              ? receive
              : new Receive(user, webhookEvent)

          await receive.handleMessage()
        }
      })
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new WebhookController()
