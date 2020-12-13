const getters = {
  ticketsPendentes: state => state.atendimentoTicket.tickets.filter(tk => tk.status === 'pending'),
  ticketsEmAtendimento: state => state.atendimentoTicket.tickets.filter(tk => tk.status === 'open'),
  ticketsResolvidos: state => state.atendimentoTicket.tickets.filter(tk => tk.status === 'closed'),
  ticketsLocalizadosBusca: state => state.atendimentoTicket.ticketsLocalizadosBusca,
  mensagensTicket: state => state.atendimentoTicket.mensagens,
  ticketFocado: state => state.atendimentoTicket.ticketFocado,
  hasMore: state => state.atendimentoTicket.hasMore,
  hasMoreOpen: state => state.atendimentoTicket.hasMoreOpen,
  hasMorePending: state => state.atendimentoTicket.hasMorePending,
  hasMoreClosed: state => state.atendimentoTicket.hasMoreClosed,
  hasMoreBusca: state => state.atendimentoTicket.hasMoreBusca,
  whatsapps: state => state.whatsapp.whatsApps
}
export default getters
