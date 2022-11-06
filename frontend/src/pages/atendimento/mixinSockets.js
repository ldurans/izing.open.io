const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
// import verifySocketTicketAction from 'src/utils/verifySocketTicketAction'
import Router from 'src/router/index'
import openSocket from 'socket.io-client'
const socket = openSocket(process.env.URL_API, {
  query: {
    token
  },
  forceNew: true
})
const userId = +localStorage.getItem('userId')

// localStorage.debug = '*'

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
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 400)
    },
    socketMessagesList () {

    },
    socketTicket () {
      socket.on(`${usuario.tenantId}:ticket`, data => {
        // verifySocketTicketAction(data.ticket, data.action)

        if (data.action === 'update' && data.ticket.userId === userId) {
          if (data.ticket.status === 'open' && !data.ticket.isTransference) {
            this.$store.commit('TICKET_FOCADO', data.ticket)
          }
        }
      })

      // socket.on(`${usuario.tenantId}:contact`, data => {
      //   if (data.action === 'update') {
      //     this.$store.commit('UPDATE_TICKET_CONTACT', data.contact)
      //     if (this.$store.getters.ticketFocado.contactId === data.contact.id) {
      //       this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', data.contact)
      //     }
      //   }
      // })
    },
    socketTicketList () {
      this.socketTicketListNew()
      // const searchParam = null
    },
    socketTicketListNew () {
      // // if (status) {
      // socket.emit(`${usuario.tenantId}:joinTickets`, 'open')
      // socket.emit(`${usuario.tenantId}:joinTickets`, 'pending')
      // socket.emit(`${usuario.tenantId}:joinTickets`, 'closed')
      // // } else {
      // socket.emit(`${usuario.tenantId}:joinNotification`)
      // }

      // verifySocketTicketAction(data.message.ticket, data.action) // refatorar para verificar corretamente os parametros
      // if (
      //   data.action === 'create' &&
      //   !data.message.read &&
      //   (data.ticket.userId === userId || !data.ticket.userId)
      // ) {
      //   this.$root.$emit('handlerNotifications', data)
      // }
      socket.on(`${usuario.tenantId}:ticketList`, data => {
        if (data.type === 'chat:create') {
          this.$store.commit('UPDATE_MESSAGES', data.payload)
        }

        if (data.type === 'chat:ack' || data.type === 'chat:delete') {
          this.$store.commit('UPDATE_MESSAGE_STATUS', data.payload)
        }

        if (data.type === 'ticket:update') {
          this.$store.commit('UPDATE_TICKET', data.payload)
        }
      })

      socket.on(`${usuario.tenantId}:contactList`, data => {
        this.$store.commit('UPDATE_CONTACT', data.payload)
      })
    },
    socketDisconnect () {
      socket.disconnect()
    }
  }
}
