<template>
  <div>
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
              rounded
              @click="chatFlowSelecionado = {}; modalChatFlow = true"
            />
          </template>
          <template v-slot:body-cell-isActive="props">
            <q-td class="text-center">
              <q-icon
                size="16px"
                :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
                :color="props.value ? 'positive' : 'negative'"
                class=""
              />
              <span class="q-mx-xs text-bold"> {{ props.value ? 'Ativo' : 'Inativo' }} </span>
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
                class="bg-padrao q-mx-sm"
                @click="duplicarFluxo(props.row)"
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
              <q-btn
                color="blue-3"
                icon="delete"
                flat
                round
                class="bg-padrao"
                @click="deletarFluxo(props.row)"
              >
                <q-tooltip>
                  Excluir
                </q-tooltip>
              </q-btn>
            </q-td>
          </template>

        </q-table>
      </div>
    </div>
    <ModalChatFlow
      :modalChatFlow.sync="modalChatFlow"
      :chatFlowEdicao.sync="chatFlowSelecionado"
      @chatFlow:criada="novoFluxoCriado"
      @chatFlow:editado="fluxoEditado"
    />
    <q-dialog
      v-model="confirmDelete"
      persistent
    >
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Você tem certeza que dessa escluir esse fluxo?</div>
          <div>{{ chatFlowSelecionado.name }}</div>
        </q-card-section>
        <q-card-actions
          align="right"
          class="text-primary"
        >
          <q-btn
            flat
            label="Cancelar"
            v-close-popup
            class="q-mr-md"
          />
          <q-btn
            flat
            label="Excluir"
            color="negative"
            v-close-popup
            @click="confirmDeleteFoo()"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ListarFilas } from 'src/service/filas'
import { ListarChatFlow, DeletarChatFlow } from 'src/service/chatFlow'
import { ListarUsuarios } from 'src/service/user'
import ModalChatFlow from './ModalChatFlow.vue'

export default {
  name: 'ChatFlowIndex',
  components: { ModalChatFlow },
  data () {
    return {
      confirmDelete: false,
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
        { name: 'isActive', label: 'Status', field: 'isActive', align: 'center' },
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
    duplicarFluxo (flow) {
      this.chatFlowSelecionado = { ...flow, isDuplicate: true }
      this.modalChatFlow = true
    },
    fluxoEditado (flow) {
      const lista = [...this.listachatFlow.filter(f => f.id !== flow.id)]
      lista.push(flow)
      this.listachatFlow = lista
    },
    editFlow (flow) {
      this.chatFlowSelecionado = flow
      this.modalChatFlow = true
    },
    async abrirFluxo (flow) {
      await this.$store.commit('SET_FLOW_DATA', {
        usuarios: this.usuarios,
        filas: this.filas,
        flow
      })
      this.$router.push({ name: 'chat-flow-builder' })
    },
    deletarFluxo (flow) {
      this.chatFlowSelecionado = flow
      this.confirmDelete = true
    },
    async confirmDeleteFoo (flow) {
      await DeletarChatFlow(this.chatFlowSelecionado)
      await this.listarChatFlow()
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
