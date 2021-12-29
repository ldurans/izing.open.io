const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
// const queues = JSON.parse(localStorage.getItem('queues'))
import Router from 'src/router/index'
// import verifySocketTicketAction from 'src/utils/verifySocketTicketAction'

// const isQueueOrUserNotify = (ticket) => {
//   const queue = queues.findIndex(q => q.id === ticket.queueId)
//   return (queue || usuario.id === ticket.userId)
// }

import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API, {
  query: {
    token
  },
  forceNew: true
})
// const userId = +localStorage.getItem('userId')

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

      // socket.on(`${ usuario.tenantId }:ticket`, data => {
      //   if (!verifySocketTicketAction(data.ticket, data.action)) return
      //   if (data.action === 'updateUnread' || data.action === 'delete') {

      //   }
      // })

      // socket.on(`${ usuario.tenantId }:appMessage`, data => {
      //   if (
      //     data.action === 'create' &&
      //     !data.message.read &&
      //     (data.ticket.userId === userId || !data.ticket.userId)
      //   ) {
      //     if (isQueueOrUserNotify(data.ticket)) {
      //       this.handlerNotifications(data)
      //     }
      //   }
      // })

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
            message: `
        < p >
        Conexão com o whatsapp está pronta.Agora já é possível enviar e receber mensagens!!
        < p > Nome Conexão: <span class="q-ml-sm "> ${data.session.name} </span>  <span class="q-mx-sm"> || </span> Número: <span class="q-ml-sm"> ${data.session.number} </span> </p >
        <p>`,
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
