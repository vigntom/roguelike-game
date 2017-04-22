(function testWebApp() {
  const { module, test } = QUnit

  function counter() {
    const init = [{ data: 0 }]

    const actions = {
      noop: () => [WebApp.nomsg],
      inc: ({ data }) => [{ data: data + 1 }],
      dec: ({ data }) => [{ data: data - 1 }]
    }

    function view() {
      return function render(model) {
        return model
      }
    }

    return {
      init,
      view,
      actions
    }
  }

  function pairOfCounters() {
    const component = counter()

    const init = [{
      alfa: component.init[0],
      betta: component.init[0]
    }]

    const actions = {
      noop: () => [WebApp.nomsg],
      reset: () => init,
      alfa: action => ({ alfa }) => {
        const next = action(alfa)

        if (next[0] === WebApp.nomsg) {
          return next
        }

        return [{ alfa: next[0] }, next[1]]
      },
      betta: action => ({ betta }) => {
        const next = action(betta)

        if (next[0] === WebApp.nomsg) {
          return next
        }

        return [{ betta: next[0] }, next[1]]
      }
    }

    function view() {
      return function render(model) {
        return model
      }
    }

    return {
      init,
      view,
      actions
    }
  }


  module("web-app", function () {
    module("constants", function () {
      test("returns nomsg constant",
        function (assert) {
          assert.propEqual(WebApp.nomsg, {})
          assert.notPropEqual(WebApp.nomsg, { foo: "moo" })
        }
      )
    })

    module("counter", {
      beforeEach() {
        const { init, actions, view } = counter()

        this.init = WebApp.start({ init, render: view() })
        this.actions = actions
      }
    }, function () {
      test("initial counter equals zero",
        function (assert) {
          const { init } = this

          assert.notStrictEqual(init.data, 1)
          assert.strictEqual(init.data, 0)
        }
      )

      test("noop returns model",
        function (assert) {
          const { actions } = this
          const model = WebApp.send(actions.noop)

          assert.notStrictEqual(model.data, 1)
          assert.strictEqual(model.data, 0)
        }
      )

      test("inc action increment counter",
        function (assert) {
          const { actions } = this

          assert.equal(WebApp.send(actions.inc).data, 1)
          assert.equal(WebApp.send(actions.inc).data, 2)
          assert.equal(WebApp.send(actions.inc).data, 3)
        }
      )

      test("dec action decrement counter",
        function (assert) {
          const { actions } = this

          assert.equal(WebApp.send(actions.dec).data, -1)
          assert.equal(WebApp.send(actions.dec).data, -2)
          assert.equal(WebApp.send(actions.dec).data, -3)
        }
      )

      test("combine inc and dec",
        function (assert) {
          const { actions } = this

          assert.equal(WebApp.send(actions.inc).data, 1)
          assert.equal(WebApp.send(actions.inc).data, 2)
          assert.equal(WebApp.send(actions.dec).data, 1)
          assert.equal(WebApp.send(actions.inc).data, 2)
        }
      )
    })

    module("map", {
      beforeEach() {
        const { init, actions, view } = pairOfCounters()

        this.app = WebApp.start({ init, render: view() })
        this.component = counter()
        this.actions = actions
        this.toAlfa = WebApp.map(actions.alfa)
        this.toBetta = WebApp.map(actions.betta)
      }
    }, function () {
      test("check initial values",
        function (assert) {
          const { toAlfa, toBetta, component: { actions } } = this

          const modelThroughAlfa = toAlfa(actions.noop)
          assert.strictEqual(modelThroughAlfa.alfa.data, 0)
          assert.strictEqual(modelThroughAlfa.betta.data, 0)

          const modelThroughBetta = toBetta(actions.noop)
          assert.strictEqual(modelThroughBetta.alfa.data, 0)
          assert.strictEqual(modelThroughBetta.betta.data, 0)
        }
      )

      test("play with alfa",
        function (assert) {
          const { toAlfa, component: { actions } } = this

          assert.equal(toAlfa(actions.inc).alfa.data, 1)
          assert.equal(toAlfa(actions.noop).betta.data, 0)

          assert.equal(toAlfa(actions.dec).alfa.data, 0)
          assert.equal(toAlfa(actions.noop).betta.data, 0)

          assert.equal(toAlfa(actions.dec).alfa.data, -1)
          assert.equal(toAlfa(actions.noop).betta.data, 0)
        }
      )

      test("play with both",
        function (assert) {
          const { toAlfa, toBetta, component: { actions } } = this

          assert.equal(toAlfa(actions.inc).alfa.data, 1)
          assert.equal(toBetta(actions.dec).betta.data, -1)

          assert.equal(toAlfa(actions.inc).betta.data, -1)
          assert.equal(toBetta(actions.inc).alfa.data, 2)

          assert.equal(toAlfa(actions.dec).alfa.data, 1)
          assert.equal(toBetta(actions.dec).betta.data, -1)
        }
      )
    })
  })
}())

/* global QUnit:false, WebApp:false */
