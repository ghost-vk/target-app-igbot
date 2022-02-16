const { URL, URLSearchParams } = require('url')
const fetch = require('node-fetch')
const i18n = require('./../i18n.config')
const config = require('./config')
const debug = require('debug')('service:graph-api')

module.exports = class GraphApi {
  static async callSendApi(requestBody) {
    if (!requestBody) {
      debug('🔴 no requestBody in callSendApi')
      return false
    }

    const url = new URL(`${config.apiUrl}/me/messages`)

    url.search = new URLSearchParams({
      access_token: config.pageAccessToken,
    })

    debug('🔵 Send request to url: %s', url)
    debug('Body: %O', requestBody)

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      debug('🔴 Could not sent message. Response: %O', response)
    } else {
      debug('🟢 Get ok response: %O', response)
    }

    return response
  }

  static async getUser(senderIgsid, fields = 'name') {
    const url = new URL(`${config.apiUrl}/${senderIgsid}`)

    url.search = new URLSearchParams({
      access_token: config.pageAccessToken,
      fields,
    })

    const response = await fetch(url)

    if (response.ok) {
      const userProfile = await response.json()

      if (fields.split(',').length > 1) {
        return userProfile
      }

      return userProfile[fields] // only one param
    } else {
      debug('🔴 Could not load profile for %s', senderIgsid)
      debug('Status: %s', response.statusText)

      return null
    }
  }

  static async setPageSubscriptions() {
    const url = new URL(`${config.apiUrl}/${config.pageId}/subscribed_apps`)

    url.search = new URLSearchParams({
      access_token: config.pageAccessToken,
      subscribed_fields: 'feed',
    })

    debug('🔵 Try to set page subscriptions.')

    const response = await fetch(url, { method: 'POST' })

    if (response.ok) {
      debug('🟢 Page subscriptions have been set.')
    } else {
      debug('Error setting page subscriptions. Response: %O', response)
    }

    return true
  }

  static async setIcebreakers() {
    const iceBreakers = [
      {
        question: i18n.__('ig.menu.lid_magnet'),
        payload: 'LID_MAGNET',
      },
      {
        question: i18n.__('ig.menu.target'),
        payload: 'TARGET_START',
      },
      {
        question: i18n.__('ig.menu.consultation'),
        payload: 'CON_START',
      },
    ]

    const url = new URL(`${config.apiUrl}/me/messenger_profile`)

    url.search = new URLSearchParams({
      access_token: config.pageAccessToken,
    })

    const json = {
      platform: 'instagram',
      ice_breakers: iceBreakers,
    }

    debug('🔵 Try to set IceBreakers')

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    })

    if (response.ok) {
      debug(`🟢 Icebreakers have been set.`)
      return true
    } else {
      debug(`🔴 Error setting ice breakers. Status: %s`, response.statusText)
      return false
    }
  }

  static async passThreadControl(senderIgsid) {
    try {
      const url = new URL(`${config.apiUrl}/me/pass_thread_control`)

      url.search = new URLSearchParams({
        access_token: config.pageAccessToken,
      })

      const json = {
        recipient: { id: senderIgsid },
        target_app_id: config.instagramInboxAppId, // appid of Instagram inbox
      }

      debug(`🔵 Try to pass control.`)

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })

      debug('🟢 App passed thread control. Got response:\n%O', response)

      return true
    } catch (e) {
      debug('🔴 Error pass thread control:\n%O', e)
    }
  }

  static async takeThreadControl(senderIgsid) {
    try {
      const url = new URL(`${config.apiUrl}/me/take_thread_control`)

      url.search = new URLSearchParams({
        access_token: config.pageAccessToken,
      })

      const json = {
        recipient: {
          id: senderIgsid,
        },
      }

      debug('🔵 Try to take control.')

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })

      if (response.ok) {
        debug('🟢 App now is thread owner. Got response:\n%O', response)
      }

      return response
    } catch (e) {
      debug('🔴 Error setting thread owner.\n%O', e)
    }
  }
}
