(function () {
  const Data = (function () {
    function identity (x) { return x }

    function composeOf (args) {
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

    function compose () {
      var args = arguments

      if (arguments.length === 0) {
        throw new Error('compose requires at least one argument')
      }

      return composeOf(args)
    }

    function range (left, right) {
      var data = []
      var index = left

      if (typeof left !== 'number' || typeof right !== 'number') {
        throw new Error('Arguments must be numbers')
      }

      while (index < right) {
        data.push(index)
        index += 1
      }

      return data
    }

    return {
      identity: identity,
      compose: compose,
      range: range
    }
  }())

  function debug (message) {
    return function (x) {
      console.log(message + x)
      return x
    }
  }

  function measure (fn, msg) {
    console.log(msg, ' start')
    const t0 = window.performance.now()
    const result = fn()
    const t1 = window.performance.now()
    console.log(msg, 'result is: ', (t1 - t0) + ' ms')
    return result
  }

  var Utils = {
    Data: Data,
    debug: debug,
    measure: measure
  }

  if (typeof exports === 'object') {
    module.exports = Utils
  } else if (typeof define === 'function' && define.amd) {
    define(function () { return Utils })
  } else {
    window.Utils = Utils
  }
}())

/* globals define */
