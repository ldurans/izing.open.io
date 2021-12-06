<template>
  <div>
    <q-card class="q-ma-sm">
      <div class="text-h6 text-bold q-pa-sm">
        DashBoard
      </div>
      <q-card-section class="q-pt-none">
        <div class="row col q-gutter-sm justify-end">
          <q-datetime-picker
            style="width: 200px"
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora Agendamento"
            mode="date"
            color="primary"
            format24h
            v-model="params.dt_inicio"
          />
          <q-datetime-picker
            style="width: 200px"
            dense
            hide-bottom-space
            outlined
            stack-label
            bottom-slots
            label="Data/Hora Agendamento"
            mode="date"
            color="primary"
            format24h
            v-model="params.dt_inicio"
          />
          <q-select
            style="width: 300px"
            dense
            outlined
            hide-bottom-space
            emit-value
            map-options
            multiple
            options-dense
            use-chips
            label="Filas"
            color="primary"
            v-model="params.queuesIds"
            :options="filas"
            :input-debounce="700"
            option-value="id"
            option-label="queue"
            input-style="width: 280px; max-width: 280px;"
          />
        </div>
      </q-card-section>
      <q-card-section>
        <div class="row q-gutter-md">
          <!-- <div class="col">
            <q-card
              class="my-card"
              flat
              bordered
            >
              <q-item>
                <q-item-section>
                  <q-item-label class="text-bold text-h6 text-center">
                    Atendimentos Realizados
                    <p>1200</p>
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator />
              <q-card-section
                class="text-bold text-center"
                horizontal
              >
                <q-card-section class="col">
                  Receptivo
                  <p> 600 </p>
                </q-card-section>
                <q-separator vertical />
                <q-card-section class="col">
                  Ativo
                  <p> 600 </p>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div> -->
          <div class="col">
            <q-card class="my-card full-height">
              <q-card-section>
                <p class="text-h4 text-bold text-center"> 1200 </p>
                Total Atendimentos
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card class="my-card full-height">
              <q-card-section>
                <p class="text-h4 text-bold text-center"> 800 </p>
                Receptivo
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card class="my-card full-height">
              <q-card-section>
                <p class="text-h4 text-bold text-center"> 400 </p>
                Ativo
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card class="my-card full-height">
              <q-card-section>
                <p class="text-h4 text-bold text-center"> 400 </p>
                Tempo Médio Atendimento (TMA)
              </q-card-section>
            </q-card>
          </div>
          <div class="col">
            <q-card class="my-card full-height">
              <q-card-section>
                <p class="text-h4 text-bold text-center"> 400 </p>
                Tempo Médio Espera (TME)
              </q-card-section>
            </q-card>
          </div>
        </div>

      </q-card-section>
      <q-card-section>
        <div class="row">

        </div>
      </q-card-section>

    </q-card>

  </div>
</template>

<script>
import { ListarFilas } from 'src/service/filas'
export default {
  name: 'IndexDashboard',
  data () {
    return {
      params: {
        dt_inicio: null,
        dt_fim: null,
        queuesIds: []
      },
      filas: []
    }
  },
  methods: {
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    }
  },
  mounted () {
    this.listarFilas()
  }
}
</script>

<style lang="scss" scoped>
</style>
