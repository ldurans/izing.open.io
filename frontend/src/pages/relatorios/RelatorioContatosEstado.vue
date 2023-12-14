<template>
  <div>
    <q-card bordered>
      <q-card-section>
        <div class="text-h6 q-px-sm"> Relatório de Contatos por Estado </div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <fieldset class="rounded-all">
          <legend class="q-px-sm">Filtros</legend>
          <div class="row q-gutter-md items-end">
            <div class="col-xs-12 col-sm-7 grow text-center">
              <q-select
                rounded
                outlined
                v-model="pesquisa.ddds"
                multiple
                :options="estadosBR"
                use-chips
                option-value="sigla"
                option-label="nome"
                emit-value
                map-options
                dropdown-icon="add"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label v-html="opt.nome"></q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-checkbox
                        :value="selected"
                        @input="toggleOption(opt)"
                      />
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:selected-item="{opt}">
                  <q-badge
                    dense
                    rounded
                    color="grey-3"
                    text-color="primary"
                    class="q-ma-xs text-body1"
                    :label="opt.nome"
                  >
                  </q-badge>
                </template>
              </q-select>
            </div>
            <div class="col-grow text-center">
              <q-btn
                class="q-mr-sm"
                color="primary"
                rounded
                label="Gerar"
                icon="refresh"
                @click="gerarRelatorio"
              />
              <q-btn
                class="q-mr-sm"
                color="black"
                rounded
                icon="print"
                label="Imprimir"
                @click="printReport('tRelatorioContatosEtiquetas')"
              />
              <q-btn
                color="warning"
                rounded
                label="Excel"
                @click="exportTable('tRelatorioContatosEtiquetas')"
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
          id="tRelatorioContatosEtiquetas"
        >
          <table
            id="tableRelatorioContatos"
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
                  v-for="row in contatos"
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
      id="slotTableRelatorioContatos"
      :imprimirRelatorio="imprimir"
      title="Relatório de Contatos por Etiquetas"
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
                v-for="row in contatos"
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
import ccPrintModelLandscape from './ccPrintModelLandscape'
import XLSX from 'xlsx'
import { RelatorioContatos } from 'src/service/estatisticas'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { estadoPorDdd, estadosBR } from 'src/utils/constants'

export default {
  name: 'RelatorioContatosEtiquetas',
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
      estadoPorDdd,
      estadosBR,
      contatos: [],
      etiquetas: [],
      columns: [
        { name: 'name', label: 'Nome', field: 'name', align: 'left', style: 'width: 300px', format: v => this.replaceEmojis(v) },
        { name: 'number', label: 'WhatsApp', field: 'number', align: 'center', style: 'width: 300px' },
        { name: 'email', label: 'Email', field: 'email', style: 'width: 500px', align: 'left' },
        { name: 'estado', label: 'Estado', field: 'number', style: 'width: 500px', align: 'left', format: v => this.definirEstadoNumero(v) }
      ],
      pesquisa: {
        ddds: []
      },
      ExibirTabela: true,
      imprimir: false
    }
  },
  methods: {
    replaceEmojis (str) {
      var ranges = [
        '[\u00A0-\u269f]',
        '[\u26A0-\u329f]',
        // The following characters could not be minified correctly
        // if specifed with the ES6 syntax \u{1F400}
        '[🀄-🧀]'
        // '[\u{1F004}-\u{1F9C0}]'
      ]
      return str.replace(new RegExp(ranges.join('|'), 'ug'), '')
    },
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
        document.getElementById('tableRelatorioContatos'),
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
      XLSX.writeFile(wb, 'Atendimentos-TESTE.xlsx')
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    definirEstadoNumero (numero) {
      const ddd = numero.substring(2, 4)
      return estadosBR.find(e => e.sigla === estadoPorDdd[ddd])?.nome || ''
    },
    async gerarRelatorio () {
      if (!this.pesquisa.ddds.length) {
        this.$q.notify({
          message: 'Ops... Para gerar o relatório, é necessário selecionar pelo menos um Estado.',
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      const { data } = await RelatorioContatos(this.pesquisa)
      this.contatos = data.contacts
    }
  },
  beforeMount () {
    this.listarEtiquetas()
  },
  async mounted () {
    // this.gerarRelatorio()
  }
}
</script>

<style scoped>
.text-right {
  text-align: right;
}

/* table {
  max-height: 300px;
  position: relative;
} */

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
  max-height: calc(100vh - 220px);
  height: calc(100vh - 220px);
}
</style>
