import request from 'src/service/request'

export function ConsultarTicketsQueuesService (params) {
  return request({
    url: '/dash-tickets-queues',
    method: 'get',
    params
  })
}
