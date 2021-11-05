const isLogging = process.env.LOGGING === 'yes'

module.exports = {
  warn(messages) {
    if (!isLogging) {
      return
    }
    let warnings = Array.isArray(messages) ? messages : [messages]
    warnings.forEach(m => {
      console.warn(m)
    })
  },
  log(messages) {
    if (!isLogging) {
      return
    }
    let logs = Array.isArray(messages) ? messages : [messages]
    logs.forEach(l => {
      console.warn(l)
    })
  },
}
