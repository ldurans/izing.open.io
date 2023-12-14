import request from 'src/service/request'

export function ConsultarTicketsQueuesService (params) {
  return request({
    url: '/dash-tickets-queues',
    method: 'get',
    params
  })
}

export function RelatorioContatos (params) {
  return request({
    url: '/contacts-report',
    method: 'get',
    params
  })
}

export function RelatorioResumoAtendimentosUsuarios (params) {
  return request({
    url: '/statistics-per-users',
    method: 'get',
    params
  })
}

export function GetDashTicketsAndTimes (params) {
  return request({
    url: '/statistics-tickets-times',
    method: 'get',
    params
  })
}

export function GetDashTicketsChannels (params) {
  return request({
    url: '/statistics-tickets-channels',
    method: 'get',
    params
  })
}

export function GetDashTicketsEvolutionChannels (params) {
  return request({
    url: '/statistics-tickets-evolution-channels',
    method: 'get',
    params
  })
}

export function GetDashTicketsEvolutionByPeriod (params) {
  return request({
    url: '/statistics-tickets-evolution-by-period',
    method: 'get',
    params
  })
}

export function GetDashTicketsPerUsersDetail (params) {
  return request({
    url: '/statistics-tickets-per-users-detail',
    method: 'get',
    params
  })
}

export function GetDashTicketsQueue (params) {
  return request({
    url: '/statistics-tickets-queue',
    method: 'get',
    params
  })
}
