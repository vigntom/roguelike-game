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
      wall: 'x',
      player: 'p',
      enemy: 'e',
      weapon: 'w',
      health: 'h',
      space: '0',
      x: 'cell-wall',
      p: 'cell-player',
      e: 'cell-enemy',
      w: 'cell-weapon',
      h: 'cell-health',
      0: 'cell-space',
      stick: { power: 5 },
      cane: { power: 10 },
      'bone knife': { power: 15 },
      'copper dagger': { power: 20 },
      'bronze ax': { power: 25 },
      'simple sword': { power: 30 }
    })

    const init = [{
      player: {
        x: 17,
        y: 7,
        health: 100,
        power: 10,
        level: 1,
        experience: 0,
        weapon: 'stick'
      },

      enemy: [
        { x: 21, y: 3, power: 4, health: 20 },
        { x: 15, y: 7, power: 5, health: 30 }
      ],

      weapon: [
        { x: 8, y: 3, name: 'cane' }
      ],

      health: [
        { x: 1, y: 2, health: 20 },
        { x: 18, y: 3, health: 20 },
        { x: 19, y: 8, health: 15 }
      ],

      floor: 1,

      dangeon: [
        'xxxxxxxxxxxxxxxxxxxxxxxxxx',
        'x00000000xxx0000000000000x',
        'x00000000xxxxx00000000000x',
        'x0000000000xxx0xx00000000x',
        'x0000000000x000xxxxxxxxxxx',
        'x00000000xxx0xxxxxxxxxxxxx',
        'x000000000000000000000000x',
        'x00000000x000000000000000x',
        'x00000000x000000000000000x',
        'xxxxxxxxxxxxxxxxxxxxxxxxxx'
      ].map(str => Array.from(str))
    }]

    const actions = (function actions () {
      const noop = () => [{}]
      const keyMoveMap = new Map()

      const moveUp = ({ x, y }) => ({ x, y: y - 1 })
      const moveDown = ({ x, y }) => ({ x, y: y + 1 })
      const moveLeft = ({ x, y }) => ({ x: x - 1, y })
      const moveRight = ({ x, y }) => ({ x: x + 1, y })

      keyMoveMap.set('ArrowUp', move(moveUp))
      keyMoveMap.set('ArrowDown', move(moveDown))
      keyMoveMap.set('ArrowLeft', move(moveLeft))
      keyMoveMap.set('ArrowRight', move(moveRight))

      keyMoveMap.set('w', move(moveUp))
      keyMoveMap.set('s', move(moveDown))
      keyMoveMap.set('a', move(moveLeft))
      keyMoveMap.set('d', move(moveRight))

      function move (step) {
        return function (model) {
          const next = Object.assign({}, model)
          const dangeon = next.dangeon
          const { x, y } = step(model.player)

          if (dangeon[y][x] === config.space) {
            next.player = Object.assign({}, model.player, { x, y })
          }

          return [next]
        }
      }

      return {
        noop,
        keyDown: key => {
          const action = keyMoveMap.get(key)

          if (action === undefined) { return noop }
          return action
        }
      }
    }())

    function view (address) {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      function keyDownHandler (ev) {
        address(actions.keyDown(ev.key))
      }

      document.body.addEventListener('keydown', keyDownHandler)

      const app = (function app () {
        function App ({ dangeon, player, floor }) {
          return h('div', {
            className: 'game'
          },
            h('div', { className: 'info' },
              h('div', { className: 'info-item' },
                h('h2', {}, 'Health: '),
                h('p', {}, player.health)
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Weapon: '),
                h('p', {}, player.weapon)
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Power: '),
                h('p', {}, (player.power + config[player.weapon].power).toString())
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Level: '),
                h('p', {}, player.level.toString())
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Experience: '),
                h('p', {}, player.experience.toString())
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Floor: '),
                h('p', {}, floor.toString())
              )
            ),
            h('div', { className: 'dangeon' },
              dangeon.map((row, rowId) => (
                h('div', { className: 'dangeon-row', key: rowId },
                  Array.from(row).map((cell, cellId) => (
                    h('div', {
                      className: ['dangeon-cell', config[cell]].join(' '),
                      key: cellId
                    })
                  ))
                )
              ))
            )
          )
        }

        return { App }
      }())

      function reform (model) {
        function dangeonUpdate (position, value) {
          if (Array.isArray(position)) {
            return compose.apply(
              undefined,
              position.map(
                pos => dangeonUpdate(pos, value)
              )
            )
          }

          return (dangeon) => {
            const { x, y } = position
            const data = dangeon.concat()
            const row = data[y].concat()

            row[x] = value
            data[y] = row

            return data
          }
        }

        const dangeon = compose(
          dangeonUpdate(model.health, config.health),
          dangeonUpdate(model.weapon, config.weapon),
          dangeonUpdate(model.enemy, config.enemy),
          dangeonUpdate(model.player, config.player)
        )(model.dangeon)

        return {
          player: model.player,
          floor: model.floor,
          dangeon
        }
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
      render: view(WebApp.send)
    })
  }())
}(document.getElementById('app-container')))
