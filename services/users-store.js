const debug = require('debug')('service:users-store')
const db = require('./../db')
const User = require('./user')

// Object to local store known users.
let users = []

const deleteFirstUserInLocalStorage = () => {
  if (users.length > 0) {
    users.splice(0, 1)
  }
}

module.exports = {
  /**
   * Returns User if exists
   * else {}
   * @param igsid
   * @returns {Object}
   */
  async getUserByIgsid(igsid) {
    try {
      if (!igsid) {
        return {}
      }

      let user = users.find((u) => u.igsid === igsid)

      if (user) {
        return user
      } else {
        const dbResponse = await db.query(
          'SELECT * FROM ig_users WHERE igsid=$1',
          [igsid]
        )

        if (dbResponse.rowCount) {
          if (users.length > 10) {
            deleteFirstUserInLocalStorage()
          }

          const name = dbResponse.rows[0].name || ''

          user = new User(dbResponse.rows[0].igsid, name)

          await user.setThreadOwner()

          await user.setLastEcho()

          users.push(user)

          return user
        } else {
          return {}
        }
      }
    } catch (e) {
      debug('❌ Error in getUserByIgsid.\n%O', e)

      return {}
    }
  },

  /**
   * Saved new User to local storage and database
   * @param {{ igsid: string, name: string }} user
   * @returns {object}
   */
  async saveNewUser(user) {
    try {
      const dbResponse = await db.query(
        `INSERT INTO ig_users (id, igsid, name, last_echo, last_income, is_app_thread_owner, interest)
          VALUES (DEFAULT, $1, $2, null, null, DEFAULT, DEFAULT) RETURNING *`,
        [user.igsid, user.name]
      )

      const newUser = new User(dbResponse.rows[0].igsid)

      if (users.length > 10) {
        deleteFirstUserInLocalStorage()
      }

      users.push(newUser)

      return newUser
    } catch (e) {
      debug('❌ An error occurs when save IG user.\n%O', e)
      throw new Error(e)
    }
  },
}
