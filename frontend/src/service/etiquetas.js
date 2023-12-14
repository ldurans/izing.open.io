import request from 'src/service/request'

export function CriarEtiqueta (data) {
  return request({
    url: '/tags/',
    method: 'post',
    data
  })
}

export function ListarEtiquetas (isActive = null) {
  return request({
    url: `/tags/?isActive=${isActive}`,
    method: 'get'
  })
}

export function AlterarEtiqueta (data) {
  return request({
    url: `/tags/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarEtiqueta (data) {
  return request({
    url: `/tags/${data.id}`,
    method: 'delete'
  })
}
