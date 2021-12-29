<template>
  <q-dialog
    :value="abrirModalQR"
    @before-show="fetchSession(channel)"
    @hide="fecharModalQrModal"
    persistent
  >
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          Leia o QrCode para iniciar a sessão
          <q-btn
            round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal"
          />

        </div>
      </q-card-section>
      <q-card-section
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''"
      >
        <QrcodeVue
          v-if="qrCode"
          :value="qrCode"
          :size="300"
          level="H"
        />
        <span v-else>
          Aguardando o Qr Code
        </span>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>

import { RequestNewQrCode, GetWhatSession } from 'src/service/channels'
import QrcodeVue from 'qrcode.vue'
import openSocket from 'socket.io-client'
const token = JSON.parse(localStorage.getItem('token'))
const socket = openSocket(process.env.API, {
  query: { token },
  forceNew: true
})
const usuario = JSON.parse(localStorage.getItem('usuario'))

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
})

export default {
  name: 'ModalQrCode',
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      qrCode: null
    }
  },
  methods: {
    fecharModalQrModal () {
      this.$emit('update:abrirModalQR', false)
    },
    async fetchSession (channel) {
      const { data } = await GetWhatSession(channel.id)
      this.qrCode = data.qrcode
      this.handlerModalQrCode()
      if (!this.qrCode) {
        // setTimeout(() => {
        //   if (!this.qrCode) {
        //     this.$emit('modalQrCode:qrCodeInexistente')
        //   }
        // }, 3000)
        await RequestNewQrCode(channel.id)
      }
    },
    handlerModalQrCode () {
      socket.on(`${usuario.tenantId}:whatsappSession`, data => {
        if (data.action === 'update' && data.session.id === this.channel.id) {
          this.qrCode = data.session.qrcode
        }

        if (data.action === 'update' && data.session.status === 'CONNECTED') {
          this.fecharModalQrModal()
          this.$store.commit('UPDATE_WHATSAPPS', data.session)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
