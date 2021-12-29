<template>
  <div>
    <div class="row col full-width q-pa-lg">
      <q-card
        flat
        bordered
        class="full-width"
      >
        <q-card-section class="row text-h6 text-bold">
          Canais de Comunicação
          <q-space />
          <q-btn
            flat
            class="bg-padrao"
            color="primary"
            label="Novo"
            @click="modalChannel = true"
          />

        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width q-py-lg q-px-md ">
      <template v-for="item in whatsapps">
        <q-card
          flat
          bordered
          class="col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md"
          :key="item.id"
        >
          <q-item>
            <q-item-section avatar>
              <q-avatar>
                <q-icon
                  size="40px"
                  :name="`img:${item.type}-logo.png`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-h6 text-bold">Nome: {{ item.name }}</q-item-label>
              <q-item-label class="text-h6 text-caption">
                {{ item.type }}
              </q-item-label>
              <q-item-label class="text-bold text-primary text-body1">Cliente: {{ `${item.tenant && item.tenant.id} - ${item.tenant && item.tenant.name}` }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn
                round
                flat
                dense
                icon="edit"
                @click="handleOpenModalWhatsapp(item)"
                v-if="isAdmin"
              />
              <!-- <q-btn
            round
            flat
            dense
            icon="delete"
            @click="deleteWhatsapp(props.row)"
            v-if="$store.getters['isSuporte']"
          /> -->
              <!-- <q-btn
            class="q-ml-sm"
            color="black"
            icon="person_search"
            round
            flat
            dense
            @click="sincronizarContatos(props.row)"
          >
            <q-tooltip>
              Sincronizar contatos
            </q-tooltip>

          </q-btn> -->
            </q-item-section>
          </q-item>
          <q-separator />
          <q-card-section>
            <ItemStatusChannel :item="item" />
          </q-card-section>
          <q-separator />
          <q-card-actions
            class="q-pa-md q-pt-none"
            align="center"
          >
            <q-btn
              v-if="item.status == 'DESTROYED' || item.status == 'qrcode'"
              color="blue-5"
              label="Novo QR Code"
              @click="handleRequestNewQrCode(item, 'btn-qrCode')"
              icon-right="watch_later"
              :disable="!isAdmin"
            />
            <q-btn-group
              v-if="item.status == 'DISCONNECTED'"
              outline
            >
              <q-btn
                outline
                color="black"
                label="Conectar"
                @click="handleStartWhatsAppSession(item.id)"
              />
            </q-btn-group>
            <q-btn
              v-if="['CONNECTED', 'PAIRING', 'TIMEOUT', 'OPENING'].includes(item.status)"
              color="negative"
              label="Desconectar"
              outline
              @click="handleDisconectWhatsSession(item.id)"
              :disable="!isAdmin"
            />
            <q-btn
              v-if="item.status == 'OPENING'"
              disable
              :loading="true"
              color="grey"
              label="Conectando"
            />
          </q-card-actions>
        </q-card>
      </template>
    </div>
    <ModalQrCode
      :abrirModalQR.sync="abrirModalQR"
      :channel="whatsappSelecionado"
    />
    <ModalChannel
      :empresas="empresas"
      :modalChannel.sync="modalChannel"
      :channelEdit.sync="whatsappSelecionado"
      @modalChannel:atualizar="listarChannels"
    />
    <q-inner-loading :showing="loading">
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </div>
</template>

<script>
import { DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, AdminListarChannels, SincronizarContatosWhatsapp } from 'src/service/channels'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import ModalQrCode from './ModalQrCode'
import { mapGetters } from 'vuex'
import ModalChannel from './ModalChannel'
import ItemStatusChannel from './ItemStatusChannel'
import { AdminListarEmpresas } from 'src/service/empresas'

const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ModalQrCode,
    ModalChannel,
    ItemStatusChannel
  },
  data () {
    return {
      loading: false,
      userLogado,
      empresas: [],
      isAdmin: false,
      abrirModalQR: false,
      modalChannel: false,
      whatsappSelecionado: {},
      whatsAppId: null,
      objStatus: {
        qrcode: ''
      },
      columns: [
        {
          name: 'name',
          label: 'Nome',
          field: 'name',
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          align: 'center'
        },
        {
          name: 'session',
          label: 'Sessão',
          field: 'status',
          align: 'center'
        },
        {
          name: 'number',
          label: 'Número',
          field: 'number',
          align: 'center'
        },
        {
          name: 'updatedAt',
          label: 'Última Atualização',
          field: 'updatedAt',
          align: 'center',
          format: d => this.formatarData(d, 'dd/MM/yyyy HH:mm')
        },
        {
          name: 'isDefault',
          label: 'Padrão',
          field: 'isDefault',
          align: 'center'
        },
        {
          name: 'acoes',
          label: 'Ações',
          field: 'acoes',
          align: 'center'
        }
      ]
    }
  },
  computed: {
    ...mapGetters(['whatsapps'])
  },
  methods: {
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    },
    handleOpenQrModal (channel) {
      this.whatsappSelecionado = channel
      this.abrirModalQR = true
    },
    handleOpenModalWhatsapp (whatsapp) {
      this.whatsappSelecionado = whatsapp
      this.modalChannel = true
    },
    async handleDisconectWhatsSession (whatsAppId) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente desconectar? ',
        // message: 'Mensagens antigas não serão apagadas no whatsapp.',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeleteWhatsappSession(whatsAppId).then(() => {
          const whatsapp = this.whatsapps.find(w => w.id === whatsAppId)
          this.$store.commit('UPDATE_WHATSAPPS', {
            ...whatsapp,
            status: whatsapp.type === 'whatsapp' ? 'DESTROYED' : 'DISCONNECTED'
          })
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async handleStartWhatsAppSession (whatsAppId) {
      try {
        await StartWhatsappSession(whatsAppId)
      } catch (error) {
        console.error(error)
      }
    },
    async handleRequestNewQrCode (channel, origem) {
      console.log('origem', origem)
      if (channel.type === 'telegram' && !channel.tokenTelegram) {
        this.$notificarErro('Necessário informar o token para Telegram')
      }
      this.handleOpenQrModal(channel)
      // this.loading = true
      // try {
      //   await RequestNewQrCode(whatsapp.id)
      //   setTimeout(() => {
      //     this.handleOpenQrModal(whatsapp.id)
      //   }, 3000)
      // } catch (error) {
      //   console.error(error)
      // }
      // this.loading = false
    },
    async listarChannels () {
      const { data } = await AdminListarChannels()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async deleteWhatsapp (whatsapp) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar? ',
        message: 'Não é uma boa ideia apagar se já tiver gerado atendimentos para esse whatsapp.',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarWhatsapp(whatsapp.id).then(r => {
          this.$store.commit('DELETE_WHATSAPPS', whatsapp.id)
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async listarEmpresas () {
      const { data } = await AdminListarEmpresas()
      this.empresas = data
    },
    sincronizarContatos (whatsapp) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente sincronizar os contatos? ',
        message: 'Todas os contatos com os quais você já conversou pelo Whatsapp serão criados. Isso pode demorar um pouco...',
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        SincronizarContatosWhatsapp(whatsapp.id).then(res => {
          this.$q.notify({
            type: 'positive',
            message: 'Contatos estão sendo sincronizados e importados. Poderão ser consultados posteriormente na Lista de Contatos.',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }).catch(error => {
          console.error(error)
          this.$notificarErro('Não foi possível sincronizar os contatos', error)
        })
        this.loading = false
      })
    }
  },
  mounted () {
    this.isAdmin = localStorage.getItem('profile')
    this.listarChannels()
    this.listarEmpresas()
    // this.$root.$on('UPDATE_SESSION', (whatsapp) => {
    //   if (whatsapp.status === 'qrcode') {
    //     this.handleOpenQrModal(whatsapp)
    //   } else {
    //     // if (whatsapp.status === 'qrcode') return
    //     this.abrirModalQR = false
    //   }
    // })
  },
  destroyed () {
    this.$root.$off('UPDATE_SESSION')
  }
}
</script>

<style lang="scss" scoped>
</style>
