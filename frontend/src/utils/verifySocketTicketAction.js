
const isNotViewTicketsQueueUndefined = (profile) => {
  const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
  const conf = configuracoes.find(c => c.key === 'NotViewTicketsQueueUndefined')
  return (conf.value === 'enabled' && profile !== 'admin')
}

const isNotViewAssignedTickets = (profile) => {
  const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
  const conf = configuracoes.find(c => c.key === 'NotViewAssignedTickets')
  return (conf.value === 'enabled' && profile !== 'admin')
}

const verifySocketTicketAction = (ticket, action = null) => {
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = localStorage.getItem('queues')
  const profile = localStorage.getItem('profile')

  const whiteListAction = [
    'updateUnread',
    'delete'
  ]

  if (whiteListAction.includes(action)) return true

  if (profile === 'admin' && filtros.showAll) return true

  if (filtros.searchParam) return false

  let isValid = false

  // verificar se a fila do ticket está filtrada
  if (filtros.queuesIds.length) {
    const isQueue = filtros.queuesIds.indexOf(q => ticket.queueId === q)
    if (isQueue) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se o usuário possui fila liberada
  if (UserQueues.length) {
    const isQueueUser = UserQueues.indexOf(q => ticket.queueId === q)
    if (isQueueUser) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se status filtro
  if (filtros.status.length) {
    const isStatus = filtros.status.indexOf(s => ticket.status === s)
    if (isStatus) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se o parametro para não permitir visualizar
  // tickets atribuidos à outros usuários ativo
  if (isNotViewAssignedTickets(profile)) {
    if (ticket.userId && ticket.userId !== usuario.id) return false
  } else {
    // verificar se filtro somente tickets não assinados - isNotAssingned
    if (filtros.isNotAssignedUser) {
      const isNotAssignedUser = filtros.isNotAssignedUser && !ticket.userId
      if (isNotAssignedUser) {
        isValid = true
      } else {
        return false
      }
    }
  }

  // verificar parametro para não permitir visualizar tickets sem filas definidas
  if (isNotViewTicketsQueueUndefined(profile)) {
    if (!ticket.queueId) return false
  } else {
    // verificar se filtro incluir tickets sem filas definida ativo - includeNotQueueDefined
    if (filtros.includeNotQueueDefined) {
      const isIncludeNotQueueDefined = filtros.includeNotQueueDefined && !ticket.queueId
      if (isIncludeNotQueueDefined) {
        isValid = true
      } else {
        return false
      }
    }
  }

  return isValid
}

export default verifySocketTicketAction
