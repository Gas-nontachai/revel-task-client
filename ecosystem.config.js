module.exports = {
  apps: [
    {
      name: 'ttcenter-client',
      port: 3090,
      instances: '1',
      script: './.output/server/index.mjs'
    }
  ]
}
