<template>
  <q-dialog
    persistent
    :value="modalFilaUsuario"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card style="width: 400px">
      <q-card-section class="q-pa-none">
        <div class="full-width text-h6 row col bg-grey-4 q-pa-sm">Filas Usuário</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm q-pt-sm"
        >Nome: {{ usuarioSelecionado.name }}</div>
        <div
          style="font-size: 1em"
          class="text-caption text-bold row col q-px-sm"
        >Email: {{ usuarioSelecionado.email }}</div>
        <q-separator spaced />
      </q-card-section>
      <q-card-section>
        <template v-for="fila in filas">
          <div
            class="row col"
            :key="fila.id"
          >
            <q-checkbox
              :disable="!fila.isActive"
              v-model="filasUsuario"
              :label="`${fila.queue} ${!fila.isActive ? '(Inativo)' : ''}`"
              :val="fila.id"
            />
          </div>
        </template>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Sair"
          class="q-px-md q-mr-sm"
          color="negative"
          rounded
          v-close-popup
        />
        <q-btn
          label="Salvar"
          class="q-px-md"
          color="primary"
          rounded
          @click="handleFilaUsuario"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { UpdateUsuarios } from 'src/service/user'
export default {
  name: 'ModalFilaUsuario',
  props: {
    modalFilaUsuario: {
      type: Boolean,
      default: false
    },
    usuarioSelecionado: {
      type: Object,
      default: () => { return { id: null } }
    },
    filas: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      filasUsuario: []
    }
  },
  methods: {
    abrirModal () {
      if (this.usuarioSelecionado.id) {
        this.filasUsuario = [...this.usuarioSelecionado.queues.map(f => f.id)]
      }
    },
    fecharModal () {
      this.$emit('update:usuarioSelecionado', {})
      this.$emit('update:modalFilaUsuario', false)
    },
    async handleFilaUsuario () {
      const req = {
        ...this.usuarioSelecionado,
        queues: [...this.filasUsuario]
      }
      const { data } = await UpdateUsuarios(req.id, req)
      this.$emit('modalFilaUsuario:sucesso', data)
      this.$q.notify({
        type: 'positive',
        progress: true,
        position: 'top',
        message: 'Filas do usuário editadas com sucesso!',
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.fecharModal()
    }
  }

}
</script>

<style lang="scss" scoped>
</style>
