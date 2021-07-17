import cInput from 'src/components/cInput'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

import DatePick from 'src/components/cDatePick'

const formatarValorMoeda = (num, black = false, intl = {}) => {
  const config = {
    language: 'pt-br',
    options: {
      // style: 'currency',
      // currency: 'BRL',
      // currencyDisplay: 'symbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 3
    }
  }
  const intlConfig = {
    ...config,
    ...intl
  }
  const valor = Intl.NumberFormat(intlConfig.language, intlConfig.options).format(num)
  if (black && num <= 0.0) {
    return ''
  }
  return valor
}

const arredodar = (num, places) => {
  if (!('' + num).includes('e')) {
    return +(Math.round(num + 'e+' + places) + 'e-' + places)
  } else {
    const arr = ('' + num).split('e')
    let sig = ''
    if (+arr[1] + places > 0) {
      sig = '+'
    }
    return +(
      Math.round(+arr[0] + 'e' + sig + (+arr[1] + places)) +
      'e-' +
      places
    )
  }
}

export default ({
  Vue
}) => {
  Vue.component('cInput', cInput)
  Vue.component('DatePick', DatePick)
  Vue.prototype.$formatarValorMoeda = formatarValorMoeda
  Vue.prototype.$round = arredodar
  Vue.prototype.$notificarErro = notificarErro
  Vue.prototype.$notificarSucesso = notificarSucesso
}
