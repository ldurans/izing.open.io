<template>
  <div v-if="easyFlowVisible"
    :class="{
      'fullscreen bg-white': isFullScreen,
      'flowHeightDefault': !isFullScreen
    }">
    <q-toolbar class="text-grey-8 ">
      <q-toolbar-title>
        <div class="text-h6">{{ data.name }}</div>
      </q-toolbar-title>
      <q-btn round
        flat
        icon="mdi-delete"
        @click="deleteElement"
        :disabled="!this.activeElement.type || ['start', 'exception'].includes(this.activeElement.type)"></q-btn>
      <q-separator inset
        spaced
        vertical />
      <!-- <q-btn
        round
        flat
        icon="mdi-download"
        @click="downloadData"
      ></q-btn> -->
      <q-btn round
        flat
        :icon="isFullScreen ? 'mdi-fullscreen-exit' : 'mdi-fullscreen'"
        @click="isFullScreen = !isFullScreen" />
      <!-- <div class="q-gutter-md q-mx-md">
        <q-btn
          type="info"
          @click="dataInfo"
          size="mini"
        >Informação</q-btn>
        <q-btn
          type="primary"
          @click="dataReloadA"
          size="mini"
          icon="mdi-refresh"
        >Processo A</q-btn>
      </div> -->
    </q-toolbar>
    <q-separator color="text-grey-3" />
    <div class="q-mt-sm"
      style="display: flex; height: calc(100% - 60px);">
      <!-- <div style="width: 230px;border-right: 1px solid #dce3e8;">
        <node-menu
          @addNode="addNode"
          ref="nodeMenu"
        ></node-menu>
      </div> -->
      <div id="efContainer"
        ref="efContainer"
        class="container"
        v-flowDrag>
        <template v-for="node in data.nodeList">
          <flow-node :id="node.id"
            :key="node.id"
            :node="node"
            :activeElement="activeElement"
            @changeNodeSite="changeNodeSite"
            @nodeRightMenu="nodeRightMenu"
            @clickNode="clickNode">
          </flow-node>
        </template>
        <!-- Forçar área de construção -->
        <div style="position:absolute;top: 2000px;left: 2000px;">&nbsp;</div>
      </div>
      <!-- Configuração node -->
      <div style="width: 500px; border-left: 1px solid #dce3e8;">
        <flow-node-form ref="nodeForm"
          @setLineLabel="setLineLabel"
          @repaintEverything="repaintEverything"
          :filas="cDataFlow.filas"
          :usuarios="cDataFlow.usuarios"
          :nodesList="data"
          @addNode="addNode"
          @deleteLine="deleteLine"
          @addNewLineCondition="addNewLineCondition"
          @saveFlow="saveFlow">
        </flow-node-form>
      </div>
    </div>
    <!-- Visualização Resultado -->
    <flow-info v-if="flowInfoVisible"
      ref="flowInfo"
      :data="data"></flow-info>
    <flow-help v-if="flowHelpVisible"
      ref="flowHelp"></flow-help>
  </div>

</template>

<script>
import draggable from 'vuedraggable'
// import jsPlumb from './jsplumb.js'
// 使用修改后的jsplumb
import './jsplumb'
import { easyFlowMixin } from './mixins'
import flowNode from './node'
import nodeMenu from './node_menu'
import FlowInfo from './info'
import FlowHelp from './help'
import FlowNodeForm from './node_form'
import { merge, cloneDeep } from 'lodash'
import './index.css'
import { uid } from 'quasar'

import { UpdateChatFlow } from '../../service/chatFlow'

export default {
  data () {
    return {
      isFullScreen: false,
      // jsPlumb 实例
      jsPlumb: null,
      // 控制画布销毁
      easyFlowVisible: true,
      // 控制流程数据显示与隐藏
      flowInfoVisible: false,
      // 是否加载完毕标志位
      loadEasyFlowFinish: false,
      flowHelpVisible: false,
      // 数据
      data: {},
      // Elemento ativo para modificação
      activeElement: {
        // node, line
        type: undefined,
        nodeId: undefined,
        sourceId: undefined,
        targetId: undefined
      },
      zoom: 0.5
    }
  },
  props: {
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    }
  },
  // 一些基础配置移动该文件中
  mixins: [easyFlowMixin],
  components: {
    // eslint-disable-next-line vue/no-unused-components
    draggable, flowNode, nodeMenu, FlowInfo, FlowNodeForm, FlowHelp
  },
  directives: {
    flowDrag: {
      bind (el, binding, vnode, oldNode) {
        if (!binding) {
          return
        }
        el.onmousedown = (e) => {
          if (e.button == 2) {
            // 右键不管
            return
          }
          //  鼠标按下，计算当前原始距离可视区的高度
          let disX = e.clientX
          let disY = e.clientY
          el.style.cursor = 'move'

          document.onmousemove = function (e) {
            // 移动时禁止默认事件
            e.preventDefault()
            const left = e.clientX - disX
            disX = e.clientX
            el.scrollLeft += -left

            const top = e.clientY - disY
            disY = e.clientY
            el.scrollTop += -top
          }

          document.onmouseup = function (e) {
            el.style.cursor = 'auto'
            document.onmousemove = null
            document.onmouseup = null
          }
        }
      }
    }
  },
  computed: {
    cDataFlow () {
      return this.$store.state.chatFlow
    }
  },
  methods: {
    getUUID () {
      return uid()
    },
    // updateLineNodes (node) {
    //   this.jsPlumb.repaintEverything()
    // },
    addNewLineCondition (from, to, oldTo) {
      if (!this.jsPlumpConsist({ sourceId: from, targetId: to })) {
        return
      }
      const connParam = {
        source: from,
        target: to,
        paintStyle: { strokeWidth: 3, stroke: '#8db1dd' }
      }
      this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      if (oldTo) {
        const conn = this.jsPlumb.getConnections({
          source: from,
          target: oldTo
        })[0]
        this.jsPlumb.deleteConnection(conn)
      }
      this.clickNode(from)
    },
    saveFlow () {
      const data = {
        ...this.cDataFlow.flow,
        flow: this.data
      }
      UpdateChatFlow(data)
        .then(res => {
          this.$notificarSucesso('Fluxo salvo!')
        })
        .catch(error => {
          console.error(error)
          this.$notificarErro(error)
        })
    },
    jsPlumpConsist (evt) {
      const from = evt.sourceId
      const to = evt.targetId
      if (from === to) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Não é possível conectar o elemento a si mesmo.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return false
      }
      if (this.hasLine(from, to)) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Não é possível realizar loop entre os elementos.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return false
      }
      if (this.hashOppositeLine(from, to)) {
        this.$q.notify({
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 2500,
          message: 'Não é possível realizar loop entre os elementos.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return false
      }
      this.$notificarSucesso('Conexão realizada.')
      return true
    },
    jsPlumbInit () {
      this.jsPlumb.ready(() => {
        // 导入默认配置
        this.jsPlumb.importDefaults(this.jsplumbSetting)
        // 会使整个jsPlumb立即重绘。
        this.jsPlumb.setSuspendDrawing(false, true)
        // 初始化节点
        this.loadEasyFlow()
        // 单点击了连接线, https://www.cnblogs.com/ysx215/p/7615677.html
        this.jsPlumb.bind('click', (conn, originalEvent) => {
          this.activeElement.type = 'line'
          this.activeElement.sourceId = conn.sourceId
          this.activeElement.targetId = conn.targetId
          this.$refs.nodeForm.lineInit({
            from: conn.sourceId,
            to: conn.targetId,
            label: conn.getLabel()
          })
        })
        // 连线
        this.jsPlumb.bind('connection', (evt) => {
          if (!this.jsPlumpConsist(evt)) {
            return
          }
          const from = evt.source.id
          const to = evt.target.id
          if (this.loadEasyFlowFinish) {
            this.data.lineList.push({ from: from, to: to, label: 'Valor' })
            // const label = 'Chave'
            const label = null
            this.$refs.nodeForm.lineInit({
              from,
              to,
              label
            })
            this.setLineLabel(from, to, label)
          }
        })

        // 删除连线回调
        this.jsPlumb.bind('connectionDetached', (evt) => {
          this.deleteLine(evt.sourceId, evt.targetId)
        })

        // 改变线的连接节点
        this.jsPlumb.bind('connectionMoved', (evt) => {
          this.changeLine(evt.originalSourceId, evt.originalTargetId)
        })

        // 连线右击
        this.jsPlumb.bind('contextmenu', (evt) => {
          console.log('contextmenu', evt)
        })

        // 连线
        this.jsPlumb.bind('beforeDrop', (evt) => {
          return this.jsPlumpConsist(evt)
        })

        // beforeDetach
        this.jsPlumb.bind('beforeDetach', (evt) => {
          console.log('beforeDetach', evt)
        })
        this.jsPlumb.setContainer(this.$refs.efContainer)
      })
    },

    loadEasyFlow () {
      // 初始化节点
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        // 设置源点，可以拖出线连接其他节点
        this.jsPlumb.makeSource(node.id, merge(this.jsplumbSourceOptions, {}))
        // // 设置目标点，其他源点拖出的线可以连接该节点
        this.jsPlumb.makeTarget(node.id, this.jsplumbTargetOptions)
        if (!node.viewOnly) {
          this.jsPlumb.draggable(node.id, {
            containment: 'parent',
            stop: function (el) {
              // 拖拽节点结束后的对调
              console.log('arraste para o final: ', el)
            }
          })
        }
      }
      // 初始化连线
      for (let i = 0; i < this.data.lineList.length; i++) {
        const line = this.data.lineList[i]
        var connParam = {
          source: line.from,
          target: line.to,
          label: line.label ? line.label : '',
          connector: line.connector ? line.connector : '',
          anchors: line.anchors ? line.anchors : undefined,
          // paintStyle: line.paintStyle ? line.paintStyle : undefined
          paintStyle: { strokeWidth: 3, stroke: '#8db1dd' }
        }
        this.jsPlumb.connect(connParam, this.jsplumbConnectOptions)
      }
      this.$nextTick(function () {
        this.loadEasyFlowFinish = true
      })
    },

    setLineLabel (from, to, label) {
      var conn = this.jsPlumb.getConnections({
        source: from,
        target: to
      })[0]
      if (!label || label === '') {
        conn.removeClass('flowLabel')
        conn.addClass('emptyFlowLabel')
      } else {
        conn.addClass('flowLabel')
      }
      conn.setLabel({
        label: label
      })

      conn.setPaintStyle({ strokeWidth: 3, stroke: '#8db1dd' })

      this.data.lineList.forEach(function (line) {
        if (line.from == from && line.to == to) {
          line.label = label
        }
      })
    },

    deleteElement () {
      if (this.activeElement.type === 'node') {
        this.deleteNode(this.activeElement)
      } else if (this.activeElement.type === 'line') {
        this.$q.dialog({
          title: 'Atenção!!',
          message: 'Deseja realmente deletar a linha selecionada?',
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
          var conn = this.jsPlumb.getConnections({
            source: this.activeElement.sourceId,
            target: this.activeElement.targetId
          })[0]
          this.jsPlumb.deleteConnection(conn)
        })
      }
    },

    deleteLine (from, to) {
      this.data.lineList = this.data.lineList.filter(function (line) {
        if (line.from == from && line.to == to) {
          return false
        }
        return true
      })
    },

    changeLine (oldFrom, oldTo) {
      this.deleteLine(oldFrom, oldTo)
    },

    changeNodeSite (data) {
      for (var i = 0; i < this.data.nodeList.length; i++) {
        const node = this.data.nodeList[i]
        if (node.id === data.id) {
          node.left = data.left
          node.top = data.top
        }
      }
    },

    addNode (evt, nodeMenu, mousePosition) {
      var screenX = evt.originalEvent.clientX, screenY = evt.originalEvent.clientY
      const efContainer = this.$refs.efContainer
      var containerRect = efContainer.getBoundingClientRect()
      var left = screenX, top = screenY
      // Verifica se deseja arrastar para o container
      if (left < containerRect.x || left > containerRect.width + containerRect.x || top < containerRect.y || containerRect.y > containerRect.y + containerRect.height) {
        this.$notificarErro('Arraste o elemento para a tela.')
        return
      }
      left = left - containerRect.x + efContainer.scrollLeft
      top = top - containerRect.y + efContainer.scrollTop
      // Centralizar
      left -= 85
      top -= 16
      var nodeId = this.getUUID()
      // Gerar nome dinâmico
      var origName = nodeMenu.name
      var nodeName = origName
      var index = 1
      while (index < 10000) {
        var repeat = false
        for (var i = 0; i < this.data.nodeList.length; i++) {
          const node = this.data.nodeList[i]
          if (node.name === nodeName) {
            nodeName = origName + index
            repeat = true
          }
        }
        if (repeat) {
          index++
          continue
        }
        break
      }
      var node = {
        id: nodeId,
        name: nodeName,
        type: nodeMenu.type,
        left: left + 'px',
        top: top + 'px',
        ico: nodeMenu.ico,
        state: 'success',
        actions: nodeMenu?.actions,
        conditions: nodeMenu?.conditions,
        interactions: nodeMenu?.interactions
      }
      /**
               * 这里可以进行业务判断、是否能够添加该节点
               */
      this.data.nodeList.push(node)
      this.$nextTick(function () {
        this.jsPlumb.makeSource(nodeId, this.jsplumbSourceOptions)
        this.jsPlumb.makeTarget(nodeId, this.jsplumbTargetOptions)
        this.jsPlumb.draggable(nodeId, {
          containment: 'parent',
          stop: function (el) {
            // 拖拽节点结束后的对调
            console.log('arastado para o final: ', el)
          }
        })
      })
    },

    deleteNode (node) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar o elemento (${node.name})?`,
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
        this.data.nodeList = this.data.nodeList.filter(n => n.id !== node.id)
        this.$nextTick(function () {
          this.jsPlumb.removeAllEndpoints(node.id)
        })
      })

      return true
    },

    clickNode (nodeId) {
      const node = this.data.nodeList.find(n => n.id === nodeId)
      // this.activeElement.type = 'node'
      // this.activeElement.id = nodeId
      this.activeElement = node
      this.$refs.nodeForm.nodeInit(this.data, nodeId)
    },

    hasLine (from, to) {
      for (var i = 0; i < this.data.lineList.length; i++) {
        var line = this.data.lineList[i]
        if (line.from === from && line.to === to) {
          return true
        }
      }
      return false
    },
    // 是否含有相反的线
    hashOppositeLine (from, to) {
      return this.hasLine(to, from)
    },
    nodeRightMenu (nodeId, evt) {
      this.menu.show = true
      this.menu.curNodeId = nodeId
      this.menu.left = evt.x + 'px'
      this.menu.top = evt.y + 'px'
    },
    repaintEverything () {
      this.jsPlumb.repaint()
    },
    dataInfo () {
      this.flowInfoVisible = true
      this.$nextTick(function () {
        this.$refs.flowInfo.init()
      })
    },
    dataReload (data) {
      this.easyFlowVisible = false
      this.data.nodeList = []
      this.data.lineList = []
      this.$nextTick(() => {
        data = cloneDeep(data)
        this.easyFlowVisible = true
        this.data = data
        this.$nextTick(() => {
          // eslint-disable-next-line no-undef
          this.jsPlumb = jsPlumb.getInstance()
          this.$nextTick(() => {
            this.jsPlumbInit()
          })
        })
      })
    },
    zoomAdd () {
      if (this.zoom >= 1) {
        return
      }
      this.zoom = this.zoom + 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    zoomSub () {
      if (this.zoom <= 0) {
        return
      }
      this.zoom = this.zoom - 0.1
      this.$refs.efContainer.style.transform = `scale(${this.zoom})`
      this.jsPlumb.setZoom(this.zoom)
    },
    // 下载数据
    downloadData () {
      this.$q.dialog({
        title: 'Oi!!',
        message: 'Confirma o download?',
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
        var datastr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.data, null, '\t'))
        var downloadAnchorNode = document.createElement('a')
        downloadAnchorNode.setAttribute('href', datastr)
        downloadAnchorNode.setAttribute('download', 'data.json')
        downloadAnchorNode.click()
        downloadAnchorNode.remove()
        this.$notificarSucesso('Baixando, por favor aguarde...')
      })
    },
    openHelp () {
      this.flowHelpVisible = true
      this.$nextTick(function () {
        this.$refs.flowHelp.init()
      })
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.jsPlumb = jsPlumb.getInstance()
    this.$nextTick(() => {
      // 默认加载流程A的数据、在这里可以根据具体的业务返回符合流程数据格式的数据即可
      this.dataReload(this.cDataFlow.flow.flow)
    })
  }
}
</script>
