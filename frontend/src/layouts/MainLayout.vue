<template>
  <q-layout view="hHh Lpr lFf">

    <q-header
      class="bg-white text-grey-8 q-py-xs "
      height-hint="58"
      bordered
    >
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          @click="leftDrawerOpen = !leftDrawerOpen"
          aria-label="Menu"
          icon="menu"
        >
          <q-tooltip>Menu</q-tooltip>
        </q-btn>

        <q-btn
          flat
          no-caps
          no-wrap
          dense
          class="q-ml-sm"
          v-if="$q.screen.gt.xs"
        >
          <q-img
            src="/bg-wchats.png"
            spinner-color="white"
            contain
            style="height: 40px; width: 50px"
          />
          <q-toolbar-title
            shrink
            class="text-bold text-grey-7"
          >
            WChats
          </q-toolbar-title>
        </q-btn>

        <q-space />

        <div class="q-gutter-sm row items-center no-wrap">
          <q-btn
            round
            dense
            flat
            color="grey-8"
            icon="notifications"
          >
            <q-badge
              color="red"
              text-color="white"
              floating
            >
              2
            </q-badge>
            <q-tooltip>Notifications (Em breve)</q-tooltip>
          </q-btn>
          <q-btn
            round
            flat
            class="bg-padrao text-bold q-mx-sm q-ml-lg"
          >
            <q-avatar size="26px">
              {{ $iniciaisString(username) }}
            </q-avatar>
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item-label header> Olá! <b> {{ username }} </b> </q-item-label>
                <q-item
                  clickable
                  v-close-popup
                >
                  <q-item-section>
                    <q-toggle
                      color="blue"
                      v-model="isDark"
                      label="Modo escuro"
                      @input="setStateDarkMode"
                    />
                  </q-item-section>
                </q-item>
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
            </q-menu>

            <q-tooltip>Usuário</q-tooltip>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-white text-grey-9"
    >
      <q-scroll-area class="fit">
        <q-list :key="userProfile">
          <q-item-label
            header
            class="text-grey-8"
          >
            Menu
          </q-item-label>
          <EssentialLink
            v-for="item in menuData"
            :key="item.title"
            v-bind="item"
          />
          <div v-if="userProfile === 'admin'">
            <q-separator spaced />
            <q-item-label header>Administração</q-item-label>
            <template v-for="item in menuDataAdmin">
              <EssentialLink
                v-if="exibirMenuBeta(item)"
                :key="item.title"
                v-bind="item"
              />
            </template>
          </div>

        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page class="q-pa-xs">
        <router-view />
      </q-page>
    </q-page-container>
    <audio ref="audioNotification">
      <source
        :src="alertSound"
        type="audio/mp3"
      >
    </audio>
    <ModalUsuario
      :isProfile="true"
      :modalUsuario.sync="modalUsuario"
      :usuarioEdicao.sync="usuario"
    />
  </q-layout>
</template>

<script>
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import EssentialLink from 'components/EssentialLink.vue'
import socketInitial from './socketInitial'
import alertSound from 'src/assets/sound.mp3'
import { format } from 'date-fns'
const username = localStorage.getItem('username')
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'
const token = JSON.parse(localStorage.getItem('token'))
const usuario = JSON.parse(localStorage.getItem('usuario'))
import openSocket from 'socket.io-client'
import { RealizarLogout } from 'src/service/login'
const socket = openSocket(process.env.API, {
  query: {
    token
  },
  forceNew: true
})

const objMenu = [
  // {
  //   title: 'Dashboard',
  //   caption: '',
  //   icon: 'mdi-view-dashboard',
  //   routeName: 'dashboard'
  // },
  {
    title: 'Painel Atendimentos',
    caption: 'Visão dos atendimentos por usuário e filas',
    icon: 'mdi-view-dashboard-variant',
    routeName: 'painel-atendimentos'
  },
  {
    title: 'Sessões',
    caption: 'Sessões Whatsapp',
    icon: 'mdi-cellphone-wireless',
    routeName: 'sessoes'
  },
  {
    title: 'Atendimentos',
    caption: 'Lista de atendimentos',
    icon: 'mdi-whatsapp',
    routeName: 'atendimento'
  },
  {
    title: 'Contatos',
    caption: 'Lista de contatos',
    icon: 'mdi-card-account-mail',
    routeName: 'contatos'
  }

]

const objMenuAdmin = [
  {
    title: 'Relatórios',
    caption: 'Relatórios gerais',
    icon: 'mdi-file-chart',
    routeName: 'relatorios'
  },
  {
    title: 'Usuarios',
    caption: 'Admin de usuários',
    icon: 'mdi-account-group',
    routeName: 'usuarios'
  },
  {
    title: 'Filas',
    caption: 'Cadastro de Filas',
    icon: 'mdi-arrow-decision-outline',
    routeName: 'filas'
  },
  {
    title: 'Mensagens Rápidas',
    caption: 'Mensagens pré-definidas para envio rápido',
    icon: 'mdi-reply-all-outline',
    routeName: 'mensagens-rapidas'
  },
  {
    title: 'Chatbot',
    caption: 'Robô de atendimento',
    icon: 'mdi-message-reply-text',
    routeName: 'auto-resposta'
  },
  {
    title: 'Etiquetas',
    caption: 'Cadastro de etiquetas',
    icon: 'mdi-tag-text',
    routeName: 'etiquetas'
  },
  {
    title: 'Horário de Atendimento',
    caption: 'Horário de funcionamento da empresa',
    icon: 'mdi-calendar-clock',
    routeName: 'horarioAtendimento'
  },
  {
    title: 'Configurações',
    caption: 'Configurações gerais',
    icon: 'mdi-cog',
    routeName: 'configuracoes'
  },
  /// / criar rotina para liberar pelo backend
  {
    title: 'Campanha',
    caption: 'Campanhas de envio',
    icon: 'mdi-message-bookmark-outline',
    routeName: 'campanhas',
    isBeta: true
  },
  {
    title: 'API',
    caption: 'Integração sistemas externos',
    icon: 'mdi-call-split',
    routeName: 'api-service',
    isBeta: true
  }

]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario },
  data () {
    return {
      username,
      domainExperimentalsMenus: [
        '@wchats.com.br',
        '@sispolos.com.br'
      ],
      userProfile: 'user',
      modalUsuario: false,
      usuario: {},
      alertSound,
      leftDrawerOpen: false,
      menuData: objMenu,
      menuDataAdmin: objMenuAdmin,
      isDark: false
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cProblemaConexao () {
      const idx = this.whatsapps.findIndex(w => ['PAIRING', 'TIMEOUT', 'DISCONNECTED'].includes(w.status))
      return (idx !== -1)
    },
    cQrCode () {
      const idx = this.whatsapps.findIndex(w => w.status === 'qrcode' || w.status === 'DESTROYED')
      return (idx !== -1)
    },
    cOpening () {
      const idx = this.whatsapps.findIndex(w => w.status === 'OPENING')
      return (idx !== -1)
    },
    cObjMenu () {
      if (this.cProblemaConexao) {
        return objMenu.map(menu => {
          if (menu.routeName === 'sessoes') {
            menu.color = 'negative'
          }
          return menu
        })
      }
      return objMenu
    }
  },
  methods: {
    setStateDarkMode () {
      // this.isDark = !this.isDark
      this.$q.dark.toggle()
    },
    exibirMenuBeta (itemMenu) {
      if (!itemMenu?.isBeta) return true
      for (const domain of this.domainExperimentalsMenus) {
        if (this.usuario.email.indexOf(domain) !== -1) return true
      }
      return false
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
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

      notification.onclick = e => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.$router.push({ name: 'atendimento' })

        // history.push(`/tickets/${ticket.id}`);
      }
      this.$nextTick(() => {
        // utilizar refs do layout
        this.$refs.audioNotification.play()
      })
    },
    async abrirModalUsuario () {
      this.modalUsuario = true
    },
    async efetuarLogout () {
      console.log('logout - main atendimento', usuario)
      try {
        await RealizarLogout(usuario)
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')

        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro(
          'Não foi possível realizar logout',
          error
        )
      }
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    },
    conectarSocket (usuario) {
      console.log('conectarSocket', usuario)
      socket.on(`${usuario.tenantId}-users`, data => {
        console.log('usuarios status', data)
      })
    }
  },
  async mounted () {
    await this.listarWhatsapps()
    await this.listarConfiguracoes()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    await this.conectarSocket(usuario)
  },
  destroyed () {
    socket.disconnect()
  }
}
</script>
