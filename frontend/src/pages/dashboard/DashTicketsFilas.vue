<template>
  <div>
    <div class="row col q-pa-md justify-between items-center">
      <h1> Painel Atendimentos </h1>
      <q-btn color="primary"
        icon="mdi-filter"
        label="Filtros"
        @click="visualizarFiltros = true" />
      <q-separator />
    </div>

    <q-dialog full-height
      position="right"
      v-model="visualizarFiltros">
      <q-card style="width: 300px">
        <q-card-section>
          <div class="text-h6">Filtros</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <DatePick dense
            class="row col"
            v-model="pesquisaTickets.dateStart" />
          <DatePick dense
            class="row col"
            v-model="pesquisaTickets.dateEnd" />
          <q-separator v-if="profile === 'admin'" />
          <q-toggle v-if="profile === 'admin'"
            class="q-ml-lg"
            v-model="pesquisaTickets.showAll"
            label="(Admin) - Visualizar Todos" />
          <q-separator class="q-mb-md"
            v-if="profile === 'admin'" />

          <q-select v-if="!pesquisaTickets.showAll"
            square
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            multiple
            options-dense
            use-chips
            label="Filas"
            color="primary"
            v-model="pesquisaTickets.queuesIds"
            :options="filas"
            :input-debounce="700"
            option-value="id"
            option-label="queue"
            input-style="width: 280px; max-width: 280px;" />
          <!-- @input="debounce(BuscarTicketFiltro(), 700)" -->
        </q-card-section>
        <q-card-section>
          <q-separator />
          <div class="text-h6 q-mt-md">Tipo de visualização</div>
          <q-option-group :options="optionsVisao"
            label="Visão"
            type="radio"
            v-model="visao" />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn outline
            label="Atualizar"
            color="primary"
            v-close-popup
            @click="consultarTickets" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <div style="height: 85vh"
      class="scroll">
      <template v-for="(items, key) in sets">
        <div :style="{ height: 800 }"
          :key="key"
          class="row q-pa-md q-col-gutter-md q-mb-sm">
          <div :class="contentClass"
            v-for="(item, index) in items"
            :key="index">
            <q-card bordered
              square
              flat>
              <q-item v-if="visao === 'U' || visao === 'US'"
                class="text-bold"
                :class="{
                  'bg-negative text-white': definirNomeUsuario(item[0]) === 'Pendente'
                }">
                <!-- <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                  </q-avatar>
                </q-item-section> -->
                <q-item-section>
                  <q-item-label class="text-bold text-h6">{{ definirNomeUsuario(item[0]) }}</q-item-label>
                  <q-item-label caption
                    :class="{
                      'text-white': definirNomeUsuario(item[0]) === 'Pendente'
                    }">
                    Atendimentos: {{ item.length }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="visao === 'F' || visao === 'FS'"
                class="text-bold"
                :class="{
                  'bg-negative text-white': definirNomeFila(item[0]) === 'Sem Fila'
                }">
                <q-item-section avatar>
                  <q-avatar>
                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ definirNomeFila(item[0]) }}</q-item-label>
                  <q-item-label caption
                    :class="{
                      'text-white': definirNomeFila(item[0]) === 'Sem Fila'
                    }">
                    Abertos: {{ counterStatus(item).open }} | Pendentes: {{ counterStatus(item).pending }} | Total: {{
                        item.length
                    }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section :style="{ height: '320px' }"
                class="scroll"
                v-if="visao === 'U' || visao === 'F'">
                <ItemTicket v-for="(ticket, i) in item"
                  :key="i"
                  :ticket="ticket"
                  :filas="filas" />
              </q-card-section>
            </q-card>
          </div>
          <q-resize-observer @resize="onResize"></q-resize-observer>
        </div>
      </template>
    </div>

  </div>
</template>

<script>
const usuario = JSON.parse(localStorage.getItem('usuario'))
import { socketIO } from 'src/utils/socket'
const socket = socketIO()

import ItemTicket from 'src/pages/atendimento/ItemTicket'
import { ConsultarTicketsQueuesService } from 'src/service/estatisticas.js'
import { ListarFilas } from 'src/service/filas'
const UserQueues = localStorage.getItem('queues')
import { groupBy } from 'lodash'
const profile = localStorage.getItem('profile')
import { format, sub } from 'date-fns'
export default {
  name: 'Painel De Controle',
  components: { ItemTicket },
  data () {
    return {
      profile,
      visualizarFiltros: false,
      slide: 0,
      height: 400,
      optionsVisao: [
        { label: 'Por Usuário', value: 'U' },
        { label: 'Por Usuário (Sintético)', value: 'US' },
        { label: 'Por Filas', value: 'F' },
        { label: 'Por Filas (Sintético)', value: 'FS' }
      ],
      visao: 'U',
      pesquisaTickets: {
        showAll: true,
        dateStart: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        dateEnd: format(new Date(), 'yyyy-MM-dd'),
        queuesIds: []
      },
      tickets: [],
      filas: [],
      sizes: { lg: 3, md: 3, sm: 2, xs: 1 }
    }
  },
  computed: {
    contentClass () {
      let contentClass = 'col'
      const keysLenSize = Object.keys(this.cTicketsUser[0]).length
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        if (this.sizes[size]) {
          const sizeExpect = this.sizes[size] > keysLenSize ? keysLenSize : this.sizes[size]
          contentClass += ' col-' + size + '-' + (12 / sizeExpect)
        }
      }
      return contentClass
    },
    sets () {
      const sets = []
      // const items = this.itemsPerSet
      const limit = Math.ceil(this.cTicketsUser.length / this.itemsPerSet)
      for (let index = 0; index < limit; index++) {
        const start = index * this.itemsPerSet
        const end = start + this.itemsPerSet
        sets.push(this.cTicketsUser.slice(start, end))
      }
      return sets[0]
    },
    itemsPerSet () {
      let cond = false
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        cond = cond || this.$q.screen[size]
        if (cond && this.sizes[size]) {
          return this.sizes[size]
        }
      }
      return 1
    },
    cUserQueues () {
      try {
        const filasUsuario = JSON.parse(UserQueues).map(q => {
          if (q.isActive) {
            return q.id
          }
        })
        return this.filas.filter(f => filasUsuario.includes(f.id)) || []
      } catch (error) {
        return []
      }
    },
    cTicketsUser () {
      const field = this.visao === 'U' || this.visao === 'US' ? 'userId' : 'queueId'
      return [groupBy(this.tickets, field)]
    }
  },
  methods: {
    deleteTicket (ticketId) {
      const newTickets = [...this.tickets]
      const ticketsFilter = newTickets.filter(t => t.id !== ticketId)
      this.tickets = [...ticketsFilter]
    },
    updateTicket (ticket) {
      const newTickets = [...this.tickets]
      const idx = newTickets.findIndex(t => ticket.id)
      if (idx) {
        newTickets[idx] = ticket
        this.tickets = [...newTickets]
      }
    },
    createTicket (ticket) {
      const newTickets = [...this.tickets]
      newTickets.unshift(ticket)
      this.tickets = [...newTickets]
    },
    verifyIsActionSocket (data) {
      if (!data.id) return false

      // mostrar todos
      if (this.pesquisaTickets.showAll) return true

      // não existir filas cadastradas
      if (!this.filas.length) return true

      // verificar se a fila do ticket está filtrada
      const isQueue = this.pesquisaTickets.queuesIds.indexOf(q => data.queueId === q)

      let isValid = false
      if (isQueue !== -1) {
        isValid = true
      }
      return isValid

      // verificar se o usuario possui ecesso a fila do ticket
    },
    conectSocketQueues (tenantId, queueId) {
      // socket.on(`${tenantId}:${queueId}:ticket:queue`, data => {
      //   if (!this.verifyIsActionSocket(data.ticket)) return

      //   if (data.action === 'update') {
      //     this.updateTicket(data.ticket)
      //   }
      //   if (data.action === 'create') {
      //     this.createTicket(data.ticket)
      //   }
      //   if (data.action === 'delete') {
      //     this.deleteTicket(data.ticketId)
      //   }
      // })
    },
    socketTickets (tenantId) {
      // socket.emit(`${tenantId}:joinTickets`, 'open')
      // socket.emit(`${tenantId}:joinTickets`, 'pending')

      // socket.on(`${tenantId}:ticket`, data => {
      //   if (!this.verifyIsActionSocket(data.ticket)) return

      //   if (data.action === 'updateQueue' || data.action === 'create') {
      //     this.updateTicket(data.ticket)
      //   }

      //   if (data.action === 'updateUnread') {
      //     // this.$store.commit('RESET_UNREAD', data.ticketId)
      //   }

      //   if (
      //     (data.action === 'update' || data.action === 'create') &&
      //     (!data.ticket.userId || data.ticket.userId === userId /* || showAll */)
      //   ) {
      //     this.updateTicket(data.ticket)
      //   }

      //   if (data.action === 'delete') {
      //     this.deleteTicket(data.ticketId)
      //   }
      // })
    },
    connectSocket () {
      this.socketTickets()
      this.cUserQueues.forEach(el => {
        this.conectSocketQueues(usuario.tenantId, el.id)
      })
    },
    definirNomeUsuario (item) {
      this.verifyIsActionSocket(item)
      return item?.user?.name || 'Pendente'
    },
    definirNomeFila (f) {
      const fila = this.filas.find(fila => fila.id === f.queueId)
      return fila?.queue || 'Sem Fila'
    },
    counterStatus (tickets) {
      const status = {
        open: 0,
        pending: 0,
        closed: 0
      }
      const group = groupBy(tickets, 'status')
      status.open = group.open?.length || 0
      status.pending = group.pending?.length || 0
      status.closed = group.closed?.length || 0
      return status
    },
    consultarTickets () {
      ConsultarTicketsQueuesService(this.pesquisaTickets)
        .then(res => {
          this.tickets = res.data
          this.connectSocket()
        })
        .catch(error => {
          console.error(error)
          this.$notificarErro('Erro ao consultar atendimentos', error)
        })
    },
    onResize ({ height }) {
      this.height = height
    }
  },

  async mounted () {
    await ListarFilas().then(res => {
      this.filas = res.data
    })
    await this.consultarTickets()
  },
  destroyed () {
    socket.disconnect()
  }
}
</script>

<style lang="scss" scoped>

</style>
