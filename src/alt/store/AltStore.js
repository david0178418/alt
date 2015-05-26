import * as fn from '../../utils/functions'
import transmitter from 'transmitter'

class AltStore {
  constructor(alt, model, state, StoreModel) {
    const lifecycleEvents = model.lifecycleEvents
    this.transmitter = transmitter()
    this.lifecycle = (event, x) => {
      if (lifecycleEvents[event]) lifecycleEvents[event].push(x)
    }
    this.state = state || model

    this._storeName = model._storeName
    this.boundListeners = model.boundListeners
    this.StoreModel = StoreModel

    fn.assign(this, model.publicMethods)

    // Register dispatcher
    this.dispatchToken = alt.dispatcher.register((payload) => {
      this.lifecycle('beforeEach', {
        payload,
        state: this.state
      })

      if (model.actionListeners[payload.action]) {
        let result = false

        try {
          result = model.actionListeners[payload.action](payload.data)
        } catch (e) {
          if (model.handlesOwnErrors) {
            this.lifecycle('error', {
              error: e,
              payload,
              state: this.state
            })
          } else {
            throw e
          }
        }

        if (result !== false) {
          this.emitChange()
        }
      }

      this.lifecycle('afterEach', {
        payload,
        state: this.state
      })
    })

    this.lifecycle('init')
  }

  emitChange() {
    this.transmitter.push(this.state)
  }

  listen(cb) {
    this.transmitter.subscribe(cb)
    return () => this.unlisten(cb)
  }

  unlisten(cb) {
    this.lifecycle('unlisten')
    this.transmitter.unsubscribe(cb)
  }

  getState() {
    return this.StoreModel.config.getState.call(this, this.state)
  }
}

export default AltStore
