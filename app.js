require('dotenv').config()
const isProduction = process.env.NODE_ENV === 'production'
const express = require('express')
const app = express()
const webhookRouter = require('./routes/webhook.route')
const { urlencoded, json } = require('body-parser')
const GraphApi = require('./services/graph-api')
const verifyRequestSignature = require('./services/verify-request-signature.service')
const errorMiddleware = require('./middleware/error.middleware')
const http = require('http')
const https = require('https')
const fs = require('fs')
const PORT = process.env.IG_CHATBOT_PORT || 8443

app.use(urlencoded({ extended: true }))

// Parse application/json. Verify that callback came from Facebook
app.use(json({ verify: verifyRequestSignature }))

app.use('/webhook', webhookRouter)
app.use(errorMiddleware)

const start = async () => {
  try {
    // http
    if (!isProduction) {
      const httpServer = http.createServer(app)
      await GraphApi.setPageSubscriptions()
      // await GraphApi.setIcebreakers()
      httpServer.listen(PORT, () => {
        console.log(`Instagram ChatBot HTTP Server started on port ${PORT} ...`)
      })
    } else { // https
      const httpsServer = https.createServer(
        {
          key: fs.readFileSync(
            '/home/ig/secret/privkey.pem'
          ),
          cert: fs.readFileSync(
            '/home/ig/secret/cert.pem'
          ),
          ca: fs.readFileSync(
            '/home/ig/secret/chain.pem'
          ),
        },
        app
      )

      await GraphApi.setPageSubscriptions()
      await GraphApi.setIcebreakers()

      httpsServer.listen(PORT, () => {
        console.log(`Instagram ChatBot HTTPS Server started on port ${PORT} ...`)
      })
    }
  } catch (err) {
    console.warn(err)
  }
}
start()
