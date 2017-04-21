(function testUtils() {
  const { test } = QUnit

  QUnit.module("utils", function () {
    QUnit.module("identity", function () {
      const { identity } = Utils

      test("returns its first argument",
        function (assert) {
          assert.equal(identity(undefined), undefined)

          assert.equal(identity("alfa"), "alfa")
          assert.notEqual(identity("alfa"), "betta")

          assert.equal(identity("alfa", "betta"), "alfa")
        }
      )

      test("has length 1",
        function (assert) {
          assert.equal(identity.length, 1)
        }
      )
    })

    QUnit.module("compose", function () {
      const { compose } = Utils

      test("throws if given no arguments",
        function (assert) {
          assert.throws(
            compose,
            function (err) {
              return err.message === "compose requires at least one argument"
            }
          )
        }
      )

      test("performs right to left function composition",
        function (assert) {
          const fn = function (str) { return `test ${str}` }
          const gn = function (str) { return `wrap (${str})` }
          const hn = function (str) { return `hn: ${str}` }

          assert.notEqual(compose(fn)("foo foo foo"), "")
          assert.equal(compose(fn)("foo foo foo"), "test foo foo foo")
          assert.equal(compose(gn, fn)("foo foo foo"), "wrap (test foo foo foo)")
          assert.equal(compose(hn, gn, fn)("foo foo foo"), "hn: wrap (test foo foo foo)")
        }
      )
    })

    QUnit.module("range", () => {
      const { range } = Utils

      test("returns list of numbers",
        function (assert) {
          assert.deepEqual(range(0, 2), [0, 1])
          assert.deepEqual(range(3, 7), [3, 4, 5, 6])
        }
      )

      test("returns empty list if left >= right",
        function (assert) {
          assert.deepEqual(range(1, 1), [])
          assert.deepEqual(range(2, 0), [])
        }
      )

      test("throw error if at least one argument isn't a number",
        function (assert) {
          assert.expect(3)

          function wrongArguments(left, right) {
            return assert.throws(
              function () { range(left, right) },
              function (err) {
                return err.message === "Arguments must be numbers"
              }
            )
          }

          wrongArguments("1", 2)
          wrongArguments(1, "foo")
          wrongArguments("a", "b")
        }
      )
    })
  })
}())

/* global QUnit:false, Utils:false */
