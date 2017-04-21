(function () {
  function identity(x) { return x }

  function composeOf(args) {
    return function (x) {
      var result = x
      var id = args.length - 1

      while (id > -1) {
        result = args[id](result)
        id -= 1
      }

      return result
    }
  }

  function compose() {
    var args = arguments

    if (arguments.length === 0) {
      throw new Error("compose requires at least one argument")
    }

    return composeOf(args)
  }

  function range(left, right) {
    var data = []
    var index = left

    if (typeof left !== "number" || typeof right !== "number") {
      throw new Error("Arguments must be numbers")
    }

    while (index < right) {
      data.push(index)
      index += 1
    }

    return data
  }

  var Utils = {
    identity: identity,
    compose: compose,
    range: range
  }

  if (typeof exports === "object") {
    module.exports = Utils
  } else if (typeof define === "function" && define.amd) {
    define(function () { return Utils })
  } else {
    window.Utils = Utils
  }
}())

/* global define: false */
/* eslint-env es6:false */
/* eslint no-var: "off" */
/* eslint prefer-rest-params: "off" */
/* eslint object-shorthand: "off" */
/* eslint vars-on-top: "off" */

