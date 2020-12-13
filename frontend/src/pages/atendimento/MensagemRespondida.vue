<template>
  <div
    :class="{
      'quotedContainerLeft': !mensagem.fromMe,
      'quotedContainerRight': mensagem.fromMe
      }"
    >
      <span
        :class="{
          'quotedSideColorLeft': !mensagem.quotedMsg.fromMe,
          'quotedSideColorRight': mensagem.quotedMsg.fromMe
        }"
      ></span>
    <div class="quotedMsg">
      <template v-if="!mensagem.quotedMsg.fromMe">
        <span class="mensagemContactName">
          {{ mensagem.quotedMsg.contact.name }}
        </span>
      </template>
      {{ mensagem.quotedMsg.body }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'MensagemRespondida',
  props: {
    mensagem: {
      type: Object,
      default: () => {
        return {
          fromMe: '',
          quotedMsg: {
            fromMe: '',
            contact: {
              name: ''
            },
            body: ''
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">

</style>
