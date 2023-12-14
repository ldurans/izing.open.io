import request from 'src/service/request'

export function CriarCampanha (data) {
  return request({
    url: '/campaigns/',
    method: 'post',
    data
  })
}

export function IniciarCampanha (campaignId) {
  return request({
    url: `/campaigns/start/${campaignId}/`,
    method: 'post',
    data: {
      campaignId
    }
  })
}

export function CancelarCampanha (campaignId) {
  return request({
    url: `/campaigns/cancel/${campaignId}/`,
    method: 'post',
    data: {
      campaignId
    }
  })
}

export function ListarCampanhas () {
  return request({
    url: '/campaigns/',
    method: 'get'
  })
}

export function AlterarCampanha (data, id) {
  return request({
    url: `/campaigns/${id}`,
    method: 'put',
    data
  })
}

export function DeletarCampanha (data) {
  return request({
    url: `/campaigns/${data.id}`,
    method: 'delete'
  })
}

export function AdicionarContatosCampanha (data, campaignId) {
  return request({
    url: `/campaigns/contacts/${campaignId}/`,
    method: 'post',
    data
  })
}

export function ListarContatosCampanha (campaignId) {
  return request({
    url: `/campaigns/contacts/${campaignId}/`,
    method: 'get',
    params: {
      campaignId
    }
  })
}

export function DeletarContatoCampanha (campaignId, contactId) {
  return request({
    url: `/campaigns/contacts/${campaignId}/${contactId}/`,
    method: 'delete',
    params: {
      campaignId,
      contactId
    }
  })
}

export function DeletarTodosContatosCampanha (campaignId) {
  return request({
    url: `/campaigns/deleteall/contacts/${campaignId}/`,
    method: 'delete',
    params: {
      campaignId
    }
  })
}
