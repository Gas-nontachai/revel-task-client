module.exports = {
  apps: [
    {
      name: 'revel-task-client',
      port: 3120,
      instances: '1',
      script: './.output/server/index.mjs'
    }
  ]
}
