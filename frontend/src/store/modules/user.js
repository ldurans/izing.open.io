import { RealizarLogin } from '../../service/login'
import { DadosUsuario } from 'src/service/user'
import { Notify } from 'quasar'

const user = {
  state: {
    token: null,
    isAdmin: false,
    isSuporte: false
  },
  mutations: {
    SET_IS_SUPORTE (state, payload) {
      const domains = ['@wchats.com.br']
      let authorized = false
      domains.forEach(domain => {
        if (payload?.email.toLocaleLowerCase().indexOf(domain.toLocaleLowerCase()) !== -1) {
          authorized = true
        }
      })
      state.isSuporte = authorized
    },
    SET_IS_ADMIN (state, payload) {
      state.isAdmin = !!((state.isSuporte || payload.profile === 'admin'))
    }
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

        // chamada deve ser feita após inserir o token no localstorage
        const { data: usuario } = await DadosUsuario(data.userId)
        localStorage.setItem('usuario', JSON.stringify(usuario))
        commit('SET_IS_SUPORTE', usuario)
        commit('SET_IS_ADMIN', usuario)
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
