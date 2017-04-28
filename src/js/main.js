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
    const init = [{

    }]

    const actions = (function actions () {
      return {
      }
    }())

    function view (address) {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      const app = (function app () {
        function App (data) {
          return h('div')
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

/* globals React, ReactDOM */
