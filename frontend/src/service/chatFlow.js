import request from 'src/service/request'

export function CriarChatFlow (data) {
  return request({
    url: '/chat-flow',
    method: 'post',
    data
  })
}

export function ListarChatFlow (params) {
  return request({
    url: '/chat-flow',
    method: 'get',
    params
  })
}
