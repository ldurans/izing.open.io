<template>
  <div>
    <q-input
      ref="inputCustomCodar"
      hide-bottom-space
      bottom-slots
      v-bind="$attrs"
      :label="label"
      :class="classAtrrs"
      dense
      outlined
      rounded
      :value="value"
      v-on="$listeners"
      :error="cError"
      :error-message="cErrorMessage"
      @input.native="valorInputSeEmpty"
    >
      <template
        v-slot:before
        v-if="iconElment.name"
      >
        <q-icon
          :name="iconElment.name"
          :size="iconElment.size"
          :color="iconElment.color"
        />
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
export default {
  extends: singleErrorExtractorMixin,
  name: 'ccInput',
  inheritAttrs: false,
  data () {
    return {
    }
  },
  props: {
    value: [String, Number, Date],
    label: String,
    classAtrrs: {
      type: String,
      default: () => ''
    },
    error: {
      type: [String, Boolean, Number],
      default: 'NI' // Não Informada
    },
    errorMessage: {
      type: [String, Boolean, Number],
      default: '' // Não Informada
    },
    icon: {
      type: Object,
      default: () => { }
    }
  },
  computed: {
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
    // Methodo para facilitar o retorno para null e não ''
    valorInputSeEmpty ($event) {
      if (!$event.target.value) {
        this.$emit('input', null)
        return
      }
      this.$emit('input', $event.target.value)
    }
  }
}
</script>

<style scoped>
</style>
