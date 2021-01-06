<template>
  <q-layout view="lhh Lpr lFf">
    <q-drawer
      v-model="drawerTickets"
      v-if="$route.name === 'atendimento'"
      show-if-above
      bordered
      :width="450"
      content-class="bg-grey-1"
    >
      <q-card
        style="min-height: calc(100vh - 8.3vh)"
        square
        bordered
        flat
      >
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="tabsAtendimento"
            narrow-indicator
            dense
            no-caps
            align="justify"
          >
            <q-tab
              class="text-purple"
              name="work"
              icon="alarm"
              label="Meus Chats"
            />
            <q-tab
              class="text-orange"
              name="resolvidos"
              icon="check"
              label="Pendentes"
            />
            <q-tab
              class="text-positive"
              name="resolvidos"
              icon="check"
              label="Resolvidos"
            />
            <q-tab
              class="text-teal"
              name="busca"
              icon="search"
              label="Busca"
            />
          </q-tabs>
          <q-separator />
          <q-tab-panels
            v-model="tabsAtendimento"
            keep-alive
            animated
          >
            <q-tab-panel
              class="q-pa-none"
              name="work"
            >
              <q-card
                class="my-card q-mt-sm"
                bordered
                square
                flat
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
                      icon="mdi-plus"
                      round
                      outline
                      dense
                      @click="modalNovoTicket=true"
                    >
                      <q-tooltip>
                        Criar Ticket
                      </q-tooltip>
                    </q-btn>
                  </div>
                </div>
                <q-card-section class="q-pa-sm bg-grey-3">
                  Em atendimento {{ ticketsEmAtendimento.length }} de {{ ticketsEmAtendimento.length > count.open ? ticketsEmAtendimento.length : count.open }}
                </q-card-section>
                <q-card-section
                  ref="scrollTargetRefTicketsAbertos"
                  class="q-pa-xs scroll-y"
                  style="height: 36vh; max-height: 36vh"
                >
                  <q-infinite-scroll
                    @load="onLoadAbertos"
                    :offset="100"
                    :debounce="700"
                    :scroll-target="$refs.scrollTargetRefTicketsAbertos"
                  >
                    <ItemTicket
                      v-for="(ticket, key) in ticketsEmAtendimento"
                      :key="key"
                      :ticket="ticket"
                      :filas="filas"
                    />
                    <template v-slot:loading>
                      <div class="row justify-center q-my-md">
                        <q-spinner-comment
                          color="primary"
                          size="40px"
                        />
                      </div>
                    </template>
                  </q-infinite-scroll>
                </q-card-section>
              </q-card>

              <q-card
                class="my-card"
                square
                flat
              >
                <q-card-section class="q-pa-sm bg-grey-3">
                  Aguardando {{ ticketsPendentes.length }} de {{ ticketsPendentes.length > count.open ? ticketsPendentes.length : count.open }}
                </q-card-section>
                <q-card-section
                  ref="scrollTargetRefTicketsPendentes"
                  class="q-pa-xs scroll-y"
                  style="height: 35vh; max-height: 35vh"
                >
                  <q-infinite-scroll
                    @load="onLoadPendentes"
                    :offset="100"
                    :debounce="700"
                    :scroll-target="$refs.scrollTargetRefTicketsPendentes"
                  >
                    <ItemTicket
                      :ticketPendente="true"
                      v-for="(ticket, key) in ticketsPendentes"
                      :key="key"
                      :ticket="ticket"
                      :filas="filas"
                    />
                    <template v-slot:loading>
                      <div class="row justify-center q-my-md">
                        <q-spinner-comment
                          color="primary"
                          size="40px"
                        />
                      </div>
                    </template>
                  </q-infinite-scroll>
                </q-card-section>
              </q-card>
            </q-tab-panel>
            <q-tab-panel name="resolvidos">
              <q-card
                class="my-card"
                bordered
                square
                flat
              >
                <q-card-section class="q-pa-sm bg-grey-3">
                  Resolvidos {{ ticketsResolvidos.length }} de {{ ticketsResolvidos.length > count.open ? ticketsResolvidos.length : count.open }}
                </q-card-section>
                <q-card-section
                  ref="scrollTargetRefTicketsResolvidos"
                  class="q-pa-xs scroll-y"
                  style="height: 80vh; max-height: 80vh"
                >
                  <q-infinite-scroll
                    @load="onLoadResolvidos"
                    :offset="100"
                    :debounce="700"
                    :scroll-target="$refs.scrollTargetRefTicketsResolvidos"
                  >
                    <ItemTicket
                      v-for="(ticket, key) in ticketsResolvidos"
                      :key="key"
                      :ticket="ticket"
                      :filas="filas"
                    />
                    <template v-slot:loading>
                      <div class="row justify-center q-my-md">
                        <q-spinner-comment
                          color="primary"
                          size="40px"
                        />
                      </div>
                    </template>
                  </q-infinite-scroll>
                </q-card-section>
              </q-card>
            </q-tab-panel>
            <q-tab-panel name="busca">
              <q-card
                class="my-card"
                bordered
                square
                flat
              >
                <div class="row justify-between items-center q-pa-sm">
                  <div class="col-12">
                    <q-input
                      dense
                      outlined
                      v-model="filterBusca"
                      :debounce="700"
                      @input="buscarTicket(filterBusca)"
                    >
                      <template v-slot:append>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>
                  <!-- <div class="col-2 text-center">
                      <q-btn
                        no-caps
                        push
                        round
                        icon="search"
                        color="primary"
                        @click="buscarTicket(filterBusca)"
                      />
                    </div> -->
                </div>
                <q-card-section class="q-pa-sm bg-grey-3">
                  {{ ticketsLocalizadosBusca.length }} Tickets
                </q-card-section>
                <q-card-section
                  ref="scrollTargetRefTicketsLocalizados"
                  class="q-pa-xs scroll-y"
                  style="height: 70vh; max-height: 70vh"
                >
                  <q-infinite-scroll
                    :offset="100"
                    :debounce="700"
                    @load="onLoadMoreTicketsBusca"
                    ref="infiniteScrollBusca"
                    :scroll-target="$refs.scrollTargetRefTicketsLocalizados"
                  >
                    <ItemTicket
                      v-for="(ticket, key) in ticketsLocalizadosBusca"
                      :key="key"
                      :ticket="ticket"
                      :buscaTicket="true"
                      :filas="filas"
                    />
                    <template v-slot:loading>
                      <div class="row justify-center q-my-md">
                        <q-spinner-comment
                          color="primary"
                          size="40px"
                        />
                      </div>
                    </template>
                  </q-infinite-scroll>
                </q-card-section>
              </q-card>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
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
      drawerTickets: true,
      drawerContact: true,
      modalNovoTicket: false,
      styleCard: {
        minHeight: 'calc(100vh - 8.3vh)',
        height: 'calc(100vh - 8.3vh)',
        backgroundImage: `url(${whatsBackground}) !important`
      },
      tabsAtendimento: 'work',
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
    }

  },
  methods: {
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
    async onLoadAbertos (idx, done) {
      if (this.ticketsEmAtendimento.length === 0 || !this.hasMoreOpen || this.loadAbertos) {
        done()
        return
      }
      try {
        this.loadAbertos = true
        this.pagAbertos += 1
        await this.consultarTickets({ status: 'open', pageNumber: this.pagAbertos })
        this.loadAbertos = false
        done()
      } catch (error) {
        this.loadAbertos = false
        done()
      }
    },
    async onLoadPendentes (idx, done) {
      if (this.ticketsPendentes.length === 0 || !this.hasMorePending || this.loadPendentes) {
        done()
        return
      }
      try {
        this.loadPendentes = true
        this.pagPendentes += 1
        await this.consultarTickets({ status: 'pending', pageNumber: this.pagPendentes })
        this.loadPendentes = false
        done()
      } catch (error) {
        this.loadPendentes = false
        done()
      }
    },
    async onLoadResolvidos (idx, done) {
      if (this.ticketsResolvidos.length === 0 || !this.hasMoreClosed || this.loadClose) {
        done()
        return
      }
      try {
        this.loadClose = true
        this.pagResolvidos += 1
        await this.consultarTickets({ status: 'closed', pageNumber: this.pagResolvidos })
        this.loadClose = false
        done()
      } catch (error) {
        this.loadClose = false
        done()
      }
    },
    async onLoadMoreTicketsBusca (idx, done) {
      if (this.ticketsLocalizadosBusca.length === 0 || !this.hasMoreBusca || this.loading) {
        done()
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
      done()
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

<style lang="scss" scoped>
.upload-btn-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.upload-btn-wrapper input[type="file"] {
  font-size: 100px;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
}
</style>
