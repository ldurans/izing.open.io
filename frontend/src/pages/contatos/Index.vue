<template>
  <div>
    <q-table class="my-sticky-dynamic"
      title="Contatos"
      :id="`tabela-contatos-${isChatContact ? 'atendimento' : ''}`"
      :data="contacts"
      :columns="columns"
      :loading="loading"
      row-key="id"
      virtual-scroll
      :virtual-scroll-item-size="48"
      :virtual-scroll-sticky-size-start="48"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      @virtual-scroll="onScroll"
      :bordered="isChatContact"
      :square="isChatContact"
      :flat="isChatContact"
      :separator="isChatContact ? 'vertical' : 'horizontal'"
      :class="{
        'q-ma-lg': !isChatContact,
        'q-ml-md heightChat': isChatContact
      }">
      <template v-slot:top>
        <div class="row col-2 q-table__title items-center ">
          <q-btn v-if="isChatContact"
            class="q-mr-sm"
            color="black"
            round
            flat
            icon="mdi-close"
            @click="$router.push({ name: 'chat-empty' })" />
          Contatos
        </div>
        <q-space />
        <q-input :class="{
          'order-last q-mt-md': $q.screen.width < 500
        }"
          style="width: 300px"
          filled
          dense
          debounce="500"
          v-model="filter"
          clearable
          placeholder="Localize"
          @input="filtrarContato">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        <!-- <q-btn class="q-ml-md"
          color="warning"
          label="Sincronizar"
          @click="sincronizarContatos" /> -->
        <q-btn class="q-ml-md"
          color="primary"
          label="Adicionar"
          @click="selectedContactId = null; modalContato = true" />
      </template>
      <template v-slot:body-cell-profilePicUrl="props">
        <q-td>
          <q-avatar style="border: 1px solid #9e9e9ea1 !important">
            <q-icon name="mdi-account"
              size="1.5em"
              color="grey-5"
              v-if="!props.value" />
            <q-img :src="props.value"
              style="max-width: 150px">
              <template v-slot:error>
                <q-icon name="mdi-account"
                  size="1.5em"
                  color="grey-5" />
              </template>
            </q-img>
          </q-avatar>
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn flat
            round
            icon="img:whatsapp-logo.png"
            @click="handleSaveTicket(props.row, 'whatsapp')"
            v-if="props.row.number" />
          <q-btn flat
            round
            icon="img:instagram-logo.png"
            @click="handleSaveTicket(props.row, 'instagram')"
            v-if="props.row.instagramPK" />
          <q-btn flat
            round
            icon="img:telegram-logo.png"
            @click="handleSaveTicket(props.row, 'telegram')"
            v-if="props.row.telegramId" />
          <q-btn flat
            round
            icon="edit"
            @click="editContact(props.row.id)" />
          <q-btn flat
            round
            icon="mdi-delete"
            @click="deleteContact(props.row.id)" />
        </q-td>
      </template>
      <template v-slot:pagination="{ pagination }">
        {{ contacts.length }}/{{ pagination.rowsNumber }}
      </template>
    </q-table>
    <ContatoModal :contactId="selectedContactId"
      :modalContato.sync="modalContato"
      @contatoModal:contato-editado="UPDATE_CONTACTS"
      @contatoModal:contato-criado="UPDATE_CONTACTS" />
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarTicket } from 'src/service/tickets'
import { ListarContatos, DeletarContato, SyncronizarContatos } from 'src/service/contatos'
import ContatoModal from './ContatoModal'
export default {
  name: 'IndexContatos',
  components: { ContatoModal },
  props: {
    isChatContact: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      contacts: [],
      modalContato: false,
      filter: null,
      selectedContactId: null,
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'profilePicUrl', label: '', field: 'profilePicUrl', style: 'width: 50px', align: 'center' },
        {
          name: 'name',
          label: 'Nome',
          field: 'name',
          align: 'left',
          style: 'width: 300px',
          format: (v, r) => {
            if (r.number && r.name == r.number && r.pushname) {
              return r.pushname
            }
            return r.name
          }
        },
        { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' },
        {
          name: 'instagramPK',
          label: 'Instagram',
          field: 'instagramPK',
          align: 'center',
          style: 'width: 300px',
          format: (v, r) => {
            return r.instagramPK ? r.pushname : ''
          }
        },
        {
          name: 'telegramId',
          label: 'Id Telegram',
          field: 'telegramId',
          align: 'center',
          style: 'width: 300px',
          format: (v, r) => {
            return r.telegramId ? r.pushname : ''
          }
        },
        { name: 'email', label: 'Email', field: 'email', style: 'width: 500px', align: 'left' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    LOAD_CONTACTS (contacts) {
      const newContacts = []
      contacts.forEach(contact => {
        const contactIndex = this.contacts.findIndex(c => c.id === contact.id)
        if (contactIndex !== -1) {
          this.contacts[contactIndex] = contact
        } else {
          newContacts.push(contact)
        }
      })
      const contactsObj = [...this.contacts, ...newContacts]
      this.contacts = contactsObj
    },
    UPDATE_CONTACTS (contact) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contact.id)
      if (contactIndex !== -1) {
        newContacts[contactIndex] = contact
      } else {
        newContacts.unshift(contact)
      }
      this.contacts = [...newContacts]
    },
    DELETE_CONTACT (contactId) {
      const newContacts = [...this.contacts]
      const contactIndex = newContacts.findIndex(c => c.id === contactId)
      if (contactIndex !== -1) {
        newContacts.splice(contactIndex, 1)
      }
      this.contacts = [...newContacts]
    },
    filtrarContato (data) {
      this.contacts = []
      this.params.pageNumber = 1
      this.params.searchParam = data
      this.loading = true
      this.listarContatos()
    },
    async listarContatos () {
      this.loading = true
      const { data } = await ListarContatos(this.params)
      this.params.hasMore = data.hasMore
      this.LOAD_CONTACTS(data.contacts)
      this.loading = false
      this.pagination.lastIndex = this.contacts.length - 1
      this.pagination.rowsNumber = data.count
    },
    onScroll ({ to, ref, ...all }) {
      if (this.loading !== true && this.params.hasMore === true && to === this.pagination.lastIndex) {
        this.loading = true
        this.params.pageNumber++
        this.listarContatos()
      }
    },
    async handleSaveTicket (contact, channel) {
      if (!contact.id) return
      this.loading = true
      try {
        const { data: ticket } = await CriarTicket({
          contactId: contact.id,
          isActiveDemand: true,
          userId: userId,
          channel,
          status: 'open'
        })
        await this.$store.commit('SET_HAS_MORE', true)
        await this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$q.notify({
          message: `Atendimento Iniciado || ${ticket.contact.name} - Ticket: ${ticket.id}`,
          type: 'positive',
          position: 'top',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.$router.push({ name: 'atendimento' })
      } catch (error) {
        if (error.status === 409) {
          const ticketAtual = JSON.parse(error.data.error)
          this.abrirAtendimentoExistente(contact, ticketAtual)
          return
        }
        this.$notificarErro('Ocorreu um erro!', error)
      }
      this.loading = false
    },
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    deleteContact (contactId) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar o contato? ',
        // message: 'Mensagens antigas não serão apagadas no whatsapp.',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarContato(contactId)
          .then(res => {
            this.DELETE_CONTACT(contactId)
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: 'Contato deletado!',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('Não é possível deletar o contato', error)
          })
        this.loading = false
      })
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    abrirAtendimentoExistente (contato, ticket) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `${contato.name} possui um atendimento em curso (Atendimento: ${ticket.id}). Deseja abrir o atendimento?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            'Não foi possível atualizar o token',
            error
          )
        }
      })
    },
    confirmarSincronizarContatos () {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente sincronizar os contatos? ',
        message: 'Todas os contatos com os quais você já conversou pelo Whatsapp serão criados. Isso pode demorar um pouco...',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'warning',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        this.loading = true
        await this.sincronizarContatos()
        this.loading = false
      })
    },
    async sincronizarContatos () {
      try {
        this.loading = true
        await SyncronizarContatos()
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: 'Contatos estão sendo atualizados. Isso pode levar um tempo...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error(error)
        this.$notificarErro('Ocorreu um erro ao sincronizar os contatos', error)
        this.loading = true
      }
      this.loading = true
    }

  },
  mounted () {
    this.listarContatos()
  }
}
</script>

<style lang="sass" >
.my-sticky-dynamic
  /* height or max-height is important */
  height: 85vh

  .q-table__top,
  .q-table__bottom,
  thead tr:first-child th /* bg color is important for th; just specify one */
    background-color: #fff

  thead tr th
    position: sticky
    z-index: 1
  /* this will be the loading indicator */
  thead tr:last-child th
    /* height of all previous header rows */
    top: 63px
  thead tr:first-child th
    top: 0

.heightChat
  height: calc(100vh - 0px)
  .q-table__top
    padding: 8px

#tabela-contatos-atendimento
  thead
    th
      height: 55px
</style>
