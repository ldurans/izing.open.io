import request from 'src/service/request'

export function ListarConfiguracoes (params) {
  return request({
    url: '/settings/',
    method: 'get',
    params
  })
}

export function AlterarConfiguracao (data) {
  return request({
    url: `/settings/${data.Key}/`,
    method: 'put',
    data
  })
}
