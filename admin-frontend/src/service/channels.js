import request from 'src/service/request'

export function AdminListarChannels (whatsAppId) {
  return request({
    url: '/admin/channels/',
    method: 'get'
  })
}

export function StartWhatsappSession (whatsAppId) {
  return request({
    url: `/whatsappsession/${whatsAppId}`,
    method: 'post'
  })
}

export function DeleteWhatsappSession (whatsAppId) {
  return request({
    url: `/whatsappsession/${whatsAppId}`,
    method: 'delete'
  })
}

export function RequestNewQrCode (whatsAppId) {
  return request({
    url: `/whatsappsession/${whatsAppId}`,
    method: 'put'
  })
}

export function GetWhatSession (whatsAppId) {
  return request({
    url: `/whatsapp/${whatsAppId}`,
    method: 'get'
  })
}

export function UpdateChannel (channelId, data) {
  return request({
    url: `/whatsapp/${channelId}`,
    method: 'put',
    data
  })
}

export function CriarChannel (data) {
  return request({
    url: '/admin/channels',
    method: 'post',
    data
  })
}

export function DeletarWhatsapp (whatsAppId) {
  return request({
    url: `/whatsapp/${whatsAppId}`,
    method: 'delete'
  })
}

export function SincronizarContatosWhatsapp (whatsAppId) {
  return request({
    url: `/whatsapp/sync-contacts/${whatsAppId}`,
    method: 'post',
    timeout: false
  })
}

// api.put(`/whatsapp/${whatsAppId}`, {
//   name: values.name,
//   isDefault: values.isDefault,
// });
