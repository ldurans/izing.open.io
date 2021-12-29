import request from 'src/service/request'

export function AdminListarChatFlow (tenantId) {
  return request({
    url: `/admin/chatflow/${tenantId}`,
    method: 'get'
  })
}
