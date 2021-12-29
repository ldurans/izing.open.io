import request from 'src/service/request'

export function AdminListarUsuarios (params) {
  return request({
    url: '/admin/users/',
    method: 'get',
    params
  })
}

export function AdminUpdateUsuarios (userId, data) {
  return request({
    url: `/admin/users/${userId}`,
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

export function UpdateConfiguracoesUsuarios (userId, data) {
  return request({
    url: `/users/${userId}/configs`,
    method: 'put',
    data
  })
}
