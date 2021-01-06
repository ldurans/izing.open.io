<template>
  <div>
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
  </div>
</template>

<script>
export default {
  name: 'StatusWhatsapp'
}
</script>

<style lang="scss" scoped>
</style>
