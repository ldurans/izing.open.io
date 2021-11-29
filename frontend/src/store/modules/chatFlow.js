const whatsapp = {
  state: {
    flow: {},
    usuarios: [],
    filas: []
  },
  mutations: {
    SET_FLOW_DATA (state, payload) {
      state.flow = payload.flow
      state.usuarios = payload.usuarios
      state.filas = payload.filas
    },
    RESET_FLOW_DATA (state) {
      state.flow = {}
      state.usuarios = []
      state.filas = []
    }
  }
}

export default whatsapp
