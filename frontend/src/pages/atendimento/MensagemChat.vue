<template>
  <div class="q-pa-md">
    <transition-group
      appear
      enter-active-class="animated fadeIn"
      leave-active-class="animated fadeOut"
    >
      <template v-for="(mensagem, index) in mensagens">
        <hr
          :key="'hr-'+index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index -1].createdAt)"
        >
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div
            :key="`ref-${mensagem.createdAt}`"
            ref="lastMessageRef"
            id="lastMessageRef"
            style="float: 'left', background: 'black', clear: 'both'"
          />
        </template>
        <q-chat-message
          size="5"
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          :bg-color="mensagem.fromMe ? 'teal-2' : 'white' "
        >
          <div :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''">
            <div
              v-if="mensagem.isDeleted"
              class="text-italic"
            > Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.</div>
            <div
              v-if="isGroupLabel(mensagem)"
              class="q-mb-sm"
              style="display: flex; color: rgb(59 23 251); fontWeight: 500;"
            >
              {{ isGroupLabel(mensagem) }}
            </div>
            <div
              v-if="mensagem.quotedMsg"
              :class="{'textContentItem': !mensagem.isDeleted, 'textContentItemDeleted': mensagem.isDeleted }"
            >
              <MensagemRespondida :mensagem="mensagem" />
            </div>
            <q-btn
              v-if="!mensagem.isDeleted"
              class="absolute-top-right mostar-btn-opcoes-chat"
              dense
              flat
              ripple
              round
              icon="mdi-chevron-down"
            >
              <q-menu
                square
                auto-close
                anchor="bottom left"
                self="top left"
              >
                <q-list style="min-width: 100px">
                  <q-item
                    clickable
                    @click="citarMensagem(mensagem)"
                  >
                    <q-item-section>Responder</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item
                    @click="deletarMenssagem(mensagem)"
                    clickable
                    v-if="mensagem.fromMe"
                  >
                    <q-item-section>Deletar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon
              v-if="mensagem.fromMe"
              class="absolute-bottom-right q-pr-xs q-pb-xs"
              :name="ackIcons[mensagem.ack]"
              size="1.2em"
              :color="mensagem.ack >= 3 ? 'green-4' : ''"
            />
            <template v-if="mensagem.mediaType === 'audio'">
              <audio
                class="q-mt-md full-width"
                controls
              >
                <source
                  :src="mensagem.mediaUrl"
                  type="audio/ogg"
                />
              </audio>
            </template>
            <template v-if="mensagem.mediaType === 'vcard'">
              <q-btn
                type="a"
                color="black"
                outline
                dense
                class="q-px-sm text-center"
                download="vCard"
                :href="`data:text/x-vcard;charset=utf-8;base64,${returnCardContato(mensagem.body)}`"
              >
                Download Contato
              </q-btn>
            </template>
            <template v-if="mensagem.mediaType === 'image'">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                @click="urlMedia=mensagem.mediaUrl;abrirModalImagem=true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                style="height: 140px; width: 100%"
                class="q-mt-md"
              />
              <VueEasyLightbox
                moveDisabled
                :visible="abrirModalImagem"
                :imgs="urlMedia"
                :index="mensagem.ticketId || 1"
                @hide="abrirModalImagem = false"
              />
            </template>
            <template v-if="mensagem.mediaType === 'video'">
              <video
                :src="mensagem.mediaUrl"
                controls
                class="q-mt-md"
                style="objectFit: cover;
                  width: 100%;
                  height: 200px;
                  borderTopLeftRadius: 8px;
                  borderTopRightRadius: 8px;
                  borderBottomLeftRadius: 8px;
                  borderBottomRightRadius: 8px;
                "
              />
            </template>
            <template v-if="mensagem.mediaType === 'application'">
              <q-btn
                type="a"
                color="primary"
                outline
                dense
                class="q-px-sm text-center"
                target="_blank"
                :href="mensagem.mediaUrl"
              >
                Download
              </q-btn>
            </template>
            <div
              v-linkified
              v-if="mensagem.mediaType !== 'vcard'"
              :class="{'q-mt-sm': mensagem.mediaType !== 'chat'}"
              class="q-message-container row items-end no-wrap"
            >
              <div v-html="farmatarMensagemWhatsapp(mensagem.body)">
              </div>
            </div>
          </div>
        </q-chat-message>

      </template>
    </transition-group>
  </div>
</template>

<script>

import mixinCommon from './mixinCommon'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida'
const downloadImageCors = axios.create({
  baseURL: process.env.API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})

import { DeletarMensagem } from 'src/service/tickets'
export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagens: {
      type: Array,
      default: () => []
    },
    replyingMessage: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      abrirModalImagem: false,
      urlMedia: '',

      ackIcons: { // Se ACK == 3 ou 4 entao color green
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all'
      }
    }
  },
  components: {
    VueEasyLightbox,
    MensagemRespondida
  },
  methods: {
    isGroupLabel (mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    returnCardContato (str) {
      return btoa(str)
    },
    async buscarImageCors (imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob'
        })
        const url = window.URL.createObjectURL(
          new Blob([data], { type: headers['content-type'] })
        )
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$q.notify({
          message: JSON.stringify(error.response),
          type: 'negative',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      this.loading = false
    },
    citarMensagem (mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      this.$root.$emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    deletarMenssagem (mensagem) {
      const data = { ...mensagem }
      this.$q.dialog({
        title: 'Atenção!! Deseja realmente deletar a mensagem? ',
        message: 'Mensagens antigas não serão apagadas no whatsapp.',
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
        DeletarMensagem(data)
          .then(res => {
            this.loading = false
          })
          .catch(error => {
            this.loading = false
            console.error(error)
          })
      }).onCancel(() => {
      })
    }
  },
  mounted () {
    this.scrollToBottom()
  },
  destroyed () {
  }
}
</script>

<style lang="scss">
.q-message-text {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2), 0 1px 1px rgba(0, 0, 0, 0.14),
    0 2px 1px -1px rgba(0, 0, 0, 0.12);
}
</style>
