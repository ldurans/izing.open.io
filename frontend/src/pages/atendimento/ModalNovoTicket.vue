<template>
  <q-dialog
    :value="modalNovoTicket"
    persistent
    @hide="fecharModal"
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
          ref="selectAutoCompleteContato"
          autofocus
          square
          outlined
          filled
          hide-dropdown-icon
          :loading="loading"
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
          hint="Digite no mínimo duas letras para localizar o contato."
        >
          <template v-slot:before-options>
            <q-btn
              color="primary"
              no-caps
              padding
              ripple
              class="full-width no-border-radius"
              outline
              icon="add"
              label="Adicionar Contato"
              @click="modalContato = true"
            />

          </template>
          <template v-slot:option="scope">
            <q-item
              v-bind="scope.itemProps"
              v-on="scope.itemEvents"
              v-if="scope.opt.name"
            >
              <q-item-section>
                <q-item-label> {{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
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
    <ContatoModal
      :modalContato.sync="modalContato"
      @contatoModal:contato-criado="contatoCriadoNotoTicket"
    />
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { ListarContatos } from 'src/service/contatos'
import { CriarTicket } from 'src/service/tickets'
import ContatoModal from 'src/pages/contatos/ContatoModal'

export default {
  name: 'ModalNovoTicket',
  components: { ContatoModal },
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
      contatos: [],
      modalContato: false,
      loading: false
    }
  },
  methods: {
    fecharModal () {
      this.ticket = {}
      this.contatoSelecionado = null
      this.$emit('update:modalNovoTicket', false)
    },
    async localizarContato (search, update, abort) {
      if (search.length < 2) {
        if (this.contatos.length) update(() => { this.contatos = [...this.contatos] })
        abort()
        return
      }
      this.loading = true
      const { data } = await ListarContatos({
        searchParam: search
      })

      update(() => {
        if (data.contacts.length) {
          this.contatos = data.contacts
        } else {
          this.contatos = [{}]
          // this.$refs.selectAutoCompleteContato.toggleOption({}, true)
        }
      })
      this.loading = false
    },
    contatoCriadoNotoTicket (contato) {
      this.contatoSelecionado = contato
      this.criarTicket()
    },
    async criarTicket () {
      if (!this.contatoSelecionado.id) return
      this.loading = true
      try {
        const { data: ticket } = await CriarTicket({
          contactId: this.contatoSelecionado.id,
          isActiveDemand: true,
          userId: userId,
          status: 'open'
        })
        await this.$store.commit('SET_HAS_MORE', true)
        await this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$q.notify({
          message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.fecharModal()
        if (this.$route.name !== 'atendimento') {
          this.$router.push({ name: 'atendimento' })
        }
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro ao iniciar o atendimento!', error)
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
