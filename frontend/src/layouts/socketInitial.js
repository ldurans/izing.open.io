const token = JSON.parse(localStorage.getItem('token'))
import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API, {
  forceNew: true,
  query: {
    token
  }
})
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

      socket.on('change_battery', data => {
        this.$q.notify({
          message: `Bateria do celular do whatsapp ${data.batteryInfo.sessionName} está com bateria em ${data.batteryInfo.battery}%. Necessário iniciar carregamento.`,
          type: 'negative',
          progress: true
        })
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
