export function map(fn, stores) {
  return stores
    ? stores.map(store => fn(store.getState()))
    : stores => map(fn, stores)
}

export function filter(fn, stores) {
  return stores
    ? stores.filter(store => fn(store.getState()))
    : stores => filter(fn, stores)
}

export function reduce(fn, stores, acc = {}) {
  return stores
    ? stores.reduce((acc, store) => fn(acc, store.getState()), acc)
    : stores => reduce(fn, stores)
}

export function flatMap(fn, stores) {
  if (!stores) return (stores) => flatMap(fn, stores)

  return stores.reduce((result, store) => {
    let value = fn(store.getState())
    Array.isArray(value)
      ? [].push.apply(result, value)
      : result.push(value)
    return result
  }, [])
}

export function zipWith(fn, a, b) {
  if (!a && !b) {
    return (a, b) => zipWith(fn, a, b)
  }

  const length = Math.min(a.length, b.length)
  const result = Array(length)
  for (let i = 0; i < length; i += 1) {
    result[i] = fn(a[i].getState(), b[i].getState())
  }
  return result
}
