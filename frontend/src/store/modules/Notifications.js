// import { Notify } from 'quasar'
// import $router from 'src/router'
// import { orderBy } from 'lodash'
// import { parseISO } from 'date-fns'

const Notifications = {
  state: {
    notifications: [],
    notifications_p: []
  },
  mutations: {
    // OK
    UPDATE_NOTIFICATIONS (state, payload) {
      state.notifications = payload
    },
    UPDATE_NOTIFICATIONS_P (state, payload) {
      state.notifications_p = payload
    }
  }
}

export default Notifications
