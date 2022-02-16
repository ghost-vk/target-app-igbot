const db = require('./../db')
const debug = require('debug')('service:user')

module.exports = class User {
  constructor(igsid, name = '') {
    this.igsid = igsid
    this.name = name
    this.lastEcho = null
    this.lastIncome = null
    this.isAppThreadOwner = true
    this.profilePic = null
  }

  setName(name) {
    this.name = name
  }

  setProfilePic(photo) {
    this.profilePic = photo
  }

  async saveLastEcho() {
    try {
      const user = await db.query(
        `UPDATE ig_users
          SET last_echo = CURRENT_TIMESTAMP
          WHERE igsid = $1 RETURNING last_echo`,
        [this.igsid]
      )

      this.lastEcho = user.rows[0].last_echo

      return this.lastEcho
    } catch (e) {
      debug('❌ Error when saving last echo to user: %s', this.igsid)
      throw new Error(e)
    }
  }

  async setThreadOwner() {
    try {
      this.isAppThreadOwner = await this.getThreadOwner()
      return this.isAppThreadOwner
    } catch (e) {
      debug('❌ Error when set thread owner for user: %s', this.igsid)
      debug('%O', e)
      throw new Error(e)
    }
  }

  async getThreadOwner() {
    try {
      const dbResponse = await db.query(
        `SELECT is_app_thread_owner FROM ig_users WHERE igsid = $1`,
        [this.igsid]
      )

      return dbResponse.rows[0].is_app_thread_owner
    } catch (e) {
      debug('❌ Error when get thread owner for user: %s', this.igsid)
      debug('%O', e)

      throw new Error(e)
    }
  }

  async saveThreadOwner(owning) {
    try {
      const dbResponse = await db.query(
        `UPDATE ig_users
         SET is_app_thread_owner = $1
         WHERE igsid = $2 RETURNING is_app_thread_owner`,
        [!!owning, this.igsid]
      )

      this.isAppThreadOwner = dbResponse.rows[0].is_app_thread_owner

      return this.isAppThreadOwner
    } catch (e) {
      debug('❌ Error when save thread owner for user: %s', this.igsid)
      debug('%O', e)

      throw new Error(e)
    }
  }

  async setLastEcho() {
    try {
      const lastEcho = await this.getLastEcho()
      this.lastEcho = new Date(lastEcho)

      return this.lastEcho
    } catch (e) {
      debug('❌ Error when set last echo to user: %s', this.igsid)
      debug('%O', e)

      throw new Error(e)
    }
  }

  async getLastEcho() {
    try {
      const dbResponse = await db.query(
        `SELECT last_echo FROM ig_users WHERE igsid = $1`,
        [this.igsid]
      )

      return dbResponse.rows[0].last_echo
    } catch (e) {
      debug('❌ Error when getting last echo to user: %s', this.igsid)
      debug('%O', e)

      throw new Error(e)
    }
  }

  async saveLastIncome() {
    try {
      const user = await db.query(
        `UPDATE ig_users
          SET last_income = CURRENT_TIMESTAMP
          WHERE igsid = $1 RETURNING last_income`,
        [this.igsid]
      )

      this.lastIncome = new Date(user.rows[0].last_income)

      return this.lastIncome
    } catch (e) {
      debug('❌ Error when saving last income to user: %s', this.igsid)
      debug('%O', e)

      throw new Error(e)
    }
  }

  async getLastIncome() {
    try {
      const dbResponse = await db.query(
        `SELECT last_income FROM ig_users WHERE igsid = $1`,
        [this.igsid]
      )

      this.lastIncome = new Date(dbResponse.rows[0].last_income)

      return this.lastIncome
    } catch (e) {
      debug('❌ Error when getting last income to user: %s', this.igsid)

      throw new Error(e)
    }
  }
}
