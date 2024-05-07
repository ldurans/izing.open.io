<template>
  <q-list separator
    style="max-width: 370px"
    class="q-px-sm q-py-none q-pt-sm">
    <q-item clickable
      style="height: 95px; max-width: 100%;"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 6px solid ${borderColor[ticket.status]}; border-radius: 10px`"
      id="item-ticket-houve"
      class="ticketBorder q-px-sm"
      :class="{
        'ticketBorderGrey': !$q.dark.isActive,
        'ticket-active-item': ticket.id === $store.getters['ticketFocado'].id,
        'ticketNotAnswered': ticket.answered == false && ticket.isGroup == false && ticket.status == 'open'
      }">
      <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="iniciarAtendimento(ticket)"
          push
          color="positive"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="positive"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <q-icon size="50px"
              name="mdi-send-circle" />
          </q-avatar>
          <q-tooltip>
            Atender
          </q-tooltip>
        </q-btn>
        <q-avatar size="50px"
          v-if="ticket.status !== 'pending'"
          class="relative-position">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            color="blue-2"
            text-color="black"
            :label="ticket.unreadMessages" />
          <img :src="ticket.profilePicUrl"
            onerror="this.style.display='none'"
            v-show="ticket.profilePicUrl">
          <q-icon size="50px"
            name="mdi-account-circle"
            color="grey-8" />
        </q-avatar>

      </q-item-section>
      <q-item-section id="ListItemsTicket">
        <q-item-label class="text-bold"
          lines="1">
          {{ !ticket.name ? ticket.contact.name : ticket.name }}
          <q-icon size="20px"
            :name="`img:${ticket.channel}-logo.png`" />
          <span class="absolute-top-right q-pr-xs">
            <q-badge dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
              :key="recalcularHora" />
          </span>
        </q-item-label>
        <q-item-label lines="1"
          caption>
          {{ ticket.lastMessage }}
        </q-item-label>
        <q-item-label lines="1"
          caption>
          #{{ ticket.id }}
          <span class="q-ml-sm">
            {{ `Fila: ${ticket.queue || obterNomeFila(ticket) || ''}` }}
          </span>
          <span class="absolute-bottom-right ">
            <q-icon v-if="ticket.status === 'closed'"
              name="mdi-check-circle-outline"
              color="positive"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                Atendimento Resolvido
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="(ticket.stepAutoReplyId && ticket.autoReplyId && ticket.status === 'pending') || (ticket.chatFlowId && ticket.stepChatFlow && ticket.status === 'pending')"
              name="mdi-robot"
              color="primary"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                ChatBot atendendo
              </q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
        <q-item-label class="row col items-center justify-between"
          caption>
          Usuário: {{ ticket.username }}
          <q-chip :color="$q.dark.isActive ? 'blue-9' : 'blue-2'"
            dense
            square
            :label="ticket.whatsapp && ticket.whatsapp.name"
            size="10px"
            class="q-mr-md text-bold" />
        </q-item-label>
        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 10px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
        <q-item-section avatar class="absolute-right q-pr-xs">
        <q-btn flat
          @click="espiarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')"
          class="q-mr-md">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 10px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="blue-2"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <q-icon size="20px"
              name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>
            Espiar
          </q-tooltip>
        </q-btn>

      </q-item-section>
    </q-item>
    <q-separator color="grey-2"
      inset="item" />
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
    obterNomeFila (ticket) {
      try {
        const fila = this.filas.find(f => f.id === ticket.queueId)
        if (fila) {
          return fila.queue
        }
        return ''
      } catch (error) {
        return ''
      }
    },
    dataInWords (timestamp, updated) {
      let data = parseJSON(updated)
      if (timestamp) {
        data = new Date(Number(timestamp))
      }
      return formatDistance(data, new Date(), { locale: pt })
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        this.$root.$emit('infor-cabecalo-chat:acao-menu')
      }
      if (!((ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    }
  },
  created () {
    setInterval(() => {
      this.recalcularHora++
    }, 20000)
  }
}
</script>

<style lang="sass">

.relative-container
  position: relative

.absolute-btn
  position: absolute
  top: 20px
  right: 20px

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
  transition: all .2s

.primary
  border-left: 3px solid $primary
.negative
  border-left: 3px solid $negative
.positive
  border-left: 3px solid $positive

.ticketNotAnswered
  border-left: 5px solid $amber !important

.ticketBorder
  border-left: 5px solid $grey-9

.ticketBorderGrey
  border-left: 5px solid $grey-4
</style>
