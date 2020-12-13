import request from 'src/service/request'

export function ListarContatos (params) {
  return request({
    url: '/contacts/',
    method: 'get',
    params
  })
}

export function ObterContato (contactId) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'get'
  })
}

export function CriarContato (data) {
  return request({
    url: '/contacts',
    method: 'post',
    data
  })
}

export function EditarContato (contactId, data) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'put',
    data
  })
}

export function DeletarContato (contactId) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'delete'
  })
}
