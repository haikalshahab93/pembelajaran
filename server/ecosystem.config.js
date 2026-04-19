module.exports = {
  apps: [
    {
      name: "pembelajaran-backend",
      script: "./index.js",
      cwd: __dirname,
      env: {
        NODE_ENV: "production",
        HOST: "0.0.0.0",
        PORT: 8020
      }
    }
  ]
}
