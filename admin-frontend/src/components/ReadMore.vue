<template>
  <div>
    <div
      class="formatHTML"
      v-html="formattedString"
      v-if="!renderPre"
    >
    </div>
    <pre v-else>
      {{ formattedString }}
    </pre>

    <div
      v-show="text.length > maxChars"
      class="text-right q-mr-md q-mt-md"
    >
      <!-- <hr :class="{'ReadMore': !isReadMore, 'ReadLess': isReadMore} "> -->
      <q-btn
        dense
        no-caps
        class="no-border-radius"
        outline
        ripple
        color="info"
        v-show="!isReadMore && mostrarBotao"
        v-on:click="triggerReadMore($event, true)"
      >
        <div class="blobs-container">
          <div class="blob blue"></div>
          <div class="blob blue"></div>
          <div class="blob blue"></div>
        </div> Ler mais
      </q-btn>

      <q-btn
        dense
        no-caps
        class="no-border-radius"
        outline
        ripple
        color="yellow-10"
        v-show="isReadMore"
        v-scroll-to="`#${link}`"
        v-on:click="triggerReadMore($event, false, link)"
      >
        <div class="blobs-container">
          <div class="blob yellow"></div>
          <div class="blob yellow"></div>
          <div class="blob yellow"></div>
        </div> Resumir
      </q-btn>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    text: {
      type: String,
      required: true
    },
    renderPre: {
      type: Boolean,
      required: false
    },
    link: {
      type: [String, Number],
      default: '#'
    },
    maxChars: {
      type: Number,
      default: 400
    }
  },

  data () {
    return {
      isReadMore: false,
      mostrarBotao: false,
      lines: 10
    }
  },

  computed: {
    formattedString () {
      let maxChars = this.maxChars
      let text = this.text
      if (!this.renderPre) {
        text = text.replace(/<(\w+)\b(?:\s+[\w\-.:]+(?:\s*=\s*(?:"[^"]*"|"[^"]*"|[\w\-.:]+))?)*\s*\/?>\s*<\/\1\s*>/igm, '')
        text = text.replace(/<p/g, '<p class="formatP" ')
        text = text.replace(/(\r\n|\n|\r)/g, '')
        text = text.replace(/<br>/g, '')
        maxChars = maxChars + 1000
      }

      if (!this.isReadMore && this.text.length > maxChars) {
        text = text.substring(0, maxChars) + ' ...'
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.mostrarBotao = true
      }

      return (text)
    }
  },

  methods: {
    triggerReadMore (e, b, link) {
      if (link === '#') {
        e.preventDefault()
      }
      if (this.lessStr !== null || this.lessStr !== '') {
        this.isReadMore = b
      }

      if (!this.isReadMore) {
        this.$emit('read-more:focar-ref', link)
      }
    }
  }
}
</script>

<style >
.formatP,
pre {
  white-space: pre-wrap !important; /* css-3 */
  white-space: -moz-pre-wrap !important; /* Mozilla, since 1999 */
  white-space: -pre-wrap !important; /* Opera 4-6 */
  white-space: -o-pre-wrap !important; /* Opera 7 */
  word-wrap: break-word !important; /* Internet Explorer 5.5+ */
}

.formatP {
  line-height: 24px;
}

.hrButtom {
  display: flex;
  justify-content: center;
  align-items: center;
}
.ReadMore {
  flex: 1;
  border: none;
  height: 2px;
  background: rgba(52, 172, 224, 0.178);
}
.ReadLess {
  flex: 1;
  border: none;
  height: 2px;
  background: rgba(255, 177, 66, 1);
}

.blobs-container {
  display: flex;
}

.blob {
  background: black;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 0, 0, 1);
  margin: 10px;
  height: 5px;
  width: 5px;
  transform: scale(1);
  animation: pulse-black 2s infinite;
}

.blob.blue {
  background: rgba(52, 172, 224, 1);
  box-shadow: 0 0 0 0 rgba(52, 172, 224, 1);
  animation: pulse-blue 2s infinite;
}

@keyframes pulse-blue {
  0% {
    transform: scale(0.5);
    box-shadow: 0 0 0 0 rgba(52, 172, 224, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(52, 172, 224, 0);
  }

  100% {
    transform: scale(0.55);
    box-shadow: 0 0 0 0 rgba(52, 172, 224, 0);
  }
}

.blob.yellow {
  background: rgba(255, 177, 66, 1);
  box-shadow: 0 0 0 0 rgba(255, 177, 66, 1);
  animation: pulse-yellow 2s infinite;
}

@keyframes pulse-yellow {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 177, 66, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(255, 177, 66, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 177, 66, 0);
  }
}
</style>
