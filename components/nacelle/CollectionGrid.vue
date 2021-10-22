<template>
  <div>
    <h3>{{ title }}</h3>
    <product-grid v-if="products && products.length" :products="products" />
  </div>
</template>

<script>
export default {
  props: {
    collectionHandle: {
      type: String,
      default: ''
    },
    itemsToShow: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      products: null
    }
  },
  async fetch() {
    const collection = await this.$nacelle.data.collection({
      handle: this.collectionHandle
    })
    const handles = collection?.productLists[0]?.handles
    if (handles) {
      this.products = await this.$nacelle.data.products({ handles })
    }
  },
  watch: {
    products: {
      immediate: true,
      handler(vals) {
        if (vals) {
          vals.forEach((val) => this.$fetchProduct(val))
        }
      }
    }
  },
  beforeDestroy() {
    this.storeProducts?.forEach((product) => {
      this.$deregisterProduct(product)
    })
  }
}
</script>

<style></style>
