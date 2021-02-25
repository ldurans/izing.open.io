import request from 'src/service/request'

export function ConsultarTicketsQueuesService (params) {
  return request({
    url: '/dash-tickets-queues',
    method: 'get',
    params
  })
}

export function RelatorioContatos (params) {
  console.log('RelatorioContatos', params)
  return request({
    url: '/contacts-report',
    method: 'get',
    params
  })
}
