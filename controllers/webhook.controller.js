const config = require('./../services/config')
const Receive = require('./../services/receive')
const User = require('./../services/user')
const ApiError = require('./../exceptions/api-error')
const GraphApi = require('./../services/graph-api')
const UsersStore = require('./../services/users-store')
const Response = require('./../services/response')
const { log, warn } = require('./../utils/log')

class WebhookController {
  verifyWebhook(req, res) {
    // Parse the query params
    log('🔵 Got /webhook')
    let mode = req.query['hub.mode']
    let token = req.query['hub.verify_token']
    let challenge = req.query['hub.challenge']

    // Check if a token and mode is in the query string of the request
    if (mode && token) {
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === config.verifyToken) {
        // Responds with the challenge token from the request
        log('🔵 WEBHOOK_VERIFIED')
        res.status(200).send(challenge)
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403)
      }
    } else {
      console.warn('Got /webhook but without needed parameters.')
    }
  }
  handleInstagramActions(req, res, next) {
    let body = req.body

    console.log(`\u{1F7EA} Received webhook:`)
    console.dir(body, { depth: null })

    try {
      if (body.object !== 'instagram') {
        return next(
          ApiError.NotFound(
            `Unrecognized POST to webhook or Received Messenger "page" object instead of "instagram" message webhook.`
          )
        )
      }

      // Return a '200 OK' response to all requests
      res.status(200).send('EVENT_RECEIVED')

      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(async (entry) => {
        if (!('messaging' in entry)) {
          console.warn('No messaging field in entry. Possibly a webhook test.')
          return
        }

        // Iterate over webhook events - there may be multiple
        for (const webhookEvent of entry.messaging) {
          // Discard uninteresting events
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
            console.log('Got an echo')
            continue
          }

          // Get the sender IGSID
          let senderIgsid = webhookEvent.sender.id
          let user = await UsersStore.getUserByIgsid(senderIgsid)
          let receive

          if (!('igsid' in user)) {
            let newUser = new User(senderIgsid)
            let userName = await GraphApi.getUserName(senderIgsid)
            newUser.setName(userName)
            user = await UsersStore.saveNewUser(newUser)
            receive = new Receive(user, webhookEvent)
            await receive.sendMessage(Response.genHello(userName))
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
