import request from 'src/service/request'

export function CriarFila (data) {
  return request({
    url: '/queue/',
    method: 'post',
    data
  })
}

export function ListarFilas () {
  return request({
    url: '/queue/',
    method: 'get'
  })
}

export function AlterarFila (data) {
  return request({
    url: `/queue/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarFila (data) {
  return request({
    url: `/queue/${data.id}`,
    method: 'delete'
  })
}
