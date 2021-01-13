<template>
  <div class="bg-grey-3 vac-col-messages">
    <InforCabecalhoChat
      @updateTicket:resolver="atualizarStatusTicket('closed')"
      @updateTicket:retornar="atualizarStatusTicket('pending')"
      @updateTicket:info-contato="exibirContato = !exibirContato"
    />
    <div
      ref="scrollContainer"
      class="scroll-y"
      :style="cStyleScroll"
      @scroll="scrollArea"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <infinite-loading
          v-if="cMessages.length"
          @infinite="onLoadMore"
          direction="top"
          :identificador="ticketFocado.id"
          spinner="spiral"
        >
          <div slot="no-results">
            Sem resultados
          </div>
          <div slot="no-more">
            Nada mais a carregar
          </div>
        </infinite-loading>
      </transition>
      <MensagemChat
        :replyingMessage.sync="replyingMessage"
        :mensagens="cMessages"
        v-if="cMessages.length"
      />
    </div>
    <div
      v-if="cMessages.length"
      class="relative-position"
    >
      <transition
        appear
        enter-active-class="animated fadeIn"
        leave-active-class="animated fadeOut"
      >
        <div v-if="scrollIcon">
          <q-btn
            class="vac-icon-scroll"
            color="white"
            text-color="black"
            icon="mdi-arrow-down"
            round
            push
            ripple
            dense
            @click="scrollToBottom"
          />
        </div>
      </transition>
    </div>
    <!-- <q-card-section
          v-if="replyingMessage"
          class="absolute q-pa-none q-pt-md bg-grey-3"
          :style="`border-top: 1px solid #; bottom: 120px; height: 120px; max-height: 120px; width: 100%;`"
        >
          <q-list class="row col justify-center full-width">
            <q-item
              class="q-card--bordered shadow-10"
              :style="`
              width: 460px;
              min-width: 460px;
              max-width: 460px;
              background-color: ${replyingMessage.fromMe ? '#a5d6a7' : '#ffffff'};
            `"
            >
              <q-item-section>
                <q-item-label
                  v-if="!replyingMessage.fromMe"
                  overline
                >
                  {{ replyingMessage.contact.name }}
                </q-item-label>
                <q-item-label lines="4">
                  {{ farmatarMensagemWhatsapp(replyingMessage.body) }}
                </q-item-label>
              </q-item-section>
              <q-btn
                @click="replyingMessage=null"
                dense
                flat
                round
                icon="close"
                class="float-right"
                :disabled="loading || ticketFocado.status !== 'open'"
              />
            </q-item>
          </q-list>
        </q-card-section> -->
    <q-footer>
      <q-separator class="bg-grey-4" />
      <InputMensagem :replyingMessage.sync="replyingMessage" />
      <q-resize-observer @resize="onResizeInputMensagem" />
    </q-footer>

  </div>
</template>
<script>
import mixinCommon from './mixinCommon'
import InforCabecalhoChat from './InforCabecalhoChat'
// import parser from 'vdata-parser'
import MensagemChat from './MensagemChat'
import InputMensagem from './InputMensagem'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'
import mixinSockets from './mixinSockets'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  name: 'Chat',
  mixins: [mixinCommon, mixinAtualizarStatusTicket, mixinSockets],
  components: {
    InforCabecalhoChat,
    MensagemChat,
    InputMensagem,
    InfiniteLoading
  },
  data () {
    return {
      scrollIcon: false,
      loading: false,
      exibirContato: false,
      heigthInputMensagem: 0,
      params: {
        ticketId: null,
        pageNumber: 1
      },
      replyingMessage: null
    }
  },
  computed: {
    cMessages () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.replyingMessage = null
      return this.mensagensTicket
    },
    cStyleScroll () {
      const loading = 0 // this.loading ? 72 : 0
      const add = this.heigthInputMensagem + loading
      return `min-height: calc(100vh - ${50 + add}px); height: calc(100vh - ${50 + add}px); width: 100%`
    }
  },
  methods: {
    async onResizeInputMensagem (size) {
      this.heigthInputMensagem = size.height
    },
    async onLoadMore (infiniteState) {
      if (this.loading) return

      if (!this.hasMore || !this.ticketFocado?.id) {
        return infiniteState.complete()
      }

      try {
        this.loading = true
        this.params.ticketId = this.ticketFocado.id
        this.params.pageNumber += 1
        await this.$store.dispatch('LocalizarMensagensTicket', this.params).then(r => { this.loading = false })
        this.loading = false
        infiniteState.loaded()
      } catch (error) {
        infiniteState.complete()
      }
      this.loading = false
    },
    scrollArea (e) {
      this.hideOptions = true
      setTimeout(() => {
        if (!e.target) return

        const { scrollHeight, clientHeight, scrollTop } = e.target
        const bottomScroll = scrollHeight - clientHeight - scrollTop

        this.scrollIcon = bottomScroll > 1000
      }, 200)
    },
    scrollToBottom () {
      const element = this.$refs.scrollContainer
      element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
    }
  },
  created () {
    this.$root.$on('scrollToBottomMessageChat', this.scrollToBottom)
    this.socketTicket()
  },
  mounted () {
    this.socketMessagesList()
  },
  destroyed () {
    this.$root.$off('scrollToBottomMessageChat', this.scrollToBottom)
  }
}
</script>

<style lang="scss">
audio {
  height: 40px;
  width: 264px;
}

.mostar-btn-opcoes-chat {
  display: none;
  transition: width 2s transform 2s;
}

.q-message-text:hover .mostar-btn-opcoes-chat {
  display: block;
  float: right;
  position: absolute;
  z-index: 999;
}

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: 0.8;
  &:before {
    content: "";
    // use the linear-gradient for the fading effect
    // use a solid background color for a solid bar
    background: linear-gradient(to right, transparent, #818078, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: black;
    font-size: 16px;
    font-weight: 600;
    padding: 0 0.5em;
    line-height: 1.5em;
    background-color: $grey;
    border-radius: 15px;
  }
}

.textContentItem {
  overflow-wrap: break-word;
  padding: 3px 80px 6px 6px;
}

.textContentItemDeleted {
  font-style: italic;
  color: rgba(0, 0, 0, 0.36);
  overflow-wrap: break-word;
  padding: 3px 80px 6px 6px;
}

.replyginContactMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #35cd96;
}

.replyginSelfMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #6bcbef;
}

.replyginMsgBody {
  padding: 10;
  height: auto;
  display: block;
  white-space: pre-wrap;
  overflow: hidden;
}

.messageContactName {
  display: flex;
  color: #6bcbef;
  font-weight: 500;
}

.vac-icon-scroll {
  position: absolute;
  bottom: 20px;
  right: 20px;
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 2px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  cursor: pointer;
  z-index: 99;
}

// /* CSS Logilcs */
// #message-box {
//   &:empty ~ #submit-button {
//     display: none;
//   } /*when textbox empty show microhpone*/
//   &:not(:empty) ~ #voice-button {
//     display: none;
//   } /*when textbox with texy show submit button*/
// }
</style>
