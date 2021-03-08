import { Notify } from 'quasar'

export const notificarError = (msg, error) => {
  let erro = ''
  if (error) {
    erro = 'Detalhe: ' + error?.data?.error || error?.data?.msg || error?.data?.message || error?.response?.data.error || 'Não identificado'
  }
  const message = `
  <p>Ops...</p>
  <p>${msg}.</p>
  <p>${erro}</p>
  `
  Notify.create({
    type: 'negative',
    progress: true,
    position: 'top',
    message,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
  throw new Error(message)
}

export const notificarSucesso = (msg) => {
  const message = `Tudo certo... <br>${msg}.`
  Notify.create({
    type: 'positive',
    progress: true,
    position: 'top',
    message,
    actions: [{
      icon: 'close',
      round: true,
      color: 'white'
    }],
    html: true
  })
}
