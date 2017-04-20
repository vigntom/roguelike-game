(function () {
  function identity(x) { return x }

  function compose() {
    var parentArguments = arguments

    if (arguments.length === 0) {
      throw new Error("compose requires at least one argument")
    }

    return function (x) {
      var result = x
      var id = parentArguments.length - 1

      while (id > -1) {
        result = parentArguments[id](result)
        id -= 1
      }

      return result
    }
  }

  const Utils = {
    identity,
    compose
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
