
const isNotViewTicketsQueueUndefined = () => {
  const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
  const conf = configuracoes?.find(c => c.key === 'NotViewTicketsQueueUndefined')
  return (conf?.value === 'enabled')
}

const isNotViewAssignedTickets = () => {
  const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
  const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
  return (conf?.value === 'enabled')
}

const verifySocketTicketAction = (ticket, action = null) => {
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
  const usuario = JSON.parse(localStorage.getItem('usuario'))
  const UserQueues = JSON.parse(localStorage.getItem('queues'))
  const profile = localStorage.getItem('profile')

  const isAdminShowAll = profile === 'admin' && filtros.showAll

  // Verificar se é admin e se está solicitando para mostrar todos
  if (isAdminShowAll) return true

  if (!ticket || ticket.status === 'closed') return true

  // verificar se já é um ticket do usuário
  if (ticket.userId && ticket.userId === usuario.id) return true

  const whiteListAction = [
    'updateUnread',
    'delete'
  ]

  // verifciar se ação está na whitelist
  if (whiteListAction.includes(action)) return true

  // verificar se está fazendo pesquisa
  if (filtros.searchParam) return false

  let isValid = false

  // Se o ticket não possuir fila definida, checar se o parametro
  // permite visualizar tickets sem filas definidas e, se sim, retornar falso
  if (!ticket.queueId && isNotViewTicketsQueueUndefined()) {
    return false
  }

  // Se o ticket não possuir fila definida, checar o filtro
  // permite visualizar tickets sem filas definidas é falso.
  if (!ticket.queueId && !filtros.includeNotQueueDefined) {
    return false
  }

  // verificar se o usuário possui fila liberada
  if (UserQueues.length) {
    const isQueueUser = UserQueues.findIndex(q => ticket.queueId === q.id)
    if (isQueueUser !== -1) {
      isValid = true
    } else if (!filtros.includeNotQueueDefined) {
      return false
    }
  }

  // verificar se a fila do ticket está filtrada
  if (filtros.queuesIds.length) {
    const isQueue = filtros.queuesIds.findIndex(q => ticket.queueId === q)
    if (isQueue !== -1) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se filtro incluir tickets sem filas definida ativo - includeNotQueueDefined
  if (filtros.includeNotQueueDefined) {
    const isIncludeNotQueueDefined = filtros.includeNotQueueDefined && !ticket.queueId
    if (isIncludeNotQueueDefined) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se status do ticker está filtrado
  if (filtros.status.length) {
    const isStatus = filtros.status.findIndex(s => ticket.status === s)
    if (isStatus !== -1) {
      isValid = true
    } else {
      return false
    }
  }

  // verificar se o parametro para não permitir visualizar
  // tickets atribuidos à outros usuários está ativo
  if (isNotViewAssignedTickets()) {
    if (ticket.userId && ticket.userId !== usuario.id) return false
  }

  // verificar se filtro somente tickets não assinados (isNotAssingned) ativo
  if (filtros.isNotAssignedUser) {
    const isNotAssignedUser = filtros.isNotAssignedUser && !ticket.userId
    if (isNotAssignedUser) {
      isValid = true
    } else {
      return false
    }
  }

  return isValid
}

export default verifySocketTicketAction
