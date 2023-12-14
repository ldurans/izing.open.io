<template>
  <q-item
    :key="wbot.id"
    v-ripple
    clickable
    dense
    class="full-width full-height "
  >
    <q-item-section avatar>
      <q-icon
        :color="status[wbot.status].color"
        size="2.5em"
        :name="status[wbot.status].icon"
      />
    </q-item-section>
    <q-item-section>
      <q-item-label lines="1">
        Nome: {{ wbot.name }}
      </q-item-label>
      <q-item-label
        caption
        lines="1"
      >
        {{ status[wbot.status].status }}
      </q-item-label>
      <q-item-label
        caption
        lines="3"
        v-if="isIconStatusMenu"
      >
        {{ status[wbot.status].description }}
      </q-item-label>
    </q-item-section>
    <q-tooltip
      v-if="!isIconStatusMenu"
      content-class="bg-light-blue-1 text-black q-pa-sm shadow-4"
    >
      <span class="text-weight-medium"> {{ status[wbot.status].description }} </span>
    </q-tooltip>
  </q-item>
</template>

<script>
export default {
  name: 'ItemStatusWhatsapp',
  props: {
    wbot: {
      type: Object,
      default: () => { }
    },
    isIconStatusMenu: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      status: {
        PAIRING: {
          color: 'info',
          icon: 'mdi-cellphone-wireles',
          status: 'Emparelhando',
          description: 'Emparelhando sessão Whatsapp.'
        },
        TIMEOUT: {
          color: 'warning',
          icon: 'mdi-timer-outline',
          status: 'Timeout',
          description: 'As tentativas de conexão falharam. Verifique a internet no celular.'
        },
        DISCONNECTED: {
          color: 'negative',
          icon: 'mdi-wifi-strength-1-alert',
          status: 'Desconectado',
          description: 'Verifique se o celular do Whatsapp possui conexão com internet.'
        },
        qrcode: {
          color: 'positive',
          icon: 'mdi-qrcode-scan',
          status: 'Qr Code',
          description: 'Necessário Ler o Qr Code'
        },
        DESTROYED: {
          color: 'primary',
          icon: 'mdi-close-network-outline',
          status: 'Inativo',
          description: 'Necessário iniciar a conexão com o Whatsapp e Ler o Qr Code.'
        },
        CONFLICT: {
          color: 'warning',
          icon: 'mdi-equal',
          status: 'Conflito',
          description: 'Whatsapp Web sendo utilizado.'
        },
        OPENING: {
          color: 'black',
          icon: 'mdi-connection',
          status: 'Conectando',
          description: 'Iniciando conexão com o Whatsapp.'
        },
        CONNECTED: {
          color: 'green-8',
          icon: 'mdi-wifi-arrow-up-down',
          status: 'Conectado',
          description: 'Conexão estabelecida com sucesso!'
        }
      }
    }
  }
}
</script>

<style lang="scss" >
.notification-box {
  text-align: center;
}
.notification-bell {
  animation: bell 1s 1s both infinite;
}
.notification-bell * {
  display: block;
  margin: 0 auto;
  background-color: $negative;
  box-shadow: 0px 0px 10px $negative;
}
.bell-top {
  width: 6px;
  height: 6px;
  border-radius: 3px 3px 0 0;
}
.bell-middle {
  width: 20px;
  height: 15px;
  margin-top: -1px;
  border-radius: 12.5px 12.5px 0 0;
}
.bell-bottom {
  position: relative;
  z-index: 0;
  width: 25px;
  height: 4px;
}
.bell-bottom::before,
.bell-bottom::after {
  content: "";
  position: absolute;
  top: -4px;
}
.bell-bottom::before {
  left: 1px;
  border-bottom: 4px solid $negative;
  border-right: 0 solid transparent;
  border-left: 4px solid transparent;
}
.bell-bottom::after {
  right: 1px;
  border-bottom: 4px solid $negative;
  border-right: 4px solid transparent;
  border-left: 0 solid transparent;
}
.bell-rad {
  width: 8px;
  height: 4px;
  margin-top: 2px;
  border-radius: 0 0 4px 4px;
  animation: rad 1s 2s both infinite;
}
.notification-count {
  position: absolute;
  z-index: 1;
  top: -6px;
  right: -6px;
  width: 30px;
  height: 30px;
  line-height: 30px;
  font-size: 18px;
  border-radius: 50%;
  background-color: black;
  color: $negative;
  animation: zoom 3s 3s both infinite;
}
@keyframes bell {
  0% {
    transform: rotate(0);
  }
  10% {
    transform: rotate(30deg);
  }
  20% {
    transform: rotate(0);
  }
  80% {
    transform: rotate(0);
  }
  90% {
    transform: rotate(-30deg);
  }
  100% {
    transform: rotate(0);
  }
}
@keyframes rad {
  0% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(6px);
  }
  20% {
    transform: translateX(0);
  }
  80% {
    transform: translateX(0);
  }
  90% {
    transform: translateX(-6px);
  }
  100% {
    transform: translateX(0);
  }
}
@keyframes zoom {
  0% {
    opacity: 0;
    transform: scale(0);
  }
  10% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 1;
  }
  51% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}
@keyframes moon-moving {
  0% {
    transform: translate(-200%, 600%);
  }
  100% {
    transform: translate(800%, -200%);
  }
}
</style>
