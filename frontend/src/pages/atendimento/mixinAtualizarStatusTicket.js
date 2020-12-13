import { AtualizarStatusTicket } from 'src/service/tickets'
const userId = +localStorage.getItem('userId')

export default {
  methods: {
    iniciarAtendimento (ticket) {
      this.loading = true
      AtualizarStatusTicket(ticket.id, 'open', userId)
        .then(res => {
          this.loading = false
          this.$q.notify({
            message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
            type: 'positive',
            progress: true
          })
          this.$store.commit('TICKET_FOCADO', {})
          this.$store.commit('SET_HAS_MORE', true)
          this.$store.dispatch('AbrirChatMensagens', ticket)
        })
        .catch(error => {
          this.loading = false
          console.error(error)
        })
    },
    atualizarStatusTicket (status) {
      const contatoName = this.ticketFocado.contact.name || ''
      const ticketId = this.ticketFocado.id
      const title = {
        open: 'Atenidmento será iniciado, ok?',
        pending: 'Retornar à fila?',
        closed: 'Encerrar o atendimento?'
      }
      const toast = {
        open: 'Atenidmento iniciado!',
        pending: 'Retornado à fila!',
        closed: 'Atendimento encerrado!'
      }

      this.$q.dialog({
        title: title[status],
        message: `Cliente: ${contatoName} || Ticket: ${ticketId}`,
        cancel: {
          label: 'Não',
          color: 'negative',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'primary',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        AtualizarStatusTicket(ticketId, status, userId)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: `${toast[status]} || ${contatoName} (Ticket ${ticketId})`,
              type: 'positive',
              progress: true
            })
            this.$store.commit('TICKET_FOCADO', {})
          })
          .catch(error => {
            this.loading = false
            console.error(error)
          })
      })
    }
  }
}
