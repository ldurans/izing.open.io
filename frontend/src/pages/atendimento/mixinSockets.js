const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
import verifySocketTicketAction from 'src/utils/verifySocketTicketAction'
import Router from 'src/router/index'
import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API, {
  query: {
    token
  },
  forceNew: true
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
        this.$root.$emit('scrollToBottomMessageChat')
      }, 400)
    },
    socketMessagesList () {
      socket.emit(`${usuario.tenantId}-joinChatBox`, this.$store.getters.ticketFocado.id)

      socket.on(`${usuario.tenantId}-appMessage`, data => {
        console.log('socketMessagesList: ADD_MESSAGE', data.message)

        verifySocketTicketAction(data.message.ticket, data.action)

        if (data.action === 'create') {
          if (data.ticket.id == this.$store.getters.ticketFocado.id) {
            this.$store.commit('ADD_MESSAGE', data.message)
            // this.scrollToBottom()
            if (!data.message.fromMe) {
              this.$root.$emit('handlerNotifications', data)
            }
          }
        }

        if (data.action === 'update') {
          console.log('UPDATE_MESSAGE', data.message)
          this.$store.commit('UPDATE_MESSAGE', data.message)
        }

        if (data.action === 'delete') {
          this.$store.commit('DELETE_MESSAGE', data.message)
        }
      })
    },
    socketTicket () {
      socket.on(`${usuario.tenantId}-ticket`, data => {
        verifySocketTicketAction(data.ticket, data.action)

        if (data.action === 'update' && data.ticket.userId === userId) {
          console.log('data.ticket - ticket', data.ticket)
          if (data.ticket.status === 'open' && !data.ticket.isTransference) {
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
          this.$store.commit('DELETE_TICKET', data.ticketId)
          this.$router.push({ name: 'chat-empty' })
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
    socketTicketList () {
      const searchParam = null
      // if (status) {
      socket.emit(`${usuario.tenantId}-joinTickets`, 'open')
      socket.emit(`${usuario.tenantId}-joinTickets`, 'pending')
      socket.emit(`${usuario.tenantId}-joinTickets`, 'closed')
      // } else {
      socket.emit(`${usuario.tenantId}-joinNotification`)
      // }

      socket.on(`${usuario.tenantId}-ticket`, data => {
        verifySocketTicketAction(data.ticket, data.action) // refatorar para verificar corretamente os parametros
        if (data.action === 'updateQueue' || data.action === 'create') {
          this.$store.commit('UPDATE_TICKET', data.ticket)
        }

        if (data.action === 'updateUnread') {
          this.$store.commit('RESET_UNREAD', data.ticketId)
        }

        if (
          (data.action === 'update' || data.action === 'create') &&
          (!data.ticket.userId || data.ticket.userId === userId || this.showAll)
        ) {
          this.$store.commit('UPDATE_TICKET', data.ticket)
        }

        if (data.action === 'delete') {
          this.$store.commit('DELETE_TICKET', data.ticketId)
        }
      })

      socket.on(`${usuario.tenantId}-appMessage`, data => {
        verifySocketTicketAction(data.message.ticket, data.action) // refatorar para verificar corretamente os parametros
        if (
          data.action === 'create' && (!data.ticket.userId || data.ticket.userId === userId || this.showAll)
        ) {
          this.$store.commit('UPDATE_TICKET_MESSAGES_COUNT', {
            ticket: data.ticket,
            searchParam
          })
        }

        if (
          data.action === 'create' &&
          !data.message.read &&
          (data.ticket.userId === userId || !data.ticket.userId)
        ) {
          this.$root.$emit('handlerNotifications', data)
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
