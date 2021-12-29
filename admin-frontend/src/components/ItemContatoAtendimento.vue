<template>
  <div>
    <q-item
        clickable
        v-ripple
        :active="menuAtivo === routeName"
        @click="$router.push({ name: routeName }); menuAtivo = routeName"
        active-class="'my-menu-link'"
      >
        <q-item-section
          v-if="icon"
          avatar
        >
          <q-icon :name="icon" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ title }}</q-item-label>
          <q-item-label caption>
            {{ caption }}
          </q-item-label>
        </q-item-section>
      </q-item>
  </div>
</template>

<script>
export default {
  name: 'ItemContatoAtendimento'
}
</script>

<style lang="scss" scoped>

</style>
