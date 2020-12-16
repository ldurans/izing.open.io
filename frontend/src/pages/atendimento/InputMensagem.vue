<template>
  <div
    style="height: 14vh"
    class="bg-grey-3 row justify-center items-center relative-position"
  >
    <div class="col-xs-2 col-sm-3 col-md-2">
      <q-btn
        round
        flat
        class="q-ml-sm"
      >
        <q-icon
          size="2em"
          name="mdi-emoticon-happy-outline"
        />
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
      <q-btn
        round
        flat
        class="q-ml-md"
        @click="abrirEnvioArquivo"
      >
        <q-icon
          size="2em"
          name="mdi-paperclip"
        />
        <q-tooltip>
          Enviar arquivo
        </q-tooltip>
      </q-btn>
    </div>
    <div
      style="height: 12vh"
      class="col scroll"
    >
      <textarea
        :disabled="ticketFocado.status !== 'open'"
        ref="inputEnvioMensagem"
        @keypress.enter.exact="() => textChat.trim().length ? enviarMensagem() : ''"
        style="min-height: 9vh; max-height: 9vh;"
        v-show="!cMostrarEnvioArquivo"
        class="q-pa-sm bg-white full-width"
        placeholder="Digita sua mensagem"
        autogrow
        dense
        outlined
        @input="handlerInputMenssagem"
        :value="textChat"
      />
      <span
        v-if="!cMostrarEnvioArquivo"
        class="text-caption text-blue-grey-10"
      >Quebra linha/Parágrafo: Shift + Enter ||| Enviar Mensagem: Enter</span>
      <!-- tamanho maximo por arquivo de 10mb -->
      <q-file
        input-style="min-height: 9vh; max-height: 9vh"
        ref="PickerFileMessage"
        class="bg-white"
        input-class="bg-white"
        v-show="cMostrarEnvioArquivo"
        v-model="arquivos"
        outlined
        use-chips
        multiple
        :max-files="5"
        :max-file-size="10485760"
        accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
      />
    </div>
    <div class="col-1">
      <q-btn
        @click="enviarMensagem"
        :disabled="ticketFocado.status !== 'open'"
        round
        flat
        class="q-ml-xs q-pa-xs"
      >
        <q-icon
          size="3em"
          color="positive"
          name="mdi-send"
        />
        <q-tooltip>
          Enviar Mensagem
        </q-tooltip>
      </q-btn>
    </div>
  </div>
</template>

<script>
import mixinCommon from './mixinCommon'
import { EnviarMensagemTexto } from 'src/service/tickets'
import { VEmojiPicker } from 'v-emoji-picker'
import { mapGetters } from 'vuex'
const usuario = JSON.parse(localStorage.getItem('usuario'))

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
      arquivos: [],
      textChat: ''
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo () {
      return this.abrirFilePicker && this.arquivos.length > 0
    }
  },
  methods: {
    onInsertSelectEmoji (emoji) {
      const self = this
      var tArea = this.$refs.inputEnvioMensagem
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
      const formData = new FormData()
      formData.append('fromMe', true)
      this.arquivos.forEach(media => {
        formData.append('medias', media)
        formData.append('body', media.name)
      })
      return formData
    },
    prepararMensagemTexto () {
      if (this.textChat.trim() === '') return
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: `*${usuario.name}*: ${this.textChat.trim()}`,
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
        await EnviarMensagemTexto(ticketId, message)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
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
            progress: true
          })
        }
      }
      this.loading = false
    },
    handlerInputMenssagem (v) {
      this.textChat = v.target.value
    }
  },
  mounted () {
    this.$root.$on('mensagem-chat:focar-input-mensagem', () => this.$refs.inputEnvioMensagem.focus())
  },
  destroyed () {
    this.$root.$off('mensagem-chat:focar-input-mensagem')
  }
}
</script>

<style lang="scss" scoped>
</style>
