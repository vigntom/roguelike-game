(function () {
  var identity = Utils.identity
  var compose = Utils.compose
  var mbox = identity
  var nomsg = Object.freeze({})

  function send(x) {
    return mbox(x)
  }

  function map(fn) {
    return compose(send, fn)
  }

  function merge2(origin, addition) {
    return Object.assign({}, origin, addition)
  }

  function update(action, model) {
    if (action === undefined) {
      throw new Error("Undefined action")
    }

    if (typeof action !== "function") {
      throw new Error("Improper Action " + action)
    }

    var msg = action(model)

    if (msg.msg === nomsg) { return [model, msg.task] }

    return [merge2(model, msg[0]), msg[1]]
  }

  var start = ({ init, render }) => {
    var updateStep = model => action => (
      subscribe(update(action, model), model)
    )

    function subscribe(nextModel, previous) {
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
    send: send,
    map: map,
    nomsg: nomsg
  }

  if (typeof exports === "object") {
    module.export = WebApp
  } else if (typeof define === "function" && define.amd) {
    define(function () { return WebApp })
  } else {
    window.WebApp = WebApp
  }
}())

/* global define: false, Utils: false */
/* eslint strict: ["error", "function"] */
/* eslint-env es6: false */
/* eslint no-var: "off" */
/* eslint prefer-rest-params: "off" */
/* eslint object-shorthand: "off" */
/* eslint vars-on-top: "off" */
