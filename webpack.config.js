function buildConfig (env) {
  return require(`./config/${env}.js`)(__dirname)
}

module.exports = buildConfig
