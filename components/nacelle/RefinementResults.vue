<template>
  <div>
    <transition name="fade" mode="out-in">
      <div v-if="isLoading" key="loading">
        <slot name="loading" />
      </div>
      <div v-else-if="searchData.length" key="results" class="search-results">
        <h2>
          Showing {{ searchData.length }} {{ itemSinglularPlural }} based on
          selected filters
        </h2>
        <slot name="results" :results="visibleResults" />
        <observe-emitter @observe="showMore" />
        <div v-if="isFetching" style="text-align: center">
          Loading products...
        </div>
      </div>
      <div v-else key="no-results" class="no-results">
        <slot name="no-results" />
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    searchData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      fetchBuffer: 12,
      isFetching: 0,
      resultsToDisplay: 12,
      loadedResults: []
    }
  },
  computed: {
    ...mapState('search', ['isLoading']),

    itemSinglularPlural() {
      return this.searchData?.length === 1 ? 'item' : 'items'
    },
    visibleResults() {
      return this.loadedResults.slice(0, this.resultsToDisplay)
    }
  },
  watch: {
    searchData: {
      handler(newData, oldData) {
        if (
          oldData &&
          newData.map((p) => p.handle).join('') !==
            oldData.map((p) => p.handle).join('')
        ) {
          this.resultsToDisplay = 12
          this.loadedResults = []
        }
        this.fetchProducts(0, this.resultsToDisplay + this.fetchBuffer)
      },
      immediate: true
    }
  },
  beforeDestroy() {
    this.loadedResults.forEach((product) => {
      this.$deregisterProduct(product)
    })
  },
  methods: {
    showMore() {
      if (this.loadedResults.length > 12) {
        const currentCount = this.resultsToDisplay
        const fetchCursor = currentCount + this.fetchBuffer
        this.resultsToDisplay = currentCount + 12
        this.fetchProducts(fetchCursor, fetchCursor + 12)
      }
    },
    async fetchProducts(start, end) {
      this.isFetching = true

      let handles = this.searchData?.map((product) => product.handle)
      handles = [...handles].splice(start, end)
      const products = await this.$nacelle.data.products({ handles })
      this.loadedResults = [...this.loadedResults, ...products]
      this.loadedResults.forEach((product) => {
        this.$fetchProduct(product)
      })
      this.isFetching = false
    }
  }
}
</script>

<style lang="scss" scoped>
.search-results,
.no-results {
  min-height: 400px;
}

.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
