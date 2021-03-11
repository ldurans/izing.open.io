<template>
  <div>
    <q-header class="bg-white no-border-radius">
      <q-toolbar
        style="min-height: 60px; height: 60px;"
        class="no-border-radius q-pa-none text-primary"
      >
        <q-item
          clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; min-width: 400px;"
          @click="$emit('updateTicket:info-contato')"
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
          <q-item-section>
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
                class="text-primary"
                style="font-size: 11px"
              > Ticket: {{ cticket.id }}</span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div v-if="Value(cticket.contact, 'name')">
          <q-btn
            @click="$emit('updateTicket:retornar')"
            dense
            flat
            round
            icon="mdi-replay"
            color="negative"
          >
            <q-tooltip>
              Retornar Ticket para a Fila
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="$emit('updateTicket:resolver')"
            dense
            round
            color="positive"
            class="q-ml-sm"
            flat
            icon="mdi-comment-check"
          >
            <q-tooltip>
              Resolver
            </q-tooltip>
          </q-btn>
          <q-btn
            @click="listarUsuarios"
            dense
            round
            flat
            color="primary"
            class="q-ml-sm q-mr-md"
          >
            <q-icon name="mdi-transfer" />
            <q-tooltip>
              Transferir
            </q-tooltip>
          </q-btn>

          <!-- <q-btn
            round
            flat
            icon="mdi-text-box-search-outline"
          />
          <q-btn
            round
            flat
          >
            <q-icon
              name="mdi-attachment"
              class="rotate-135"
            />
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-dots-vertical"
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
          </q-btn> -->
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog
      v-model="modalTransferirTicket"
      @hide="modalTransferirTicket=false"
      persistent
    >
      <q-card
        class="q-pa-md"
        style="width: 500px"
      >
        <q-card-section>
          <div class="text-h6">Selecione o destino:</div>
        </q-card-section>
        <q-card-section>
          <q-select
            square
            outlined
            v-model="usuarioSelecionado"
            :options="usuarios"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            label="Usuário destino"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Sair"
            color="negative"
            v-close-popup
            class="q-mr-lg"
          />
          <q-btn
            flat
            label="Salvar"
            color="primary"
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
import { AtualizarTicket } from 'src/service/tickets'
export default {
  name: 'InfoCabecalhoMensagens',
  data () {
    return {
      modalTransferirTicket: false,
      usuarioSelecionado: null,
      usuarios: []
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
      if (!this.usuarioSelecionado) return
      if (this.ticketFocado.userId === this.usuarioSelecionado) {
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
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado,
        status: 'open',
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

<style lang="scss" scoped>
</style>
