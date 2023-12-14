<template>
  <div>
    <q-card class="q-ma-md">
      <q-card-section>
        <div class="text-h6">
          Configurações API
          <q-btn
            class="float-right"
            color="primary"
            rounded
            label="Adicionar"
            @click="apiEdicao = {}; modalApi = !modalApi;"
          />
        </div>
      </q-card-section>
      <q-separator />
      <q-card-section
        class="scroll"
        style="height: calc(100vh - 200px)"
      >
        <q-item
          v-for="api in apis"
          :key="api.token"
          class="q-my-md shadow-2"
        >

          <q-item-section top>
            <q-item-label class="text-bold text-h6 q-my-sm">
              Nome: {{ api.name }}
              <div class="text-grey-8 q-gutter-xs float-right">
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-content-copy"
                  @click="copy(api.token)"
                >
                  <q-tooltip>
                    Copiar token
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="edit"
                  @click="editarAPI(api)"
                >
                  <q-tooltip>
                    Editar Configuraçao
                  </q-tooltip>
                </q-btn>
                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="mdi-autorenew"
                  @click="gerarNovoToken(api)"
                >
                  <q-tooltip>
                    Gerar novo Token
                  </q-tooltip>
                </q-btn>

                <q-btn
                  class="gt-xs"
                  size="12px"
                  flat
                  dense
                  round
                  icon="delete"
                  @click="deletarApi(api)"
                >
                  <q-tooltip>
                    Deletar Configuração
                  </q-tooltip>
                </q-btn>
              </div>
            </q-item-label>
            <q-item-label
              lines="4"
              style="word-break: break-all;"
            >
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Url:
                </span>
                {{ montarUrlIntegração(api.id) }}
              </p>
            </q-item-label>
            <q-item-label style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Token:
                </span>
                {{ api.token }}
              </p>
            </q-item-label>
            <q-item-label caption>
              <p class="text-weight-medium">
                <span class="text-bold">WebHook Status Whatsapp:</span> <span> {{ api.urlServiceStatus }} </span>
              </p>
            </q-item-label>
            <q-item-label caption>
              <p class="text-weight-medium">
                <span class="text-bold">WebHook Status Mensagem:</span> <span> {{ api.urlMessageStatus }} </span>
              </p>
            </q-item-label>
            <q-item-label style="word-break: break-all;">
              <p class="text-weight-medium text-nowrap q-pr-md">
                <span class="text-bold">Token Autenticação:
                </span>
                {{ api.authToken }}
              </p>
            </q-item-label>
            <q-item-label
              lines="1"
              class="q-mt-xs text-body2 text-weight-bold text-primary text-uppercase"
            >
            </q-item-label>
          </q-item-section>
        </q-item>

      </q-card-section>
    </q-card>

    <ModalApi
      :modalApi.sync="modalApi"
      :apiEdicao.sync="apiEdicao"
      @modal-api:criada="apiCriada"
      @modal-api:editada="apiEditada"
    />

  </div>
</template>

<script>
import { ListarAPIs, ApagarAPI, NovoTokenAPI } from 'src/service/api'
import { copyToClipboard } from 'quasar'
import ModalApi from './ModalApi'
export default {
  name: 'APIs',
  components: {
    ModalApi
  },
  data () {
    return {
      apiEdicao: {},
      modalApi: false,
      apis: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'token', label: 'Token', classes: 'ellipsis', style: 'max-width: 400px', field: 'token', align: 'left' },
        { name: 'isActive', label: 'Ativo', field: 'isActive', align: 'center' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  computed: {
    cBaseUrlIntegração () {
      return `${process.env.VUE_URL_API}/v1/api/external`
    }
  },
  methods: {
    montarUrlIntegração (id) {
      return `${this.cBaseUrlIntegração}/${id}`
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso('Token copiado!'))
        .catch()
    },
    async listarAPIs () {
      const { data } = await ListarAPIs()
      this.apis = data.apis
    },
    apiCriada (api) {
      const newApis = [...this.apis]
      newApis.push(api)
      this.apis = [...newApis]
    },
    apiEditada (api) {
      const newApis = [...this.apis]
      const idx = newApis.findIndex(f => f.id === api.id)
      if (idx > -1) {
        newApis[idx] = api
      }
      this.apis = [...newApis]
    },
    editarAPI (api) {
      this.apiEdicao = { ...api }
      this.modalApi = true
    },
    gerarNovoToken (api) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente gerar novo token para "${api.name}"?
        Lembre que as integrações que utilizam atual irão parar de funcionar
        até que atualize o token onde for necessário.`,
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
      }).onOk(async () => {
        try {
          const { data } = await NovoTokenAPI(api)
          this.apiEditada(data)
          this.$notificarSucesso('Token atualizado!')
        } catch (error) {
          this.$notificarErro(
            'Não foi possível atualizar o token',
            error
          )
        }
      })
    },
    deletarApi (api) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar "${api.name}"?`,
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
        ApagarAPI(api)
          .then(res => {
            let newApis = [...this.apis]
            newApis = newApis.filter(a => a.id !== api.id)
            this.apis = [...newApis]
            this.$notificarSucesso(`${api.name} deletada!`)
          })
          .catch(error => this.$notificarErro(`Não foi possível deletar ${api.name}`, error))
        this.loading = false
      })
    }

  },
  mounted () {
    this.listarAPIs()
  }
}
</script>

<style lang="scss" scoped>
</style>
