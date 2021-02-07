<template>
  <div>
    <q-item
      dense
      :clickable="ticket.status !== 'pending' && (ticket.id !== $store.getters['ticketFocado'].id || $route.name !== 'chat')"
      style="min-height: 7vh; max-height: 9vh"
      @click="abrirChatContato(ticket)"
      :style="`border-left: 5px solid ${borderColor[ticket.status]}`"
      class="q-px-sm"
      :class="{
        'ticket-active-item bg-blue-1 text-primary': ticket.id === $store.getters['ticketFocado'].id,
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
          <img :src="ticket.contact.profilePicUrl" />
          <!-- <template v-slot:error>
              <div class="absolute-full flex flex-center bg-negative text-white">
                <q-icon size="40px" name="mdi-account-circle-outline" />
              </div>
            </template> -->
        </q-avatar>
      </q-item-section>
      <q-item-section id="ListItemsTicket">
        <q-item-label lines="1">
          <div class="col-row">
            {{ticket.contact.name}}
            <span class="float-right absolute-top-right">
              <q-badge
                dense
                style="font-size: .7em;"
                transparent
                square
                text-color="grey-10"
                color="grey-2"
                :label="dataInWords(ticket.updatedAt)"
                :key="recalcularHora"
              />
            </span>
          </div>
        </q-item-label>
        <q-item-label
          lines="1"
          caption
        >{{ ticket.lastMessage }}</q-item-label>
        <q-item-label
          class="text-primary"
          lines="1"
          caption
        >
          #{{ ticket.id }}
          <span
            class="q-ml-lg q-mb-xs"
            style="font-size: .9em;"
          >
            {{ `Fila: ${obterNomeFila(ticket.queueId)}` }}
          </span>
          <span class="absolute-bottom-right q-mb-xs q-mr-xs">
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
          class="text-primary"
          lines="1"
          caption
        >
          Usuário: {{ ticket && ticket.user && ticket.user.name }}
        </q-item-label>
        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 10px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
      </q-item-section>
    </q-item>
    <q-separator />
  </div>
</template>

<script>
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'
export default {
  name: 'ItemTicket',
  mixins: [mixinAtualizarStatusTicket],
  data () {
    return {
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
.ticket-active-item
  // border: 2px solid rgb(21, 120, 173)
  // border-left: 3px solid $light //rgb(21, 120, 173)
  border-radius: 0
  position: relative
  height: 100%
  font-weight: 600

#ListItemsTicket
  .q-item__label + .q-item__label
    margin-top: 1.5px

.primary
  border-left: 3px solid $primary
.negative
  border-left: 3px solid $negative
.positive
  border-left: 3px solid $positive
</style>
