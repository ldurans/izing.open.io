<template>
  <q-dialog
    :value="modalAutoResposta"
    @hide="fecharModal"
    @show="abrirModal"
    persistent
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ autoRespostaEdicao.id ? 'Editar': 'Criar' }} Auto Resposta</div>
      </q-card-section>
      <q-card-section>
        <q-input
          class="row col"
          square
          outlined
          v-model="autoResposta.name"
          label="Descrição"
        />
        <!-- <div class="row col q-mt-md">
          <q-option-group
            v-model="autoResposta.action"
            :options="options"
            color="primary"
          />
        </div> -->
        <div class="row col q-mt-md">
          <q-checkbox
            v-model="autoResposta.isActive"
            label="Ativo"
          />
        </div>
        <div class="row col q-mt-md">
          <q-input
            clearable
            class="full-width"
            square
            outlined
            v-model="autoResposta.celularTeste"
            label="Número para Teste"
            hint="Deixe limpo para que a Auto resposta funcione. Caso contrário, irá funcionar somente para o número informado aqui."
          />
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
          @click="handleAutoresposta"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarAutoResposta, EditarAutoResposta } from 'src/service/autoResposta'
export default {
  name: 'ModalAutoResposta',
  props: {
    modalAutoResposta: {
      type: Boolean,
      default: false
    },
    autoRespostaEdicao: {
      type: Object,
      default: () => {
        return { id: null }
      }
    }
  },
  data () {
    return {
      autoResposta: {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      }
      // options: [
      //   { value: 0, label: 'Entrada (Criação do Ticket)' },
      //   { value: 1, label: 'Encerramento (Resolução Ticket)' }
      // ]
    }
  },
  methods: {
    abrirModal () {
      if (this.autoRespostaEdicao.id) {
        this.autoResposta = {
          ...this.autoRespostaEdicao,
          userId
        }
      } else {
        this.autoResposta = {
          name: null,
          action: 0,
          userId,
          celularTeste: null,
          isActive: true
        }
      }
    },
    fecharModal () {
      this.autoResposta = {
        name: null,
        action: 0,
        userId,
        celularTeste: null,
        isActive: true
      }
      this.$emit('update:autoRespostaEdicao', { id: null })
      this.$emit('update:modalAutoResposta', false)
    },
    async handleAutoresposta () {
      if (this.autoResposta.id) {
        const { data } = await EditarAutoResposta(this.autoResposta)
        this.$emit('autoResposta:editado', data)
      } else {
        const { data } = await CriarAutoResposta(this.autoResposta)
        this.$emit('autoResposta:criada', data)
      }
      this.fecharModal()
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
