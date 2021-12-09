<template>
  <q-dialog
    :value="modalWhatsapp"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">
          <q-icon
            size="50px"
            class="q-mr-md"
            :name="`img:${whatsapp.type}-logo.png`"
          /> {{ whatsapp.id ? 'Editar' : 'Adicionar' }} Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row">
          <div class="col-12">
            <c-input
              outlined
              label="Nome"
              v-model="whatsapp.name"
              :validator="$v.whatsapp.name"
              @blur="$v.whatsapp.name.$touch"
            />
          </div>
          <div
            class="col-12 q-mt-md"
            v-if="whatsapp.type === 'telegram'"
          >
            <c-input
              outlined
              label="Token Telegram"
              v-model="whatsapp.tokenTelegram"
            />
          </div>
          <div
            class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'instagram'"
          >
            <div class="col">
              <fieldset class="full-width q-pa-md">
                <legend>Dados da conta do Instagram</legend>
                <div
                  class="col-12 q-mb-md"
                  v-if="whatsapp.type === 'instagram'"
                >
                  <c-input
                    outlined
                    label="Usuário"
                    v-model="whatsapp.instagramUser"
                    hint="Seu usário do Instagram (sem @)"
                  />
                </div>
                <div
                  class="col-12"
                  v-if="whatsapp.type === 'instagram'"
                >
                  <c-input
                    outlined
                    label="Senha"
                    v-model="whatsapp.instagramKey"
                    hint="Senha utilizada para logar no Instagram"
                  />
                </div>

              </fieldset>

            </div>

          </div>
          <!-- <q-checkbox
            class="q-ml-md"
            v-model="whatsapp.isDefault"
            label="Padrão"
          /> -->

        </div>
      </q-card-section>
      <q-card-actions
        align="center"
        class="q-mt-lg"
      >
        <q-btn
          flat
          label="Sair"
          class="q-px-md q-mr-lg"
          color="negative"
          v-close-popup
        />
        <q-btn
          flat
          label="Salvar"
          color="primary"
          class="q-px-md"
          @click="handleSaveWhatsApp(whatsapp)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateWhatsapp, CriarWhatsapp } from 'src/service/sessoesWhatsapp'
import cInput from 'src/components/cInput.vue'
export default {
  components: { cInput },
  name: 'ModalWhatsapp',
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      whatsapp: {
        name: '',
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: ''
      }
    }
  },
  validations: {
    whatsapp: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  methods: {
    fecharModal () {
      this.whatsapp = {
        name: '',
        isDefault: false
      }
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.$v.whatsapp.$touch()
      if (this.$v.whatsapp.$error) {
        return this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: 'Ops! Verifique os erros...',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
      try {
        if (this.whatsAppEdit.id) {
          await UpdateWhatsapp(this.whatsAppEdit.id, whatsapp)
        } else {
          await CriarWhatsapp(whatsapp)
        }
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `Whatsapp ${this.whatsAppEdit.id ? 'editado' : 'criado'} com sucesso!`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.fecharModal()
      } catch (error) {
        console.error(error)
      }
    }
  },
  destroyed () {
    this.$v.whatsapp.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
