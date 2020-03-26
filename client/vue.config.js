module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  devServer: {
    clientLogLevel: 'info',
    watchOptions: {
        poll: true
    },
    proxy: {
      '^/api': {
        target: 'https://localhost:5000',
        changeOrigin: true
      },
      '^/socket.io': {
        target: 'https://localhost:5000',
        changeOrigin: true,
        ws: true
      }
    },
  }
}