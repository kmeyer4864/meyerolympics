import '@testing-library/jest-dom'

// Mock localStorage for tests using a Proxy to support Object.keys()
const createLocalStorageMock = () => {
  const store: Record<string, string> = {}

  const handler: ProxyHandler<typeof store> = {
    get(target, prop: string) {
      if (prop === 'getItem') {
        return (key: string) => target[key] ?? null
      }
      if (prop === 'setItem') {
        return (key: string, value: string) => {
          target[key] = value.toString()
        }
      }
      if (prop === 'removeItem') {
        return (key: string) => {
          delete target[key]
        }
      }
      if (prop === 'clear') {
        return () => {
          Object.keys(target).forEach((key) => delete target[key])
        }
      }
      if (prop === 'key') {
        return (index: number) => Object.keys(target)[index] ?? null
      }
      if (prop === 'length') {
        return Object.keys(target).length
      }
      return target[prop]
    },
    ownKeys(target) {
      return Object.keys(target)
    },
    getOwnPropertyDescriptor(target, prop) {
      if (prop in target) {
        return { configurable: true, enumerable: true, value: target[prop as string] }
      }
      return undefined
    },
  }

  return new Proxy(store, handler)
}

Object.defineProperty(globalThis, 'localStorage', {
  value: createLocalStorageMock(),
  configurable: true,
})

// Mock window.location for OAuth tests
Object.defineProperty(globalThis, 'location', {
  value: {
    origin: 'http://localhost:3000',
    href: 'http://localhost:3000/',
  },
  writable: true,
})
