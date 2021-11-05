const Router = require('express').Router
const webhookController = require('../controllers/webhook.controller')
const webhookRouter = new Router()

webhookRouter.get('/', webhookController.verifyWebhook)
webhookRouter.post('/', webhookController.handleInstagramActions)

module.exports = webhookRouter
