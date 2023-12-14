import request from 'src/service/request'

export function ListarContatos (params) {
  return request({
    url: '/contacts/',
    method: 'get',
    params
  })
}

export function ObterContato (contactId) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'get'
  })
}

export function CriarContato (data) {
  return request({
    url: '/contacts',
    method: 'post',
    data
  })
}

export function ImportarArquivoContato (data) {
  return request({
    url: '/contacts/upload',
    method: 'post',
    data,
    timeout: 120000
  })
}

export function ExportarArquivoContato (data) {
  return request({
    url: '/contacts/export',
    method: 'post',
    data,
    timeout: 120000
  })
}

export function SyncronizarContatos () {
  return request({
    url: '/contacts/sync',
    method: 'post'
  })
}

export function EditarContato (contactId, data) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'put',
    data
  })
}

export function DeletarContato (contactId) {
  return request({
    url: `/contacts/${contactId}`,
    method: 'delete'
  })
}

export function EditarEtiquetasContato (contactId, tags) {
  const data = {
    tags
  }
  return request({
    url: `/contact-tags/${contactId}`,
    method: 'put',
    data
  })
}

export function EditarCarteiraContato (contactId, wallets) {
  const data = {
    wallets
  }
  return request({
    url: `/contact-wallet/${contactId}`,
    method: 'put',
    data
  })
}
