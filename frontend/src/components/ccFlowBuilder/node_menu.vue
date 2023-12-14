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
      draggableOptions: {
        preventOnFilter: false,
        sort: false,
        disabled: false,
        ghostClass: 'tt',
        forceFallback: true
      },
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
              style: {}
            }, {
              id: '12',
              type: 'task',
              name: 'Chamada de interface',
              ico: 'mdi-speedometer-medium',
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
              style: {}
            }, {
              id: '22',
              type: 'over',
              name: 'Limpeza de dados',
              ico: 'mdi-close',
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
        mousePosition.left = event.layerX
        mousePosition.top = event.clientY - 50
        event.preventDefault()
        event.stopPropagation()
      }
    }
  },
  methods: {
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
    move (evt, a, b, c) {
      var type = evt.item.attributes.type.nodeValue
      this.nodeMenu = this.getMenuByType(type)
    },
    end (evt, e) {
      this.$emit('addNode', evt, this.nodeMenu, mousePosition)
    },
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
