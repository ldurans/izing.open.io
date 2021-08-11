import request from 'src/service/request'

export function ListarUsuarios (params) {
  return request({
    url: '/users/',
    method: 'get',
    params
  })
}

export function CriarUsuario (data) {
  return request({
    url: '/users',
    method: 'post',
    data
  })
}

export function UpdateUsuarios (userId, data) {
  return request({
    url: `/users/${userId}`,
    method: 'put',
    data
  })
}

export function UpdateConfiguracoesUsuarios (userId, data) {
  return request({
    url: `/users/${userId}/configs`,
    method: 'put',
    data
  })
}

export function DadosUsuario (userId) {
  return request({
    url: `/users/${userId}`,
    method: 'get'
  })
}

export function DeleteUsuario (userId) {
  return request({
    url: `/users/${userId}`,
    method: 'delete'
  })
}
