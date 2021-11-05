const Response = require('./response'),
  i18n = require('./../i18n.config')

module.exports = class LidMagnet {
  static handlePayload(payload) {
    if (payload === 'LID_MAGNET') {
      return [
        Response.genText(i18n.__('ig.lid_magnet.thanks')),
        Response.genText(i18n.__('ig.lid_magnet.ideas_storage')),
        Response.genText(i18n.__('ig.lid_magnet.figma_lesson')),
        Response.genText(i18n.__('ig.lid_magnet.how_to_write_client')),
        Response.genText(i18n.__('ig.lid_magnet.where_find_client')),
        Response.genText(i18n.__('ig.lid_magnet.video_substitution')),
        Response.genText(i18n.__('ig.lid_magnet.calculating_budget')),
      ]
    }
  }
}