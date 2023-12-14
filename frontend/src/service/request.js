import axios from 'axios'
import Router from '../router/index'

import loading from 'src/utils/loading'
import { Notify } from 'quasar'

import backendErrors from './erros'
import { RefreshToken } from './login'

const service = axios.create({
  baseURL: process.env.VUE_URL_API,
  timeout: 20000
})

const handlerError = err => {
  const errorMsg = err?.response?.data?.error
  let error = 'Ocorreu um erro não identificado.'
  if (errorMsg) {
    if (backendErrors[errorMsg]) {
      error = backendErrors[errorMsg]
    } else {
      error = err.response.data.error
    }
  }
  Notify.create({
    position: 'top',
    type: 'negative',
    html: true,
    progress: true,
    message: `${JSON.stringify(error)}`
  })
}

// const tokenInicial = url => {
//   const paths = [
//     '/login/'
//   ]
//   let is_init = false
//   paths.forEach(path => {
//     url.indexOf(path) !== -1 ? is_init = true : is_init = false
//   })
//   return is_init
// }

service.interceptors.request.use(
  config => {
    try {
      if (config.loading) {
        loading.show(config.loading)
      }
    } catch (error) {

    }

    // let url = config.url
    // const r = new RegExp('id_conta_cliente', 'g')
    // url = url.replace(r, id_conta_cliente)
    // const u = new RegExp('id_unidade_negocio', 'g')
    // config.url = url.replace(u, id_unidade_negocio)
    const tokenAuth = JSON.parse(localStorage.getItem('token'))
    const token = 'Bearer ' + tokenAuth
    if (token) {
      // config.headers['Authorization'] = 'Bearer ' + token
      config.headers.Authorization = token
    }
    return config
  },
  error => {
    // handlerError(error)
    Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    loading.hide(response.config)
    const res = response
    const status = res.status
    if (status.toString().substr(0, 1) !== '2') {
      // handlerError(res)
      return Promise.reject('error')
    } else {
      return response
    }
  },
  error => {
    loading.hide(error.config)
    if (error?.response?.status === 403 && !error.config._retry) {
      error.config._retry = true
      RefreshToken().then(res => {
        if (res.data) {
          localStorage.setItem('token', JSON.stringify(res.data.token))
        }
      })
    }
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('profile')
      localStorage.removeItem('userId')
      if (error.config.url.indexOf('logout') === -1) {
        handlerError(error)
        setTimeout(() => {
          Router.push({
            name: 'login'
          })
        }, 2000)
      }
    } else if (error.response && error.response.status === 500) {
      handlerError(error)
    } else if (error.message.indexOf('timeout') > -1) {
      Notify.create({
        message: 'Processando informações de estatisticas',
        position: 'top',
        type: 'positive',
        progress: true,
        html: true
      })
    } else {
      // handlerError(error)
    }
    return Promise.reject(error.response)
  }
)

export default service
