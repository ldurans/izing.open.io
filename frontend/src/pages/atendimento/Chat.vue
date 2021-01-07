<template>
  <div>
    <InforCabecalhoChat
      @updateTicket:resolver="atualizarStatusTicket('closed')"
      @updateTicket:retornar="atualizarStatusTicket('pending')"
      @updateTicket:info-contato="exibirContato = !exibirContato"
      class="bg-white"
    />
    <q-scroll-area
      ref="scrollAreaChat"
      @scroll="onLoadMore"
      style="min-height: calc(100% - 5px)"
    >

      <div v-if="true">
        <div class="row justify-center q-my-md">
          <q-spinner
            color="primary"
            size="3em"
            :thickness="3"
          />
        </div>
        <div class="row col justify-center q-my-sm text-primary">
          Carregando...
        </div>
      </div>
      {{loading}}
      asasasasasasas {{ cGroupDateMessage }}
      <MensagemChat
        :replyingMessage.sync="replyingMessage"
        :mensagensAgrupadas="cGroupDateMessage"
      />
      <!-- v-if="Object.keys(cGroupDateMessage).length" -->
      <h1>asasas</h1>
      <q-separator />

    </q-scroll-area>

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

    <!-- <InputMensagem :replyingMessage.sync="replyingMessage" /> -->

    <ContatoModal
      :contactId="selectedContactId"
      :modalContato.sync="modalContato"
      @contatoModal:contato-editado="contatoEditado"
    />

  </div>
</template>
<script>
import ContatoModal from 'src/pages/contatos/ContatoModal'
import mixinCommon from './mixinCommon'
import InforCabecalhoChat from './InforCabecalhoChat'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
// import parser from 'vdata-parser'
import { groupBy, orderBy } from 'lodash'
import whatsBackground from 'src/assets/wa-background.png'
import MensagemChat from './MensagemChat'
// import InputMensagem from './InputMensagem'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket'
import mixinSockets from './mixinSockets'
export default {
  name: 'Chat',
  mixins: [mixinCommon, mixinAtualizarStatusTicket, mixinSockets],
  components: {
    InforCabecalhoChat,
    MensagemChat,
    // InputMensagem,
    ContatoModal
  },
  data () {
    return {
      exibirContato: false,
      selectedContactId: null,
      modalContato: false,
      styleCard: {
        minHeight: 'calc(100vh - 8.3vh)',
        height: 'calc(100vh - 8.3vh)',
        backgroundImage: `url(${whatsBackground}) !important`
      },
      params: {
        ticketId: null,
        pageNumber: 1
      },
      replyingMessage: null
    }
  },
  computed: {
    cGroupDateMessage () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      this.replyingMessage = null
      const messages = [...this.mensagensTicket]
      const dateFormat = message => format(parseISO(message.createdAt), 'dd/MM/yyyy', { locale: pt })
      const messageOrdered = orderBy(messages, (obj) => parseISO(obj.createdAt), ['asc'])
      const result = groupBy(messageOrdered, dateFormat)

      return result
    }
  },
  methods: {
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    async onLoadMore () {
      console.log('onLoadMore')
      this.loading = true
      if (!this.hasMore || !this.ticketFocado.id || this.loading) {
        return
      }
      try {
        this.loading = true
        this.params.ticketId = this.ticketFocado.id
        this.params.pageNumber += 1
        await this.$store.dispatch('LocalizarMensagensTicket', this.params).then(r => { this.loading = false })
        this.loading = false
      } catch (error) {
      }
    },
    contatoEditado (contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
      this.$store.commit('UPDATE_TICKET_CONTACT', contato)
    }
  },
  created () {
    this.socketTicket()
  },
  mounted () {
    this.socketMessagesList()
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
  opacity: 0.5;
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
    font-weight: bold;
    padding: 0 0.5em;
    line-height: 1.5em;
    background-color: #fcfcfa;
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
</style>
