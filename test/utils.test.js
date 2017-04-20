(function testUtils() {
  const { test } = QUnit

  QUnit.module("utils", () => {
    QUnit.module("identity", () => {
      const { identity } = Utils

      test("returns its first argument", (assert) => {
        assert.equal(identity(undefined), undefined)

        assert.equal(identity("alfa"), "alfa")
        assert.notEqual(identity("alfa"), "betta")

        assert.equal(identity("alfa", "betta"), "alfa")
      })

      test("has length 1", function (assert) {
        assert.equal(identity.length, 1)
      })
    })

    QUnit.module("compose", () => {
      const { compose } = Utils

      test("throws if given no arguments", function (assert) {
        assert.throws(
          function () { compose() },
          function (err) {
            return err.message === "compose requires at least one argument"
          }
        )
      })

      test("performs right to left function composition", function (assert) {
        const fn = function (str) { return `test ${str}` }
        const gn = function (str) { return `wrap (${str})` }
        const hn = function (str) { return `hn: ${str}` }

        assert.notEqual(compose(fn)("foo foo foo"), "")
        assert.equal(compose(fn)("foo foo foo"), "test foo foo foo")
        assert.equal(compose(gn, fn)("foo foo foo"), "wrap (test foo foo foo)")
        assert.equal(compose(hn, gn, fn)("foo foo foo"), "hn: wrap (test foo foo foo)")
      })
    })
  })
}())

/* global QUnit:false, Utils:false */
