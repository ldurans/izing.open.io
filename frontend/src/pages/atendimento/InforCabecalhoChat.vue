<template>
  <div>
    <q-header class="bg-white text-grey-10 no-border-radius">
      <q-toolbar
        style="min-height: 60px; height: 60px;"
        class="no-border-radius q-pa-none "
      >
        <q-btn
          flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'white' : ''"
          @click="$root.$emit('infor-cabecalo-chat:acao-menu')"
        />
        <q-item
          clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; width: 300px;"
          @click="$root.$emit('update-ticket:info-contato')"
        >
          <q-item-section
            avatar
            class="q-pl-sm"
          >
            <q-btn
              round
              flat
            >
              <q-avatar class="bg-grey">
                <q-img :src="Value(cticket.contact, 'profilePicUrl')">
                </q-img>
              </q-avatar>
            </q-btn>
          </q-item-section>
          <q-item-section id="InfoCabecalhoChat">
            <q-item-label class="text-bold">
              {{ Value(cticket.contact, 'name') }}
              <q-skeleton
                v-if="!Value(cticket.contact, 'name')"
                animation="none"
                style="width: 230px"
              />
            </q-item-label>
            <q-item-label
              caption
              lines="1"
              style="margin-top: 2px !important;"
              :style="$q.screen.width < 500 ? 'max-width: 170px' : ''"
            >
              <span v-if="Value(cticket.user, 'name')"> Atribuido à: {{ Value(cticket.user, 'name') }} </span>
              <q-skeleton
                v-else
                type="text"
                class="text-caption"
                animation="none"
                style="width: 150px"
              />
            </q-item-label>
            <q-item-label
              lines="1"
              style="margin-top: 0px !important;"
            >
              <span
                v-if="Value(cticket.contact, 'name')"
                class=""
                style="font-size: 11px"
              > Ticket: {{ cticket.id }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div
          class="q-gutter-xs q-pr-sm"
          v-if="Value(cticket.contact, 'name')"
        >
          <q-btn
            @click="$emit('abrir:modalAgendamentoMensagem')"
            icon="mdi-message-text-clock-outline"
            color="black"
            rounded
            :disable="cticket.status == 'closed'"
          >
            <q-tooltip content-class="bg-grey-9 text-bold">
              Agendamento de mensagem
            </q-tooltip>
          </q-btn>

          <q-btn-dropdown
            split
            color="positive"
            no-caps
            rounded
            @click="$emit('updateTicket:resolver')"
            icon="mdi-comment-check"
            label="Resolver"
            :disable-main-btn="cticket.status == 'closed'"
          >
            <q-list>
              <q-item
                clickable
                v-close-popup
                v-if="cticket.status == 'closed'"
                @click="$emit('updateTicket:reabrir')"
              >
                <q-item-section avatar>
                  <q-avatar
                    icon="mdi-reload"
                    color="amber-6"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Reabrir Ticket</q-item-label>
                </q-item-section>
              </q-item>

              <q-item
                v-close-popup
                @click="$emit('updateTicket:retornar')"
                clickable
                v-if="cticket.status == 'open'"
              >
                <q-item-section avatar>
                  <q-avatar
                    icon="mdi-replay"
                    color="negative"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Fila</q-item-label>
                  <q-item-label caption>Retornar aos pendentes</q-item-label>
                </q-item-section>
              </q-item>
              <q-item
                v-close-popup
                @click="listarFilas"
                clickable
                v-if="cticket.status != 'closed'"
              >
                <q-item-section avatar>
                  <q-avatar
                    icon="mdi-transfer"
                    color="primary"
                    text-color="white"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Transferir</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog
      v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent
    >
      <q-card
        class="q-pa-md"
        style="width: 500px"
      >
        <q-card-section>
          <div class="text-h6">Selecione o destino:</div>
        </q-card-section>
        <q-card-section class="row q-gutter-sm">
          <div class="col-12">
            <q-select
              dense
              rounded
              outlined
              v-model="filaSelecionada"
              :options="filas"
              emit-value
              map-options
              option-value="id"
              option-label="queue"
              label="Fila de destino"
              class="full-width"
            />
          </div>
          <div class="col-12">
            <q-select
              rounded
              dense
              outlined
              v-model="usuarioSelecionado"
              :options="usuarios.filter(filterUsers)"
              emit-value
              map-options
              option-value="id"
              option-label="name"
              label="Usuário destino"
              class="full-width"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            rounded
            label="Sair"
            color="negative"
            v-close-popup
            class="q-mr-md"
          />
          <q-btn
            rounded
            label="Salvar"
            color="positive"
            @click="confirmarTransferenciaTicket"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { mapGetters } from 'vuex'
import { ListarUsuarios } from 'src/service/user'
import { ListarFilas } from 'src/service/filas'
import { AtualizarTicket } from 'src/service/tickets'
export default {
  name: 'InfoCabecalhoMensagens',
  data () {
    return {
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      usuarios: [],
      filas: []
    }
  },
  computed: {
    ...mapGetters([
      'ticketFocado'
    ]),
    cticket () {
      const infoDefault = {
        contact: { profilePicUrl: '', name: '' },
        user: { name: '' }
      }
      return Object.keys(this.ticketFocado).includes('contact') ? this.ticketFocado : infoDefault
    }
  },
  methods: {
    Value (obj, prop) {
      try {
        return obj[prop]
      } catch (error) {
        return ''
      }
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas()
        this.filas = data
        this.modalTransferirTicket = true
        this.listarUsuarios()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema ao carregar filas', error)
      }
    },
    async listarUsuarios () {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data.users
        this.modalTransferirTicket = true
      } catch (error) {
        console.error(error)
        this.$notificarErro('Problema ao carregar usuários', error)
      }
    },
    async confirmarTransferenciaTicket () {
      if (!this.filaSelecionada) return
      // if (!this.usuarioSelecionado) return
      console.log('usuario selecionado: ' + this.usuarioSelecionado)
      console.log('usuario atual do ticket: ' + this.ticketFocado.userId)
      if (this.ticketFocado.userId === this.usuarioSelecionado && this.ticketFocado.userId != null) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertece ao usuário selecionado.',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      if (this.ticketFocado.userId === userId && userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertece ao seu usuário',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }

      if (this.ticketFocado.queueId === this.filaSelecionada && this.ticketFocado.userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: 'Ticket já pertece a esta fila e usuário',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado,
        queueId: this.filaSelecionada,
        status: this.usuarioSelecionado == null ? 'pending' : 'open',
        isTransference: 1
      })
      this.$q.notify({
        type: 'positive',
        message: 'Ticket transferido.',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$store.commit('TICKET_FOCADO', {})
    }
  }
}
</script>

<style lang="sass" scoped>
#InfoCabecalhoChat
  .q-item__label + .q-item__label
    margin-top: 1.5px
</style>
