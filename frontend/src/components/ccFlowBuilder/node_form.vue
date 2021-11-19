<template>
  <div class="q-pa-md">
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
                class="text-center q-pa-sm "
                v-show="type === 'node'"
              >
                <div class="row col justify-center">
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
                        <div class="full-width text-left">
                          <q-btn
                            round
                            dense
                            disable
                            color="black"
                            :label="idx + 1"
                            style="margin-bottom: -25px; z-index: 999"
                            @click="removeItem(element)"
                          />
                          <q-separator style="margin-bottom: -10px;" />
                        </div>
                        <div class="full-width text-right">
                          <q-btn
                            round
                            dense
                            icon="mdi-close"
                            flat
                            color="negative"
                            class="bg-padrao"
                            style="margin-bottom: -10\px; z-index: 999"
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
            <q-tab-panel name="condicoes">
              <div class="text-h6">Alarms</div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
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
import { cloneDeep } from 'lodash'
import Message from './message'
import ImageField from './imageField'
export default {
  components: {
    Message,
    ImageField
  },
  data () {
    return {
      visible: true,
      tabNodeForm: 'interacoes',
      elements: [],
      fields: [
        {
          name: 'Message',
          data: ''
        },
        {
          name: 'ImageField',
          data: ''
        }
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
      this.node.interactions.push({ name: 'Message', data: '', id: this.gerarUID() })
    },
    addImageField () {
      this.node.interactions.push({ name: 'ImageField', data: '', id: this.gerarUID() })
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
          this.node = cloneDeep(node)
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
