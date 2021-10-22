<!--
/****
/* For information about creating collections, please refer to:
/*
/* https://docs.getnacelle.com/nuxt/collections.html#adding-content-to-collections-pages
/****
-->
<template>
  <div v-if="collection" class="page page-collection">
    <page-content class="page" :page="page" />
    <section class="section">
      <div class="container">
        <div class="columns is-multiline">
          <product-grid
            v-if="visibleProducts.length"
            :products="visibleProducts"
            :show-add-to-cart="true"
            :show-quantity-update="true"
          />
        </div>
      </div>
      <observe-emitter @observe="showMore" />
      <div v-if="isFetching" style="text-align: center">
        Loading products...
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      collection: null,
      collectionProducts: [],
      productVisibilityCount: 12,
      fetchBuffer: 12,
      isFetching: false,
      page: null
    }
  },
  async fetch() {
    const handle = this.$route.params?.collectionHandle
    await Promise.all([this.fetchCollection(handle), this.fetchPage(handle)])
    await this.fetchProducts(0, this.productVisibilityCount + this.fetchBuffer)
  },
  head() {
    if (this.collection) {
      const properties = {}
      const meta = []

      if (this.collection.title) {
        const fullTitle = this.collection.title

        properties.title = fullTitle
        meta.push({
          hid: 'og:title',
          property: 'og:title',
          content: fullTitle
        })
      }

      if (this.collection.description) {
        meta.push({
          hid: 'description',
          name: 'description',
          content: this.collection.description
        })
        meta.push({
          hid: 'og:description',
          property: 'og:description',
          content: this.collection.description
        })
      }

      return {
        ...properties,
        meta
      }
    }
  },
  computed: {
    visibleProducts() {
      return this.collectionProducts?.slice(0, this.productVisibilityCount)
    }
  },
  watch: {
    collectionProducts: {
      immediate: true,
      handler(products) {
        if (products) {
          products.forEach((product) => {
            this.$fetchProduct(product)
          })
        }
      }
    }
  },
  mounted() {
    if (this.collection) {
      this.collectionView({ collection: this.collection })
    }
  },
  beforeDestroy() {
    this.visibleProducts.forEach((product) => {
      this.$deregisterProduct(product)
    })
  },
  methods: {
    ...mapActions('events', ['collectionView']),

    async fetchCollection(handle) {
      this.collection = await this.$nacelle.data
        .collection({ handle })
        .catch(() =>
          console.warn(`No collection with handle: '${handle}' found`)
        )
    },
    async fetchPage(handle) {
      this.page = await this.$nacelle.data
        .page({ handle })
        .catch(() => console.warn(`No page with handle: '${handle}' found`))
    },
    async fetchProducts(start, end) {
      this.isFetching = true
      let handles = this.collection?.productLists[0]?.handles
      if (handles) {
        handles = [...handles].splice(start, end)
        const products = await this.$nacelle.data.products({ handles })
        this.collectionProducts = [...this.collectionProducts, ...products]
        this.isFetching = false
      }
    },
    showMore() {
      if (!this.collection) {
        return
      }
      const currentCount = this.productVisibilityCount
      const fetchCursor = currentCount + this.fetchBuffer
      this.productVisibilityCount = currentCount + 12
      this.fetchProducts(fetchCursor, fetchCursor + 12)
    }
  }
}
</script>

<style lang="scss" scoped>
.page-collection {
  min-height: 85vh;
}
.product {
  .title {
    font-weight: bold;
  }
  img {
    width: 250px;
  }
}
</style>
