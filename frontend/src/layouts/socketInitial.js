import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API)
const userId = +localStorage.getItem('userId')

export default {
  methods: {
    socketInitial () {
      socket.emit('joinNotification')

      socket.on('ticket', data => {
        if (data.action === 'updateUnread' || data.action === 'delete') {

        }
      })

      socket.on('appMessage', data => {
        if (
          data.action === 'create' &&
          !data.message.read &&
          (data.ticket.userId === userId || !data.ticket.userId)
        ) {
          this.handlerNotifications(data)
        }
      })

      socket.on('whatsapp', data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      socket.on('whatsapp', data => {
        if (data.action === 'delete') {
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      socket.on('whatsappSession', data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
        }
      })
    }
  },
  mounted () {
    this.socketInitial()
  },
  destroyed () {
    socket.disconnect()
  }
}
