// Test command: DEBUG=* DEBUG_DEPTH=* NODE_ENV=development node services/tests/answer.js

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const debug = require('debug')('test')

const Answer = require('./../answer')

const getAnswer = async () => {
  try {
    const answer = new Answer('CON_FORCE_QUESTION')
    const response = await answer.getAnswerByPayload()

    debug('Response:\n%O', response)
  } catch (e) {
    debug('Error:\n%O', e)
  }
}

getAnswer()
