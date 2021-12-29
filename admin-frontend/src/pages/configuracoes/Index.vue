<template>
  <div>
    <q-list class="text-weight-medium">
      <q-item-label
        header
        class="text-bold text-h6 q-mb-sm"
      >
        Configurações
      </q-item-label>
      <q-item-label class="text-bold q-ma-md">
        <q-select
          style="width: 400px"
          outlined
          dense
          v-model="empresaSelecionada"
          :options="empresas"
          map-options
          emit-value
          option-value="id"
          option-label="name"
          @input="listarDados"
        >
          <template v-slot:after>
            <q-btn
              :disabled="!empresaSelecionada"
              round
              dense
              color="white"
              text-color="black"
              icon="mdi-code-json"
              class="q-ml-sm"
              @click="objetoConfiguracao = true"
            >
              <q-tooltip>
                Visualizar objeto de configuração
              </q-tooltip>
            </q-btn>
          </template>
        </q-select>
      </q-item-label>
      <template v-if="empresaSelecionada">

        <!-- <q-item-label
        caption
        class="q-mt-lg q-pl-sm"
      >Módulo: Atendimento</q-item-label> -->
        <q-separator spaced />

        <q-item
          tag="label"
          v-ripple
        >
          <q-item-section>
            <q-item-label>Não visualizar Tickets já atribuidos à outros usuários</q-item-label>
            <q-item-label caption>Somente o usuário responsável pelo ticket e/ou os administradores visualizarão a atendimento.</q-item-label>
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
            <q-item-label>Não visualizar Tickets no ChatBot</q-item-label>
            <q-item-label caption>Somente administradores poderão visualizar tickets que estivem interagindo com o ChatBot.</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="NotViewTicketsChatBot"
              false-value="disabled"
              true-value="enabled"
              checked-icon="check"
              keep-color
              :color="NotViewTicketsChatBot === 'enabled' ? 'green' : 'negative'"
              size="md"
              unchecked-icon="clear"
              @input="atualizarConfiguracao('NotViewTicketsChatBot')"
            />
          </q-item-section>
        </q-item>

        <q-item
          tag="label"
          v-ripple
        >
          <q-item-section>
            <q-item-label>Forçar atendimento via Carteira</q-item-label>
            <q-item-label caption>Caso o contato tenha carteira vínculada, o sistema irá direcionar o atendimento somente para os donos da carteira de clientes.</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-toggle
              v-model="DirectTicketsToWallets"
              false-value="disabled"
              true-value="enabled"
              checked-icon="check"
              keep-color
              :color="DirectTicketsToWallets === 'enabled' ? 'green' : 'negative'"
              size="md"
              unchecked-icon="clear"
              @input="atualizarConfiguracao('DirectTicketsToWallets')"
            />
          </q-item-section>
        </q-item>

        <q-item
          tag="label"
          v-ripple
        >
          <q-item-section>
            <q-item-label>Fluxo ativo para o Bot de atendimento</q-item-label>
            <q-item-label caption>Fluxo a ser utilizado pelo Bot para os novos atendimentos</q-item-label>
          </q-item-section>
          <q-item-section avatar>
            <q-select
              style="width: 300px"
              outlined
              dense
              v-model="botTicketActive"
              :options="listaChatFlow"
              map-options
              emit-value
              option-value="id"
              option-label="name"
              @input="atualizarConfiguracao('botTicketActive')"
            />
          </q-item-section>
        </q-item>

      </template>

    </q-list>
    <q-dialog v-model="objetoConfiguracao">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">
            Objeto
            <q-btn
              flat
              class="bg-padrao float-right"
              color="negative"
              round
              dense
              icon="mdi-close"
              v-close-popup
            />
          </div>
        </q-card-section>
        <q-card-section>
          <pre>
            {{ configuracoes }}
          </pre>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            class="bg-padrao"
            label="Fechar"
            color="primary"
            v-close-popup
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script>
import { AdminListarChatFlow } from 'src/service/chatFlow'
import { AdminListarConfiguracoes, AdminAlterarConfiguracao } from 'src/service/configuracoes'
import { AdminListarEmpresas } from 'src/service/empresas'
export default {
  name: 'IndexConfiguracoes',
  data () {
    return {
      empresas: [],
      empresaSelecionada: null,
      configuracoes: [],
      objetoConfiguracao: false,
      listaChatFlow: [],
      NotViewAssignedTickets: null,
      NotViewTicketsChatBot: null,
      DirectTicketsToWallets: null,
      botTicketActive: null
    }
  },
  methods: {
    async listarEmpresas () {
      const { data } = await AdminListarEmpresas()
      this.empresas = data
    },
    async listarConfiguracoes () {
      const { data } = await AdminListarConfiguracoes(this.empresaSelecionada)
      this.configuracoes = data
      console.log('this.configuracoes', this.configuracoes)
      this.configuracoes.forEach(el => {
        let value = el.value
        if (el.key === 'botTicketActive' && el.value) {
          value = +el.value
        }
        this.$data[el.key] = value
      })
    },
    async listarChatFlow () {
      const { data } = await AdminListarChatFlow(this.empresaSelecionada)
      this.listaChatFlow = data.chatFlow
      console.log(data)
    },
    async listarDados () {
      await this.listarChatFlow()
      await this.listarConfiguracoes()
    },
    async atualizarConfiguracao (key) {
      const params = {
        key,
        value: this.$data[key]
      }
      if (!this.empresaSelecionada) return

      try {
        await AdminAlterarConfiguracao(this.empresaSelecionada, params)
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
  async mounted () {
    await this.listarEmpresas()
  }
}
</script>

<style lang="scss" scoped>
</style>
