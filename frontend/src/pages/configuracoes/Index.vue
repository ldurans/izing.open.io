<template>
  <div>
    <q-list class="text-weight-medium">
      <q-item-label
        header
        class="text-bold text-h6 q-mb-lg"
      >Configurações</q-item-label>

      <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Módulo: Atendimento</q-item-label>
      <q-separator spaced />

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets já atribuidos à outros usuários</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewAssignedTickets"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewAssignedTickets === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewAssignedTickets')"
          />
        </q-item-section>
      </q-item>

      <q-item
        tag="label"
        v-ripple
      >
        <q-item-section>
          <q-item-label>Não visualizar Tickets sem fila definida</q-item-label>
        </q-item-section>
        <q-item-section avatar>
          <q-toggle
            v-model="NotViewTicketsQueueUndefined"
            false-value="disabled"
            true-value="enabled"
            checked-icon="check"
            keep-color
            :color="NotViewTicketsQueueUndefined === 'enabled' ? 'green' : 'negative'"
            size="md"
            unchecked-icon="clear"
            @input="atualizarConfiguracao('NotViewTicketsQueueUndefined')"
          />
        </q-item-section>
      </q-item>

    </q-list>

  </div>
</template>

<script>
import { ListarConfiguracoes, AlterarConfiguracao } from 'src/service/configuracoes'
export default {
  name: 'IndexConfiguracoes',
  data () {
    return {
      configuracoes: [],
      NotViewAssignedTickets: null,
      NotViewTicketsQueueUndefined: null
    }
  },
  methods: {
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      this.configuracoes = data
      this.configuracoes.forEach(el => {
        this.$data[el.key] = el.value
      })
    },
    async atualizarConfiguracao (key) {
      const params = {
        key,
        value: this.$data[key]
      }
      try {
        await AlterarConfiguracao(params)
        this.$q.notify({
          type: 'positive',
          message: 'Configuração alterada!',
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = this.$data[key] === 'enabled' ? 'disabled' : 'enabled'
        this.$notificarErro('Ocorreu um erro!', error)
      }
    }
  },
  mounted () {
    this.listarConfiguracoes()
  }
}
</script>

<style lang="scss" scoped>
</style>
