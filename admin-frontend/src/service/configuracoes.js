import request from 'src/service/request'

export function AdminListarConfiguracoes (empresa) {
  return request({
    url: `/admin/settings/${empresa}`,
    method: 'get'
  })
}

export function AdminAlterarConfiguracao (empresa, data) {
  return request({
    url: `/admin/settings/${empresa}/`,
    method: 'put',
    data
  })
}
