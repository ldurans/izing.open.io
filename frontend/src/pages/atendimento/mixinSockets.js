import openSocket from 'socket.io-client'
const socket = openSocket(process.env.API, {
  forceNew: true
})
const userId = +localStorage.getItem('userId')

export default {
  methods: {
    scrollToBottom () {
      setTimeout(() => {
        const el = document.getElementById('lastMessageRef')
        el.scrollIntoView()
      }, 400)
    },
    socketMessagesList () {
      socket.emit('joinChatBox', this.$store.getters.ticketFocado.id)
      socket.on('appMessage', data => {
        if (data.action === 'create') {
          if (data.ticket.id == this.$store.getters.ticketFocado.id) {
            this.$store.commit('ADD_MESSAGE', data.message)
            this.scrollToBottom()
          }
        }
        if (data.action === 'update') {
          this.$store.commit('UPDATE_MESSAGE', data.message)
        }
      })
    },
    socketTicket () {
      socket.on('ticket', data => {
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

      socket.on('contact', data => {
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
        socket.emit('joinTickets', status)
      } else {
        socket.emit('joinNotification')
      }

      socket.on('ticket', data => {
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

      socket.on('appMessage', data => {
        if (
          data.action === 'create' && (!data.ticket.userId || data.ticket.userId === userId /* || showAll */)
        ) {
          this.$store.commit('UPDATE_TICKET_MESSAGES_COUNT', {
            ticket: data.ticket,
            searchParam
          })
        }
      })

      socket.on('contact', data => {
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
