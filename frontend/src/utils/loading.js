import { Loading, QSpinnerBars, QSpinnerPuff } from 'quasar'

const loading = {}
let lastRequest = new Date()

loading.show = function (config) {
  // if (config && config.loading) {
  const now = new Date()
  const ms = now - lastRequest
  lastRequest = now
  if (ms > 2000) {
    if (config.loading === 'gears') {
      Loading.show({
        spinner: QSpinnerBars,
        message: '',
        messageColor: 'white',
        spinnerSize: 100,
        spinnerColor: 'white',
        customClass: ''
      })
    } else if (config.loading === 'hourglass') {
      Loading.show({
        spinner: QSpinnerBars,
        message: '',
        messageColor: 'white',
        spinnerSize: 100,
        spinnerColor: 'white',
        customClass: ''
      })
    } else {
      Loading.show({
        spinner: QSpinnerPuff,
        message: 'Estamos trabalhando...',
        messageColor: 'white',
        spinnerSize: 150,
        spinnerColor: 'white',
        customClass: ''
      })
    }
  }
  // }
}

loading.hide = function (config) {
  setTimeout(() => {
    Loading.hide()
  }, 1000)
  // if (config && config.loading) {
  //   setTimeout(() => {
  //     Loading.hide()
  //   }, 1000)
  // }
}

export default loading
