import request from 'src/service/request'

export function FetchFacebookPages (data) {
  return request({
    url: '/fb/register-pages',
    method: 'post',
    data
  })
}
