import request from 'src/service/request'

export function CriarAutoResposta (data) {
  return request({
    url: '/auto-reply',
    method: 'post',
    data
  })
}

export function ListarAutoResposta (params) {
  return request({
    url: '/auto-reply',
    method: 'get',
    params
  })
}

export function EditarAutoResposta (data) {
  return request({
    url: `/auto-reply/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarAutoResposta (autoRepostaId) {
  return request({
    url: `/auto-reply/${autoRepostaId}`,
    method: 'delete'
  })
}

export function CriarEtapaResposta (data) {
  return request({
    url: `/auto-reply/${data.idAutoReply}/steps`,
    method: 'post',
    data
  })
}

export function EditarEtapaResposta (data) {
  return request({
    url: `/auto-reply/${data.idAutoReply}/steps/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarEtapaResposta (data) {
  return request({
    url: `/auto-reply/${data.idAutoReply}/steps/${data.id}`,
    method: 'delete'
  })
}

export function CriarAcaoEtapa (data) {
  return request({
    url: '/auto-reply-action',
    method: 'post',
    data
  })
}

export function EditarAcaoEtapa (data) {
  return request({
    url: `/auto-reply-action/${data.id}`,
    method: 'put',
    data
  })
}

export function DeletarAcaoEtapa (data) {
  return request({
    url: `/auto-reply-action/${data.id}`,
    method: 'delete'
  })
}
