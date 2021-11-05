const { URL, URLSearchParams } = require('url')
const fetch = require('node-fetch')
const i18n = require('./../i18n.config')
const config = require('./config')
const { log, warn } = require('./../utils/log')

module.exports = class GraphApi {
  static async callSendApi(requestBody) {
    if (!requestBody) {
      warn(`🔴 no requestBody in callSendApi`)
      return false
    }
    let url = new URL(`${config.apiUrl}/me/messages`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
    })
    log([`🔵 Send request to url: ${url}`, `Body: ${requestBody}`])
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) {
      warn([`🔴 Could not sent message.`, response.statusText, response])
    } else {
      log(`🟢 Get ok response: ${response}`)
    }
    return response
  }

  static async getUserName(senderIgsid) {
    let url = new URL(`${config.apiUrl}/${senderIgsid}`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
      fields: 'name',
    })

    let response = await fetch(url)

    if (response.ok) {
      let userProfile = await response.json()
      return userProfile.name
    } else {
      warn(
        `🔴 Could not load profile for ${senderIgsid}: ${response.statusText}`
      )
      return null
    }
  }

  static async setPageSubscriptions() {
    let url = new URL(`${config.apiUrl}/${config.pageId}/subscribed_apps`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
      subscribed_fields: 'feed',
    })
    log(`🔵 Try to set page subscriptions.`)
    let response = await fetch(url, { method: 'POST' })
    if (response.ok) {
      log('🟢 Page subscriptions have been set.')
    } else {
      warn([`Error setting page subscriptions`, response.statusText])
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
      {
        question: i18n.__('ig.menu.telegram_chat'),
        payload: 'TG_START',
      },
    ]

    let url = new URL(`${config.apiUrl}/me/messenger_profile`)
    url.search = new URLSearchParams({
      access_token: config.pageAccesToken,
    })
    let json = {
      platform: 'instagram',
      ice_breakers: iceBreakers,
    }
    log(`🔵 Try to set IceBreakers.`)
    let response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(json),
    })
    if (response.ok) {
      log(`🟢 Icebreakers have been set.`)
      return true
    } else {
      warn(`🔴 Error setting ice breakers`, response.statusText)
      return false
    }
  }

  static async passThreadControl(senderIgsid) {
    try {
      let url = new URL(`${config.apiUrl}/me/pass_thread_control`)
      url.search = new URLSearchParams({
        access_token: config.pageAccesToken,
      })
      let json = {
        recipient: { id: senderIgsid },
        target_app_id: config.instagramInboxAppId, // appid of Instagram inbox
      }
      log(`🔵 Try to pass control.`)
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      log(['🟢 App passed thread control', response])
      return true
    } catch (e) {
      warn(['🔴 Error pass thread control', e])
    }
  }

  static async takeThreadControl(senderIgsid) {
    try {
      let url = new URL(`${config.apiUrl}/me/take_thread_control`)
      url.search = new URLSearchParams({
        access_token: config.pageAccesToken,
      })
      let json = {
        recipient: {
          id: senderIgsid,
        },
      }
      log(`🔵 Try to take control.`)
      let response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      })
      if (response.ok) {
        log(['🟢 App now is thread owner', response])
      }
      return response
    } catch (e) {
      warn([`🔴 Error setting thread owner`, e])
    }
  }
}
