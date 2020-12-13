<template>
  <div>
    <q-table
      title="Conexões"
      bordered
      :data="whatsapps"
      :columns="columns"
      row-key="name"
      table-style="height: 50vh"
      class="my-sticky-dynamic q-ma-lg"
    >
      <template v-slot:top-right>
        <q-btn
          class="q-ml-md"
          color="primary"
          label="Adicionar"
          @click="whatsappSelecionado = {}; modalWhatsapp = true"
        />
      </template>
      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <q-icon
            v-if="props.value == 'qrcode'"
            color="primary"
            name="mdi-crop-free"
            size="2.5em"
          >
            <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
              <span class="text-weight-medium"> Esperando leitura do QR Code </span>
              <span class="row col"> Clique no botão 'QR CODE' e leia o QR Code com o seu celular para iniciar a sessão </span>
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="props.value == 'DISCONNECTED'"
            color="negative"
            size="2.5em"
            name="mdi-wifi-alert"
          >
            <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
              <span class="text-weight-medium"> Falha ao iniciar sessão do WhatsApp </span>
              <span class="row col"> Certifique-se de que seu celular esteja conectado à internet e tente novamente, ou solicite um novo QR Code </span>
            </q-tooltip>
          </q-icon>
          <q-icon
            name="mdi-wifi-arrow-up-down"
            color="green-8"
            size="2.5em"
            v-if="props.value == 'CONNECTED'"
          >
            <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
              <span class="text-weight-medium"> Conexão estabelecida! </span>
            </q-tooltip>
          </q-icon>
          <q-icon
            v-if="['PAIRING', 'TIMEOUT'].includes(props.value)"
            color="negative"
            size="2.5em"
            name="mdi-wifi-strength-1-alert"
          >
            <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
              <span class="text-weight-medium"> A conexão com o celular foi perdida </span>
              <span class="row col"> Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto, ou clique no botão 'Desconectar' para obter um novo QR Code </span>
            </q-tooltip>
          </q-icon>
          <q-spinner
            v-if="props.value == 'OPENING'"
            color="green-7"
            size="3em"
            :thickness="2"
          >
          </q-spinner>
        </q-td>
      </template>
      <template v-slot:body-cell-session="props">
        <q-td :props="props">
          <q-btn
            v-if="props.value == 'qrcode'"
            color="primary"
            label="QR CODE"
            @click="handleOpenQrModal(props.row.id)"
          />
          <q-btn-group
            v-if="props.value == 'DISCONNECTED'"
            outline
          >
            <q-btn
              outline
              color="black"
              label="Tentar novamente"
              @click="handleStartWhatsAppSession(props.row.id)"
            />
            <q-btn
              outline
              color="blue-3"
              label="Novo QR Code"
              @click="handleRequestNewQrCode(props.row.id)"
              icon-right="watch_later"
            />
          </q-btn-group>
          <q-btn
            v-if="['CONNECTED', 'PAIRING', 'TIMEOUT'].includes(props.value)"
            color="negative"
            label="Desconectar"
            outline
            @click="handleDisconectWhatsSession(props.row.id)"
          />
          <q-btn
            v-if="props.value == 'OPENING'"
            disable
            :loading="true"
            color="grey"
            label="Conectando"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-isDefault="props">
        <q-td :props="props">
          <q-icon
            v-if="props.value"
            name="mdi-check-circle"
            size="2em"
            color="positive"
          />
          <q-icon
            v-else
            name="mdi-checkbox-blank-circle-outline"
            size="2em"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td :props="props">
          <q-btn
            round
            flat
            dense
            icon="edit"
            @click="handleOpenModalWhatsapp(props.row)"
          />
          <q-btn
            round
            flat
            dense
            icon="delete"
            @click="deleteWhatsapp(props.row)"
          />

        </q-td>
      </template>
    </q-table>
    <ModalQrCode
      :abrirModalQR.sync="abrirModalQR"
      :whatsAppId="whatsAppId"
    />
    <ModalWhatsapp
      :modalWhatsapp.sync="modalWhatsapp"
      :whatsAppEdit.sync="whatsappSelecionado"
    />
  </div>
</template>

<script>
import { DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, RequestNewQrCode, ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import ModalQrCode from './ModalQrCode'
import { mapGetters } from 'vuex'
import ModalWhatsapp from './ModalWhatsapp'
export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ModalQrCode,
    ModalWhatsapp
  },
  data () {
    return {
      abrirModalQR: false,
      modalWhatsapp: false,
      whatsappSelecionado: {},
      whatsAppId: null,
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
    handleOpenQrModal (whatsAppId) {
      this.whatsAppId = whatsAppId
      this.abrirModalQR = true
    },
    handleOpenModalWhatsapp (whatsapp) {
      this.whatsappSelecionado = whatsapp
      this.modalWhatsapp = true
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
        DeleteWhatsappSession(whatsAppId).finally(f => {
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
    async handleRequestNewQrCode (whatsAppId) {
      try {
        await RequestNewQrCode(whatsAppId)
      } catch (error) {
        console.error(error)
      }
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async deleteWhatsapp (whatsapp) {
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar? ',
        message: 'Não é uma boa ideia apagar se já tiver gerado tickets para esse whatsapp.',
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
    }
  },
  mounted () {
    this.listarWhatsapps()
  }
}
</script>

<style lang="scss" scoped>
</style>
