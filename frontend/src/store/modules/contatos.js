const contatos = {
  state: {
    contatos: []
  },
  mutations: {
    LOAD_CONTACTS (state, payload) {
      const contacts = payload
      const newContacts = []
      contacts.forEach(contact => {
        const contactIndex = state.contatos.findIndex(c => c.id === contact.id)
        if (contactIndex !== -1) {
          state.contatos[contactIndex] = contact
        } else {
          newContacts.push(contact)
        }
      })
      return [...state.contatos, ...newContacts]
    },
    UPDATE_CONTACTS (state, payload) {
      const contact = payload
      const contactIndex = state.contatos.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        state.contatos[contactIndex] = contact
        return [...state.contatos]
      } else {
        return [contact, ...state.contatos]
      }
    },
    DELETE_CONTACT (state, payload) {
      const contactId = payload
      const contactIndex = state.contatos.findIndex(c => c.id === contactId)
      if (contactIndex !== -1) {
        state.contatos.splice(contactIndex, 1)
      }
      return [...state.contatos]
    },
    RESET_CONTACT (state) {
      state.contatos = []
      return []
    }
  }
}

export default contatos
