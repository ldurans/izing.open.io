import request from 'src/service/request'

export function CriarMensagemRapida (data) {
  return request({
    url: '/fastreply/',
    method: 'post',
    data
  })
}

export function ListarMensagensRapidas () {
  return request({
    url: '/fastreply/',
    method: 'get'
  })
}

export function AlterarMensagemRapida (data) {
  return request({
    url: `/fastreply/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarMensagemRapida (data) {
  return request({
    url: `/fastreply/${data.id}`,
    method: 'delete'
  })
}
