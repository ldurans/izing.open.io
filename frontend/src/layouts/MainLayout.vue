<template>
  <q-layout view="hHh Lpr lFf">
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-2"
    >
      <q-toolbar
        class="text-primary q-pr-none"
        style="height: 60px"
      >
        <q-btn-dropdown
          color="primary"
          :label="username"
          no-caps
          outline
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
      </q-toolbar>
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
          <EssentialLink
            v-for="item in menuDataAdmin"
            :key="item.title"
            v-bind="item"
          />
        </div>

      </q-list>
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
import { DadosUsuario } from 'src/service/user'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp'
import EssentialLink from 'components/EssentialLink.vue'
import socketInitial from './socketInitial'
import alertSound from 'src/assets/sound.mp3'
import { format } from 'date-fns'
const userId = +localStorage.getItem('userId')
const username = localStorage.getItem('username')
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes'

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
    routeName: 'campanhas'
  },
  {
    title: 'API',
    caption: 'Integração sistemas externos',
    icon: 'mdi-call-split',
    routeName: 'api-service'
  }

]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario },
  data () {
    return {
      username,
      userProfile: 'user',
      modalUsuario: false,
      usuario: {},
      alertSound,
      leftDrawerOpen: false,
      menuData: objMenu,
      menuDataAdmin: objMenuAdmin
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
    async dadosUsuario () {
      const { data } = await DadosUsuario(userId)
      this.usuario = data
      localStorage.setItem('usuario', JSON.stringify(data))
      localStorage.setItem('queues', JSON.stringify(data.queues))
      this.$store.commit('SET_IS_SUPORTE', data)
      this.$store.commit('SET_IS_ADMIN', data)
    },
    async abrirModalUsuario () {
      if (!this.usuario.id) {
        await this.dadosUsuario()
      }
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
      this.$router.go({ name: 'login', replace: true })
    },
    async listarConfiguracoes () {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
    }
  },
  async mounted () {
    await this.listarWhatsapps()
    await this.listarConfiguracoes()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    await this.dadosUsuario()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>
