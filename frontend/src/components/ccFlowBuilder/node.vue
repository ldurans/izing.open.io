<template>
  <div
    ref="node"
    :style="nodeContainerStyle"
    @click="clickNode"
    @mouseup="changeNodeSite"
    :class="nodeContainerClass"
    class="nodeStyle text-body1"
  >
    <div
      class="ef-node-text"
      :show-overflow-tooltip="true"
    >
      <q-icon
        size="20px"
        :name="node.ico"
        :class="nodeIcoClass"
        class="absolute-top-left"
      />
      {{node.name}}
    </div>
    <div class="ef-node-right-ico">
      <i
        class="el-icon-circle-check el-node-state-success"
        v-show="node.state === 'success'"
      ></i>
      <i
        class="el-icon-circle-close el-node-state-error"
        v-show="node.state === 'error'"
      ></i>
      <i
        class="el-icon-warning-outline el-node-state-warning"
        v-show="node.state === 'warning'"
      ></i>
      <i
        class="el-icon-loading el-node-state-running"
        v-show="node.state === 'running'"
      ></i>
    </div>

  </div>
</template>

<script>
export default {
  props: {
    node: Object,
    activeElement: Object
  },

  data () {
    return {
      expanded: true
    }
  },
  computed: {
    nodeContainerClass () {
      return {
        'ef-node-container': true,
        'border-left-exception': this.node.type === 'exception',
        'ef-node-active shadow-8 bg-blue-3 text-white': this.activeElement.type !== 'line' ? this.activeElement.id === this.node.id : false
      }
    },
    nodeContainerStyle () {
      return {
        top: this.node.top,
        left: this.node.left,
        ...this.node.style
      }
    },
    nodeIcoClass () {
      var nodeIcoClass = {}
      nodeIcoClass[this.node.ico] = true
      nodeIcoClass['flow-node-drag'] = !this.node.viewOnly
      return nodeIcoClass
    }
  },
  methods: {
    clickNode () {
      this.$emit('clickNode', this.node.id)
    },
    changeNodeSite () {
      if (this.node.left == this.$refs.node.style.left && this.node.top == this.$refs.node.style.top) {
        return
      }
      this.$emit('changeNodeSite', {
        id: this.node.id,
        left: this.$refs.node.style.left,
        top: this.$refs.node.style.top
      })
    }
  }
}
</script>

<style>
.nodeStyle {
  min-height: 80px !important;
  border-left: 5px solid #0288d1 !important;
}
.border-left-exception {
  border-left: 5px solid red !important;
}
.ef-node-active {
  transform: scale(1.1);
}
</style>
