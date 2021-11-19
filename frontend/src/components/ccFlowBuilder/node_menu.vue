<template>
  <div
    class="flow-menu"
    ref="tool"
  >
    <div
      v-for="menu  in  menuList"
      :key="menu.id"
    >
      <span
        class="ef-node-pmenu"
        @click="menu.open = !menu.open"
      >
        <q-icon :name="menu.open ? 'mdi-menu-down': 'mdi-menu-up'" />&nbsp;{{menu.name}}
      </span>
      <ul
        v-show="menu.open"
        class="ef-node-menu-ul"
      >
        <draggable
          @end="end"
          @start="move"
          v-model="menu.children"
          :options="draggableOptions"
        >
          <li
            v-for="subMenu in menu.children"
            class="ef-node-menu-li"
            :key="subMenu.id"
            :type="subMenu.type"
          >
            <q-icon :name="subMenu.ico" /> {{subMenu.name}}
          </li>
        </draggable>
      </ul>
    </div>
  </div>
</template>
<script>
import draggable from 'vuedraggable'

var mousePosition = {
  left: -1,
  top: -1
}

export default {
  data () {
    return {
      activeNames: '1',
      // draggable配置参数参考 https://www.cnblogs.com/weixin186/p/10108679.html
      draggableOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        // 不使用H5原生的配置
        forceFallback: true
        // 拖拽的时候样式
        // fallbackClass: 'flow-node-draggable'
      },
      // 默认打开的左侧菜单的id
      defaultOpeneds: ['1', '2'],
      menuList: [
        {
          id: '1',
          type: 'group',
          name: 'Inicial',
          ico: 'mdi-play',
          open: true,
          children: [
            {
              id: '11',
              type: 'timer',
              name: 'Acesso de dados',
              ico: 'mdi-clock-outline',
              // 自定义覆盖样式
              style: {}
            }, {
              id: '12',
              type: 'task',
              name: 'Chamada de interface',
              ico: 'mdi-speedometer-medium',
              // 自定义覆盖样式
              style: {}
            }
          ]
        },
        {
          id: '2',
          type: 'group',
          name: 'Final',
          ico: 'mdi-pause',
          open: true,
          children: [
            {
              id: '21',
              type: 'end',
              name: 'Fim do processo',
              ico: 'mdi-arrow-right',
              // 自定义覆盖样式
              style: {}
            }, {
              id: '22',
              type: 'over',
              name: 'Limpeza de dados',
              ico: 'mdi-close',
              // 自定义覆盖样式
              style: {}
            }
          ]
        }
      ],
      nodeMenu: {}
    }
  },
  components: {
    draggable
  },
  created () {
    if (this.isFirefox()) {
      document.body.ondrop = function (event) {
        // 解决火狐浏览器无法获取鼠标拖拽结束的坐标问题
        mousePosition.left = event.layerX
        mousePosition.top = event.clientY - 50
        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
  methods: {
    // 根据类型获取左侧菜单对象
    getMenuByType (type) {
      for (let i = 0; i < this.menuList.length; i++) {
        const children = this.menuList[i].children
        for (let j = 0; j < children.length; j++) {
          if (children[j].type === type) {
            return children[j]
          }
        }
      }
    },
    // 拖拽开始时触发
    move (evt, a, b, c) {
      var type = evt.item.attributes.type.nodeValue
      this.nodeMenu = this.getMenuByType(type)
    },
    // 拖拽结束时触发
    end (evt, e) {
      this.$emit('addNode', evt, this.nodeMenu, mousePosition)
    },
    // 是否是火狐浏览器
    isFirefox () {
      var userAgent = navigator.userAgent
      if (userAgent.indexOf('Firefox') > -1) {
        return true
      }
      return false
    }
  }
}
</script>
