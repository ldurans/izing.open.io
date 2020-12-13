<template>
  <q-dialog
    :value="modalNovoTicket"
    persistent
    @hide="$emit('update:modalNovoTicket', false)"
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">Criar Ticket</div>
      </q-card-section>
      <q-card-section>
        <q-select
          square
          outlined
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          option-label="name"
          option-value="id"
          label="Localizar Contato"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-pr-md"
      >
        <q-btn
          label="Sair"
          color="negative"
          v-close-popup
          class="q-px-md q-mr-lg"
        />
        <q-btn
          label="Salvar"
          class="q-px-md "
          color="primary"
          @click="criarTicket"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { ListarContatos } from 'src/service/contatos'
import { CriarTicket } from 'src/service/tickets'
export default {
  name: 'ModalNovoTicket',
  props: {
    modalNovoTicket: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      ticket: {},
      contatoSelecionado: null,
      contatos: []
    }
  },
  methods: {
    async localizarContato (search, update, abort) {
      if (search.length < 2) {
        if (this.contatos.length) update(() => { this.contatos = [...this.contatos] })
        abort()
        return
      }
      const { data } = await ListarContatos({
        searchParam: search
      })
      update(() => {
        this.contatos = data.contacts
      })
    },
    async criarTicket () {
      if (!this.contatoSelecionado.id) return
      this.loading = true
      try {
        const { data: ticket } = await CriarTicket({
          contactId: this.contatoSelecionado.id,
          userId: userId,
          status: 'open'
        })
        await this.$store.commit('SET_HAS_MORE', true)
        await this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$q.notify({
          message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
          type: 'positive',
          progress: true
        })
        this.$router.push({ name: 'atendimento' })
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    }
  },
  destroyed () {
    this.contatoSelecionado = null
  }
}
</script>

<style lang="scss" scoped>
</style>
