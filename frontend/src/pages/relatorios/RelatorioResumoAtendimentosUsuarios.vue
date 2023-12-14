<template>
  <div>
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm"> Relatório Resumo Atendimentos Usuários </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros (Data Atendimentos)</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-grow">
              <label>Início</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.startDate"
              />
            </div>
            <div class="col-grow">
              <label>Final</label>
              <DatePick
                dense
                rounded
                v-model="pesquisa.endDate"
              />
            </div>
            <div class="col-grow text-center">
              <q-btn
                class="q-mr-sm"
                color="primary"
                label="Gerar"
                icon="refresh"
                rounded
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                rounded
                icon="print"
                label="Imprimir"
                @click="printReport('tRelatorioResumoAtendimentosUsuarios')"
              />
              <q-btn
                color="warning"
                label="Excel"
                rounded
                @click="exportTable('tRelatorioResumoAtendimentosUsuarios')"
              />
            </div>
          </div>
        </fieldset>
      </q-card-section>
    </q-card>

    <div class="row">
      <div class="col-xs-12 q-mt-sm">
        <div
          class="tableLarge q-ma-sm q-markup-table q-table__container q-table__card q-table--cell-separator q-table--flat q-table--bordered q-table--no-wrap"
          id="tRelatorioResumoAtendimentosUsuarios"
        >
          <table
            id="tableRelatorioResumoAtendimentosUsuarios"
            class="q-pb-md q-table q-tabs--dense "
          >
            <thead>
              <tr>
                <td
                  v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                  :key="col.name"
                >
                  {{ col.label }}
                </td>
              </tr>
            </thead>
            <tbody>
              <template v-if="!bl_sintetico">
                <tr
                  v-for="row in dadosResumo"
                  :key="row.number"
                >
                  <td
                    v-for="col in columns"
                    :key="col.name +'-'+ row.id"
                    :class="col.class"
                    :style="col.style"
                  >
                    {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                  </td>
                </tr>
              </template>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <ccPrintModelLandscape
      id="slotTableRelatorioResumoAtendimentosUsuarios"
      :imprimirRelatorio="imprimir"
      title="Relatório de Resumo Atendimentos Usuários"
      :styleP="`
      table { width: 100%; font-size: 10px; border-spacing: 1; border-collapse: collapse;  }
      #tableReport tr td { border:1px solid #DDD; padding-left: 10px; padding-right: 10px;  }
      #tableReport thead tr:nth-child(1) td { text-align: center; padding: 5px; font-weight: bold; color: #000; background: lightgrey; opacity: 1; }
      #lineGroup { background: #f8f8f8; line-height: 30px; }
      #quebraAgrupamentoRelatorio { border-bottom: 1px solid black !important; }
      #st_nome, #st_tipo_atendimento, #st_status_faturamento, #st_convenio, #st_nome_profissional, #st_status, #st_nome_unidade, #st_nome_profissional { width: 200px; word-wrap: normal !important; white-space: normal !important; }
      #dt_atendimento_unidade { width: 100px; text-align: center }
      `"
    >
      <template v-slot:body>
        <table class="q-pb-md q-table q-tabs--dense ">
          <thead>
            <tr>
              <td
                v-for="col in bl_sintetico ? columns.filter(c => c.name == opcoesRelatorio.agrupamento) : columns"
                :key="col.name"
              >
                {{ col.label }}
              </td>
            </tr>
          </thead>
          <tbody>
            <template v-if="!bl_sintetico">
              <tr
                v-for="row in dadosResumo"
                :key="row.number"
              >
                <td
                  v-for="col in columns"
                  :key="col.name +'-'+ row.id"
                  :class="col.class"
                  :style="col.style"
                >
                  {{ col.format !== void 0 ? col.format(row[col.field], row) : row[col.field] }}
                </td>
              </tr>
            </template>

          </tbody>
        </table>
      </template>
    </ccPrintModelLandscape>

  </div>
</template>

<script>
import { format, sub } from 'date-fns'
import ccPrintModelLandscape from './ccPrintModelLandscape'
import XLSX from 'xlsx'
import { RelatorioResumoAtendimentosUsuarios } from 'src/service/estatisticas'

export default {
  name: 'RelatorioResumoAtendimentosUsuarios',
  components: { ccPrintModelLandscape },
  props: {
    moduloAtendimento: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      data: null,
      bl_sintetico: false,
      dadosResumo: [],
      columns: [
        { name: 'name', label: 'Nome', field: 'name', align: 'left', style: 'width: 300px', format: v => !v ? 'Não Informado' : v },
        { name: 'email', label: 'E-Mail', field: 'email', align: 'left', style: 'width: 300px', format: v => !v ? 'Não Informado' : v },
        { name: 'qtd_pendentes', label: 'Pendentes', field: 'qtd_pendentes', align: 'center', style: 'width: 300px; text-align: center;' },
        { name: 'qtd_em_atendimento', label: 'Em Atendimento', field: 'qtd_em_atendimento', align: 'center', style: 'width: 300px; text-align: center;' },
        { name: 'qtd_resolvidos', label: 'Resolvidos', field: 'qtd_resolvidos', align: 'center', style: 'width: 300px; text-align: center;' },
        { name: 'qtd_por_usuario', label: 'Total', field: 'qtd_por_usuario', align: 'center', style: 'width: 300px; text-align: center;' },
        { name: 'menor_tempo_por_usuario', label: 'Menor Tempo (Min)', field: 'menor_tempo_por_usuario', align: 'center', style: 'width: 300px; text-align: center;', format: v => this.$formatarValorMoeda(v, 0) },
        { name: 'maior_tempo_por_usuario', label: 'Maior Tempo (Min)', field: 'maior_tempo_por_usuario', align: 'center', style: 'width: 300px; text-align: center;', format: v => this.$formatarValorMoeda(v, 0) },
        { name: 'tempo_medio_por_usuario', label: 'Tempo Médio (Min)', field: 'tempo_medio_por_usuario', style: 'width: 300px; text-align: center;', align: 'left', format: v => this.$formatarValorMoeda(v, 0) }
      ],
      pesquisa: {
        startDate: format(sub(new Date(), { days: 30 }), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd')
      },
      ExibirTabela: true,
      imprimir: false
    }
  },
  methods: {
    sortObject (obj) {
      return Object.keys(obj)
        .sort().reduce((a, v) => {
          a[v] = obj[v]
          return a
        }, {})
    },
    printReport (idElemento) {
      this.imprimir = !this.imprimir
    },
    exportTable () {
      const json = XLSX.utils.table_to_sheet(
        document.getElementById('tableRelatorioResumoAtendimentosUsuarios'),
        { raw: true }
      )
      for (const col in json) {
        if (col[0] == 'J') {
          json[col].t = 'n'
          json[col].v = json[col].v.replace(/\./g, '').replace(',', '.')
          // json[col].f = `VALUE(${json[col].v})`
        }
      }
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, json, 'Relatório Atendimentos')
      XLSX.writeFile(wb, 'Resumo Atendimentos.xlsx')
    },
    async gerarRelatorio () {
      const { data } = await RelatorioResumoAtendimentosUsuarios(this.pesquisa)
      this.dadosResumo = data
    }
  },
  async mounted () {
    this.gerarRelatorio()
  }
}
</script>

<style scoped>
.text-right {
  text-align: right;
}

thead tr:nth-child(1) td {
  color: #000;
  background: lightgrey;
  position: sticky;
  opacity: 1;
  top: 0;
  z-index: 1000;
}

.tableSmall {
  max-height: calc(100vh - 130px);
  height: calc(100vh - 130px);
}

.tableLarge {
  max-height: calc(100vh - 250px);
  height: calc(100vh - 250px);
}
</style>
