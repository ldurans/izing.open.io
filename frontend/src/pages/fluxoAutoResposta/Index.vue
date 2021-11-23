<template>
  <div>
    <q-card class="q-ma-md">
      <q-card-section class="q-pa-sm">
        <ccFlow
          :filas="filas"
          :usuarios="usuarios"
        />
      </q-card-section>
    </q-card>

    <template v-if="false">

      <div class="row">
        <div class="col">
          <q-table
            square
            flat
            bordered
            class="my-sticky-dynamic q-ma-lg"
            title="Auto Resposta"
            hide-bottom
            :data="listaAutoResposta"
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
                @click="autoRespostaSelecionado = {}; modalAutoResposta = true"
              />
            </template>
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th auto-width />
                <q-th
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>
            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td auto-width>
                  <q-btn
                    size="sm"
                    color="accent"
                    round
                    dense
                    @click="props.expand = !props.expand"
                    :icon="props.expand ? 'remove' : 'add'"
                  />
                </q-td>
                <q-td
                  v-for="col in props.cols"
                  :key="col.name"
                  :props="props"
                >
                  {{ col.value }}
                </q-td>
                <q-td
                  auto-width
                  class="text-center"
                >
                  <q-btn
                    dense
                    flat
                    round
                    icon="edit"
                    @click="editarAutoResposta(props.row)"
                  />
                  <q-btn
                    flat
                    dense
                    round
                    icon="mdi-delete"
                    @click="deletarAutoResposta(props.row)"
                  />
                </q-td>
              </q-tr>
              <q-tr
                v-show="props.expand"
                :props="props"
              >
                <q-td colspan="100%">
                  <q-table
                    class="my-sticky-dynamic"
                    title="Etapas"
                    square
                    flat
                    bordered
                    hide-bottom
                    :data="props.row.stepsReply"
                    :columns="columnsEtapas"
                    :loading="loading"
                    row-key="id"
                    :pagination.sync="pagination"
                    :rows-per-page-options="[0]"
                  >
                    <template v-slot:top-right>
                      <q-btn
                        class="q-ml-md"
                        color="primary"
                        outline
                        label="Nova Etapa"
                        @click="novaEtapa(props.row)"
                      />
                    </template>
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th auto-width />
                        <q-th
                          v-for="col in props.cols"
                          :key="col.name"
                          :props="props"
                        >
                          {{ col.label }}
                        </q-th>
                      </q-tr>
                    </template>
                    <template v-slot:body="etapas">
                      <q-tr :props="etapas">
                        <q-td auto-width>
                          <q-btn
                            size="sm"
                            color="accent"
                            round
                            dense
                            @click="etapas.expand = !etapas.expand"
                            :icon="etapas.expand ? 'remove' : 'add'"
                          />
                        </q-td>
                        <q-td
                          v-for="col in etapas.cols"
                          :key="col.name"
                          :props="etapas"
                        >
                          {{ col.value }}
                        </q-td>
                        <q-td
                          auto-width
                          class="text-center"
                        >
                          <q-btn
                            dense
                            flat
                            round
                            icon="edit"
                            @click="editarEtapaAutoResposta(props.row, etapas.row)"
                          />
                          <q-btn
                            flat
                            dense
                            round
                            icon="mdi-delete"
                            @click="deletarEtapaAutoResposta(props.row, etapas.row)"
                          />
                        </q-td>
                      </q-tr>
                      <q-tr
                        v-show="etapas.expand"
                        :props="etapas"
                      >
                        <q-td colspan="100%">
                          <q-table
                            square
                            flat
                            bordered
                            class="my-sticky-dynamic"
                            title="Ações"
                            :data="etapas.row.stepsReplyAction"
                            :columns="columnsAcoes"
                            :loading="loading"
                            row-key="id"
                            hide-bottom
                            :pagination.sync="pagination"
                            :rows-per-page-options="[0]"
                          >
                            <template v-slot:top-right>
                              <q-btn
                                class="q-ml-md"
                                color="black"
                                glossy
                                label="Nova Ação"
                                outline
                                @click="criarAcaoEtapa(props.row, etapas.row)"
                              />
                            </template>
                            <template v-slot:body-cell-acoes="acao">
                              <q-td class="text-center">
                                <q-icon
                                  size="24px"
                                  :name="!acao.row.replyDefinition ? 'mdi-email-off-outline' : 'mdi-email-send-outline'"
                                  class="q-mr-sm"
                                >
                                  <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
                                    <span class="text-weight-medium"> Mensagem de retorno: </span>
                                    <span class="row col">
                                      {{ acao.row.replyDefinition || 'Sem mensagem de retorno' }}
                                    </span>
                                  </q-tooltip>

                                </q-icon>

                                <q-btn
                                  flat
                                  round
                                  icon="edit"
                                  @click="editarAcaoEtapa(props.row, etapas.row, acao.row)"
                                />
                                <q-btn
                                  flat
                                  round
                                  icon="mdi-delete"
                                  @click="deletarAcaoEtapa(props.row, etapas.row, acao.row)"
                                />
                              </q-td>
                            </template>
                            <!-- <template :props="acao">
                            <q-tr v-show="acao.row.replyDefinition">
                              <q-td colspan="100%">
                                Mensagem: acao.row.replyDefinition
                              </q-td>
                            </q-tr>
                          </template> -->
                          </q-table>
                        </q-td>
                      </q-tr>
                    </template>

                  </q-table>
                </q-td>
              </q-tr>
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

          </q-table>
        </div>
      </div>
      <ModalAutoResposta
        :modalAutoResposta.sync="modalAutoResposta"
        :autoRespostaEdicao.sync="autoRespostaSelecionado"
        @autoResposta:criada="autoRespostaCriada"
        @autoResposta:editado="autoRespostaEditada"
      />
      <ModalEtapaAutoResposta
        :modalEtapaAutoResposta.sync="modalEtapaAutoResposta"
        :etapaAutoRespostaEdicao.sync="etapaAutoRespostaEdicao"
        :autoReply="autoReply"
        @etapaAutoResposta:criada="etapaAutoRespostaCriada"
        @etapaAutoResposta:editada="etapaAutoRespostaEditada"
      />
      <ModalAcaoEtapa
        :modalAcaoEtapa.sync="modalAcaoEtapa"
        :acaoEtapaEdicao.sync="acaoEtapaEdicao"
        :filas="filas"
        :autoReply="autoReply"
        :etapaAutoResposta.sync="etapaAutoRespostaEdicao"
        :usuarios="usuarios"
        @acaoEtapa:editada="acaoEditada"
        @acaoEtapa:criada="acaoCriada"
      />
    </template>
  </div>
</template>

<script>
import { DeletarAutoResposta, DeletarEtapaResposta, ListarAutoResposta, DeletarAcaoEtapa } from 'src/service/autoResposta'
import { ListarFilas } from 'src/service/filas'
import { ListarUsuarios } from 'src/service/user'
import ModalAutoResposta from './ModalAutoResposta'
import ModalEtapaAutoResposta from './ModalEtapaAutoResposta'
import ModalAcaoEtapa from './ModalAcaoEtapa'
import ccFlow from '../../components/ccFlowBuilder/panel.vue'

export default {
  name: 'CadastroAutoReply',
  components: { ccFlow, ModalAutoResposta, ModalEtapaAutoResposta, ModalAcaoEtapa },
  data () {
    return {
      autoRespostaSelecionado: {},
      modalAutoResposta: false,
      etapaAutoRespostaEdicao: {},
      modalEtapaAutoResposta: false,
      modalAcaoEtapa: false,
      acaoEtapaEdicao: {},
      autoReply: {},
      tipoAutoResposta: [
        { value: '0', label: 'Entrada (Criação do Ticket)' },
        { value: '1', label: 'Encerramento (Resolução Ticket)' }
      ],
      // tipoEtapa: [
      //   { value: '1', label: 'Menu' },
      //   { value: '2', label: 'Redirecionamento' }
      // ],
      acaoEtapa: [
        { value: '0', label: 'Próxima Etapa' },
        { value: '1', label: 'Encaminhar para Fila' },
        { value: '2', label: 'Ecaminhar para Usuário' }
      ],
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
        { name: 'expand', label: '', field: 'expand', align: 'left' },
        { name: 'name', label: 'Nome', field: 'name', align: 'left' },
        {
          name: 'action',
          label: 'Tipo',
          field: 'action',
          align: 'left',
          format: (v) => this.tipoAutoResposta.find(a => a.value == v).label || ''
        },
        { name: 'isActive', label: 'Status', field: 'isActive', align: 'center', format: (v) => v === true ? 'Ativo' : 'Inativo' },
        { name: 'celularTeste', label: 'Celular Teste', field: 'celularTeste', align: 'center' },
        { name: 'acoes', label: '', field: 'acoes', align: 'center' }
      ],
      columnsEtapas: [
        { name: 'expand', label: '', field: 'expand', align: 'left' },
        { name: 'id', label: 'ID', field: 'id', align: 'center', sortable: true, sort: (a, b, rowA, rowB) => parseInt(a, 10) - parseInt(b, 10) },
        { name: 'reply', label: 'Mensagem', field: 'reply', align: 'left', classes: 'ellipsis', style: 'max-width: 400px;' },
        { name: 'initialStep', label: 'Etapa Inicial', sortable: true, field: 'initialStep', align: 'left', format: v => v ? 'Sim' : '' },
        { name: 'acoes', label: '', field: 'acoes', align: 'center' }
      ],
      columnsAcoes: [
        { name: 'words', label: 'Chave', field: 'words', align: 'left' },
        { name: 'action', label: 'Ação', field: 'action', align: 'left', format: (v) => this.acaoEtapa.find(a => a.value == v).label },
        {
          name: 'queueId',
          label: 'Fila Destino',
          field: 'queueId',
          align: 'center',
          format: (v) => v ? this.filas.find(f => f.id === v).queue : ''
        },
        { name: 'userIdDestination', label: 'Usuário Destino', field: 'userIdDestination', align: 'center', format: (v) => v ? this.usuarios.find(u => u.id === v).name : '' },
        { name: 'nextStepId', label: 'ID Etapa destino', field: 'nextStepId', align: 'center' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ],
      listaAutoResposta: [],
      filas: [],
      usuarios: []

    }
  },
  methods: {
    autoRespostaCriada (autoResposta) {
      const newLista = [...this.listaAutoResposta]
      newLista.push(autoResposta)
      this.listaAutoResposta = [...newLista]
    },
    autoRespostaEditada (autoResposta) {
      let newLista = [...this.listaAutoResposta]
      newLista = newLista.filter(a => a.id !== autoResposta.id)
      newLista.push(autoResposta)
      this.listaAutoResposta = [...newLista]
    },
    async listarAutoReply () {
      const { data } = await ListarAutoResposta()
      this.listaAutoResposta = data.autoReply
    },
    async listarFilas () {
      const { data } = await ListarFilas({ isActive: true })
      this.filas = data.filter(q => q.isActive)
    },
    editarAutoResposta (autoResposta) {
      this.autoRespostaSelecionado = autoResposta
      this.modalAutoResposta = true
    },
    async deletarAutoResposta (autoResposta) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Auto Resposta "${autoResposta.name}"?`,
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
        DeletarAutoResposta(autoResposta.id)
          .then(res => {
            let newLista = [...this.listaAutoResposta]
            newLista = newLista.filter(a => a.id !== autoResposta.id)
            this.listaAutoResposta = [...newLista]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Auto Resposta ${autoResposta.name} deletada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('Não é possível deletar o Chatbot', error)
          })
        this.loading = false
      })
    },
    novaEtapa (autoResposta) {
      this.autoReply = autoResposta
      this.etapaAutoRespostaEdicao = {}
      this.modalEtapaAutoResposta = true
    },
    etapaAutoRespostaCriada (etapa) {
      const newLista = [...this.listaAutoResposta]
      const lista = newLista.map(i => {
        if (i.id === etapa.idAutoReply) {
          if (!Array.isArray(i.stepsReply)) {
            i.stepsReply = []
          }
          i.stepsReply.push(etapa)
        }
        return i
      })
      this.listaAutoResposta = [...lista]
    },
    etapaAutoRespostaEditada (etapa) {
      const newLista = [...this.listaAutoResposta]
      const lista = newLista.map(i => {
        if (i.id === etapa.idAutoReply) {
          const idx = i.stepsReply.findIndex(step => step.id === etapa.id)
          if (idx > -1) {
            i.stepsReply[idx] = etapa
          }
        }
        return i
      })
      this.listaAutoResposta = [...lista]
    },
    editarEtapaAutoResposta (autoResposta, etapa) {
      this.autoReply = autoResposta
      this.etapaAutoRespostaEdicao = etapa
      this.modalEtapaAutoResposta = true
    },
    deletarEtapaAutoResposta (autoResposta, etapa) {
      const dataParams = {
        id: etapa.id,
        idAutoReply: autoResposta.id
      }
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Etapa "ID: ${etapa.id}"?`,
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
        DeletarEtapaResposta(dataParams)
          .then(res => {
            let newLista = [...this.listaAutoResposta]
            newLista = newLista.map(a => {
              if (a.id === etapa.idAutoReply) {
                const steps = a.stepsReply.filter(s => s.id !== etapa.id)
                a.stepsReply = steps
              }
              return a
            })
            this.listaAutoResposta = [...newLista]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Etapa ${etapa.id} deletada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('Não é possível deletar a etapa', error)
          })
        this.loading = false
      })
    },
    criarAcaoEtapa (autoReply, etapa) {
      this.autoReply = autoReply
      this.etapaAutoRespostaEdicao = etapa
      this.modalAcaoEtapa = true
    },
    editarAcaoEtapa (autoReply, etapa, acao) {
      this.autoReply = autoReply
      this.etapaAutoRespostaEdicao = etapa
      this.acaoEtapaEdicao = acao
      this.modalAcaoEtapa = true
    },
    deletarAcaoEtapa (autoReply, etapa, acao) {
      this.autoReply = autoReply
      this.etapaAutoRespostaEdicao = etapa
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Ação de "Chave: ${acao.words}"?`,
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
        DeletarAcaoEtapa(acao)
          .then(res => {
            const newLista = [...this.listaAutoResposta]
            const lista = newLista.map(i => {
              if (i.id === this.autoReply.id) {
                i.stepsReply.forEach(element => {
                  if (element.id === acao.stepReplyId) {
                    const el = element.stepsReplyAction.filter(a => a.id !== acao.id)
                    element.stepsReplyAction = [...el]
                  }
                })
              }
              return i
            })
            this.listaAutoResposta = [...lista]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Ação Etapa ${etapa.id} deletada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
          .catch(error => {
            console.error(error)
            this.$notificarErro('Não é possível deletar a ação da etapa', error)
          })
        this.loading = false
      })
    },
    async listarUsuarios () {
      const { data } = await ListarUsuarios(this.params)
      this.usuarios = data.users
    },
    acaoEditada (acao) {
      const newLista = [...this.listaAutoResposta]
      const lista = newLista.map(i => {
        if (i.id === this.autoReply.id) {
          i.stepsReply.forEach(element => {
            if (element.id === acao.stepReplyId) {
              const idx = element.stepsReplyAction.findIndex(action => action.id === acao.id)
              if (idx) {
                element.stepsReplyAction[idx] = acao
              }
            }
          })
        }
        return i
      })
      this.listaAutoResposta = [...lista]
    },
    acaoCriada (acao) {
      const newLista = [...this.listaAutoResposta]
      const lista = newLista.map(i => {
        if (i.id === this.autoReply.id) {
          i.stepsReply.forEach(element => {
            if (element.id === acao.stepReplyId) {
              if (!Array.isArray(element.stepsReplyAction)) {
                element.stepsReplyAction = []
              }
              element.stepsReplyAction.push(acao)
            }
          })
        }
        return i
      })
      this.listaAutoResposta = [...lista]
    }
  },
  mounted () {
    this.listarFilas()
    this.listarUsuarios()
    this.listarAutoReply()
  }
}
</script>

<style lang="scss" scoped>
</style>
