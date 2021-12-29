<script>
export default {
  name: 'MultipleCards',
  props: {
    collection: Array,
    sizes: {
      type: Object,
      default () {
        return {
          lg: 4,
          md: 3,
          sm: 2,
          xs: 1
        }
      },
      validator (value) {
        for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
          if (value[size] && 12 % value[size] != 0) {
            return false
          }
        }
        return true
      }
    }
  },
  computed: {
    contentClass () {
      let contentClass = 'col'
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        if (this.sizes[size]) {
          contentClass += ' col-' + size + '-' + (12 / this.sizes[size])
        }
      }
      return contentClass
    },
    sets () {
      const sets = []
      const limit = Math.ceil(this.collection[0].length / this.itemsPerSet)
      for (let index = 0; index < limit; index++) {
        const start = index * this.itemsPerSet
        const end = start + this.itemsPerSet
        sets.push(this.collection[0].slice(start, end))
      }
      return sets
    },
    itemsPerSet () {
      let cond = false
      for (const size of ['xl', 'lg', 'md', 'sm', 'xs']) {
        cond = cond || this.$q.screen[size]
        if (cond && this.sizes[size]) {
          return this.sizes[size]
        }
      }
      return 1
    }
  },
  render (h) {
    return this.$scopedSlots.default({ sets: this.sets, contentClass: this.contentClass })[0]
  }
}
</script>

<style lang="scss" scoped>
</style>
