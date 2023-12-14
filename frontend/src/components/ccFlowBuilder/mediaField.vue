<template>
  <div>
    <q-card
      flat
      class="q-pa-sm q-pb-md"
    >
      <q-card-section
        style="min-height: 100px"
        class="q-pa-none"
      >
        <q-file
          style="display: none"
          :loading="loading"
          rounded
          label="Mídia composição mensagem"
          ref="PickerFileMessage"
          v-model="file"
          class="col-grow"
          bg-color="blue-grey-1"
          input-style="max-height: 30vh"
          outlined
          clearable
          autogrow
          append
          :max-files="1"
          counter
          :max-file-size="10242880"
          :max-total-size="10242880"
          accept=".txt, .jpg, .png, image/jpeg, .jpeg, image/*, .pdf, .doc, .docx, .xls, .xlsx, .zip, .ppt, .pptx, .mp4, .mp3"
          @rejected="onRejectedFiles"
          @input="getMediaUrl"
        />
        <q-btn
          v-if="!$attrs.element.data.type "
          icon="mdi-file-plus-outline"
          @click="$refs.PickerFileMessage.pickFiles()"
          round
          flat
          size="lg"
          class="bg-grey-3 z-max q-pa-lg absolute-center"
        />

        <div class="text-center full-width hide-scrollbar no-scroll">
          <iframe
            v-if="cMediaUrl && $attrs.element.data.type === 'application/pdf'"
            frameBorder="0"
            scrolling="no"
            style="
              max-height: 150px;
              overflow-y: hidden;
              -ms-overflow-y: hidden;
            "
            class="no-scroll hide-scrollbar"
            :src="cMediaUrl"
          >
            Faça download do PDF
            <!-- alt : <a href="mensagem.cMediaUrl"></a> -->
          </iframe>
          <video
            v-if="cMediaUrl && $attrs.element.data.type.indexOf('video') != -1"
            :src="cMediaUrl"
            controls
            class="q-mt-md"
            style="objectFit: cover;
                  width: 330px;
                  height: 150px;
                  borderTopLeftRadius: 8px;
                  borderTopRightRadius: 8px;
                  borderBottomLeftRadius: 8px;
                  borderBottomRightRadius: 8px;"
            type="video/mp4"
          >
          </video>
          <audio
            v-if="cMediaUrl && $attrs.element.data.type.indexOf('audio') != -1"
            class="q-mt-md full-width"
            controls
          >
            <source
              :src="cMediaUrl"
              type="audio/ogg"
            />
          </audio>

          <q-img
            v-if="cMediaUrl && $attrs.element.data.type.indexOf('image') != -1"
            @click="abrirModalImagem=true"
            :src="cMediaUrl"
            spinner-color="primary"
            height="150px"
            width="100%"
            id="imagemfield"
            style="cursor: pointer; "
          />

        </div>
        <VueEasyLightbox
          v-if="cMediaUrl && $attrs.element.data.type.indexOf('image') != -1"
          :visible="abrirModalImagem"
          :imgs="cMediaUrl"
          :index="1"
          @hide="abrirModalImagem = false;"
        />
        <div v-if="getFileIcon($attrs.element.data.name)">
          <q-icon
            size="80px"
            :name="getFileIcon($attrs.element.data.name)"
          />
        </div>
        <div
          v-if="cMediaUrl"
          class="text-bold flex flex-inline flex-center items-center"
        >
          <div
            style="max-width: 340px"
            class="ellipsis"
          >
            {{ $attrs.element.data.name }}
            <q-tooltip>
              {{ $attrs.element.data.name }}
            </q-tooltip>

          </div>
          <q-btn
            v-if="cMediaUrl"
            flat
            class="bg-padrao btn-rounded q-ma-sm"
            color="primary"
            no-caps
            icon="mdi-image-edit-outline"
            @click="$refs.PickerFileMessage.pickFiles()"
          >
            <q-tooltip>
              Substituir Arquivo
            </q-tooltip>
          </q-btn>
        </div>

      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'MediaField',
  components: { VueEasyLightbox },
  data () {
    return {
      mediaUrl: '',
      file: [],
      abrirModalImagem: false,
      loading: false,
      name: '',
      icons: {
        xls: 'mdi-microsoft-excel',
        xlsx: 'mdi-microsoft-excel',
        doc: 'mdi-file-word',
        docx: 'mdi-file-word',
        zip: 'mdi-folder-zip-outline',
        ppt: 'mdi-microsoft-powerpoint',
        pptx: 'mdi-microsoft-powerpoint'
      }
    }
  },
  computed: {
    cMediaUrl () {
      if (this.$attrs.element.data?.mediaUrl) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mediaUrl = this.$attrs.element.data.mediaUrl
        return this.mediaUrl
      }
      if (!this.$attrs.element.data?.mediaUrl && this.file.type) {
        this.getMediaUrl()
        return this.mediaUrl
      }
      return ''
    }
  },
  methods: {
    async getMediaUrl () {
      let url = ''
      if (this.file?.type) {
        const blob = new Blob([this.file], { type: this.file.type })
        url = window.URL.createObjectURL(blob)
        this.$attrs.element.data.mediaUrl = url
        const base64 = await this.getBase64(this.file)
        this.$attrs.element.data.ext = this.getFileExtension(this.file.name)
        this.$attrs.element.data.media = base64
        this.$attrs.element.data.type = this.file.type
        this.$attrs.element.data.name = this.file.name
      } else {
        this.mediaUrl = this.$attrs.element.data.mediaUrl
      }
    },
    getNewMediaUrl () {
      if (this.$attrs.element.data?.mediaUrl) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mediaUrl = this.$attrs.element.data.mediaUrl
        return this.mediaUrl
      }
      if (!this.$attrs.element.data?.mediaUrl && this.file.type) {
        return this.getMediaUrl()
      } else {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        // this.mediaUrl = ''
        return this.mediaUrl
      }
    },
    getFileExtension (name) {
      if (!name) return ''
      const split = name.split('.')
      const ext = split[split.length - 1]
      return ext
    },
    getFileIcon (name) {
      return this.icons[this.getFileExtension(name)]
    },
    getBase64 (file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    onRejectedFiles (rejectedEntries) {
      this.$q.notify({
        html: true,
        message: `Ops... Ocorreu um erro! <br>
        <ul>
          <li>Arquivo deve ter no máximo 5MB.</li>
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
    }
  }
}
</script>

<style lang="scss" scoped>
#imagemfield > .q-img__content > div {
  padding: 0 !important;
  background: none; // rgba(0, 0, 0, 0.47);
}
</style>
