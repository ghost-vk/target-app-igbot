// Test command: DEBUG=* DEBUG_DEPTH=* NODE_ENV=development node services/tests/handle-text-message.js

const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, './../../.env') })
const db = require('../../db')
const Answer = require('../answer')
const debug = require('debug')('test')

const getResponse = async (message) => {
  const dbResponse = await db.query('SELECT * FROM text_needles')

  if (dbResponse.rows.length > 0) {
    let row
    for (row of dbResponse.rows) {
      const needles = row.needle.split('|')

      let pattern

      for (pattern of needles) {
        if (message.includes(pattern)) {
          const answer = new Answer(row.payload)
          const response = await answer.getAnswerByPayload()

          return response
        }
      }
    }
  }
}

getResponse('материалы').then((response) => {
  debug('Response:\n%O', response)
})


