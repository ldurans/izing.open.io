<template>
  <div
    style="min-height: 80px"
    class="row bg-white justify-center items-center text-grey-9 relative-position"
  >
    <div class="full-width absolute-top">
      <q-menu
        max-width="600px"
        :key="cMensagensRapidas.length"
        square
        no-focus
        class="no-box-shadow no-shadow"
        fit
        persistent
        max-height="200px"
        :offset="[0,-45]"
        :value="textChat.startsWith('/')"
      >
        <q-list
          class="no-shadow no-box-shadow"
          style="min-width: 100px"
          separator
          v-if="!cMensagensRapidas.length"
        >
          <q-item>
            <q-item-section>
              <q-item-label class="text-negative text-bold">Ops... Nenhuma mensagem rápida criada.</q-item-label>
              <q-item-label caption>Cadastre suas mensagens na administração de sistema.</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <q-list
          class="no-shadow no-box-shadow"
          style="min-width: 100px"
          separator
          v-else
        >
          <q-item
            v-for="resposta in cMensagensRapidas"
            :key="resposta.key"
            clickable
            v-close-popup
            @click="mensagemRapidaSelecionada(resposta.message)"
          >
            <q-item-section>
              <q-item-label class="text-bold"> {{ resposta.key }} </q-item-label>
              <q-item-label
                caption
                lines="2"
              > {{ resposta.message }} </q-item-label>
            </q-item-section>
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              {{ resposta.message }}
            </q-tooltip>
          </q-item>
        </q-list>
      </q-menu>
    </div>
    <template v-if="!isRecordingAudio">
      <q-btn
        flat
        @click="abrirEnvioArquivo"
        icon="mdi-paperclip"
        :disable="cDisableActions"
        class="bg-padrao btn-rounded q-mx-xs"
      >
        <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
          Enviar arquivo
        </q-tooltip>
      </q-btn>
      <q-btn
        flat
        icon="mdi-emoticon-happy-outline"
        :disable="cDisableActions"
        class="bg-padrao btn-rounded q-mx-xs"
      >
        <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
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
        :loading="loading"
        :disable="cDisableActions"
        ref="inputEnvioMensagem"
        id="inputEnvioMensagem"
        type="textarea"
        @keypress.enter.exact="() => textChat.trim().length ? enviarMensagem() : ''"
        v-show="!cMostrarEnvioArquivo"
        class="col-grow q-mt-md q-mx-xs inputEnvioMensagem"
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
        hint="Quebra linha: Shift + Enter || Mensagens Rápidas: /"
      />
      <!-- tamanho maximo por arquivo de 10mb -->
      <q-file
        :loading="loading"
        :disable="cDisableActions"
        ref="PickerFileMessage"
        id="PickerFileMessage"
        v-show="cMostrarEnvioArquivo"
        v-model="arquivos"
        class="col-grow q-mt-md q-mx-xs PickerFileMessage"
        bg-color="blue-grey-1"
        input-style="max-height: 30vh"
        outlined
        use-chips
        multiple
        autogrow
        dense
        rounded
        append
        :max-files="5"
        counter
        :max-file-size="10485760"
        :max-total-size="30485760"
        accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
        @rejected="onRejectedFiles"
      />
      <q-btn
        v-if="textChat"
        ref="btnEnviarMensagem"
        @click="enviarMensagem"
        :disabled="ticketFocado.status !== 'open'"
        flat
        icon="mdi-send"
        class="bg-padrao btn-rounded q-mx-xs"
      >
        <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
          Enviar Mensagem
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio"
        @click="handleSartRecordingAudio"
        :disabled="cDisableActions"
        flat
        icon="mdi-microphone"
        class="bg-padrao btn-rounded q-mx-xs"
      >
        <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
          Enviar Áudio
        </q-tooltip>
      </q-btn>
    </template>
    <template v-else>
      <div
        style="width: 200px"
        class="flex flex-center items-center"
        v-if="isRecordingAudio"
      >
        <q-btn
          flat
          icon="mdi-close"
          color="negative"
          @click="handleCancelRecordingAudio"
          class="bg-padrao btn-rounded q-mx-xs"
        />
        <RecordingTimer />
        <q-btn
          flat
          icon="mdi-send-circle-outline"
          color="positive"
          @click="handleStopRecordingAudio"
          class="bg-padrao btn-rounded q-mx-xs"
        />
      </div>

    </template>

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
import RecordingTimer from './RecordingTimer'
import MicRecorder from 'mic-recorder-to-mp3'
const Mp3Recorder = new MicRecorder({ bitRate: 128 })

export default {
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null
    },
    mensagensRapidas: {
      type: Array,
      default: () => []
    }
  },
  components: {
    VEmojiPicker,
    RecordingTimer
  },
  data () {
    return {
      loading: false,
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
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
    },
    cDisableActions () {
      return (this.loading || this.isRecordingAudio || this.ticketFocado.status !== 'open')
    },
    cMensagensRapidas () {
      let search = this.textChat?.toLowerCase()
      if (search && search.trim().startsWith('/')) {
        search = search.replace('/', '')
      }
      return !search ? this.mensagensRapidas : this.mensagensRapidas.filter(r => r.key.toLowerCase().indexOf(search) !== -1)
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
    mensagemRapidaSelecionada (mensagem) {
      this.textChat = mensagem
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
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
      this.textChat = ''
      this.abrirFilePicker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleSartRecordingAudio () {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true })
        await Mp3Recorder.start()
        this.isRecordingAudio = true
      } catch (error) {
        this.isRecordingAudio = false
      }
    },
    async handleStopRecordingAudio () {
      this.loading = true
      try {
        const [, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('fromMe', true)
        const ticketId = this.ticketFocado.id
        await EnviarMensagemTexto(ticketId, formData)
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.isRecordingAudio = false
        this.loading = false
        this.$notificarErro('Ocorreu um erro!', error)
      }
    },
    async handleCancelRecordingAudio () {
      try {
        await Mp3Recorder.stop().getMp3()
        this.isRecordingAudio = false
        this.loading = false
      } catch (error) {
        this.$notificarErro('Ocorreu um erro!', error)
      }
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

      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find(m => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error = this.cMensagensRapidas.length > 1
            ? 'Várias mensagens rápidas encontradas. Selecione uma ou digite uma chave única da mensagem.'
            : '/ indica que você deseja enviar uma mensagem rápida, mas nenhuma foi localizada. Cadastre ou apague a / e digite sua mensagem.'
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username) {
        mensagem = `*#${username}*:\n ${mensagem}`
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
        this.isRecordingAudio = false
        this.loading = false
        this.$notificarErro('Ocorreu um erro!', error)
      }
      this.isRecordingAudio = false
      this.loading = false
      setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
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
    },
    onRejectedFiles (rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `Ops... Ocorreu um erro! <br>
        <ul>
          <li>Cada arquivo deve ter no máximo 10MB.</li>
          <li>Em caso de múltiplos arquivos, o tamanho total (soma de todos) deve ser de até 30MB.</li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
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

<style lang="sass" scoped>
@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important
</style>
