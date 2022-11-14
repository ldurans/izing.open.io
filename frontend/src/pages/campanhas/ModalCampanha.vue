<template>
  <q-dialog persistent
    maximized
    :value="modalCampanha"
    @hide="fecharModal"
    @show="abrirModal">
    <q-card class="q-pa-sm">
      <q-card-section class="q-pa-none q-px-md">
        <div class="text-h6 text-bold">{{ campanhaEdicao.id ? 'Editar' : 'Criar' }} Campanha</div>
        <div class="row">
          As mensagens sempre serão enviadas em horário comercial e dias úteis.
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-sm">
          <div class="col-xs-12 col-md-5">
            <q-input class="required"
              outlined
              v-model="campanha.name"
              label="Nome da Campanha"
              @blur="$v.campanha.name.$touch"
              :error="$v.campanha.name.$error"
              error-message="Obrigatório" />
          </div>
          <div class="col-xs-12 col-md-3">
            <DatePick hint="Data início de envio"
              v-model="campanha.start"
              @blur="$v.campanha.start.$touch"
              :error="$v.campanha.start.$error"
              error-message="Não pode ser inferior ao dia atual" />
          </div>
          <div class="col-xs-12 col-md-4">
            <q-select class="required"
              outlined
              emit-value
              map-options
              label="Enviar por"
              color="primary"
              v-model="campanha.sessionId"
              :options="cSessions"
              :input-debounce="700"
              option-value="id"
              option-label="name"
              input-style="width: 280px; max-width: 280px;"
              @blur="$v.campanha.sessionId.$touch"
              :error="$v.campanha.sessionId.$error"
              error-message="Obrigatório" />
          </div>
          <div class="col-xs-12 col-md-4">
            <q-file v-if="!campanha.mediaUrl"
              :loading="loading"
              label="Mídia composição mensagem"
              ref="PickerFileMessage"
              v-model="arquivos"
              class="col-grow"
              bg-color="blue-grey-1"
              input-style="max-height: 30vh"
              outlined
              clearable
              autogrow
              append
              :max-files="5"
              counter
              :max-file-size="10485760"
              :max-total-size="30485760"
              accept=".jpg, .png, image/jpeg, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .pptx, image/*"
              @rejected="onRejectedFiles" />
            <q-input v-if="campanha.mediaUrl"
              readonly
              label="Mídia composição mensagem"
              :value="cArquivoName"
              class=" col-grow "
              bg-color="blue-grey-1"
              input-style="max-height: 30vh"
              outlined
              autogrow
              append
              counter>
              <template v-slot:append>
                <q-btn round
                  dense
                  flat
                  icon="close"
                  @click="campanha.mediaUrl = null; arquivos = []" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
      <q-card-section class="row">
        <div class="col-xs-12 col-sm-4">
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">1ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn round
                flat
                class="q-ml-sm">
                <q-icon size="2em"
                  name="mdi-emoticon-happy-outline" />
                <q-tooltip>
                  Emoji
                </q-tooltip>
                <q-menu anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    labelSearch="Localizar..."
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message1')" />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea ref="message1"
                style="min-height: 9vh; max-height: 9vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                :class="{
                  'bg-red-1': $v.campanha.message1.$error
                }"
                @blur="$v.campanha.message1.$touch"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                @input="(v) => campanha.message1 = v.target.value"
                :value="campanha.message1" />
              <q-separator class="q-my-md" />
            </div>
          </div>
          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">2ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn round
                flat
                class="q-ml-sm">
                <q-icon size="2em"
                  name="mdi-emoticon-happy-outline" />
                <q-tooltip>
                  Emoji
                </q-tooltip>
                <q-menu anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    labelSearch="Localizar..."
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message2')" />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea ref="message2"
                style="min-height: 9vh; max-height: 9vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': $v.campanha.message2.$error
                }"
                @blur="$v.campanha.message2.$touch"
                @input="(v) => campanha.message2 = v.target.value"
                :value="campanha.message2" />
              <q-separator class="q-my-md" />
            </div>
          </div>

          <div class="row items-center q-pt-none">
            <label class="text-heading text-bold">3ª Mensagem</label>
            <div class="col-xs-3 col-sm-2 col-md-1">
              <q-btn round
                flat
                class="q-ml-sm">
                <q-icon size="2em"
                  name="mdi-emoticon-happy-outline" />
                <q-tooltip>
                  Emoji
                </q-tooltip>
                <q-menu anchor="top right"
                  self="bottom middle"
                  :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw"
                    :showSearch="false"
                    :emojisByRow="20"
                    labelSearch="Localizar..."
                    lang="pt-BR"
                    @select="(v) => onInsertSelectEmoji(v, 'message3')" />
                </q-menu>
              </q-btn>
            </div>
            <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
              <textarea ref="message3"
                style="min-height: 9vh; max-height: 9vh;"
                class="q-pa-sm bg-white full-width rounded-borders"
                placeholder="Digite a mensagem"
                autogrow
                dense
                outlined
                :class="{
                  'bg-red-1': $v.campanha.message3.$error
                }"
                @blur="$v.campanha.message3.$touch"
                @input="(v) => campanha.message3 = v.target.value"
                :value="campanha.message3" />
            </div>
          </div>
        </div>
        <div class="col-xs-12 col-sm-6 col-md-4">
          <q-card bordered
            flat
            class="full-width">
            <div class="text-body1 text-bold q-pa-sm full-width text-center bg-grey-3">
              Visualização
            </div>
            <q-card-section class="row justify-center">
              <q-option-group class="q-mb-sm"
                inline
                v-model="messagemPreview"
                :options="optRadio"
                color="primary" />
              <cMolduraCelular class="row justify-center"
                :key="cKey">
                <MensagemChat :isLineDate="false"
                  size="8"
                  class="full-width"
                  :mensagens="cMessages" />
              </cMolduraCelular>
            </q-card-section>
          </q-card>

        </div>
        <div class="col-xs-12 col-sm-6 col-md-4 self-end text-right">
          <q-btn label="Cancelar"
            color="negative"
            v-close-popup
            class="q-mr-md" />
          <q-btn label="Salvar"
            color="positive"
            icon="save"
            @click="handleCampanha" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import { required } from 'vuelidate/lib/validators'
import { VEmojiPicker } from 'v-emoji-picker'
import axios from 'axios'
import cMolduraCelular from 'src/components/cMolduraCelular'
import MensagemChat from 'src/pages/atendimento/MensagemChat'
import { mapGetters } from 'vuex'
import { CriarCampanha, AlterarCampanha } from 'src/service/campanhas'
import { parseISO, startOfDay } from 'date-fns'
const isValidDate = (v) => {
  return startOfDay(new Date(parseISO(v))).getTime() >= startOfDay(new Date()).getTime()
}

const downloadImageCors = axios.create({
  baseURL: process.env.URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob'
  }
})

export default {
  name: 'ModalCampanha',
  components: { VEmojiPicker, cMolduraCelular, MensagemChat },
  props: {
    modalCampanha: {
      type: Boolean,
      default: false
    },
    campanhaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      optRadio: [
        { label: 'Mensagem 1', value: 'message1' },
        { label: 'Mensagem 2', value: 'message2' },
        { label: 'Mensagem 3', value: 'message3' }
      ],
      messagemPreview: 'message1',
      loading: false,
      abrirModalImagem: false,
      urlMedia: '',
      campanha: {
        name: null,
        start: null,
        mediaUrl: null,
        message1: null,
        message2: null,
        message3: null,
        sessionId: null
      },
      messageTemplate: {
        mediaUrl: null,
        id: null,
        ack: 3,
        read: true,
        fromMe: true,
        body: null,
        mediaType: 'chat',
        isDeleted: false,
        createdAt: '2021-02-20T20:09:04.736Z',
        updatedAt: '2021-02-20T23:26:24.311Z',
        quotedMsgId: null,
        ticketId: 0,
        contactId: null,
        userId: null,
        contact: null,
        quotedMsg: null
      },
      arquivos: []
    }
  },
  validations: {
    campanha: {
      name: { required },
      start: { required, isValidDate },
      message1: { required },
      message2: { required },
      message3: { required },
      sessionId: { required }
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cSessions () {
      return this.whatsapps.filter(w => w.type === 'whatsapp' && !w.isDeleted)
    },
    cKey () {
      return this.campanha.message1 + this.campanha.message2 + this.campanha.message3
    },
    cArquivoName () {
      const split = this.campanha.mediaUrl.split('/')
      const name = split[split.length - 1]
      return name
    },
    cMessages () {
      const messages = []
      const msgArray = ['message1', 'message2', 'message3']
      if (this.arquivos?.type) {
        const blob = new Blob([this.arquivos], { type: this.arquivos.type })
        messages.push({
          ...this.messageTemplate,
          id: 'mediaUrl',
          mediaUrl: window.URL.createObjectURL(blob),
          body: this.arquivos.name,
          mediaType: this.arquivos.type.substr(0, this.arquivos.type.indexOf('/'))
        })
      } else if (this.campanha.mediaUrl) {
        messages.push({
          ...this.messageTemplate,
          id: 'mediaUrl',
          mediaUrl: this.campanha.mediaUrl,
          body: '',
          mediaType: this.campanha.mediaType
        })
      }
      msgArray.forEach(el => {
        if (this.messagemPreview === el) {
          const body = this.campanha[el]
          const msg = {
            ...this.messageTemplate,
            id: el,
            body
          }
          messages.push(msg)
        }
      })
      return messages
    }
  },
  methods: {
    onInsertSelectEmoji (emoji, ref) {
      const self = this
      var tArea = this.$refs[ref]
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
      self.txtContent = this.campanha[ref]
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.campanha[ref] = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    },
    resetarCampanha () {
      this.campanha = {
        id: null,
        name: null,
        start: null,
        message1: null,
        message2: null,
        message3: null,
        message4: null,
        mediaUrl: null,
        userId: null,
        sessionId: null
      }
    },
    fecharModal () {
      this.resetarCampanha()
      this.$emit('update:campanhaEdicao', { id: null })
      this.$emit('update:modalCampanha', false)
    },
    abrirModal () {
      if (this.campanhaEdicao.id) {
        this.campanha = { ...this.campanhaEdicao }
      } else {
        this.resetarCampanha()
      }
    },
    onRejectedFiles (rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `Ops... Ocorreu um erro! <br>
        <ul>
          <li>Arquivo deve ter no máximo 10MB.</li>
          <li>Priorize o envio de imagem ou vídeo.</li>
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
        this.$notificarErro('Algum problema ao carregar a imagem', error)
      }
      this.loading = false
    },
    async handleCampanha () {
      this.$v.campanha.$touch()
      if (this.$v.campanha.$error) {
        this.$q.notify({
          type: 'negative',
          message: 'Verifique se todas os campos obrigatórios estão preenchidos '
        })
        return
      }
      try {
        this.loading = true
        const campanha = { ...this.campanha }
        const medias = new FormData()
        Object.keys(campanha).forEach((key) => {
          medias.append(key, campanha[key])
        })
        medias.append('medias', this.arquivos)
        if (this.campanha.id) {
          const { data } = await AlterarCampanha(medias, campanha.id)
          this.$emit('modal-campanha:editada', data)
          this.$q.notify({
            type: 'info',
            progress: true,
            position: 'top',
            textColor: 'black',
            message: 'Campanha editada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        } else {
          const { data } = await CriarCampanha(medias)
          this.$emit('modal-campanha:criada', data)
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Campanha criada!',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        this.loading = false
        this.fecharModal()
      } catch (error) {
        console.error(error)
        this.$notificarErro('Algum problema ao criar campanha', error)
      }
    }
  }

}
</script>

<style lang="scss" >
border-error {
  border: 3px solid red;
  background: red !important;
}
</style>
