const db = require('./../db')
const { toArray } = require('./../utils/database-array')
const { warn } = require('./../utils/log')

module.exports = class User {
  constructor(igsid) {
    this.igsid = igsid
    this.name = ''
    this.lastEcho = null
    this.lastIncome = null
    this.isAppThreadOwner = true
    this.interests = []
  }
  setName(name) {
    this.name = name
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
      warn(`❌ Error when saving last echo to user: ${this.igsid}`)
      throw new Error(e)
    }
  }
  async setThreadOwner() {
    try {
      this.isAppThreadOwner = await this.getThreadOwner()
      return this.isAppThreadOwner
    } catch (e) {
      warn(`❌ Error when set thread owner for user: ${this.igsid}`)
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
      warn(`❌ Error when get thread owner for user: ${this.igsid}`)
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
      warn(`❌ Error when save thread owner for user: ${this.igsid}`)
      throw new Error(e)
    }
  }

  async setLastEcho() {
    try {
      const lastEcho = await this.getLastEcho()
      this.lastEcho = new Date(lastEcho)
      return this.lastEcho
    } catch (e) {
      warn(`❌ Error when set last echo to user: ${this.igsid}`)
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
      warn(`❌ Error when getting last echo to user: ${this.igsid}`)
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
      warn(`❌ Error when saving last income to user: ${e}`)
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
      warn(`❌ Error when getting last income to user: ${this.igsid}`)
      throw new Error(e)
    }
  }

  /**
   * Returns array of user interests
   * @returns {Promise<unknown> | Array}
   */
  async getInterests() {
    try {
      const dbResponse = await db.query(
        `SELECT interest FROM ig_users WHERE igsid = $1`,
        [this.igsid]
      )
      const { interest } = dbResponse.rows[0]
      return toArray(interest)
    } catch (e) {
      warn(`❌ Error when getting user interests: ${this.igsid}`)
      throw new Error(e)
    }
  }

  async setInterests() {
    try {
      this.interests = await this.getInterests()
      return this.interests
    } catch (e) {
      warn(`❌ Error when getting user interests: ${this.igsid}`)
      throw new Error(e)
    }
  }

  async saveInterest(interest) {
    try {
      if (this.interests.includes(interest)) {
        return true
      }
      if (!['target', 'consultation', 'telegram'].includes(interest)) {
        return false
      }
      const existInterests = await this.getInterests()
      if (existInterests.includes(interest)) {
        return true
      }
      existInterests.push(interest)
      const newInterests = existInterests.join('|')
      const dbResponse = await db.query(
        `UPDATE ig_users
          SET interest = $1
          WHERE igsid = $2 RETURNING interest`,
        [newInterests, this.igsid]
      )
      this.interests = toArray(dbResponse.rows[0].interest)
      return this.interests
    } catch (e) {
      console.warn(`❌ Error when saving user interest: ${this.igsid}`)
      throw new Error(e)
    }
  }
}
