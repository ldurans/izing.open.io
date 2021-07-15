<template>
  <div
    class="WAL position-relative bg-grey-3"
    :style="style"
  >
    <q-layout
      class="WAL__layout shadow-3"
      container
      view="lHr LpR lFr"
    >

      <!-- view="lHr LpR lFr" -->
      <q-drawer
        v-model="drawerTickets"
        show-if-above
        behavior="desktop"
        :width="380"
        persistent
        bordered
        content-class="hide-scrollbar"
      >
        <q-toolbar
          class="q-pr-none q-gutter-xs"
          style="height: 64px"
        >
          <q-btn-dropdown
            :label="username"
            no-caps
            flat
            class="bg-padrao text-bold btn-rounded"
            ripple
          >
            <q-list style="min-width: 100px">
              <q-item
                clickable
                v-close-popup
                @click="abrirModalUsuario"
              >
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-item
                clickable
                v-close-popup
                @click="efetuarLogout"
              >
                <q-item-section>Sair</q-item-section>
              </q-item>
              <q-separator />

            </q-list>
          </q-btn-dropdown>

          <q-space />
          <q-btn
            flat
            class="bg-padrao btn-rounded"
            icon="mdi-home"
            @click="() => $router.push({name: 'contatos'})"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Retornar ao menu
            </q-tooltip>
          </q-btn>

          <!-- <q-btn
            flat
            class="bg-padrao btn-rounded "
            icon="mdi-comment-plus-outline"
            @click="modalNovoTicket=true"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Novo atendimento
            </q-tooltip>
          </q-btn> -->
          <StatusWhatsapp
            class="q-mr-sm"
            isIconStatusMenu
          />
          <!-- <q-toolbar
            class="text-center bg-grey-3"
            style="width: 60px;"
          >
            <StatusWhatsapp isIconStatusMenu />
          </q-toolbar> -->
        </q-toolbar>
        <StatusWhatsapp class="q-mx-sm full-width" />
        <q-toolbar
          v-show="toolbarSearch"
          class="row q-gutter-sm q-py-sm items-center"
        >
          <q-separator class="absolute-top" />
          <q-btn
            :icon="!cFiltroSelecionado ? 'mdi-filter-outline' : 'mdi-filter-plus'"
            flat
            class="bg-padrao btn-rounded"
            :color="cFiltroSelecionado ? 'deep-orange-9' : 'primary'"
          >
            <q-menu
              content-class="shadow-10"
              square
            >
              <div
                class="row q-pa-sm"
                style="min-width: 350px; max-width: 350px"
              >
                <div class="q-ma-sm">
                  <div class="text-h6 q-mb-md">Filtros Avançados</div>
                  <q-toggle
                    v-if="profile === 'admin'"
                    class="q-ml-lg"
                    v-model="pesquisaTickets.showAll"
                    label="(Admin) - Visualizar Todos"
                    :class="{'q-mb-lg': pesquisaTickets.showAll}"
                    @input="debounce(BuscarTicketFiltro(), 700)"
                  />
                  <q-separator
                    class="q-mb-md"
                    v-if="!pesquisaTickets.showAll"
                  />
                  <div v-if="!pesquisaTickets.showAll">
                    <q-select
                      :disable="pesquisaTickets.showAll"
                      square
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
                      v-model="pesquisaTickets.queuesIds"
                      :options="cUserQueues"
                      :input-debounce="700"
                      option-value="id"
                      option-label="queue"
                      @input="debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-list
                      dense
                      class="q-my-md"
                    >
                      <q-item
                        tag="label"
                        v-ripple
                      >
                        <q-item-section avatar>
                          <q-checkbox
                            v-model="pesquisaTickets.status"
                            val="open"
                            color="primary"
                            keep-color
                            @input="debounce(BuscarTicketFiltro(), 700)"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Abertos</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        tag="label"
                        v-ripple
                      >
                        <q-item-section avatar>
                          <q-checkbox
                            v-model="pesquisaTickets.status"
                            val="pending"
                            color="negative"
                            keep-color
                            @input="debounce(BuscarTicketFiltro(), 700)"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Pendentes</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        tag="label"
                        v-ripple
                      >
                        <q-item-section avatar>
                          <q-checkbox
                            v-model="pesquisaTickets.status"
                            val="closed"
                            color="positive"
                            keep-color
                            @input="debounce(BuscarTicketFiltro(), 700)"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Resolvidos</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-separator class="q-mb-md" />
                    <q-toggle
                      v-if="!isNotViewTicketsQueueUndefined() || profile === 'admin'"
                      v-model="pesquisaTickets.includeNotQueueDefined"
                      label="Incluir Tickets sem filas definidas"
                      @input="debounce(BuscarTicketFiltro(), 700)"
                    />
                    <q-toggle
                      v-model="pesquisaTickets.withUnreadMessages"
                      label="Somente Tickets com mensagens não lidas"
                      @input="debounce(BuscarTicketFiltro(), 700)"
                    />
                    <q-toggle
                      v-model="pesquisaTickets.isNotAssignedUser"
                      label="Somente Tickets não atribuidos (sem usuário definido)"
                      @input="debounce(BuscarTicketFiltro(), 700)"
                    />
                  </div>
                  <q-separator
                    class="q-my-md"
                    spaced
                    v-if="!pesquisaTickets.showAll"
                  />
                  <q-btn
                    class="float-right q-my-md"
                    color="primary"
                    label="Fechar"
                    push
                    v-close-popup
                  />
                </div>
              </div>
            </q-menu>
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Filtro Avançado
            </q-tooltip>
          </q-btn>
          <q-input
            v-model="pesquisaTickets.searchParam"
            dense
            outlined
            rounded
            type="search"
            class="col-grow"
            :debounce="700"
            @input="BuscarTicketFiltro()"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn
            flat
            class="bg-padrao btn-rounded"
            icon="mdi-book-account-outline"
            @click="$router.push({name:'chat-contatos'})"
          >
            <q-tooltip content-class="bg-padrao text-grey-9 text-bold">
              Contatos
            </q-tooltip>
          </q-btn>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-scroll-area
          ref="scrollAreaTickets"
          style="height: calc(100% - 120px)"
          @scroll="onScroll"
        >
          <q-separator />
          <ItemTicket
            v-for="(ticket, key) in tickets"
            :key="key"
            :ticket="ticket"
            :filas="filas"
          />
          <div v-if="loading">
            <div class="row justify-center q-my-md">
              <q-spinner
                color="white"
                size="3em"
                :thickness="3"
              />
            </div>
            <div class="row col justify-center q-my-sm text-white">
              Carregando...
            </div>
          </div>
        </q-scroll-area>
      </q-drawer>

      <q-page-container>
        <router-view
          :mensagensRapidas="mensagensRapidas"
          :key="ticketFocado.id"
        ></router-view>
      </q-page-container>

      <q-drawer
        v-if="!cRouteContatos && ticketFocado.id"
        v-model="drawerContact"
        show-if-above
        bordered
        side="right"
        content-class="bg-grey-1"
      >
        <div
          class="bg-white full-width no-border-radius q-pa-sm"
          style="height:60px;"
        >
          <span class="q-ml-md text-h6">
            Dados Contato
          </span>
        </div>
        <q-separator />
        <div
          class="q-pa-sm"
          v-if="ticketFocado.id"
        >
          <q-card
            class="bg-white btn-rounded"
            style="width: 100%"
            bordered
            flat
          >
            <q-card-section class="text-center">
              <q-avatar style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px">
                <q-icon
                  name="mdi-account"
                  style="width: 100px; height: 100px"
                  size="6em"
                  color="grey-5"
                  v-if="!ticketFocado.contact.profilePicUrl"
                />
                <q-img
                  :src="ticketFocado.contact.profilePicUrl"
                  style="width: 100px; height: 100px"
                >
                  <template v-slot:error>
                    <q-icon
                      name="mdi-account"
                      size="1.5em"
                      color="grey-5"
                    />
                  </template>
                </q-img>
              </q-avatar>
              <div
                class="text-caption q-mt-md"
                style="font-size: 14px"
              >
                {{ ticketFocado.contact.name || ''  }}
              </div>
              <div
                class="text-caption q-mt-sm"
                style="font-size: 14px"
              >
                {{ ticketFocado.contact.number || ''  }}
              </div>
              <q-btn
                color="primary"
                class="q-mt-sm bg-padrao btn-rounded"
                flat
                icon="edit"
                label="Editar Contato"
                @click="editContact(ticketFocado.contact.id)"
              />
            </q-card-section>
          </q-card>
          <q-card
            class="bg-white q-mt-sm btn-rounded"
            style="width: 100%"
            bordered
            flat
          >
            <q-card-section class="text-bold q-pb-none">
              Outras Informações
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-list>
                <q-item
                  v-for="(info, idx) in ticketFocado.contact.extraInfo"
                  :key="idx"
                >
                  <q-item-section>
                    <q-item-label caption>{{info.name}}</q-item-label>
                    <q-item-label>{{info.value}}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
          <q-card
            class="bg-white q-mt-sm btn-rounded"
            style="width: 100%"
            bordered
            flat
          >
            <q-card-section class="text-bold q-pb-none">
              Etiquetas
              <q-separator />
            </q-card-section>
            <q-card-section class="q-pa-none">
              <q-select
                square
                borderless
                :value="ticketFocado.contact.tags"
                multiple
                :options="etiquetas"
                use-chips
                option-value="id"
                option-label="tag"
                emit-value
                map-options
                dropdown-icon="add"
                @input="tagSelecionada"
              >
                <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label v-html="opt.tag"></q-item-label>
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
                  <q-chip
                    dense
                    square
                    color="white"
                    text-color="primary"
                    class="q-ma-xs row col-12 text-body1"
                  >
                    <q-icon
                      :style="`color: ${opt.color}`"
                      name="mdi-pound-box-outline"
                      size="28px"
                      class="q-mr-sm"
                    />
                    {{ opt.tag }}
                  </q-chip>
                </template>
                <template v-slot:no-option="{ itemProps, itemEvents }">
                  <q-item
                    v-bind="itemProps"
                    v-on="itemEvents"
                  >
                    <q-item-section>
                      <q-item-label class="text-negative text-bold">
                        Ops... Sem etiquetas criadas!
                      </q-item-label>
                      <q-item-label caption>
                        Cadastre novas etiquetas na administração de sistemas.
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

              </q-select>
            </q-card-section>
          </q-card>
        </div>
      </q-drawer>

      <ModalNovoTicket :modalNovoTicket.sync="modalNovoTicket" />
      <ContatoModal
        :contactId="selectedContactId"
        :modalContato.sync="modalContato"
        @contatoModal:contato-editado="contatoEditado"
      />

      <ModalUsuario
        :isProfile="true"
        :modalUsuario.sync="modalUsuario"
        :usuarioEdicao.sync="usuario"
      />
    </q-layout>
    <audio ref="audioNotificationPlay">
      <source
        :src="alertSound"
        type="audio/mp3"
      >
    </audio>
  </div>
</template>

<script>
import ContatoModal from 'src/pages/contatos/ContatoModal'
import ItemTicket from './ItemTicket'
import { ConsultarTickets } from 'src/service/tickets'
import { mapGetters } from 'vuex'
import mixinSockets from './mixinSockets'
import socketInitial from 'src/layouts/socketInitial'
import ModalNovoTicket from './ModalNovoTicket'
import { ListarFilas } from 'src/service/filas'
const UserQueues = JSON.parse(localStorage.getItem('queues'))
const profile = localStorage.getItem('profile')
const username = localStorage.getItem('username')
const usuario = JSON.parse(localStorage.getItem('usuario'))
import StatusWhatsapp from 'src/components/StatusWhatsapp'
import alertSound from 'src/assets/sound.mp3'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import { debounce } from 'quasar'
import { format } from 'date-fns'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { ListarConfiguracoes } from 'src/service/configuracoes'
import { ListarMensagensRapidas } from 'src/service/mensagensRapidas'
import { ListarEtiquetas } from 'src/service/etiquetas'
import { EditarEtiquetasContato } from 'src/service/contatos'

export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets, socketInitial],
  components: {
    ItemTicket,
    ModalNovoTicket,
    StatusWhatsapp,
    ContatoModal,
    ModalUsuario
  },
  data () {
    return {
      configuracoes: [],
      debounce,
      alertSound,
      usuario,
      username,
      modalUsuario: false,
      toolbarSearch: true,
      drawerTickets: true,
      drawerContact: true,
      loading: false,
      profile,
      modalNovoTicket: false,
      modalContato: false,
      selectedContactId: null,
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      countTickets: 0,
      pesquisaTickets: {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending'],
        showAll: false,
        count: null,
        queuesIds: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true
        // date: new Date(),
      },
      filas: [],
      etiquetas: [],
      mensagensRapidas: [],
      modalEtiquestas: false
    }
  },
  watch: {
    // pesquisaTickets: {
    //   handler (v) {
    //     this.$store.commit('SET_FILTER_PARAMS', extend(true, {}, this.pesquisaTickets))
    //     localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    //   },
    //   deep: true
    //   // immediate: true
    // }
  },
  computed: {
    ...mapGetters([
      'tickets',
      'ticketFocado',
      'hasMore'
    ]),
    cUserQueues () {
      // try {
      //   const filasUsuario = JSON.parse(UserQueues).map(q => {
      //     if (q.isActive) {
      //       return q.id
      //     }
      //   })
      //   return this.filas.filter(f => filasUsuario.includes(f.id)) || []
      // } catch (error) {
      //   return []
      // }
      return UserQueues
    },
    style () {
      return {
        height: this.$q.screen.height + 'px'
      }
    },
    cToolbarSearchHeigthAjust () {
      return this.toolbarSearch ? 58 : 0
    },
    cHeigVerticalTabs () {
      return `${50 + this.cToolbarSearchHeigthAjust}px`
    },
    cRouteContatos () {
      return this.$route.name === 'chat-contatos'
    },
    cFiltroSelecionado () {
      const { queuesIds, showAll, withUnreadMessages, isNotAssignedUser } = this.pesquisaTickets
      return !!(queuesIds?.length || showAll || withUnreadMessages || isNotAssignedUser)
    }
  },
  methods: {
    handlerNotifications (data) {
      const { message, contact, ticket } = data

      const options = {
        body: `${message.body} - ${format(new Date(), 'HH:mm')}`,
        icon: contact.profilePicUrl,
        tag: ticket.id,
        renotify: true
      }

      const notification = new Notification(
        `Mensagem de ${contact.name}`,
        options
      )

      setTimeout(() => {
        notification.close()
      }, 4000)

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$router.push({ name: 'atendimento' })
        // history.push(`/tickets/${ticket.id}`);
      }

      this.$nextTick(() => {
        // utilizar refs do layout
        this.$refs.audioNotificationPlay.play()
      })
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    },
    isNotViewTicketsQueueUndefined () {
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
      const conf = configuracoes.find(c => c.key === 'NotViewTicketsQueueUndefined')
      return (conf?.value === 'enabled')
    },
    onScroll (info) {
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    editContact (contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    contatoEditado (contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
      this.$store.commit('UPDATE_TICKET_CONTACT', contato)
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        ...paramsInit
      }
      try {
        this.socketTicketList()
        const { data } = await ConsultarTickets(params)
        this.countTickets = data.count // count total de tickets no status
        this.$store.commit('LOAD_TICKETS', data.tickets)
        this.$store.commit('SET_HAS_MORE', data.hasMore)
      } catch (err) {
        this.$notificarErro('Algum problema', err)
        console.error(err)
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    async BuscarTicketFiltro () {
      this.$store.commit('RESET_TICKETS')
      this.loading = true
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
      this.pesquisaTickets = {
        ...this.pesquisaTickets,
        pageNumber: 1
      }
      await this.consultarTickets(this.pesquisaTickets)
      this.loading = false
    },
    async onLoadMore () {
      if (this.tickets.length === 0 || !this.hasMore || this.loading) {
        return
      }
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async listarFilas () {
      const { data } = await ListarFilas()
      this.filas = data
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    async listarEtiquetas () {
      const { data } = await ListarEtiquetas(true)
      this.etiquetas = data
    },
    async abrirModalUsuario () {
      // if (!usuario.id) {
      //   await this.dadosUsuario()
      // }
      // const { data } = await DadosUsuario(userId)
      // this.usuario = data
      this.modalUsuario = true
    },
    efetuarLogout () {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('profile')
      localStorage.removeItem('userId')
      localStorage.removeItem('queues')
      localStorage.removeItem('usuario')
      localStorage.removeItem('filtrosAtendimento')
      this.$router.go({ name: 'login', replace: true })
    },
    async tagSelecionada (tags) {
      console.log('tagSelecionada', tags)
      const data = await EditarEtiquetasContato(this.ticketFocado.contact.id, [...tags])
      console.log('tagSelecionada - contact data', data)
      // this.contatoEditado(data)
    }
  },
  beforeMount () {
    this.listarFilas()
    this.listarEtiquetas()
    this.listarConfiguracoes()
  },
  async mounted () {
    // Caso não existam filtros ainda no localstorage, salvar.
    const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
    if (!filtros?.pageNumber) {
      console.log('filtros', filtros)
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    }
    this.pesquisaTickets = JSON.parse(localStorage.getItem('filtrosAtendimento'))
    this.$root.$on('handlerNotifications', this.handlerNotifications)
    await this.listarWhatsapps()
    await this.consultarTickets()
    const { data } = await ListarMensagensRapidas()
    this.mensagensRapidas = data
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    this.userProfile = localStorage.getItem('profile')
    // this.socketInitial()
  },
  destroyed () {
    this.$root.$off('handlerNotifications', this.handlerNotifications)
    this.socketDisconnect()
    this.$store.commit('TICKET_FOCADO', {})
  }
}
</script>

<style lang="sass">
.upload-btn-wrapper
  position: relative
  overflow: hidden
  display: inline-block

  & input[type="file"]
    font-size: 100px
    position: absolute
    left: 0
    top: 0
    opacity: 0

.WAL
  width: 100%
  height: 100%

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%

  &__field.q-field--outlined .q-field__control:before
    border: none

  .q-drawer--standard
    .WAL__drawer-close
      display: none

@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0!important
  font-size: 1.4rem
</style>
