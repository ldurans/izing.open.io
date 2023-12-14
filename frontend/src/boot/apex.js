import VueApexCharts from 'vue-apexcharts'

export default ({
  Vue
}) => {
  Vue.use(VueApexCharts)
  Vue.component('apexchart', VueApexCharts)
}
