<template>
  <div>
    <q-table
      flat
      bordered
      square
      hide-bottom
      class="my-sticky-dynamic q-ma-lg"
      title="Campanhas"
      :data="campanhas"
      :columns="columns"
      :loading="loading"
      row-key="id"
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
    >
      <template v-slot:top-right>
        <q-btn
          color="primary"
          label="Adicionar"
          @click="campanhaEdicao = {}; modalCampanha = true"
        />
      </template>
      <template v-slot:body-cell-color="props">
        <q-td class="text-center">
          <div
            class="q-pa-sm rounded-borders"
            :style="`background: ${props.row.color}`"
          >
            {{ props.row.color }}
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-isActive="props">
        <q-td class="text-center">
          <q-icon
            size="24px"
            :name="props.value ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline'"
            :color="props.value ? 'positive' : 'negative'"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acoes="props">
        <q-td class="text-center">
          <q-btn
            flat
            round
            icon="mdi-playlist-edit"
            @click="contatosCampanha(props.row)"
          >
            <q-tooltip>
              Lista de Contatos da Campanha
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="mdi-calendar-clock"
            @click="iniciarCampanha(props.row)"
          >
            <q-tooltip>
              Programar Envio
            </q-tooltip>
          </q-btn>
          <q-btn
            flat
            round
            icon="edit"
            @click="editarCampanha(props.row)"
          />
          <q-btn
            flat
            round
            icon="mdi-delete"
            @click="deletarCampanha(props.row)"
          />
        </q-td>
      </template>
    </q-table>
    <ModalCampanha
      v-if="modalCampanha"
      :modalCampanha.sync="modalCampanha"
      :campanhaEdicao.sync="campanhaEdicao"
      @modal-campanha:criada="campanhaCriada"
      @modal-campanha:editada="campanhaEditada"
    />
  </div>
</template>

<script>
import { DeletarCampanha, IniciarCampanha, ListarCampanhas } from 'src/service/campanhas'
import ModalCampanha from './ModalCampanha'
import { format, parseISO } from 'date-fns'
export default {
  name: 'Campanhas',
  components: {
    ModalCampanha
  },
  data () {
    return {
      campanhaEdicao: {},
      modalCampanha: false,
      campanhas: [],
      pagination: {
        rowsPerPage: 40,
        rowsNumber: 0,
        lastIndex: 0
      },
      loading: false,
      columns: [
        { name: 'id', label: '#', field: 'id', align: 'left' },
        { name: 'name', label: 'Campanha', field: 'name', align: 'left' },
        { name: 'start', label: 'Início', field: 'start', align: 'center', format: (v) => format(parseISO(v), 'dd/MM/yyyy') },
        { name: 'end', label: 'Fim', field: 'end', align: 'center', format: (v) => format(parseISO(v), 'dd/MM/yyyy') },
        { name: 'status', label: 'Status', field: 'status', align: 'center' },
        { name: 'contactsCount', label: 'Qtd. Contatos', field: 'contactsCount', align: 'center' },
        { name: 'acoes', label: 'Ações', field: 'acoes', align: 'center' }
      ]
    }
  },
  methods: {
    async listarCampanhas () {
      const { data } = await ListarCampanhas()
      this.campanhas = data
    },
    campanhaCriada (campanha) {
      // const newCampanhas = [...this.campanhas]
      // newCampanhas.push(campanha)
      // this.campanhas = [...newCampanhas]
      this.listarCampanhas()
    },
    campanhaEditada (campanha) {
      // const newCampanhas = [...this.campanhas]
      // const idx = newCampanhas.findIndex(f => f.id === campanha.id)
      // if (idx > -1) {
      //   newCampanhas[idx] = campanha
      // }
      // this.campanhas = [...newCampanhas]
      this.listarCampanhas()
    },
    editarCampanha (campanha) {
      console.log('campanha', campanha)
      this.campanhaEdicao = {
        ...campanha,
        start: format(parseISO(campanha.start), 'yyyy-MM-dd'),
        end: format(parseISO(campanha.start), 'yyyy-MM-dd')
      }
      this.modalCampanha = true
    },
    deletarCampanha (campanha) {
      this.$q.dialog({
        title: 'Atenção!!',
        message: `Deseja realmente deletar a Campanha "${campanha.tag}"?`,
        cancel: {
          label: 'Não',
          color: 'primary',
          push: true
        },
        ok: {
          label: 'Sim',
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarCampanha(campanha)
          .then(res => {
            let newCampanhas = [...this.campanhas]
            newCampanhas = newCampanhas.filter(f => f.id !== campanha.id)

            this.campanhas = [...newCampanhas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: `Campanha ${campanha.tag} deletada!`,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          })
        this.loading = false
      })
    },
    contatosCampanha (campanha) {
      this.$router.push({
        name: 'contatos-campanha',
        params: {
          campanhaId: campanha.id,
          campanha
        }
      })
    },
    iniciarCampanha (campanha) {
      IniciarCampanha(campanha.id).then(res => {
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: 'Campanha iniciada.',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }).catch(err => {
        this.$q.notify({
          type: 'negatice',
          progress: true,
          position: 'top',
          message: `Não foi possível iniciar a campanha. ${err.message || err.msg}`,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      })
    }
  },
  mounted () {
    this.listarCampanhas()
  }
}

</script>

<style lang="scss" scoped>
</style>
