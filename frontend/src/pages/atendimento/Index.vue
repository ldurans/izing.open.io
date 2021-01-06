<template>
  <div
    class="WAL position-relative"
    :style="style"
  >
    <q-layout
      class="WAL__layout shadow-3"
      container
      view="lHr LpR lFr"
    >
      <q-header elevated>
        <q-toolbar class="bg-grey-3 text-black">
          <q-btn
            round
            flat
            icon="keyboard_arrow_left"
            class="WAL__drawer-open q-mr-sm"
            @click="leftDrawerOpen = true"
          />

          <q-btn
            round
            flat
          >
            <q-avatar>
              <img src="https://cdn.quasar.dev/app-icons/icon-128x128.png" />
            </q-avatar>
          </q-btn>

          <span class="q-subtitle-1 q-pl-md">
            Nome
          </span>

          <q-space />

          <q-btn
            round
            flat
            icon="search"
          />
          <q-btn
            round
            flat
          >
            <q-icon
              name="attachment"
              class="rotate-135"
            />
          </q-btn>
          <q-btn
            round
            flat
            icon="more_vert"
          >
            <q-menu
              auto-close
              :offset="[110, 0]"
            >
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </q-toolbar>
      </q-header>

      <q-drawer
        v-model="drawerTickets"
        show-if-above
        bordered
        :width="450"
        content-class="bg-grey-1"
      >
        <q-toolbar class="bg-primary text-white shadow-1">
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
            icon="mdi-comment-search"
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
            icon="more_vert"
          >
            <q-menu
              auto-close
              :offset="[110, 8]"
            >
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>New group</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Archived</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Favorites</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn
            round
            flat
            icon="close"
            class="WAL__drawer-close"
            @click="leftDrawerOpen = false"
          />
        </q-toolbar>
        <q-toolbar
          v-show="toolbarSearch"
          class="bg-grey-3"
        >
          <div class="row justify-center items-center">
            <div class="col-11 flex q-pa-xs">
              <q-checkbox
                v-model="pesquisa.showAll"
                :false-value="true"
                :true-value="false"
                label="Meus"
                @input="consultarTicketsIniciais"
              />
              <q-select
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
              />
            </div>
            <div class="col-1 text-right q-pr-sm">
              <q-btn
                color="primary"
                icon="mdi-close"
                round
                outline
                dense
                @click="toolbarSearch = !toolbarSearch"
              >
                <q-tooltip>
                  Limpar pesquisa
                </q-tooltip>
              </q-btn>
            </div>
          </div>
        </q-toolbar>
        <q-separator />
        <q-toolbar class="q-pa-none">
          <q-tabs
            v-model="tabsAtendimento"
            narrow-indicator
            no-caps
            inline-label
            align="justify"
            class="absolute-full"
            @input="$refs.scrollAreaTickets.setScrollPosition(0)"
          >
            <q-tab
              class="text-primary"
              name="inbox"
              icon="mdi-forum-outline"
              label="Inbox"
            >
              <q-badge
                style="font-size: .7em; border-radius: 10px;"
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
              icon="check"
              label="Fila"
            >
              <q-badge
                style="font-size: .7em; border-radius: 10px;"
                class="text-center"
                floating
                dense
                text-color="white"
                color="negative"
                :label="ticketsPendentes.length > count.open ? ticketsPendentes.length : count.open"
              />
            </q-tab>
            <q-tab
              class="text-positive"
              name="resolvidos"
              icon="check"
              label="Resolvidos"
            />
          </q-tabs>
        </q-toolbar>
        <q-separator />

        <q-scroll-area
          ref="scrollAreaTickets"
          style="height: calc(100% - 165px)"
          @scroll="onScroll"
        >
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
          <template v-slot:loading>
            <div class="row justify-center q-my-md">
              <q-spinner-comment
                color="primary"
                size="40px"
              />
            </div>
          </template>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <q-page>
          <div class="row">
            <div class="col relative-position">
              <Chat v-if="ticketFocado.id" />
              <div
                :style="styleCard"
                v-else
                class="q-card--bordered justify-center items-center text-center  full-height full-width"
              >
                <InforCabecalhoChat class="bg-white " />
                <div class="absolute-center text-grey-7">
                  <div class="text-h4 "> Selecione um ticket! </div>
                  <q-icon
                    size="7em"
                    name="mdi-target-account"
                  ></q-icon>
                </div>
              </div>
            </div>
          </div>
          <ModalNovoTicket :modalNovoTicket.sync="modalNovoTicket" />
        </q-page>
      </q-page-container>

      <q-drawer
        v-if="$route.name === 'atendimento'"
        v-model="drawerContact"
        show-if-above
        bordered
        side="right"
        content-class="bg-grey-1"
      >

        <div
          class="full-width no-border-radius q-pa-sm"
          style="height:55px;"
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
              <q-avatar style="border: 1px solid #9e9e9ea1 !important; width: 160px; height: 160px">
                <q-icon
                  name="mdi-account"
                  style="width: 160px; height: 160px"
                  size="6em"
                  color="grey-5"
                  v-if="!ticketFocado.contact.profilePicUrl"
                />
                <q-img
                  :src="ticketFocado.contact.profilePicUrl"
                  style="width: 160px; height: 160px"
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
                style="font-size: 16px"
              >
                {{ ticketFocado.contact.name || ''  }}
              </div>
              <div
                class="text-caption q-mt-sm"
                style="font-size: 16px"
              >
                {{ ticketFocado.contact.number || ''  }}
              </div>
              <q-btn
                color="primary"
                outline
                class="q-mt-md"
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
    </q-layout>
  </div>
</template>

<script>
import ItemTicket from './ItemTicket'
import Chat from './Chat'
import { ConsultarTickets } from 'src/service/tickets'
import { mapGetters } from 'vuex'
import InforCabecalhoChat from './InforCabecalhoChat'
import whatsBackground from 'src/assets/wa-background.png'
import mixinSockets from './mixinSockets'
import ModalNovoTicket from './ModalNovoTicket'
import { ListarFilas } from 'src/service/filas'
const UserQueues = localStorage.getItem('queues')
export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets],
  components: {
    ItemTicket,
    Chat,
    InforCabecalhoChat,
    ModalNovoTicket
  },
  data () {
    return {
      toolbarSearch: false,
      drawerTickets: true,
      drawerContact: true,
      modalNovoTicket: false,
      styleCard: {
        minHeight: 'calc(100vh - 8.3vh)',
        height: 'calc(100vh - 8.3vh)',
        backgroundImage: `url(${whatsBackground}) !important`
      },
      tabsAtendimento: 'inbox',
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      loadAbertos: false,
      loadPendentes: false,
      loadResolvidos: false,
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
    }

  },
  methods: {
    onScroll (info) {
      console.log('info.verticalPercentage <= 0.85',
        info.verticalPercentage,
        info.verticalPercentage <= 0.85)
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
            progress: true
          })
        } else {
          this.$q.notify({
            message: 'Ops... Ocorreu um problema de rede não identificado.',
            type: 'negative',
            progress: true
          })
          console.error(err)
        }
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    async onLoadAbertos () {
      if (this.ticketsEmAtendimento.length === 0 || !this.hasMoreOpen || this.loadAbertos) {
        return
      }
      try {
        this.loadAbertos = true
        this.pagAbertos += 1
        await this.consultarTickets({ status: 'open', pageNumber: this.pagAbertos })
        this.loadAbertos = false
      } catch (error) {
        this.loadAbertos = false
      }
    },
    async onLoadPendentes () {
      if (this.ticketsPendentes.length === 0 || !this.hasMorePending || this.loadPendentes) {
        return
      }
      try {
        this.loadPendentes = true
        this.pagPendentes += 1
        await this.consultarTickets({ status: 'pending', pageNumber: this.pagPendentes })
        this.loadPendentes = false
      } catch (error) {
        this.loadPendentes = false
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
    buscarTicket () {
      if (this.loading === true) return
      this.loading = true
      this.pesquisaTickets = {
        ...this.pesquisaTickets,
        searchParam: this.filterBusca,
        pageNumber: 1
      }
      try {
        ConsultarTickets(this.pesquisaTickets).then(({ data }) => {
          this.pesquisaTickets.count = data.count
          this.$store.commit('RESET_TICKETS_LOCALIZADOS_BUSCA')
          this.$store.commit('LOAD_TICKETS_LOCALIZADOS_BUSCA', data.tickets)
          this.$store.commit('SET_HAS_MORE_BUSCA', data.hasMore)
        })
      } catch (err) {
        console.error(err)
      }
      this.loading = false
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data.queueData
    },
    async consultarTicketsIniciais () {
      this.$store.commit('RESET_TICKETS')
      this.loadAbertos = false
      this.loadPendentes = false
      this.loadResolvidos = false
      this.pagAbertos = 1
      this.pagPendentes = 1
      this.pagResolvidos = 1
      this.pesquisa.pageNumber = 1
      this.pesquisaTickets.pageNumber = 1
      await this.consultarTickets() // abertos (em atendimento)
      await this.consultarTickets({ status: 'pending' }) // pendentes (aguardando atendimento)
      await this.consultarTickets({ status: 'closed' }) // pendentes (aguardando atendimento)
    }
  },
  beforeMount () {
    this.listarFilas()
  },
  mounted () {
    this.consultarTicketsIniciais()
  },
  destroyed () {
    this.socketDisconnect()
    this.$store.commit('TICKET_FOCADO', {})
  }
}
</script>

<style lang="sass" scoped>
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
    background-color: #009688

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%
    border-radius: 5px

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
