<template>
  <q-dialog
    :value="modalAcaoEtapa"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
    position="top"
  >
    <q-card
      style="width: 600px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ acaoEtapaEdicao.id ? 'Editar': 'Criar' }} Ação Etapa</div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col">
            <q-input
              dense
              square
              outlined
              v-model="acaoEtapa.words"
              label="Chave"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-option-group
              inline
              v-model="acaoEtapa.action"
              :options="optionsAcao"
              color="primary"
            />
          </div>
        </div>
        <div class="row q-mt-md">
          <div class="col">
            <q-select
              v-if="acaoEtapa.action === 0"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.nextStepId"
              :options="autoReply.stepsReply"
              option-label="id"
              option-value="id"
              label="Etapa"
              map-options
              emit-value
              clearable
              @input="acaoEtapa.queueId = null; acaoEtapa.userIdDestination = null"
            />
            <q-select
              v-if="acaoEtapa.action === 1"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.queueId"
              :options="filas"
              option-label="queue"
              option-value="id"
              label="Fila"
              map-options
              emit-value
              clearable
              @input="acaoEtapa.nextStepId = null; acaoEtapa.userIdDestination = null"
            />
            <q-select
              v-if="acaoEtapa.action === 2"
              dense
              outlined
              class="full-width"
              v-model="acaoEtapa.userIdDestination"
              :options="usuarios"
              option-label="name"
              option-value="id"
              label="Usuário"
              map-options
              emit-value
              clearable
              @input="acaoEtapa.nextStepId = null; acaoEtapa.queueId = null"
            />
          </div>
        </div>
        <div class="row items-center q-mt-md">
          <div class="col-xs-3 col-sm-2 col-md-1">
            <q-btn
              round
              flat
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
          </div>
          <div class="col-xs-8 col-sm-10 col-md-11 q-pl-sm">
            <label class="text-caption">Mensagem retorno:</label>
            <textarea
              ref="inputEnvioMensagem"
              style="min-height: 10vh; max-height: 10vh;"
              class="q-pa-sm bg-white full-width"
              placeholder="Digita a mensagem"
              autogrow
              dense
              outlined
              @input="(v) => acaoEtapa.replyDefinition = v.target.value"
              :value="acaoEtapa.replyDefinition"
            />
          </div>
        </div>
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          label="Cancelar"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          @click="handleAcaoEtapa"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarAcaoEtapa, EditarAcaoEtapa } from 'src/service/autoResposta'
import { VEmojiPicker } from 'v-emoji-picker'

export default {
  name: 'ModalAcaoEtapa',
  components: { VEmojiPicker },
  props: {
    modalAcaoEtapa: {
      type: Boolean,
      default: false
    },
    acaoEtapaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    },
    etapaAutoResposta: {
      type: Object,
      default: () => {
        return { id: null }
      }
    },
    filas: {
      type: Array,
      default: () => []
    },
    usuarios: {
      type: Array,
      default: () => []
    },
    autoReply: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      acaoEtapa: {
        stepReplyId: null,
        words: null,
        action: null,
        userId,
        queueId: null,
        userIdDestination: null,
        nextStepId: null,
        replyDefinition: null
      },
      optionsAcao: [
        { value: 0, label: 'Proxima Etapa' },
        { value: 1, label: 'Enviar para Fila' },
        { value: 2, label: 'Enviar para usuário' }
      ]
    }
  },
  methods: {
    resetAcaoEtapa () {
      this.acaoEtapa = {
        stepReplyId: null,
        words: null,
        action: null,
        userId,
        queueId: null,
        userIdDestination: null,
        nextStepId: null,
        replyDefinition: null
      }
    },
    abrirModal () {
      if (this.acaoEtapaEdicao.id) {
        this.acaoEtapa = {
          ...this.acaoEtapaEdicao,
          userId
        }
      } else {
        this.resetAcaoEtapa()
      }
    },
    fecharModal () {
      this.resetAcaoEtapa()
      this.$emit('update:acaoEtapaEdicao', { id: null })
      this.$emit('update:modalAcaoEtapa', false)
    },
    async handleAcaoEtapa () {
      const params = {
        ...this.acaoEtapa,
        stepReplyId: this.etapaAutoResposta.id
      }
      if (params.id) {
        const { data } = await EditarAcaoEtapa(params)
        this.$emit('acaoEtapa:editada', data)
        this.$q.notify({
          type: 'info',
          progress: true,
          position: 'top',
          textColor: 'black',
          message: 'Ação editada!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } else {
        const { data } = await CriarAcaoEtapa(params)
        this.$emit('acaoEtapa:criada', data)
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: 'Ação criada!',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      this.fecharModal()
    },
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
      self.txtContent = this.acaoEtapa.replyDefinition
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.acaoEtapa.replyDefinition = self.txtContent
      // move cursor:
      setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length
      }, 10)
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
