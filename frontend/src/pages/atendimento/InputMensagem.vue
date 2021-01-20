<template>
  <div
    style="min-height: 80px"
    class="row bg-white justify-center items-start text-primary q-pt-md "
  >
    <q-btn
      round
      flat
      @click="abrirEnvioArquivo"
      icon="mdi-paperclip"
    >
      <q-tooltip>
        Enviar arquivo
      </q-tooltip>
    </q-btn>
    <q-btn
      round
      flat
      icon="mdi-emoticon-happy-outline"
    >
      <q-tooltip>
        Emoji
      </q-tooltip>
      <q-menu
        anchor="top right"
        self="bottom middle"
        :offset="[5, 40]"
      >
        <VEmojiPicker
          style="width: 40vw"
          :showSearch="false"
          :emojisByRow="20"
          labelSearch="Localizar..."
          lang="pt-BR"
          @select="onInsertSelectEmoji"
        />
      </q-menu>
    </q-btn>
    <q-input
      hide-bottom-space
      :disabled="ticketFocado.status !== 'open'"
      ref="inputEnvioMensagem"
      type="textarea"
      @keypress.enter.exact="() => textChat.trim().length ? enviarMensagem() : ''"
      v-show="!cMostrarEnvioArquivo"
      class="WAL__field col-grow"
      bg-color="blue-grey-1"
      placeholder="Digita sua mensagem"
      input-style="max-height: 30vh"
      autogrow
      rounded
      dense
      outlined
      v-model="textChat"
      :value="textChat"
      @paste="handleInputPaste"
      hint="Quebra linha/Parágrafo: Shift + Enter ||| Enviar Mensagem: Enter"
    />
    <!-- tamanho maximo por arquivo de 10mb -->
    <q-file
      ref="PickerFileMessage"
      v-show="cMostrarEnvioArquivo"
      v-model="arquivos"
      class="WAL__field col-grow "
      bg-color="blue-grey-1"
      input-style="max-height: 30vh"
      outlined
      use-chips
      multiple
      autogrow
      dense
      rounded
      :max-files="5"
      :max-file-size="10485760"
      accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
    />
    <q-btn
      ref="btnEnviarMensagem"
      @click="enviarMensagem"
      :disabled="ticketFocado.status !== 'open'"
      round
      flat
      icon="mdi-send"
      color="primary"
    >
      <q-tooltip>
        Enviar Mensagem
      </q-tooltip>
    </q-btn>
    <q-dialog
      v-model="abrirModalPreviewImagem"
      position="right"
      @hide="hideModalPreviewImagem"
      @show="showModalPreviewImagem"
    >
      <q-card
        style="height: 90vh; min-width: 60vw; max-width: 60vw"
        class="q-pa-md"
      >
        <q-card-section>
          <div class="text-h6">{{ urlMediaPreview.title  }}
            <q-btn
              class="float-right"
              icon="close"
              color="negative"
              round
              outline
              @click="hideModalPreviewImagem"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <q-img
            :src="urlMediaPreview.src"
            spinner-color="white"
            class="img-responsive mdi-image-auto-adjust q-uploader__file--img"
            style="height: 60vh; min-width: 55vw; max-width: 55vw"
          />
        </q-card-section>
        <q-card-actions align="center">
          <q-btn
            ref="qbtnPasteEnvioMensagem"
            label="Enviar"
            color="primary"
            v-close-popup
            @click="enviarMensagem"
            @keypress.enter.exact="enviarMensagem()"
          />
        </q-card-actions>
        <span class="row col text-caption text-blue-grey-10">* Confirmar envio: Enter</span>
        <span class="row col text-caption text-blue-grey-10">** Cancelar: ESC</span>
      </q-card>
    </q-dialog>
  </div>
  <!-- <p
      v-if="!cMostrarEnvioArquivo"
      class="row col text-caption text-blue-grey-10"
    >Quebra linha/Parágrafo: Shift + Enter ||| Enviar Mensagem: Enter</p> -->

</template>

<script>
import mixinCommon from './mixinCommon'
import { EnviarMensagemTexto } from 'src/service/tickets'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'

export default {
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null
    }
  },
  components: {
    VEmojiPicker
  },
  data () {
    return {
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      urlMediaPreview: {
        title: '',
        src: ''
      },
      arquivos: [],
      textChat: ''
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo () {
      return this.arquivos.length > 0
    }
  },
  methods: {
    openFilePreview (event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputPaste (e) {
      if (!this.ticketFocado?.id) return
      if (e.clipboardData.files[0]) {
        this.textChat = ''
        this.arquivos = [e.clipboardData.files[0]]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: `Enviar imagem para ${this.ticketFocado?.contact?.name}`,
          src: this.openFilePreview(e)
        }
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem.$refs.input
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value

      // filter:
      if (!emoji.data) {
        return
      }

      // insert:
      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    abrirEnvioArquivo (event) {
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    prepararUploadMedia () {
      if (!this.arquivos.length) {
        throw new Error('Não existem arquivos para envio')
      }
      const formData = new FormData()
      formData.append('fromMe', true)
      this.arquivos.forEach(media => {
        formData.append('medias', media)
        formData.append('body', media.name)
      })
      return formData
    },
    prepararMensagemTexto () {
      if (this.textChat.trim() === '') {
        throw new Error('Mensagem Inexistente')
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username) {
        mensagem = `*${username}*: ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        quotedMsg: this.replyingMessage
      }
      return message
    },
    async enviarMensagem () {
      this.loading = true
      const ticketId = this.ticketFocado.id
      const message = !this.cMostrarEnvioArquivo
        ? this.prepararMensagemTexto()
        : this.prepararUploadMedia()
      try {
        if (!this.cMostrarEnvioArquivo && !this.textChat) return
        await EnviarMensagemTexto(ticketId, message)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        const errorMsg = error.response?.data?.error
        if (errorMsg) {
          this.$q.notify({
            type: 'negative',
            message: error.response.data.error,
            progress: true
          })
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Ops... Ocorreu um problema não identificado.',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      }
      this.loading = false
    },
    handlerInputMenssagem (v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem () {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem () {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    }
  },
  mounted () {
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
    const self = this
    window.addEventListener('paste', self.handleInputPaste)
  },
  beforeDestroy () {
    const self = this
    window.removeEventListener('paste', self.handleInputPaste)
  },
  destroyed () {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  }
}
</script>

<style lang="scss" scoped>
</style>
