/* globals React, ReactDOM */

import WebApp from './web-app'
import Utils from './utils'

function debug (message) {
  return function (x) {
    console.log(message + x)
    return x
  }
}

(function application (root$) {
  const { compose } = Utils

  const rogueLikeGame = (function rogueLikeGame () {
    const config = Object.freeze({
      x: { name: 'cell-wall', output: ' ' },
      p: { name: 'cell-player', output: ' ' },
      e: { name: 'cell-enemy', output: ' ' },
      w: { name: 'cell-weapon', output: ' ' },
      h: { name: 'cell-health', output: ' ' },
      0: { name: 'cell-space', output: ' ' }
    })

    const init = [{
      dangeon: [
        'xxxxxxxxxxxxxxxxxxxxxxxxxx',
        'x0h000000xxx000000000h000x',
        'x00000000xxxxx00000000000x',
        'x0000000000xxx0xx0000e000x',
        'x0000000000x000xxxxxxxxxxx',
        'x00000000xxx0xxxxxxxxxxxxx',
        'x000000000000000000000000x',
        'x00000000x000000p000e0000x',
        'x00w00000x000000000000h00x',
        'xxxxxxxxxxxxxxxxxxxxxxxxxx'
      ]
    }]

    const actions = (function actions () {
      return {
        noop: () => [{}]
      }
    }())

    function view (address) {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      const app = (function app () {
        function App ({ dangeon }) {
          return h('div', { className: 'game' },
            h('div', { className: 'dangeon' },
              dangeon.map((row, rowId) => (
                h('div', { className: 'dangeon-row', key: rowId },
                  Array.from(row).map((cell, cellId) => (
                    h('div', {
                      className: ['dangeon-cell', config[cell].name].join(' '),
                      key: cellId
                    }, config[cell].output)
                  ))
                )
              ))
            )
          )
        }

        return { App }
      }())

      function reform (model) {
        return model
      }

      return function render (model) {
        const reflect = reform(model)
        const { App } = app

        return renderer(h(App, reflect))
      }
    }

    return {
      init,
      view
    }
  }())

  return (function start () {
    const { init, view } = rogueLikeGame

    return WebApp.start({
      init,
      render: view(compose(debug('And model is: '), WebApp.send, debug('Send a message: ')))
    })
  }())
}(document.getElementById('app-container')))
