
const verifySocketTicketAction = (ticket, action = null) => {
  const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
  const UserQueues = localStorage.getItem('queues')
  const profile = localStorage.getItem('profile')

  if (action === 'delete') return true

  if (filtros.searchParam) return true
  if (profile === 'admin' && filtros.showAll) {
    return true
  }

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
    const isQueueUSer = UserQueues.indexOf(q => ticket.queueId === q)
    if (isQueueUSer) {
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

  // verificar se filtro tickets não assinados - isNotAssingned
  if (filtros.isNotAssignedUser) {
    const isNotAssignedUser = filtros.isNotAssignedUser && !ticket.userId
    if (isNotAssignedUser) {
      isValid = true
    } else {
      return false
    }
  }

  if (filtros.includeNotQueueDefined) {
    const isIncludeNotQueueDefined = filtros.includeNotQueueDefined && !ticket.queueId
    if (isIncludeNotQueueDefined) {
      isValid = true
    } else {
      return false
    }
  }

  return isValid
}

export default verifySocketTicketAction
