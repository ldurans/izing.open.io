const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
import Router from 'src/router/index'
import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API, {
  query: {
    token
  }
})
const userId = +localStorage.getItem('userId')

// localStorage.debug = '*'

socket.on(`tokenInvalid-${socket.id}`, () => {
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
        const el = document.getElementById('lastMessageRef')
        el.scrollIntoView()
      }, 400)
    },
    socketMessagesList () {
      socket.emit(`${usuario.tenantId}-joinChatBox`, this.$store.getters.ticketFocado.id)
      socket.on(`${usuario.tenantId}-appMessage`, data => {
        if (data.action === 'create') {
          if (data.ticket.id == this.$store.getters.ticketFocado.id) {
            this.$store.commit('ADD_MESSAGE', data.message)
            // this.scrollToBottom()
          }
        }
        if (data.action === 'update') {
          this.$store.commit('UPDATE_MESSAGE', data.message)
        }
      })
    },
    socketTicket () {
      socket.on(`${usuario.tenantId}-ticket`, data => {
        if (data.action === 'updateStatus' && data.ticket.userId === userId) {
          if (data.ticket.status === 'open') {
            this.$store.commit('TICKET_FOCADO', data.ticket)
          }
        }

        if (data.action === 'delete') {
          // this.$q.notify({
          //   type: 'positive',
          //   progress: true,
          //   message: 'Tudo ok!'
          // })
          this.$store.commit('TICKET_FOCADO', {})
        }

        // preprar notificação
        if (data.action === 'updateUnread' || data.action === 'delete') {

        }
      })

      socket.on(`${usuario.tenantId}-contact`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_TICKET_CONTACT', data.contact)
          if (this.$store.getters.ticketFocado.contactId === data.contact.id) {
            this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', data.contact)
          }
        }
      })
    },
    socketTicketList (status) {
      const searchParam = null
      if (status) {
        socket.emit(`${usuario.tenantId}-joinTickets`, status)
      } else {
        socket.emit(`${usuario.tenantId}-joinNotification`)
      }

      socket.on(`${usuario.tenantId}-ticket`, data => {
        if (data.action === 'updateQueue' || data.action === 'create') {
          this.$store.commit('UPDATE_TICKET', data.ticket)
        }

        if (data.action === 'updateUnread') {
          this.$store.commit('RESET_UNREAD', data.ticketId)
        }

        if (
          (data.action === 'updateStatus' || data.action === 'create') &&
          (!data.ticket.userId || data.ticket.userId === userId /* || showAll */)
        ) {
          this.$store.commit('UPDATE_TICKET', data.ticket)
        }

        if (data.action === 'delete') {
          this.$store.commit('DELETE_TICKET', data.ticketId)
        }
      })

      socket.on(`${usuario.tenantId}-appMessage`, data => {
        if (
          data.action === 'create' && (!data.ticket.userId || data.ticket.userId === userId /* || showAll */)
        ) {
          this.$store.commit('UPDATE_TICKET_MESSAGES_COUNT', {
            ticket: data.ticket,
            searchParam
          })
        }
      })

      socket.on(`${usuario.tenantId}-contact`, data => {
        if (data.action === 'update') {
          this.$store.commit('UPDATE_TICKET_CONTACT', data.contact)
        }
      })
    },
    socketDisconnect () {
      // socket.disconnect()
    }
  }
}
