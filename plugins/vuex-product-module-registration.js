import productModule from '~/store/product/productModule'

export default ({ store }, inject) => {
  const fetchProduct = async (product) => {
    const namespace = `product/${product.handle}`
    if (!store.hasModule(namespace)) {
      store.registerModule(namespace, productModule(), {
        preserveState: !!store.state[namespace]
      })
    }
    return await store.dispatch(`${namespace}/fetchProduct`, product)
  }

  const registerProduct = (product) => {
    const namespace = `product/${product.handle}`
    if (!store.hasModule(namespace)) {
      store.registerModule(namespace, productModule(), {
        preserveState: !!store.state[namespace]
      })
    }
  }

  const deregisterProduct = (product) => {
    const namespace = `product/${product.handle}`
    if (!store.hasModule(namespace)) {
      return
    }
    store.unregisterModule(namespace)
  }

  inject('fetchProduct', fetchProduct)
  inject('registerProduct', registerProduct)
  inject('deregisterProduct', deregisterProduct)
}
