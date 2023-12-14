import { io } from 'socket.io-client'

export const socketIO = () => {
  return io(process.env.VUE_URL_API, {
    reconnection: true,
    autoConnect: true,
    transports: ['websocket'],
    auth: (cb) => {
      const tokenItem = localStorage.getItem('token')
      const token = tokenItem ? JSON.parse(tokenItem) : null
      // eslint-disable-next-line standard/no-callback-literal
      cb({ token })
    }
  })
}

const socket = socketIO()

socket.io.on('error', (error) => {
  // ...
  console.error('socket error', error)
})

socket.on('disconnect', (reason) => {
  console.info('socket disconnect', reason)

  // if (reason === "io server disconnect") {
  //   // the disconnection was initiated by the server, you need to reconnect manually
  //   socket.connect();
  // }
  // else the socket will automatically try to reconnect
})
