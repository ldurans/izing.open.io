import { ConsultarDadosTicket, LocalizarMensagens } from 'src/service/tickets'
import { Notify } from 'quasar'
import $router from 'src/router'
import { orderBy } from 'lodash'
import { parseISO } from 'date-fns'

const orderMessages = (messages) => {
  const newMessages = orderBy(messages, (obj) => parseISO(obj.timestamp || obj.createdAt), ['asc'])
  return [...newMessages]
}

const orderTickets = (tickets) => {
  const newTickes = orderBy(tickets, (obj) => parseISO(obj.lastMessageAt || obj.updatedAt), ['asc'])
  return [...newTickes]
}

const checkTicketFilter = (ticket) => {
  const filtroPadrao = {
    searchParam: '',
    pageNumber: 1,
    status: ['open', 'pending'],
    showAll: false,
    count: null,
    queuesIds: [],
    withUnreadMessages: false,
    isNotAssignedUser: false,
    includeNotQueueDefined: true
    // date: new Date(),
  }

  const NotViewTicketsChatBot = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'NotViewTicketsChatBot')
    return (conf?.value === 'enabled')
  }

  const DirectTicketsToWallets = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'DirectTicketsToWallets')
    return (conf?.value === 'enabled')
  }

  const isNotViewAssignedTickets = () => {
    const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
    const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
    return (conf?.value === 'enabled')
  }
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues'))
  const filasCadastradas = JSON.parse(localStorage.getItem('filasCadastradas') || '[]')
  const profile = localStorage.getItem('profile')
  const isAdminShowAll = profile === 'admin' && filtros.showAll
  const isQueuesTenantExists = filasCadastradas.length > 0

  const userId = usuario?.userId || +localStorage.getItem('userId')

  // Verificar se é admin e se está solicitando para mostrar todos
  if (isAdminShowAll) {
    console.log('isAdminShowAll', isAdminShowAll)
    return true
  }

  // se ticket for um grupo, todos podem verificar.
  if (ticket.isGroup) {
    console.log('ticket.isGroup', ticket.isGroup)
    return true
  }

  // se status do ticket diferente do staatus filtrado, retornar false
  if (filtros.status.length > 0 && !filtros.status.includes(ticket.status)) {
    console.log('Status ticket', filtros.status, ticket.status)
    return false
  }

  // verificar se já é um ticket do usuário
  if (ticket?.userId == userId) {
    console.log('Ticket do usuário', ticket?.userId, userId)
    return true
  }

  // Não visualizar tickets ainda com o Chatbot
  // desde que ainda não exista usuário ou fila definida
  if (NotViewTicketsChatBot() && ticket.autoReplyId) {
    if (!ticket?.userId && !ticket.queueId) {
      console.log('NotViewTicketsChatBot e o ticket está sem usuário e fila definida')
      return false
    }
  }

  // Se o ticket não possuir fila definida, checar o filtro
  // permite visualizar tickets sem filas definidas é falso.
  // if (isQueuesTenantExists && !ticket.queueId && !filtros.includeNotQueueDefined) {
  //   console.log('filtros.includeNotQueueDefined', ticket.queueId, !filtros.includeNotQueueDefined)
  //   return false
  // }

  let isValid = true

  // verificar se o usuário possui fila liberada
  if (isQueuesTenantExists) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      console.log('Fila do ticket liberada para o Usuario', ticket.queueId)
      isValid = true
    } else {
      console.log('Usuario não tem acesso a fila', ticket.queueId)
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (isQueuesTenantExists && filtros?.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue == -1) {
      console.log('filas filtradas e diferentes da do ticket', ticket.queueId)
      return false
    }
  }

  // se configuração para carteira ativa: verificar se já é um ticket da carteira do usuário
  if (DirectTicketsToWallets() && (ticket?.contact?.wallets?.length || 0) > 0) {
    const idx = ticket?.contact?.wallets.findIndex(w => w.id == userId)
    if (idx !== -1) {
      console.log('Ticket da carteira do usuário')
      return true
    }
    console.log('DirectTicketsToWallets: Ticket não pertence à carteira do usuário', ticket)
    return false
  }

  // verificar se o parametro para não permitir visualizar
  // tickets atribuidos à outros usuários está ativo
  if (isNotViewAssignedTickets() && (ticket?.userId || userId) !== userId) {
    console.log('isNotViewAssignedTickets e ticket não é do usuário', ticket?.userId, userId)
    // se usuário não estiver atribuido, permitir visualizar
    if (!ticket?.userId) {
      return true
    }
    return false
  }

  // verificar se filtro somente tickets não assinados (isNotAssingned) ativo
  if (filtros.isNotAssignedUser) {
    console.log('isNotAssignedUser ativo para exibir somente tickets não assinados', filtros.isNotAssignedUser, !ticket.userId)
    return filtros.isNotAssignedUser && !ticket.userId
  }

  return isValid
}

const atendimentoTicket = {
  state: {
    chatTicketDisponivel: false,
    tickets: [],
    ticketsLocalizadosBusca: [],
    ticketFocado: {
      contacts: {
        tags: [],
        wallets: [],
        extraInfo: []
      }
    },
    hasMore: false,
    contatos: [],
    mensagens: []
  },
  mutations: {
    // OK
    SET_HAS_MORE (state, payload) {
      state.hasMore = payload
    },
    // OK
    LOAD_TICKETS (state, payload) {
      const newTickets = orderTickets(payload)
      newTickets.forEach(ticket => {
        const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)
        if (ticketIndex !== -1) {
          state.tickets[ticketIndex] = ticket
          if (ticket.unreadMessages > 0) {
            state.tickets.unshift(state.tickets.splice(ticketIndex, 1)[0])
          }
        } else {
          if (checkTicketFilter(ticket)) {
            state.tickets.push(ticket)
          }
        }
      })
    },
    RESET_TICKETS (state) {
      state.hasMore = true
      state.tickets = []
    },
    RESET_UNREAD (state, payload) {
      const tickets = [...state.tickets]
      const ticketId = payload.ticketId
      const ticketIndex = tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        tickets[ticketIndex] = payload
        tickets[ticketIndex].unreadMessages = 0
      }
      state.ticket = tickets
    },
    // OK
    UPDATE_TICKET (state, payload) {
      const ticketIndex = state.tickets.findIndex(t => t.id === payload.id)
      if (ticketIndex !== -1) {
        // atualizar ticket se encontrado
        const tickets = [...state.tickets]
        tickets[ticketIndex] = {
          ...tickets[ticketIndex],
          ...payload,
          // ajustar informações por conta das mudanças no front
          username: payload?.user?.name || payload?.username || tickets[ticketIndex].username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl || tickets[ticketIndex].profilePicUrl,
          name: payload?.contact?.name || payload?.name || tickets[ticketIndex].name
        }
        state.tickets = tickets.filter(t => checkTicketFilter(t))

        // atualizar se ticket focado
        if (state.ticketFocado.id == payload.id) {
          state.ticketFocado = {
            ...state.ticketFocado,
            ...payload
            // conservar as informações do contato
            // contact: state.ticketFocado.contact
          }
        }
      } else {
        const tickets = [...state.tickets]
        tickets.unshift({
          ...payload,
          // ajustar informações por conta das mudanças no front
          username: payload?.user?.name || payload?.username,
          profilePicUrl: payload?.contact?.profilePicUrl || payload?.profilePicUrl,
          name: payload?.contact?.name || payload?.name
        })
        state.tickets = tickets.filter(t => checkTicketFilter(t))
      }
    },

    DELETE_TICKET (state, payload) {
      const ticketId = payload
      const ticketIndex = state.tickets.findIndex(t => t.id === ticketId)
      if (ticketIndex !== -1) {
        state.tickets.splice(ticketIndex, 1)
      }
      // return state.tickets
    },

    // UPDATE_TICKET_MESSAGES_COUNT (state, payload) {

    //   const { ticket, searchParam } = payload
    //   const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id)
    //   if (ticketIndex !== -1) {
    //     state.tickets[ticketIndex] = ticket
    //     state.tickets.unshift(state.tickets.splice(ticketIndex, 1)[0])
    //   } else if (!searchParam) {
    //     state.tickets.unshift(ticket)
    //   }
    //   // return state.tickets
    // },

    UPDATE_TICKET_FOCADO_CONTACT (state, payload) {
      state.ticketFocado.contact = payload
    },
    UPDATE_CONTACT (state, payload) {
      if (state.ticketFocado.contactId == payload.id) {
        state.ticketFocado.contact = payload
      }
      const ticketIndex = state.tickets.findIndex(t => t.contactId === payload.id)
      if (ticketIndex !== -1) {
        const tickets = [...state.tickets]
        tickets[ticketIndex].contact = payload
        tickets[ticketIndex].name = payload.name
        tickets[ticketIndex].profilePicUrl = payload.profilePicUrl
        state.tickets = tickets
      }
    },
    // OK
    TICKET_FOCADO (state, payload) {
      const params = {
        ...payload,
        status: payload.status == 'pending' ? 'open' : payload.status
      }
      state.ticketFocado = params
      // return state.ticketFocado
    },
    // OK
    LOAD_INITIAL_MESSAGES (state, payload) {
      const { messages, messagesOffLine } = payload
      state.mensagens = []
      const newMessages = orderMessages([...messages, ...messagesOffLine])
      state.mensagens = newMessages
    },
    // OK
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
    // OK
    UPDATE_MESSAGES (state, payload) {
      // Se ticket não for o focado, não atualizar.
      if (state.ticketFocado.id === payload.ticket.id) {
        const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
        const mensagens = [...state.mensagens]
        if (messageIndex !== -1) {
          mensagens[messageIndex] = payload
        } else {
          mensagens.push(payload)
        }
        state.mensagens = mensagens
        if (payload.scheduleDate && payload.status == 'pending') {
          const idxScheduledMessages = state.ticketFocado.scheduledMessages.findIndex(m => m.id === payload.id)
          if (idxScheduledMessages === -1) {
            state.ticketFocado.scheduledMessages.push(payload)
          }
        }
      }

      const TicketIndexUpdate = state.tickets.findIndex(t => t.id == payload.ticket.id)
      if (TicketIndexUpdate !== -1) {
        const tickets = [...state.tickets]
        const unreadMessages = state.ticketFocado.id == payload.ticket.id ? 0 : payload.ticket.unreadMessages
        tickets[TicketIndexUpdate] = {
          ...state.tickets[TicketIndexUpdate],
          answered: payload.ticket.answered,
          unreadMessages,
          lastMessage: payload.mediaName || payload.body
        }
        state.tickets = tickets
      }
    },
    // OK
    UPDATE_MESSAGE_STATUS (state, payload) {
      // Se ticket não for o focado, não atualizar.
      if (state.ticketFocado.id != payload.ticket.id) {
        return
      }
      const messageIndex = state.mensagens.findIndex(m => m.id === payload.id)
      const mensagens = [...state.mensagens]
      if (messageIndex !== -1) {
        mensagens[messageIndex] = payload
        state.mensagens = mensagens
      }

      // Se existir mensagens agendadas no ticket focado,
      // tratar a atualização das mensagens deletadas.
      if (state.ticketFocado?.scheduledMessages) {
        const scheduledMessages = [...state.ticketFocado.scheduledMessages]
        const scheduled = scheduledMessages.filter(m => m.id != payload.id)
        state.ticketFocado.scheduledMessages = scheduled
      }
    },
    // OK
    RESET_MESSAGE (state) {
      state.mensagens = []
      // return state.mensagens
    }
  },
  actions: {
    async LocalizarMensagensTicket ({ commit, dispatch }, params) {
      const mensagens = await LocalizarMensagens(params)
      // commit('TICKET_FOCADO', mensagens.data.ticket)
      commit('SET_HAS_MORE', mensagens.data.hasMore)
      // commit('UPDATE_TICKET_CONTACT', mensagens.data.ticket.contact)
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
        const ticket = await ConsultarDadosTicket(data)
        await commit('TICKET_FOCADO', ticket.data)
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
