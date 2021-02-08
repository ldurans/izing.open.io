import { LocalizarMensagens } from 'src/service/tickets'
import { Notify } from 'quasar'
import $router from 'src/router'
import { orderBy } from 'lodash'
import { parseISO } from 'date-fns'
// import Vue from 'vue'

const orderMessages = (messages) => {
  const newMessages = orderBy(messages, (obj) => parseISO(obj.createdAt), ['asc'])
  return [...newMessages]
}

const atendimentoTicket = {
  state: {
    chatTicketDisponivel: false,
    tickets: [],
    ticketsLocalizadosBusca: [],
    ticketFocado: {},
    hasMore: false,
    contatos: [],
    mensagens: []
  },
  mutations: {
    SET_HAS_MORE (state, payload) {
      state.hasMore = payload
      return state.hasMore
    },
    LOAD_TICKETS (state, payload) {
      const newTickets = payload
      newTickets.forEach(ticket => {
        const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = ticket
          if (ticket.unreadMessages > 0) {
            state.tickets.unshift(state.tickets.splice(ticketIndex, 1)[0])
          }
        } else {
          state.tickets.push(ticket)
        }
      })
      return state.tickets
    },
    RESET_TICKETS (state) {
      state.hasMore = true
      state.tickets = []
    },
    RESET_UNREAD (state, payload) {
      const ticketId = payload
      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex].unreadMessages = 0
      }
      return state.tickets
    },
    UPDATE_TICKET (state, payload) {
      const newTickets = [...state.tickets]
      const ticket = payload
      const ticketIndex = newTickets.findIndex(t => t.id === ticket.id)
      if (ticketIndex !== -1) {
        newTickets[ticketIndex] = ticket
      } else {
        newTickets.unshift(ticket)
      }
      state.tickets = newTickets
      return state.tickets
    },
    DELETE_TICKET (state, payload) {
      const ticketId = payload
      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        state.tickets.splice(ticketIndex, 1)
      }
      return state.tickets
    },
    UPDATE_TICKET_MESSAGES_COUNT (state, payload) {
      const { ticket, searchParam } = payload
      const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)
      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = ticket
        state.tickets.unshift(state.tickets.splice(ticketIndex, 1)[0])
      } else if (!searchParam) {
        state.tickets.unshift(ticket)
      }
      return state.tickets
    },
    UPDATE_TICKET_CONTACT (state, payload) {
      const contact = payload
      const newState = [...state.tickets]
      const ticketIndex = newState.findIndex(t => t.contactId === contact.id)
      if (ticketIndex !== -1) {
        newState[ticketIndex].contact = contact
      }
      state.tickets = newState
    },
    UPDATE_TICKET_FOCADO_CONTACT (state, payload) {
      state.ticketFocado.contact = payload
    },
    TICKET_FOCADO (state, payload) {
      state.ticketFocado = payload
      return state.ticketFocado
    },
    LOAD_INITIAL_MESSAGES (state, payload) {
      const { messages, messagesOffLine } = payload
      state.mensagens = []
      const newMessages = orderMessages([...messages, ...messagesOffLine])
      state.mensagens = newMessages
    },
    LOAD_MORE_MESSAGES (state, payload) {
      const { messages, messagesOffLine } = payload
      const arrayMessages = [...messages, ...messagesOffLine]
      const newMessages = []
      arrayMessages.forEach((message, index) => {
        const messageIndex = state.mensagens.findIndex(m => m.id === message.id)
        if (messageIndex !== -1) {
          state.mensagens[messageIndex] = message
          arrayMessages.splice(index, 1)
        } else {
          newMessages.push(message)
        }
      })
      const messagesOrdered = orderMessages(newMessages)
      state.mensagens = [...messagesOrdered, ...state.mensagens]
    },
    ADD_MESSAGE (state, payload) {
      const newMessage = payload
      const messageIndex = state.mensagens.findIndex(m => m.id === newMessage.id)
      if (messageIndex !== -1) {
        state.mensagens[messageIndex] = newMessage
      } else {
        state.mensagens.push(newMessage)
      }
      return state.mensagens
    },
    UPDATE_MESSAGE (state, payload) {
      const messageToUpdate = payload
      const messagesState = [...state.mensagens]
      const messageIndex = messagesState.findIndex(m => m.id === messageToUpdate.id)
      if (messageIndex !== -1) {
        messagesState[messageIndex] = messageToUpdate
      }
      state.mensagens = messagesState
      return state.mensagens
    },
    DELETE_MESSAGE (state, payload) {
      const messagesState = [...state.mensagens]
      const message = messagesState.filter(msg => msg.id !== payload.id)
      state.mensagens = message
      return state.mensagens
    },
    RESET_MESSAGE (state) {
      state.mensagens = []
      return state.mensagens
    }
  },
  actions: {
    async LocalizarMensagensTicket ({ commit, dispatch }, params) {
      const mensagens = await LocalizarMensagens(params)
      // commit('TICKET_FOCADO', mensagens.data.ticket)
      commit('SET_HAS_MORE', mensagens.data.hasMore)
      if (params.pageNumber === 1) {
        commit('LOAD_INITIAL_MESSAGES', mensagens.data)
      } else {
        commit('LOAD_MORE_MESSAGES', mensagens.data)
      }
    },
    async AbrirChatMensagens ({ commit, dispatch }, data) {
      try {
        await commit('TICKET_FOCADO', {})
        await commit('RESET_MESSAGE')
        await commit('TICKET_FOCADO', data)
        // commit('SET_HAS_MORE', true)
        const params = {
          ticketId: data.id,
          pageNumber: 1
        }
        await dispatch('LocalizarMensagensTicket', params)

        await $router.push({ name: 'chat', params, query: { t: new Date().getTime() } })
      } catch (error) {
        // posteriormente é necessário investigar o motivo de está caindo em erro
        if (!error) return
        const errorMsg = error?.response?.data?.error
        if (errorMsg) {
          Notify.create({
            type: 'negative',
            message: error.response.data.error,
            progress: true,
            position: 'top'
          })
        } else {
          Notify.create({
            type: 'negative',
            message: `Ops... Ocorreu um problema não identificado. ${JSON.stringify(error)}`,
            progress: true,
            position: 'top'
          })
        }
      }
    }
  }
}

export default atendimentoTicket
