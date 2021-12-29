<template>
  <div>
    <q-input
      class="full-width"
      hide-bottom-space
      outlined
      stack-label
      type="date"
      bottom-slots
      v-bind="$attrs"
      :class="classAtrrs"
      :value="cValue"
      v-on="$listeners"
      :error="cError"
      :error-message="cErrorMessage"
      :ruler="[val => dateIsValid(val) || 'Data inválida!' ]"
    >
      <template v-slot:append>
        <q-icon
          name="event"
          class="cursor-pointer q-mr-sm"
        >
          <q-popup-proxy
            ref="qDateProxy"
            transition-show="scale"
            transition-hide="scale"
          >
            <q-date
              :value="cQDate"
              today-btn
              mask="DD/MM/YYYY"
              @input="emitDate"
            />
          </q-popup-proxy>
        </q-icon>
      </template>

      <!-- Aceitar Demais Slot's -->
      <template
        v-for="(_, slot) of $scopedSlots"
        v-slot:[slot]="scope"
      >
        <slot
          :name="slot"
          v-bind="scope"
        />
      </template>
    </q-input>
  </div>
</template>
<script>
import { singleErrorExtractorMixin } from 'vuelidate-error-extractor'
import { format, parse, isValid } from 'date-fns'

export default {
  name: 'ccInputDate',
  extends: singleErrorExtractorMixin,
  inheritAttrs: false,
  data () {
    return {
      date: null,
      dateSelect: null
    }
  },
  props: {
    value: [String, Date],
    initValue: {
      type: [String, Date],
      default: null
    },
    error: {
      type: [String, Boolean, Number],
      default: 'NI' // Não Informada
    },
    errorMessage: {
      type: [String, Boolean, Number],
      default: '' // Não Informada
    },
    classAtrrs: {
      type: String,
      default: () => ''
    },
    icon: {
      type: Object,
      default: () => { }
    }
  },
  watch: {
    initValue (v) {
      this.dateFormated(v)
    }
  },
  computed: {
    cValue () {
      return this.value ? this.value : this.dateSelect ? format(parse(this.dateSelect, 'dd/MM/yyyy', new Date()), 'yyyy-MM-dd') : null
    },
    cQDate () {
      if (isValid(this.cValue)) {
        return format(this.cValue, 'dd/MM/yyyy')
      }
      return this.cValue ? format(parse(this.cValue, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : format(new Date(), 'dd/MM/yyyy')
    },
    cError () {
      if (this.error == 'NI') {
        return this.hasErrors
      }
      return this.error
    },
    cErrorMessage () {
      if (this.errorMessage == '') {
        return this.firstErrorMessage
      }
      return this.errorMessage
    },
    iconElment: {
      cache: false,
      get () {
        const defaultConfig = { name: null, size: '24px', color: '#000' }
        const data = { ...defaultConfig, ...this.icon }
        if (!data.name) {
          return defaultConfig
        } else {
          return data
        }
      }
    }
  },
  methods: {
    emitDate (d, r, dt) {
      let date = d
      if (!date) {
        date = `${dt.day}/${dt.month}/${dt.year}`
      }
      const parseDate = parse(date, 'dd/MM/yyyy', new Date())
      this.$emit('input', format(parseDate, 'yyyy-MM-dd'))
      this.$refs.qDateProxy.hide()
    },
    dateIsValid (d) {
      return this.cValue ? isValid(d) : true
    }
  }
}
</script>

<style scoped>
</style>
