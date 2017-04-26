/* globals Utils, define */

(function () {
  var mbox = function (x) {
    return x
  }

  function send (x) {
    return mbox(x)
  }

  function merge2 (origin, addition) {
    return Object.assign({}, origin, addition)
  }

  function update (action, model) {
    if (action === undefined) {
      throw new Error('Undefined action')
    }

    if (typeof action !== 'function') {
      throw new Error('Improper Action: ' + action)
    }

    var msg = action(model)

    return [merge2(model, msg[0]), msg[1]]
  }

  function start (config) {
    var init = config.init
    var render = config.render

    function updateStep (model) {
      return function (action) {
        return subscribe(update(action, model), model)
      }
    }

    function subscribe (nextModel, previous) {
      var model = nextModel[0]
      var task = nextModel[1]

      mbox = updateStep(model)

      if (model !== previous) { render(model) }
      if (task !== undefined) { task() }

      return model
    }

    return subscribe(init)
  }

  var WebApp = {
    start: start,
    send: send
  }

  if (typeof exports === 'object') {
    module.export = WebApp
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return WebApp })
  } else {
    window.WebApp = WebApp
  }
}())
