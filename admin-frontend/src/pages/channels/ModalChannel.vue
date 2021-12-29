<template>
  <q-dialog
    :value="modalChannel"
    @hide="fecharModal"
    @before-show="abrirModal"
    persistent
  >
    <q-card
      class="q-pa-md"
      style="width: 500px"
    >
      <q-card-section>
        <div class="text-h6">
          <q-avatar>
            <q-icon
              size="40px"
              :name="`img:${channel.type}-logo.png`"
            />
          </q-avatar>
          {{ channel.id ? 'Editar' : 'Adicionar' }} Canal
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-mb-md">
          <div class="col-12">
            <q-select
              outlined
              v-model="channel.tenantId"
              :options="empresas"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              label="Cliente"
              :validator="$v.channel.tenantId"
              @blur="$v.channel.tenantId.$touch"
            />
          </div>
        </div>
        <div class="row q-mb-md">
          <div class="col-12">
            <q-select
              outlined
              v-model="channel.type"
              :options="typesOptions"
              emit-value
              map-options
              label="Tipo do Canal"
              :validator="$v.channel.type"
              @blur="$v.channel.type.$touch"
            />
          </div>
        </div>
        <div
          class="row"
          v-if="channel.type"
        >
          <div class="col-12">
            <c-input
              outlined
              label="Nome"
              v-model="channel.name"
              :validator="$v.channel.name"
              @blur="$v.channel.name.$touch"
            />
          </div>
          <div
            class="col-12 q-mt-md"
            v-if="channel.type === 'telegram'"
          >
            <c-input
              outlined
              label="Token Telegram"
              v-model="channel.tokenTelegram"
            />
          </div>
          <div
            class="q-mt-md row full-width justify-center"
            v-if="channel.type === 'instagram'"
          >
            <div class="col">
              <fieldset class="full-width q-pa-md">
                <legend>Dados da conta do Instagram</legend>
                <div
                  class="col-12 q-mb-md"
                  v-if="channel.type === 'instagram'"
                >
                  <c-input
                    outlined
                    label="Usuário"
                    v-model="channel.instagramUser"
                    hint="Seu usário do Instagram (sem @)"
                  />
                </div>
                <div
                  v-if="channel.type === 'instagram' && !isEdit"
                  class="text-center"
                >
                  <q-btn
                    flat
                    color="info"
                    class="bg-padrao"
                    icon="edit"
                    label="Nova senha"
                    @click="isEdit = !isEdit"
                  >
                    <q-tooltip>
                      Alterar senha
                    </q-tooltip>
                  </q-btn>
                </div>
                <div
                  class="col-12"
                  v-if="channel.type === 'instagram' && isEdit"
                >
                  <c-input
                    filled
                    label="Senha"
                    :type="isPwd ? 'password' : 'text'"
                    v-model="channel.instagramKey"
                    hint="Senha utilizada para logar no Instagram"
                    placeholder="*************"
                    :disable="!isEdit"
                  >
                    <template v-slot:after>
                      <q-btn
                        class="bg-padrao"
                        round
                        flat
                        color="negative"
                        icon="mdi-close"
                        @click="isEdit = !isEdit"
                      >
                        <q-tooltip>
                          Cancelar alteração de senha
                        </q-tooltip>

                      </q-btn>
                    </template>
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </c-input>
                </div>
              </fieldset>

            </div>

          </div>
          <div
            class="col-12 q-mt-md"
            v-if="channel.type === 'waba'"
          >
            <c-input
              outlined
              label="WABA Token"
              v-model="channel.wabaApiKey"
            />
          </div>
          <!-- <q-checkbox
            class="q-ml-md"
            v-model="whatsapp.isDefault"
            label="Padrão"
          /> -->
          <div
            class="col-12 q-mt-md"
            v-if="channel.id"
          >
            <q-checkbox
              label="Ativo"
              v-model="channel.isActive"
            />

          </div>
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
          @click="handleSaveChannel(channel)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
import { required, minLength, maxLength } from 'vuelidate/lib/validators'
import { UpdateChannel, CriarChannel } from 'src/service/channels'
import cInput from 'src/components/cInput.vue'
export default {
  components: { cInput },
  name: 'ModalChannel',
  props: {
    modalChannel: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    channelEdit: {
      type: Object,
      default: () => { }
    },
    empresas: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      isPwd: true,
      isEdit: false,
      typesOptions: [
        { label: 'Whatsapp', value: 'whatsapp' },
        { label: 'Instagram', value: 'instagram' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'WABA', value: 'waba' }
      ],
      channel: {
        tenantId: '',
        name: '',
        type: '',
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        wabaApiKey: '',
        wabaBSP: '360',
        isActive: true
      }
    }
  },
  validations: {
    channel: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      type: { required },
      tenantId: { required },
      isDefault: {}
    }
  },
  methods: {
    fecharModal () {
      this.channel = {
        name: '',
        isDefault: false,
        tenantId: '',
        type: '',
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        wabaApiKey: ''
      }
      this.$emit('update:channelEdit', {})
      this.$emit('update:modalChannel', false)
      this.$emit('modalChannel:atualizar')
    },
    abrirModal () {
      if (this.channelEdit.id) {
        this.channel = { ...this.channelEdit }
      }
    },
    async handleSaveChannel (channel) {
      this.$v.channel.$touch()
      if (this.$v.channel.$error) {
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
        if (this.channelEdit.id) {
          await UpdateChannel(this.channelEdit.id, channel)
        } else {
          await CriarChannel(channel)
        }
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: `Canal ${this.channelEdit.id ? 'editado' : 'criado'} com sucesso!`,
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
    this.$v.channel.$reset()
  }
}
</script>

<style lang="scss" scoped>
</style>
