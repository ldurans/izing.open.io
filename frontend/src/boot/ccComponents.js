import cInput from 'src/components/cInput'
const userLogado = JSON.parse(localStorage.getItem('usuario'))

const user = {
  isSuporte () {
    const domains = ['@wchats.com.br']
    let authorized = false
    domains.forEach(domain => {
      console.log('isSuporte', userLogado?.email, domain.toLocaleLowerCase().indexOf(userLogado?.email))
      if (userLogado?.email.toLocaleLowerCase().indexOf(domain.toLocaleLowerCase()) !== -1) {
        authorized = true
      }
    })
    return authorized
  },
  isAdmin () {
    const domains = ['@wchats.com.br']
    let isSuporte = false
    domains.forEach(domain => {
      if (userLogado?.email.toLocaleLowerCase().indexOf(domain.toLocaleLowerCase()) !== -1) {
        isSuporte = true
      }
    })
    return !!((isSuporte || userLogado.profile === 'admin'))
  }

}

export default ({
  Vue
}) => {
  Vue.prototype.$user = user
  Vue.component('cInput', cInput)
}
