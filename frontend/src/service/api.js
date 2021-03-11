import request from 'src/service/request'

export function CriarAPI (data) {
  return request({
    url: '/api-config/',
    method: 'post',
    data
  })
}

export function ListarAPIs () {
  return request({
    url: '/api-config/',
    method: 'get'
  })
}

export function EditarAPI (data) {
  return request({
    url: `/api-config/${data.id}/`,
    method: 'put',
    data
  })
}

export function NovoTokenAPI (data) {
  return request({
    url: `/api-config/renew-token/${data.id}/`,
    method: 'put',
    data
  })
}

export function ApagarAPI (data) {
  return request({
    url: `/api-config/${data.id}/`,
    method: 'delete',
    data
  })
}
