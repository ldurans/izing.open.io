import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import whatsapp from './modules/whatsapp'
import atendimentoTicket from './modules/atendimentoTicket'
import notifications from './modules/Notifications'
import chatFlow from './modules/chatFlow'
import usersApp from './modules/usersApp'
import getters from './getters'
// import example from './module-example'

Vue.use(Vuex)

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default function (/* { ssrContext } */) {
  const Store = new Vuex.Store({
    getters,
    modules: {
      // example
      user,
      notifications,
      atendimentoTicket,
      whatsapp,
      chatFlow,
      usersApp
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEBUGGING
  })

  return Store
}
