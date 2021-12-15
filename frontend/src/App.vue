<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: 'App',
  data () {
    return {
      IDLE_TIMEOUT: 5, // seconds
      idleSecondsCounter: 0

    }
  },
  methods: {
    CheckIdleTime () {
      this.idleSecondsCounter++
      // var oPanel = document.getElementById('SecondsUntilExpire')
      // if (oPanel) { oPanel.innerHTML = (this.IDLE_TIMEOUT - this.idleSecondsCounter) + '' }
      if (this.idleSecondsCounter >= this.IDLE_TIMEOUT) {
        alert('Time expired!')
        // document.location.href = 'logout.html'
      }
    }
  },
  beforeMount () {
    const usuario = JSON.parse(localStorage.getItem('usuario'))
    if (usuario?.configs?.isDark) {
      this.$q.dark.set(usuario?.configs?.isDark)
    }
    //   document.onclick = function () {
    //     this.idleSecondsCounter = 0
    //   }
    //   document.onmousemove = function () {
    //     this.idleSecondsCounter = 0
    //   }
    //   document.onkeypress = function () {
    //     this.idleSecondsCounter = 0
    //   }
    //   window.setInterval(this.CheckIdleTime, 1000)
  }

}
</script>
