<template>
  <q-layout view="hHh Lpr lFf">
    <q-header>
      <q-toolbar class="bg-primary text-white">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title>
          WChats
        </q-toolbar-title>
        <q-icon
          color="negative"
          size="2.5em"
          name="mdi-wifi-strength-1-alert"
          v-if="cProblemaConexao"
        >
          <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
            Verifique o celular, a conexão foi perdida.
          </span>
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium"> Alternativas: </span>
            <span class="row col">
              1 - Tente fechar e abrir novamente o aplicativo do whatsapp no celular;
            </span>
            <span class="row col">
              2 - Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto;
            </span>
            <span class="row col">
              3 - Recarregue a página do sistema;
            </span>
            <span class="row col">
              4 - Clique no botão 'Desconectar' para obter um novo QR Code.
            </span>
          </q-tooltip>
        </q-icon>
        <q-icon
          v-if="cQrCode"
          name="mdi-qrcode-scan"
          color="positive"
          size="2.5em"
        >
          <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
            Necessário ler o QrCode em conexões.
          </span>
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium"> Ação: </span>
            <span class="row col">
              1 - Acesse o menu Conexões;
            </span>
            <span class="row col">
              2 - Clique no botão azul "QR Code";
            </span>
            <span class="row col">
              3 - Leia o QrCode gerado com o aplicativo do Whatsapp do celular e aguarde a conexão ser estabelecida.
            </span>
          </q-tooltip>
        </q-icon>
        <q-icon
          v-if="cOpening"
          name="mdi-lan-connect"
          color="warning"
          size="2.5em"
        >
          <span class="q-ml-md text-weight-medium text-center text-caption text-white ">
            Verifique o celular e a internet, a conexão foi perdida. Tentando reconectar ao Whatsapp.
          </span>
          <q-tooltip content-class="bg-light-blue-1 text-black q-pa-sm shadow-4">
            <span class="text-weight-medium"> Ação: </span>
            <span class="row col">
              1 - Tente fechar e abrir novamente o aplicativo do whatsapp no celular;
            </span>
            <span class="row col">
              2 - Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja aberto;
            </span>
          </q-tooltip>
        </q-icon>
        <q-space />
        <q-btn
          class="bg-grey"
          round
        >
          <q-avatar size="32px">
            <q-icon name="mdi-account" />
          </q-avatar>
          <q-menu>
            <q-list style="min-width: 100px">
              <q-item-label header> Olá! {{ usuario.name }} </q-item-label>
              <q-separator />
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

        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      content-class="bg-grey-1"
    >
      <q-list>
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
      <router-view />
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
import ModalUsuario from 'src/pages/usuarios/ModalUsuario'
import { mapGetters } from 'vuex'

const objMenu = [
  // {
  //   title: 'Dashboard',
  //   caption: '',
  //   icon: 'mdi-view-dashboard',
  //   routeName: 'dashboard'
  // },
  {
    title: 'Conexões',
    caption: 'Sessões Whatsapp',
    icon: 'mdi-cellphone-wireless',
    routeName: 'conexoes'
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
    title: 'Auto Resposta',
    caption: 'Configuração auto resposta',
    icon: 'mdi-message-reply-text',
    routeName: 'auto-resposta'
  }
  // {
  //   title: 'Configurações',
  //   caption: 'Configurações gerais',
  //   icon: 'mdi-cog',
  //   routeName: 'conexoes'
  // }

]

export default {
  name: 'MainLayout',
  mixins: [socketInitial],
  components: { EssentialLink, ModalUsuario },
  data () {
    return {
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
          if (menu.routeName === 'conexoes') {
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
    }
  },
  async mounted () {
    await this.listarWhatsapps()
    if (!('Notification' in window)) {
    } else {
      Notification.requestPermission()
    }
    await this.dadosUsuario()
    this.userProfile = localStorage.getItem('profile')
  }
}
</script>
