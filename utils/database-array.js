module.exports = {
  toArray(str) {
    if (str) {
      if (str.includes('|')) {
        return str.split('|')
      } else {
        return [str]
      }
    } else {
      return []
    }
  }
}