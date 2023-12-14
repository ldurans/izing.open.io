<template>
  <div>
    <q-scroll-area
      ref="scrollAreaTickets"
      style="height: calc(100vh - 300px)"
      @scroll="onScroll"
    >
      <!-- <q-separator /> -->
      <ItemTicket
        v-for="(ticket, key) in cTickets"
        :key="key"
        :ticket="ticket"
        :filas="filas"
      />
      <div v-if="loading">
        <div class="row justify-center q-my-md">
          <q-spinner
            color="white"
            size="3em"
            :thickness="3"
          />
        </div>
        <div class="row col justify-center q-my-sm text-white">
          Carregando...
        </div>
      </div>
    </q-scroll-area>

  </div>
</template>

<script>
import ItemTicket from './ItemTicket.vue'
import { mapGetters } from 'vuex'
import { ConsultarTickets } from 'src/service/tickets'
import { socketIO } from '../../utils/socket'

export default {
  name: 'TocketList',
  components: {
    ItemTicket
  },
  props: {
    filas: {
      type: Array,
      default: () => []
    },
    status: {
      type: String,
      default: 'open'
    },
    searchParam: {
      type: String,
      default: ''
    },
    showAll: {
      type: Boolean,
      default: false
    },
    withUnreadMessages: {
      type: Boolean,
      default: false
    },
    isNotAssignedUser: {
      type: Boolean,
      default: false
    },
    includeNotQueueDefined: {
      type: Boolean,
      default: true
    },
    queuesIds: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      socket: null,
      loading: false,
      countTickets: 0,
      hasMore: true,
      pesquisaTickets: {
        pageNumber: 1,
        count: null
        // date: new Date(),
      }
    }
  },
  computed: {
    ...mapGetters([
      'getTickets',
      'ticketFocado',
      'whatsapps'
    ]),
    cTickets () {
      return this.getTickets(this.status)
    }
  },
  watch: {
    'ticketFocado.id': {
      handler () {
        if (this.socket && this.ticketFocado?.id) {
          console.log('ticketFocado.id', this.ticketFocado.id)
          this.socket.emit(`tenant:${this.ticketFocado.tenantId}:joinChatBox`, `${this.ticketFocado.id}`)
        }
      },
      immediate: true
    },
    socket: {
      handler () {
        if (this.socket && this.ticketFocado?.id) {
          console.log('socket ticketFocado.id', this.ticketFocado.id)
          this.socket.emit(`tenant:${this.ticketFocado.tenantId}:joinChatBox`, `${this.ticketFocado.id}`)
        }
      },
      immediate: true
    }
  },
  methods: {
    onScroll (info) {
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    async onLoadMore () {
      if (this.cTickets.length === 0 || !this.hasMore || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        status: this.status,
        searchParam: this.searchParam,
        showAll: this.showAll,
        withUnreadMessages: this.withUnreadMessages,
        isNotAssignedUser: this.isNotAssignedUser,
        includeNotQueueDefined: this.includeNotQueueDefined,
        queuesIds: this.queuesIds,
        ...paramsInit
      }

      if (params.pageNumber == 1) {
        this.$store.commit('RESET_TICKETS', this.status)
      }

      try {
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // count total de tickets no status
        this.$store.commit('LOAD_TICKETS', { type: this.status, tickets: data.tickets })
        this.hasMore = data.hasMore
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    // async BuscarTicketFiltro () {
    //   this.$store.commit('RESET_TICKETS', this.status)
    //   this.loading = true
    //   localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    //   this.pesquisaTickets = {
    //     ...this.pesquisaTickets,
    //     pageNumber: 1
    //   }
    //   await this.consultarTickets(this.pesquisaTickets)
    //   this.loading = false
    //   this.$setConfigsUsuario({ isDark: this.$q.dark.isActive })
    // },
    scrollToBottom () {
      setTimeout(() => {
        this.$root.$emit('scrollToBottomMessageChat')
      }, 200)
    },
    ticketListSocket () {
      this.socket = socketIO()
      const usuario = JSON.parse(localStorage.getItem('usuario'))

      const shouldUpdateTicket = (ticket) =>
        (!ticket.userId || ticket.userId === usuario?.userId || this.showAll) &&
        (!ticket.queueId || this.queuesIds.indexOf(ticket.queueId) > -1)

      const notBelongsToUserQueues = (ticket) =>
        ticket.queueId && this.queuesIds.indexOf(ticket.queueId) === -1

      this.socket.on('connect', () => {
        if (this.status) {
          this.socket.emit(`tenant:${usuario.tenantId}:joinTickets`, this.status)
        } else {
          this.socket.emit(`tenant:${usuario.tenantId}:joinNotification`)
        }
      })

      this.socket.on(`tenant:${usuario.tenantId}:ticket`, (data) => {
        if (data.action === 'updateUnread') {
          this.$store.commit('RESET_UNREAD', { type: this.status, ticketId: data.ticketId })
        }

        if (data.action === 'update' && shouldUpdateTicket(data.ticket)) {
          console.log('ticketList > UPDATE_TICKET', data)
          this.$store.commit('UPDATE_TICKET', { type: this.status, ticket: data.ticket })
        }

        if (data.action === 'update' && notBelongsToUserQueues(data.ticket)) {
          console.log('ticketList > DELETE_TICKET', data)
          this.$store.commit('DELETE_TICKET', { type: this.status, ticketId: data.ticket.id })
        }

        if (data.action === 'delete') {
          this.$store.commit('DELETE_TICKET', { type: this.status, ticketId: data.ticketId })
        }
      })

      this.socket.on(`tenant:${usuario.tenantId}:appMessage`, (data) => {
        if (data.action === 'create' && shouldUpdateTicket(data.ticket)) {
          console.log('ticketList > UPDATE_TICKET_UNREAD_MESSAGES', data)
          if (this.ticketFocado.id !== data.ticket.id && this.status !== 'closed' && !data.message.fromMe && !data.ticket.chatFlowId) {
            this.$root.$emit('handlerNotifications', data.message)
          }
          this.$store.commit('UPDATE_TICKET_UNREAD_MESSAGES', { type: this.status, ticket: data.ticket })
        }
      })

      // socket.on(`${usuario.tenantId}:contact`, (data) => {
      //   if (data.action === 'update') {
      //     dispatch({
      //       type: 'UPDATE_TICKET_CONTACT',
      //       payload: data.contact
      //     })
      //   }
      // })
    },
    registerPropWatchers (propNames) {
      propNames.forEach(propName => {
        this.$watch(propName, (newVal, oldVal) => {
          console.log('handle obsevablePropsSocket', propName)
          if (propName != 'searchParam') {
            if (this.socket) {
              this.socket.disconnect()
            }
            this.ticketListSocket()
          }
          this.consultarTickets({ pageNumber: 1 })
        })
      })
    }
  },
  mounted () {
    // this.consultarTickets()
    this.ticketListSocket()
    this.registerPropWatchers([
      'status',
      'showAll',
      'withUnreadMessages',
      'isNotAssignedUser',
      'includeNotQueueDefined',
      'queuesIds',
      'searchParam'
    ])
  },
  beforeDestroy () {
    if (this.socket) {
      this.socket.disconnect()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
