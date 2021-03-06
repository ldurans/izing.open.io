import cInput from 'src/components/cInput'
import { notificarError, notificarSucesso } from 'src/utils/helpersNotifications'

import DatePick from 'src/components/cDatePick'

export default ({
  Vue
}) => {
  Vue.component('cInput', cInput)
  Vue.component('DatePick', DatePick)
  Vue.prototype.$notificarError = notificarError
  Vue.prototype.$notificarSucesso = notificarSucesso
}
