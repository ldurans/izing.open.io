<template>
  <div class="q-px-md q-py-sm">
    <div class="row col q-mb-sm">
      <q-btn
        class="bg-padrao"
        flat
        color="primary"
        icon="mdi-plus"
        label="Nova Etapa"
        @click="addNode"
      />
    </div>
    <q-card class="fit">
      <div class="ef-node-form-header">
        Configuração Fluxo
      </div>
      <q-card-section>
        <div>
          <q-input
            outlined
            filled
            label="Nome"
            v-model="node.name"
            class="q-mb-md"
          />
          <q-separator
            inset=""
            class="q-mb-md"
          />

          <q-tabs
            v-model="tabNodeForm"
            narrow-indicator
            class="text-grey-8"
          >
            <q-tab
              name="interacoes"
              label="Interações"
            />
            <q-tab
              name="condicoes"
              label="Condições"
            />
            <q-tab
              name="acoes"
              label="Ações"
            />
          </q-tabs>
          <q-tab-panels
            v-model="tabNodeForm"
            animated
            keep-alive
            infinite
            class="q-pa-none rounded-borders"
          >
            <q-tab-panel
              class="q-pa-none"
              name="interacoes"
            >
              <div
                class="text-center "
                v-show="type === 'node'"
              >
                <div class="row q-mt-md col justify-center">
                  <q-btn
                    flat
                    icon="mdi-message-text-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addMessage"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar Mensagem
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    @click="addImageField"
                    icon="mdi-image"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar Imagem
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    icon="mdi-file-document-outline"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar um arquivo
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    icon="mdi-microphone"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                  >
                    <q-tooltip content-class="text-bold">
                      Enviar Áudio
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="row bg-grey-2 q-pa-sm q-my-md justify-center scroll"
                  style="height: calc(100vh - 500px)"
                >
                  <div class="col-xs-12">
                    <div
                      v-for="(element, idx) in this.node.interactions"
                      :key="element.id"
                      v-bind="element"
                    >
                      <div class="q-my-sm">
                        <div class="bg-white full-width row col justify-between ">
                          <q-btn
                            round
                            dense
                            disable
                            color="black"
                            :label="idx + 1"
                            style="z-index: 999; margin-bottom: -10px"
                          />
                          <q-btn
                            round
                            dense
                            icon="mdi-close"
                            flat
                            color="negative"
                            class="bg-padrao"
                            style="z-index: 999; margin-bottom: -10px"
                            @click="removeItem(element)"
                          />
                        </div>
                        <component
                          :is="element.name"
                          :element="element"
                        >
                        </component>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- <q-select
                  v-model="node.state"
                  placeholder="请选择"
                  :options="stateList"
                  option-label="label"
                  option-value="state"
                  outlined
                  label="Estado"
                />
                <hr class="q-mt-md">
                <q-btn
                  icon="mdi-close"
                  label="Redefinir"
                /> -->
                <q-btn
                  type="primary"
                  icon="mdi-content-save"
                  @click="save"
                  label="Salvar"
                />
              </div>
            </q-tab-panel>
            <q-tab-panel
              class="q-pa-none"
              name="condicoes"
            >
              <div v-show="type === 'node'">
                <div class="row q-mt-md col justify-end">
                  <q-btn
                    flat
                    icon="mdi-vector-polyline-plus"
                    class="bg-padrao btn-rounded q-mx-xs"
                    :color="$q.dark.isActive ? 'white' : ''"
                    @click="addCondiction"
                  >
                    <q-tooltip content-class="text-bold">
                      Nova condição
                    </q-tooltip>
                  </q-btn>
                </div>

                <div
                  style="height: calc(100vh - 500px)"
                  class="row bg-grey-2 q-pa-sm scroll q-mt-md col justify-start"
                >
                  <template v-for="(item, idx) in node.conditions">
                    <q-card
                      :key="item.id"
                      class="full-width q-my-sm"
                      style="height: 300px;"
                    >
                      <div class="full-width row col justify-between text-left q-pa-xs">
                        <q-btn
                          round
                          dense
                          disable
                          color="black"
                          :label="idx + 1"
                        />
                        <q-btn
                          round
                          dense
                          icon="mdi-close"
                          flat
                          color="negative"
                          class="bg-padrao"
                          style="z-index: 999"
                          @click="removeItem(element)"
                        />
                      </div>
                      <q-card-section class="q-pa-sm q-gutter-sm">
                        <q-select
                          outlined
                          dense
                          v-model="item.type"
                          :options="optionsSe"
                          label="Se"
                        />

                        <q-select
                          dense
                          label="Respostas"
                          outlined
                          v-model="item.condition"
                          use-input
                          use-chips
                          multiple
                          hide-dropdown-icon
                          input-debounce="0"
                          new-value-mode="add-unique"
                        />
                      </q-card-section>
                      <q-separator
                        inset
                        spaced
                      />
                      <q-card-section class="q-pa-sm">
                        <div class="text-bold q-px-sm"> Rotear para: </div>
                        <q-option-group
                          class="text-center"
                          inline
                          v-model="item.action"
                          :options="optionsAcao"
                          color="primary"
                        />
                        <div class="row q-mt-sm">
                          <div class="col">
                            <q-select
                              v-if="item.action === 0"
                              dense
                              outlined
                              class="full-width"
                              v-model="item.nextStepId"
                              :options="nodesList.nodeList"
                              option-label="name"
                              option-value="id"
                              label="Etapa"
                              map-options
                              emit-value
                              clearable
                              @input="item.queueId = null; item.userIdDestination = null"
                            />
                            <q-select
                              v-if="item.action === 1"
                              dense
                              outlined
                              class="full-width"
                              v-model="item.queueId"
                              :options="filas"
                              option-label="queue"
                              option-value="id"
                              label="Fila"
                              map-options
                              emit-value
                              clearable
                              @input="item.nextStepId = null; item.userIdDestination = null"
                            />
                            <q-select
                              v-if="item.action === 2"
                              dense
                              outlined
                              class="full-width"
                              v-model="item.userIdDestination"
                              :options="usuarios"
                              option-label="name"
                              option-value="id"
                              label="Usuário"
                              map-options
                              emit-value
                              clearable
                              @input="item.nextStepId = null; item.queueId = null"
                            />
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </template>

                </div>
              </div>
            </q-tab-panel>
            <q-tab-panel name="acoes">
              <div class="text-h6">Movies</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
            </q-tab-panel>
          </q-tab-panels>

          <div
            class="q-pa-sm q-gutter-md"
            v-show="type === 'line'"
          >
            <q-input
              outlined
              label="Chave"
              v-model="line.label"
            />
            <q-btn
              icon="mdi-close"
              label="Redefinir"
            />
            <q-btn
              type="primary"
              icon="mdi-content-save"
              @click="saveLine"
              label="Salvar"
            />
          </div>
          <!--            <div class="el-node-form-tag"></div>-->
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { uid } from 'quasar'
// import { cloneDeep } from 'lodash'
import MessageField from './messageField'
import ImageField from './imageField'
export default {
  components: {
    MessageField,
    ImageField
  },
  props: {
    nodesList: {
      type: Object,
      default: () => { }
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      visible: true,
      tabNodeForm: 'interacoes',
      elements: [],
      fields: [
        {
          name: 'MessageField',
          data: ''
        },
        {
          name: 'ImageField',
          data: ''
        }
      ],
      optionsAcao: [
        { value: 0, label: 'Etapa' },
        { value: 1, label: 'Fila' },
        { value: 2, label: 'Usuário' }
      ],
      optionsSe: [
        { label: 'Qualquer resposta', value: 'us' },
        { label: 'Respostas', value: 'r' }
      ],
      // node 或 line
      type: 'node',
      node: {},
      line: {},
      data: {},
      stateList: [{
        state: 'success',
        label: '成功'
      }, {
        state: 'warning',
        label: '警告'
      }, {
        state: 'error',
        label: '错误'
      }, {
        state: 'running',
        label: '运行中'
      }]
    }
  },
  methods: {
    gerarUID () {
      return uid()
    },
    addMessage () {
      this.node.interactions.push({ name: 'MessageField', data: '', id: this.gerarUID() })
    },
    addImageField () {
      this.node.interactions.push({ name: 'ImageField', data: '', id: this.gerarUID() })
    },
    addCondiction () {
      this.node.conditions.push({
        type: '',
        condiction: [],
        id: this.gerarUID()
      })
    },
    addNode(evt) {
      const nodeMenu = {
        id: 'nodeC',
        name: 'Boas vindas!',
        type: 'node',
        left: '26px',
        top: '201px',
        interactions: [],
        conditions: [],
        actions: []
        // ico: 'el-icon-present'
      }
      this.$emit('addNode', evt, {}, mousePosition)
    },
    removeItem (el) {
      const idx = this.node.interactions.findIndex(e => e.id === el.id)
      this.node.interactions.splice(idx, 1)
    },
    /**
     * 表单修改，这里可以根据传入的ID进行业务信息获取
     * @param data
     * @param id
     */
    nodeInit (data, id) {
      this.type = 'node'
      this.data = data
      data.nodeList.filter((node) => {
        if (node.id === id) {
          // this.node = cloneDeep(node)
          this.node = node
        }
      })
    },
    lineInit (line) {
      this.type = 'line'
      this.line = line
    },
    // 修改连线
    saveLine () {
      this.$emit('setLineLabel', this.line.from, this.line.to, this.line.label)
    },
    save () {
      this.data.nodeList.filter((node) => {
        if (node.id === this.node.id) {
          console.log('node', node)
          console.log('this node', this.node)
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.state = this.node.state
          node.state = this.node.actions
          node.state = this.node.conditions
          node.state = this.node.interactions
          // node
          this.$emit('repaintEverything')
        }
      })
    }
  }
}
</script>

<style>
.el-node-form-tag {
  position: absolute;
  top: 50%;
  margin-left: -15px;
  height: 40px;
  width: 15px;
  background-color: #fbfbfb;
  border: 1px solid rgb(220, 227, 232);
  border-right: none;
  z-index: 0;
}
</style>
