<template>
  <div>
    <q-card
      class="q-ma-md"
      v-if="false"
    >
      <q-card-section class="q-pa-sm">
        <ccFlow
          :filas="filas"
          :usuarios="usuarios"
        />
      </q-card-section>
    </q-card>

    <template>

      <div class="row">
        <div class="col">
          <q-table
            square
            flat
            bordered
            class="my-sticky-dynamic q-ma-lg"
            title="Fluxos"
            hide-bottom
            :data="listachatFlow"
            :columns="columns"
            :loading="loading"
            row-key="id"
            :pagination.sync="pagination"
            :rows-per-page-options="[0]"
          >
            <template v-slot:top-right>
              <q-btn
                class="q-ml-md"
                color="primary"
                label="Adicionar"
                @click="chatFlowSelecionado = {}; modalChatFlow = true"
              />
            </template>
            <template v-slot:body-cell-isActive="props">
              <q-td class="text-center">
                <q-icon
                  size="24px"
                  :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                  :color="props.value ? 'positive' : 'negative'"
                  class=""
                />
              </q-td>
            </template>
            <template v-slot:body-cell-acoes="props">
              <q-td class="text-center">
                <q-btn
                  color="blue-3"
                  icon="edit"
                  flat
                  round
                  class="bg-padrao"
                  @click="editFlow(props.row)"
                >
                  <q-tooltip>
                    Editar informações
                  </q-tooltip>
                </q-btn>
                <q-btn
                  color="blue-3"
                  icon="mdi-content-duplicate"
                  flat
                  round
                  class="bg-padrao"
                  @click="editFlow(props.row)"
                >
                  <q-tooltip>
                    Duplicar Fluxo
                  </q-tooltip>
                </q-btn>
                <q-btn
                  color="blue-3"
                  icon="mdi-sitemap"
                  flat
                  round
                  class="bg-padrao"
                  @click="abrirFluxo(props.row)"
                >
                  <q-tooltip>
                    Abrir Fluxo
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>

          </q-table>
        </div>
      </div>
    </template>
    <ModalNovoFlow
      :modalChatFlow.sync="modalChatFlow"
      :chatFlowEdicao.sync="chatFlowSelecionado"
      @chatFlow:criada="novoFluxoCriado"
    />
  </div>
</template>

<script>
import { ListarFilas } from 'src/service/filas'
import { ListarChatFlow } from 'src/service/chatFlow'
import { ListarUsuarios } from 'src/service/user'
import ccFlow from '../../components/ccFlowBuilder/panel.vue'
import ModalNovoFlow from './ModalNovoFlow.vue'

export default {
  name: 'ChatFlowIndex',
  components: { ccFlow, ModalNovoFlow },
  data () {
    return {
      listachatFlow: [],
      modalChatFlow: false,
      chatFlowSelecionado: {},
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      params: {
        pageNumber: 1,
        searchParam: null,
        hasMore: true
      },
      loading: false,
      columns: [
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        { name: 'isActive', label: 'Status', field: 'isActive', align: 'center', format: (v) => v === true ? 'Ativo' : 'Inativo' },
        { name: 'celularTeste', label: 'Celular Teste', field: 'celularTeste', align: 'center' },
        { name: 'acoes', label: '', field: 'acoes', align: 'center' }
      ],
      filas: [],
      usuarios: []
    }
  },
  methods: {
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listachatFlow = data.chatFlow
      console.log('listarChatFlow', this.listachatFlow)
    },
    async listarFilas () {
      const { data } = await ListarFilas({ isActive: true })
      this.filas = data.filter(q => q.isActive)
    },
    async listarUsuarios () {
      const { data } = await ListarUsuarios(this.params)
      this.usuarios = data.users
    },
    novoFluxoCriado (flow) {
      const lista = [...this.listachatFlow]
      lista.push(flow)
      this.listachatFlow = lista
    },
    async abrirFluxo (flow) {
      await this.$store.commit('SET_FLOW_DATA', {
        usuarios: this.usuarios,
        filas: this.filas,
        flow
      })
      this.$router.push({ name: 'chat-flow-builder' })
    }
  },
  async mounted () {
    await this.listarChatFlow()
    await this.listarFilas()
    await this.listarUsuarios()
  }
}
</script>

<style lang="scss" scoped>
</style>
