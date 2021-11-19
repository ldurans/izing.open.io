<template>
  <div>
    <q-card
      flat
      class="q-pa-sm"
    >
      <q-card-section class="q-pa-none">
        <q-file
          style="display: none"
          :loading="loading"
          label="Mídia composição mensagem"
          ref="PickerFileMessage"
          v-model="arquivo"
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
          @rejected="onRejectedFiles"
          @input="getURLMedia"
        />
        <q-btn
          v-if="!arquivo.length && !arquivo.type "
          icon="mdi-plus"
          @click="$refs.PickerFileMessage.pickFiles()"
          round
          flat
          size="lg"
          class="bg-grey-3 z-max q-pa-lg absolute-center"
        />

        <q-img
          @click="abrirModalImagem=true"
          :src="urlMedia"
          spinner-color="primary"
          height="200px"
          width="100%"
          id="imagemfield"
          style="cursor: pointer; "
        >
          <div
            v-if="urlMedia"
            class="absolute-bottom-right  text-subtitle2"
          >
            <q-btn
              flat
              class="bg-padrao btn-rounded q-ma-sm"
              color="primary"
              no-caps
              icon="mdi-image-edit-outline"
              @click="$refs.PickerFileMessage.pickFiles()"
            >
              <q-tooltip>
                Substituir imagem
              </q-tooltip>
            </q-btn>
          </div>
        </q-img>

        <q-input
          v-if="urlMedia"
          dense
          outlined
          label="Subtítulo"
          v-model="name"
          color="black"
          class="z-max q-pa-none q-mt-sm"
        />

        <VueEasyLightbox
          v-if="urlMedia"
          :visible="abrirModalImagem"
          :imgs="urlMedia"
          :index="1"
          @hide="abrirModalImagem = false;"
        />

      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import VueEasyLightbox from 'vue-easy-lightbox'

export default {
  name: 'ImageField',
  components: { VueEasyLightbox },
  data () {
    return {
      abrirModalImagem: false,
      urlMedia: '',
      loading: false,
      arquivo: []
    }
  },
  // computed: {
  //   cUrlMedia () {
  //     let url = ''
  //     if (this.arquivo.type) {
  //       const blob = new Blob([this.arquivo], { type: this.arquivo.type })
  //       console.log(blob, blob.text())
  //       url = window.URL.createObjectURL(blob)
  //     }
  //     return url
  //   }

  // },
  methods: {
    async getURLMedia () {
      let url = ''
      if (this.arquivo.type) {
        const blob = new Blob([this.arquivo], { type: this.arquivo.type })
        console.log(blob, blob.text())
        url = window.URL.createObjectURL(blob)
        const base64 = await this.getBase64(this.arquivo)
        console.log(base64)
      }
      this.urlMedia = url
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
