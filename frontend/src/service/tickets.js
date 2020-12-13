import request from 'src/service/request'

export function ConsultarTickets (params) {
  return request({
    url: '/tickets',
    method: 'get',
    params
  })
}

export function AtualizarStatusTicket (ticketId, status, userId) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data: {
      status,
      userId
    }
  })
}

export function AtualizarTicket (ticketId, data) {
  return request({
    url: `/tickets/${ticketId}`,
    method: 'put',
    data
  })
}

export function LocalizarMensagens (params) {
  return request({
    url: `/messages/${params.ticketId}`,
    method: 'get',
    params
  })
}

export function EnviarMensagemTexto (ticketId, data) {
  return request({
    url: `/messages/${ticketId}`,
    method: 'post',
    data
  })
}

export function DeletarMensagem (mensagem) {
  return request({
    url: `/messages/${mensagem.id}`,
    method: 'delete'
  })
}

export function CriarTicket (data) {
  return request({
    url: '/tickets',
    method: 'post',
    data
  })
}
