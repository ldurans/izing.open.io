import cInput from 'src/components/cInput'
import { notificarErro, notificarSucesso } from 'src/utils/helpersNotifications'

import DatePick from 'src/components/cDatePick'
import cDateTimePick from 'src/components/cDateTimePick'

import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'

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

const iniciaisString = nomecompleto => {
  nomecompleto = nomecompleto.replace(/\s(de|da|dos|das)\s/g, ' ') // Remove os de,da, dos,das.
  const iniciais = nomecompleto.match(/\b(\w)/gi) // Iniciais de cada parte do nome.
  // var nome = nomecompleto.split(' ')[0].toLowerCase() // Primeiro nome.
  const sobrenomes = iniciais
    .splice(1, iniciais.length - 1)
    .join('')
    .toLowerCase() // Iniciais
  const iniciaisNome = iniciais + sobrenomes
  return iniciaisNome.toUpperCase()
}

const formatarData = (data, formato = 'dd/MM/yyyy') => {
  return format(parseISO(data), formato, { locale: pt })
}

export default ({
  Vue
}) => {
  Vue.component('cInput', cInput)
  Vue.component('DatePick', DatePick)
  Vue.component('cDateTimePick', cDateTimePick)
  Vue.prototype.$formatarValorMoeda = formatarValorMoeda
  Vue.prototype.$round = arredodar
  Vue.prototype.$formatarData = formatarData
  Vue.prototype.$iniciaisString = iniciaisString
  Vue.prototype.$notificarErro = notificarErro
  Vue.prototype.$notificarSucesso = notificarSucesso
}
