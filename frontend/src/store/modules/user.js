import { RealizarLogin } from '../../service/login'
import { Notify } from 'quasar'

const user = {
  state: {
    token: null
  },
  mutations: {

  },
  actions: {

    async UserLogin ({ commit, dispatch }, user) {
      user.email = user.email.trim()
      try {
        const { data } = await RealizarLogin(user)
        localStorage.setItem('token', JSON.stringify(data.token))
        localStorage.setItem('username', data.username)
        localStorage.setItem('profile', data.profile)
        localStorage.setItem('userId', data.userId)
        this.$router.push({
          name: 'atendimento'
        })
        Notify.create({
          type: 'positive',
          message: 'Login realizado com sucesso!',
          position: 'bottom-right',
          progress: true
        })
      } catch (error) {
        console.error(error)
      }
    }
  }
}

export default user
