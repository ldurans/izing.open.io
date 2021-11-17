<template>
  <div>
    <div>
      <div class="ef-node-form-header">
        Configuração Fluxo
      </div>
      <div
        class="q-pa-sm q-gutter-md"
        v-show="type === 'node'"
      >
        <q-input
          outlined
          v-model="node.type"
          :disable="true"
          label="Tipo"
        />
        <q-input
          outlined
          label="Nome"
          v-model="node.name"
        />
        <q-input
          v-model="node.left"
          :disable="true"
          outlined
          label="Posição Esquerda"
        />
        <q-input
          v-model="node.top"
          :disable="true"
          outlined
          label="Posição Superior"
        />
        <q-input
          v-model="node.ico"
          outlined
          label="Ícone"
        />
        <q-select
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
        />
        <q-btn
          type="primary"
          icon="mdi-content-save"
          @click="save"
          label="Salvar"
        />
      </div>
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
  </div>

</template>

<script>
import { cloneDeep } from 'lodash'

export default {
  data () {
    return {
      visible: true,
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
          node.name = this.node.name
          node.left = this.node.left
          node.top = this.node.top
          node.ico = this.node.ico
          node.state = this.node.state
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
