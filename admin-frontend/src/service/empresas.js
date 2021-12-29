import request from 'src/service/request'

export function AdminListarEmpresas () {
  return request({
    url: '/admin/tenants/',
    method: 'get'
  })
}
