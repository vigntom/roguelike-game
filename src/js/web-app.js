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

    var pair = action(model)
    var msg = pair[0]
    var task = pair[1]

    if (Object.keys(msg).length === 0) {
      return [model, task]
    }

    return [merge2(model, msg), task]
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
    module.exports = WebApp
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return WebApp })
  } else {
    window.WebApp = WebApp
  }
}())

/* globals define */
