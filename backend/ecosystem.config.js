module.exports = [{
  script: 'dist/server.js',
  name: 'wchats-app',
  exec_mode: 'cluster',
  cron_restart: '00 00 * * *',
  instances: 2,
  watch: false
}]
