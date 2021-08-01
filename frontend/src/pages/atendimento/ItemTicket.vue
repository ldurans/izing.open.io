<template>
  <q-list
    padding
    class="q-px-md "
    separator
  >
    <!-- :clickable="ticket.status !== 'pending' && (ticket.id !== $store.getters['ticketFocado'].id || $route.name !== 'chat')" -->
    <q-item
      clickable
      style="height: 85px;"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 5px solid ${borderColor[ticket.status]}; border-radius: 10px`"
      id="item-ticket-houve"
      :class="{
        'ticket-active-item': ticket.id === $store.getters['ticketFocado'].id,
      }"
    >
      <q-item-section
        avatar
        class="q-px-none"
      >
        <q-btn
          flat
          @click="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')"
        >
          <q-badge
            v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center"
            floating
            dense
            text-color="white"
            color="green"
            :label="ticket.unreadMessages"
          />
          <q-avatar>
            <q-icon
              size="45px"
              name="mdi-play-circle-outline"
            />
          </q-avatar>
          <q-tooltip>
            Atender
          </q-tooltip>
        </q-btn>
        <q-avatar
          size="45px"
          v-if="ticket.status !== 'pending'"
          class="relative-position"
        >
          <q-badge
            v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center"
            floating
            dense
            text-color="white"
            color="green"
            :label="ticket.unreadMessages"
          />
          <img
            :src="ticket.profilePicUrl"
            onerror="this.style.display='none'"
          />
          <q-icon
            size="50px"
            name="mdi-account-circle"
            color="grey-4"
          />
        </q-avatar>
      </q-item-section>
      <q-item-section id="ListItemsTicket">
        <q-item-label
          class="text-bold"
          lines="1"
        >
          {{ticket.name}}
          <span class="absolute-top-right q-pr-xs">
            <q-badge
              dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.updatedAt)"
              :key="recalcularHora"
            />
          </span>
        </q-item-label>
        <q-item-label
          lines="1"
          caption
        >
          {{ ticket.lastMessage }}
        </q-item-label>
        <q-item-label
          lines="1"
          caption
        >
          #{{ ticket.id }}
          <span class="q-ml-sm">
            {{ `Fila: ${ticket.queue || ''}` }}
          </span>
          <span class="absolute-bottom-right ">
            <q-icon
              v-if="ticket.status === 'closed'"
              name="mdi-check-circle-outline"
              color="positive"
              size="1.5em"
            >
              <q-tooltip>
                Atendimento Resolvido
              </q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
        <q-item-label
          lines="1"
          caption
        >
          Usuário: {{ ticket.username }}
        </q-item-label>

        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 10px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
      </q-item-section>
    </q-item>
    <q-separator
      color="grey-2"
      inset="item"
    />
    <!-- <q-separator /> -->
  </q-list>
</template>

<script>
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'
import { outlinedAccountCircle } from '@quasar/extras/material-icons-outlined'

export default {
  name: 'ItemTicket',
  mixins: [mixinAtualizarStatusTicket],
  data () {
    return {
      outlinedAccountCircle,
      recalcularHora: 1,
      statusAbreviado: {
        open: 'A',
        pending: 'P',
        closed: 'R'
      },
      status: {
        open: 'Aberto',
        pending: 'Pendente',
        closed: 'Resolvido'
      },
      color: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      },
      borderColor: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      }
    }
  },
  props: {
    ticket: {
      type: Object,
      default: () => {
      }
    },
    buscaTicket: {
      type: Boolean,
      default: false
    },
    filas: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    obterNomeFila (filaId) {
      try {
        const descricao = this.filas.find(f => f.id === filaId).queue
        return descricao
      } catch (error) {
        return ''
      }
    },
    dataInWords (date) {
      return formatDistance(parseJSON(date), new Date(), { locale: pt })
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    }
  },
  created () {
    setInterval(() => {
      this.recalcularHora++
    }, 50000)
  }
}
</script>

<style lang="sass">
img:after
  content: ""
  vertical-align: middle
  display: inline-block
  border-radius: 50%
  font-size: 48px
  position: absolute
  top: 0
  left: 0
  width: inherit
  height: inherit
  z-index: 10
  background: #ebebeb url('http://via.placeholder.com/300?text=PlaceHolder') no-repeat center
  color: transparent

.ticket-active-item
  // border: 2px solid rgb(21, 120, 173)
  // border-left: 3px solid $light //rgb(21, 120, 173)
  border-radius: 0
  position: relative
  height: 100%
  background: $blue-1 //$active-item-ticket
  // background-color: #e6ebf5

#ListItemsTicket
  .q-item__label + .q-item__label
    margin-top: 1.5px

#item-ticket-houve:hover
  background: $blue-1 //$active-item-ticket
  transition: all .4s

.primary
  border-left: 3px solid $primary
.negative
  border-left: 3px solid $negative
.positive
  border-left: 3px solid $positive
</style>
