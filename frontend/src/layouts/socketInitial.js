const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
import Router from 'src/router/index'

import openSocket from 'socket.io-client'
import checkTicketFilter from 'src/utils/checkTicketFilter'
const socket = openSocket(process.env.URL_API, {
  query: {
    token
  },
  forceNew: true
})
const userId = +localStorage.getItem('userId')

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  setTimeout(() => {
    Router.push({
      name: 'login'
    })
  }, 1000)
})

export default {
  methods: {
    socketInitial () {
      socket.emit(`${usuario.tenantId}:joinNotification`)

      socket.on(`${usuario.tenantId}:appMessage`, data => {
        if (
          data.action === 'create' &&
          !data.message.read &&
          (data.ticket.userId === userId || !data.ticket.userId)
        ) {
          if (checkTicketFilter(data.ticket)) {
            this.handlerNotifications(data)
          }
        }
      })

      socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_WHATSAPPS', data.whatsapp)
        }
      })

      socket.on(`${usuario.tenantId}:whatsapp`, data => {
        if (data.action === 'delete') {
          this.$store.commit('DELETE_WHATSAPPS', data.whatsappId)
        }
      })

      socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_SESSION', data.session)
          this.$root.$emit('UPDATE_SESSION', data.session)
        }

        if (data.action === 'readySession') {
          this.$q.notify({
            position: 'top',
            icon: 'mdi-wifi-arrow-up-down',
            message: `A conexão com o WhatsApp está pronta e o mesmo está habilitado para enviar e receber mensagens. Conexão: ${data.session.name}. Número: ${data.session.number}.`,
            type: 'positive',
            color: 'primary',
            html: true,
            progress: true,
            timeout: 7000,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }],
            classes: 'text-body2 text-weight-medium'
          })
        }
      })

      socket.on(`${usuario.tenantId}:change_battery`, data => {
        this.$q.notify({
          message: `Bateria do celular do whatsapp ${data.batteryInfo.sessionName} está com bateria em ${data.batteryInfo.battery}%. Necessário iniciar carregamento.`,
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
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
