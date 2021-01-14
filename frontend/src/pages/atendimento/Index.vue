<template>
  <div
    class="WAL position-relative bg-grey-3"
    :style="style"
  >
    <q-layout
      class="WAL__layout shadow-3"
      container
      view="lHr LpR lFr"
    >
      <!-- view="lHr LpR lFr" -->
      <q-drawer
        v-model="drawerTickets"
        show-if-above
        bordered
        :width="450"
        content-class="bg-white hide-scrollbar"
      >

        <q-toolbar
          class="text-primary q-pr-none"
          style="height: 50px"
        >
          <q-avatar class="cursor-pointer">
            <img src="https://cdn.quasar.dev/app-icons/icon-128x128.png" />
          </q-avatar>
          <q-space />
          <q-btn
            round
            flat
            icon="mdi-comment-plus-outline"
            @click="modalNovoTicket=true"
          >
            <q-tooltip
              :delay="1000"
              content-class="bg-primary"
            >
              Novo atendimento
            </q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-comment-search-outline"
            @click="toolbarSearch = !toolbarSearch"
          >
            <q-tooltip
              :delay="1000"
              content-class="bg-primary"
            >
              Pesquisar
            </q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-book-account-outline"
            @click="$router.push({name:'chat-contatos'})"
          >
            <q-tooltip
              :delay="1000"
              content-class="bg-primary"
            >
              Contatos
            </q-tooltip>
          </q-btn>
          <StatusWhatsapp
            class="q-mx-sm"
            isIconStatusMenu
          />
          <!-- <q-toolbar
            class="text-center bg-grey-3"
            style="width: 60px;"
          >
            <StatusWhatsapp isIconStatusMenu />
          </q-toolbar> -->
        </q-toolbar>
        <q-toolbar
          v-show="toolbarSearch"
          class="row q-py-sm items-center"
        >
          <q-separator class="absolute-top" />
          <!-- <q-checkbox
                v-model="pesquisa.showAll"
                :false-value="true"
                :true-value="false"
                label="Meus"
                @input="consultarTicketsIniciais"
              /> -->
          <!-- <q-select
                rounded
                class="q-ml-md"
                style="width: 13vw"
                dense
                outlined
                v-model="pesquisa.queue"
                :options="cUserQueues"
                option-label="queue"
                option-value="id"
                label="Fila"
                map-options
                emit-value
                @input="consultarTicketsIniciais"
                clearable
              /> -->
          <q-btn
            color="primary"
            icon="mdi-filter-outline"
            round
            flat
            dense
          >
            <q-tooltip>
              Filtro Avançado
            </q-tooltip>
          </q-btn>
          <q-btn
            color="primary"
            icon="mdi-close"
            round
            flat
            dense
            @click="toolbarSearch = !toolbarSearch"
          >
            <q-tooltip>
              Limpar pesquisa
            </q-tooltip>
          </q-btn>
          <q-input
            v-model="filterBusca"
            dense
            outlined
            type="search"
            class="col-grow "
            :debounce="700"
            @input="BuscarTicketFiltro(filterBusca)"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-separator class="absolute-bottom" />
        </q-toolbar>
        <q-toolbar class="q-pa-none">
          <q-tabs
            narrow-indicator
            align="justify"
            dense
            v-model="tabsAtendimento"
            no-caps
            inline-label
            class="full-width bg-grey-2"
            @input="$refs.scrollAreaTickets.setScrollPosition(0)"
          >
            <q-tab
              class="text-primary"
              name="inbox"
              icon="mdi-comment-account-outline"
              ripple
              label="Inbox"
              content-class="q-py-md"
            >
              <q-badge
                style="margin-top: 0px; font-size: .7em; border-radius: 10px;"
                class="text-center"
                floating
                dense
                text-color="white"
                color="primary"
                :label="ticketsEmAtendimento.length > count.open ? ticketsEmAtendimento.length : count.open"
              />
            </q-tab>
            <q-tab
              class="text-negative"
              name="fila"
              icon="mdi-clock-fast"
              content-class="q-py-md"
              label="Fila"
            >
              <q-badge
                style="font-size: .7em; border-radius: 10px;"
                class="text-center"
                floating
                dense
                text-color="white"
                color="negative"
                :label="ticketsPendentes.length > count.pending ? ticketsPendentes.length : count.pending"
              />
            </q-tab>
            <q-tab
              class="text-positive"
              name="resolvidos"
              icon="mdi-comment-check-outline"
              content-class="q-py-md"
              label="Resolvidos"
            >
            </q-tab>
          </q-tabs>
        </q-toolbar>
        <q-scroll-area
          ref="scrollAreaTickets"
          style="height: calc(100% - 165px)"
          @scroll="onScroll"
        >
          <q-separator />
          <q-tab-panels
            v-model="tabsAtendimento"
            keep-alive
            animated
          >
            <q-tab-panel
              name="inbox"
              class="q-pa-none scroll-y"
            >
              <ItemTicket
                v-for="(ticket, key) in ticketsEmAtendimento"
                :key="key"
                :ticket="ticket"
                :filas="filas"
              />
            </q-tab-panel>
            <q-tab-panel
              name="fila"
              class="q-pa-none scroll-y"
            >
              <ItemTicket
                :ticketPendente="true"
                v-for="(ticket, key) in ticketsPendentes"
                :key="key"
                :ticket="ticket"
                :filas="filas"
              />
            </q-tab-panel>
            <q-tab-panel name="resolvidos">
              <ItemTicket
                v-for="(ticket, key) in ticketsResolvidos"
                :key="key"
                :ticket="ticket"
                :filas="filas"
              />
            </q-tab-panel>
            <q-tab-panel name="busca">
              <ItemTicket
                v-for="(ticket, key) in ticketsLocalizadosBusca"
                :key="key"
                :ticket="ticket"
                :buscaTicket="true"
                :filas="filas"
              />
            </q-tab-panel>
          </q-tab-panels>
          <div v-if="loading">
            <div class="row justify-center q-my-md">
              <q-spinner
                color="primary"
                size="3em"
                :thickness="3"
              />
            </div>
            <div class="row col justify-center q-my-sm text-primary">
              Carregando...
            </div>
          </div>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <router-view :key="ticketFocado.id"></router-view>
      </q-page-container>

      <q-drawer
        v-if="!cRouteContatos"
        v-model="drawerContact"
        show-if-above
        bordered
        side="right"
        content-class="bg-grey-1"
      >
        <div
          class="bg-white text-primary full-width no-border-radius q-pa-sm"
          style="height:50px;"
        >
          <span class="q-ml-md text-h6">
            Dados Contato
          </span>
        </div>
        <q-separator />
        <div
          class="q-pa-sm"
          v-if="ticketFocado.id"
        >
          <q-card
            class="bg-white"
            style="width: 100%"
            bordered
            flat
            square
          >
            <q-card-section class="text-center">
              <q-avatar style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px">
                <q-icon
                  name="mdi-account"
                  style="width: 100px; height: 100px"
                  size="6em"
                  color="grey-5"
                  v-if="!ticketFocado.contact.profilePicUrl"
                />
                <q-img
                  :src="ticketFocado.contact.profilePicUrl"
                  style="width: 100px; height: 100px"
                >
                  <template v-slot:error>
                    <q-icon
                      name="mdi-account"
                      size="1.5em"
                      color="grey-5"
                    />
                  </template>
                </q-img>
              </q-avatar>
              <div
                class="text-caption q-mt-md"
                style="font-size: 14px"
              >
                {{ ticketFocado.contact.name || ''  }}
              </div>
              <div
                class="text-caption q-mt-sm"
                style="font-size: 14px"
              >
                {{ ticketFocado.contact.number || ''  }}
              </div>
              <q-btn
                color="primary"
                outline
                class="q-mt-sm"
                label="Editar Contato"
                @click="editContact(ticketFocado.contact.id)"
              />
            </q-card-section>
          </q-card>
          <q-card
            class="bg-white q-mt-sm"
            style="width: 100%"
            bordered
            flat
            square
          >
            <q-card-section class="text-bold">
              Outras Informações
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-list>
                <q-item
                  v-for="(info, idx) in ticketFocado.contact.extraInfo"
                  :key="idx"
                >
                  <q-item-section>
                    <q-item-label caption>{{info.name}}</q-item-label>
                    <q-item-label>{{info.value}}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </q-drawer>

      <ModalNovoTicket :modalNovoTicket.sync="modalNovoTicket" />
      <ContatoModal
        :contactId="selectedContactId"
        :modalContato.sync="modalContato"
        @contatoModal:contato-editado="contatoEditado"
      />
      <audio ref="audioNotification">
        <source
          :src="alertSound"
          type="audio/mp3"
        >
      </audio>
    </q-layout>
  </div>
</template>

<script>
import ContatoModal from 'src/pages/contatos/ContatoModal'
import ItemTicket from './ItemTicket'
import { ConsultarTickets } from 'src/service/tickets'
import { mapGetters } from 'vuex'
import mixinSockets from './mixinSockets'
import socketInitial from 'src/layouts/socketInitial'
import ModalNovoTicket from './ModalNovoTicket'
import { ListarFilas } from 'src/service/filas'
const UserQueues = localStorage.getItem('queues')
import StatusWhatsapp from 'src/components/StatusWhatsapp'
import alertSound from 'src/assets/sound.mp3'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'

import { format } from 'date-fns'

export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets, socketInitial],
  components: {
    ItemTicket,
    ModalNovoTicket,
    StatusWhatsapp,
    ContatoModal
  },
  data () {
    return {
      splitterModel: 20,
      alertSound,
      toolbarSearch: true,
      drawerTickets: true,
      drawerContact: true,
      loading: false,
      modalNovoTicket: false,
      modalContato: false,
      selectedContactId: null,
      tabsAtendimento: 'inbox',
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      pagAbertos: 1,
      pagPendentes: 1,
      pagResolvidos: 1,
      count: {
        open: 0,
        pending: 0,
        closed: 0,
        busca: 0
      },
      pesquisa: {
        searchParam: '',
        pageNumber: 1,
        status: 'open',
        showAll: false,
        queue: null
        // date: new Date(),
        // withUnreadMessages: ''
      },
      pesquisaTickets: {
        searchParam: '',
        pageNumber: 1,
        // status: 'open',
        showAll: true,
        count: null,
        queue: null
        // date: new Date(),
        // withUnreadMessages: ''
      },
      filas: []
    }
  },
  computed: {
    ...mapGetters([
      'ticketsEmAtendimento',
      'ticketsPendentes',
      'ticketsResolvidos',
      'ticketsLocalizadosBusca',
      'ticketFocado',
      'hasMoreOpen',
      'hasMorePending',
      'hasMoreClosed',
      'hasMoreBusca'
    ]),
    cUserQueues () {
      try {
        const filasUsuario = JSON.parse(UserQueues).map(q => {
          if (q.isActive) {
            return q.id
          }
        })
        return this.filas.filter(f => filasUsuario.includes(f.id)) || []
      } catch (error) {
        return this.filas
      }
    },
    style () {
      return {
        height: this.$q.screen.height + 'px'
      }
    },
    cToolbarSearchHeigthAjust () {
      return this.toolbarSearch ? 58 : 0
    },
    cHeigVerticalTabs () {
      return `${50 + this.cToolbarSearchHeigthAjust}px`
    },
    cRouteContatos () {
      return this.$route.name === 'chat-contatos'
    }
  },
  methods: {
    onScroll (info) {
      if (info.verticalPercentage <= 0.85) return
      if (this.tabsAtendimento === 'inbox') {
        this.onLoadAbertos()
      }
      if (this.tabsAtendimento === 'fila') {
        this.onLoadPendentes()
      }
      if (this.tabsAtendimento === 'resolvidos') {
        this.onLoadResolvidos()
      }
      if (this.tabsAtendimento === 'busca') {
        this.onLoadMoreTicketsBusca()
      }
    },
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    contatoEditado (contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
      this.$store.commit('UPDATE_TICKET_CONTACT', contato)
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisa,
        ...paramsInit
      }
      try {
        this.socketTicketList(params.status)
        const { data } = await ConsultarTickets(params)
        this.count[params.status] = data.count // count total de tickets no status
        this.$store.commit('LOAD_TICKETS', data.tickets)
        this.$store.commit(`SET_HAS_MORE_${params.status.toUpperCase()}`, data.hasMore)
      } catch (err) {
        const errorMsg = err.response?.data?.error
        if (errorMsg) {
          this.$q.notify({
            message: err.response.data.error,
            type: 'negative',
            progress: true,
            position: 'top-right'
          })
        } else {
          this.$q.notify({
            message: 'Ops... Ocorreu um problema de rede não identificado.',
            type: 'negative',
            progress: true,
            position: 'top-right'
          })
          console.error(err)
        }
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    async BuscarTicketFiltro (searchParam) {
      if (this.loading === true) return
      const statusPesquisa = ['open', 'pending', 'closed']
      this.$store.commit('RESET_TICKETS')
      this.loading = true
      this.pagAbertos = 1
      this.pagPendentes = 1
      this.pagResolvidos = 1
      await Promise.all(
        statusPesquisa.map(async status => {
          this.pesquisaTickets = {
            ...this.pesquisaTickets,
            pageNumber: 1,
            searchParam,
            status
          }
          await this.consultarTickets(this.pesquisaTickets)
        })
      )
      this.loading = false
    },
    async onLoadAbertos () {
      if (this.ticketsEmAtendimento.length === 0 || !this.hasMoreOpen || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pagAbertos += 1
        await this.consultarTickets({ status: 'open', pageNumber: this.pagAbertos })
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async onLoadPendentes () {
      if (this.ticketsPendentes.length === 0 || !this.hasMorePending || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pagPendentes += 1
        await this.consultarTickets({ status: 'pending', pageNumber: this.pagPendentes })
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async onLoadResolvidos () {
      if (this.ticketsResolvidos.length === 0 || !this.hasMoreClosed || this.loadClose) {
        return
      }
      try {
        this.loadClose = true
        this.pagResolvidos += 1
        await this.consultarTickets({ status: 'closed', pageNumber: this.pagResolvidos })
        this.loadClose = false
      } catch (error) {
        this.loadClose = false
      }
    },
    async onLoadMoreTicketsBusca () {
      if (this.ticketsLocalizadosBusca.length === 0 || !this.hasMoreBusca || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        const { data } = await ConsultarTickets(this.pesquisaTickets)
        // this.pesquisaTickets.count = data.count
        this.$store.commit('LOAD_TICKETS_LOCALIZADOS_BUSCA', data.tickets)
        this.$store.commit('SET_HAS_MORE_BUSCA', data.hasMore)
      } catch (error) {
        console.error(error)
      }
      this.loading = false
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data.queueData
    },
    async consultarTicketsIniciais () {
      this.$store.commit('RESET_TICKETS')
      this.loading = false
      this.pagAbertos = 1
      this.pagPendentes = 1
      this.pagResolvidos = 1
      this.pesquisa.pageNumber = 1
      this.pesquisaTickets.pageNumber = 1
      await this.consultarTickets() // abertos (em atendimento)
      await this.consultarTickets({ status: 'pending' }) // pendentes (aguardando atendimento)
      await this.consultarTickets({ status: 'closed' }) // pendentes (aguardando atendimento)
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    handlerNotifications (data) {
      const { message, contact, ticket } = data

      const options = {
        body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
        icon: contact.profilePicUrl,
        tag: ticket.id,
        renotify: true
      }

      const notification = new Notification(
        `Mensagem de ${contact.name}`,
        options
      )

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$router.push({ name: 'atendimento' })

        // history.push(`/tickets/${ticket.id}`);
      }
      this.$nextTick(() => {
        // utilizar refs do layout
        this.$refs.audioNotification.play()
      })
    }
  },
  beforeMount () {
    this.listarFilas()
  },
  async mounted () {
    await this.consultarTicketsIniciais()
    await this.listarWhatsapps()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    this.userProfile = localStorage.getItem('profile')
    // this.socketInitial()
  },
  destroyed () {
    this.socketDisconnect()
    this.$store.commit('TICKET_FOCADO', {})
  }
}
</script>

<style lang="sass">
.upload-btn-wrapper
  position: relative
  overflow: hidden
  display: inline-block

  & input[type="file"]
    font-size: 100px
    position: absolute
    left: 0
    top: 0
    opacity: 0

.WAL
  width: 100%
  height: 100%

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0!important
  font-size: 1.4rem
</style>
