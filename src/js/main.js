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

  const config = Object.freeze({
    objects: {
      wall: 'x',
      player: 'p',
      enemy: 'e',
      weapon: 'w',
      health: 'h',
      space: '0'
    },
    marks: {
      x: 'cell-wall',
      p: 'cell-player',
      e: 'cell-enemy',
      w: 'cell-weapon',
      h: 'cell-health',
      0: 'cell-space'
    },
    weapons: {
      noWeapon: { power: 0, sd: 0.3 },
      stick: { power: 5, sd: 0.2 },
      cane: { power: 10, sd: 0.15 },
      'bone knife': { power: 15, sd: 0.13 },
      'copper dagger': { power: 20, sd: 0.1 },
      'bronze ax': { power: 25, sd: 0.08 },
      'simple sword': { attack: 30, sd: 0.05 }
    },
    levels: {
      '1': { power: 10, health: 100, breakpoint: 20 },
      '2': { power: 15, health: 150, breakpoint: 40 },
      '3': { power: 20, health: 200, breakpoint: 60 },
      '4': { power: 25, health: 250, breakpoint: 80 }
    },
    enemies: {
      goblin: {
        level: 1,
        power: 5,
        value: 10,
        weapon: 'stick'
      },
      skeleton: {
        level: 2,
        power: 10,
        value: 20,
        weapon: 'cane'
      },
      gnoll: {
        level: 3,
        power: 15,
        value: 35,
        weapon: 'copper dagger'
      },
      dwarf: {
        level: 4,
        power: 20,
        value: 40,
        weapon: 'bronze ax'
      },
      boss: {
        level: 5,
        power: 50,
        value: 100,
        weapon: 'simple sword'
      }
    }
  })

  const Point = (function Point () {
    const moveUp = p => create(p.x, p.y - 1)
    const moveDown = p => create(p.x, p.y + 1)
    const moveLeft = p => create(p.x - 1, p.y)
    const moveRight = p => create(p.x + 1, p.y)

    function create (x, y) {
      return { x, y }
    }

    function equals (p1, p2) {
      return p1.x === p2.x && p1.y === p2.y
    }

    return {
      create,
      equals,
      moveUp,
      moveDown,
      moveLeft,
      moveRight
    }
  }())

  const Cell = (function Cell () {
    const isWall = cell => cell === config.objects.wall

    function create (value) {
      const valueExists = Object.keys(config.objects).some(x => x === value)

      if (valueExists === undefined) {
        throw new Error(`Can't create Cell with value: #{value} !`)
      }

      return value
    }

    return {
      create,
      isWall
    }
  }())

  const Dangeon = (function Dangeon () {
    function create (rows, cols) {
      const testDangeon = [
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
      ]

      return testDangeon.map(str => {
        const row = Array.from(str)
        return row.map(value => Cell.create(value))
      })
    }

    function batch (fn) {
      return (points, cell) =>
        dangeon => points.reduce((accDangeon, point) => (
          fn(point, cell)(accDangeon)
        ), dangeon)
    }

    function update (point, cell) {
      return function (dangeon) {
        const pointIsWall = compose(Cell.isWall, get(point))

        if (pointIsWall(dangeon)) {
          throw new Error(`Position for value '#{value}' is occupied by a wall.`)
        }

        return set(point, cell, dangeon)
      }
    }

    function get (pos) {
      return dangeon => dangeon[pos.y][pos.x]
    }

    function set (pos, cell, dangeon) {
      const dangeonCopy = dangeon.concat()
      const row = dangeon[pos.y].concat()

      row[pos.x] = cell
      dangeonCopy[pos.y] = row

      return dangeonCopy
    }

    return {
      create,
      get,
      set,
      update,
      batch
    }
  }())

  function rogueLikeGame (address) {
    function createDangeon () {
      const initialState = {
        player: {
          place: Point.create(17, 7),
          level: 1,
          health: 100,
          power: 10,
          experience: 0,
          weapon: 'stick'
        },

        enemy: [
          { place: Point.create(21, 3), health: 95, type: 'goblin' },
          { place: Point.create(15, 7), health: 90, type: 'goblin' }
        ],

        weapon: [
          { place: Point.create(8, 3), name: 'cane' }
        ],

        health: [
          { place: Point.create(1, 2), health: 20 },
          { place: Point.create(18, 3), health: 20 },
          { place: Point.create(19, 8), health: 15 }
        ],

        floor: 1,

        dangeon: Dangeon.create()
      }

      return [initialState]
    }

    const tasks = (function tasks () {
      function randomDamage ({ power, weapon }) {
        const weaponPower = config.weapons[weapon].power
        const sd = config.weapons[weapon].sd
        const min = Math.ceil(weaponPower * (1 - 3 * sd))
        const max = Math.floor(weaponPower * (1 + 3 * sd))

        return power + min + Math.floor(Math.random() * (max - min + 1))
      }

      function generateDamage ({ player, enemy }, keeper) {
        return () => keeper({
          player: randomDamage(player),
          enemy: randomDamage(config.enemies[enemy.type])
        })
      }

      return {
        generateDamage
      }
    }())

    const actions = (function actions () {
      const noop = () => [{}]
      const keyMoveMap = new Map()

      keyMoveMap.set('ArrowUp', move(Point.moveUp))
      keyMoveMap.set('ArrowDown', move(Point.moveDown))
      keyMoveMap.set('ArrowLeft', move(Point.moveLeft))
      keyMoveMap.set('ArrowRight', move(Point.moveRight))

      keyMoveMap.set('w', move(Point.moveUp))
      keyMoveMap.set('s', move(Point.moveDown))
      keyMoveMap.set('a', move(Point.moveLeft))
      keyMoveMap.set('d', move(Point.moveRight))

      function simulateAttack (enemyId) {
        return function ({ player, enemy }) {
          return function (model) {
            const next = Object.assign({}, model)

            next.player = Object.assign({}, model.player)
            next.enemy = model.enemy.concat()
            next.enemy[enemyId] = Object.assign({}, model.enemy[enemyId])

            next.player.health -= enemy
            next.enemy[enemyId].health -= player

            if (next.enemy[enemyId].health <= 0) {
              next.player.experience += config.enemies[next.enemy[enemyId].type].value

              if (next.player.experience >= config.levels[next.player.level].breakpoint) {
                next.player.level += 1
                next.player.experience = 0
              }

              next.enemy = next.enemy
                .slice(0, enemyId)
                .concat(next.enemy.slice(enemyId + 1))
            }

            return [next]
          }
        }
      }

      function move (step) {
        return function (model) {
          const next = Object.assign({}, model)
          const dangeon = next.dangeon
          const moveTo = step(model.player.place)
          const findId = findPositionId(moveTo)

          function findPositionId (pos) {
            return function (list) {
              return list.findIndex(({ place }) => Point.equals(pos, place))
            }
          }

          const maybeHealthId = findId(model.health)

          if (maybeHealthId > -1) {
            next.player.health += next.health[maybeHealthId].health
            next.health = next.health
              .slice(0, maybeHealthId)
              .concat(next.health.slice(maybeHealthId + 1))

            return makeStep()
          }

          const maybeWeaponId = findId(model.weapon)

          if (maybeWeaponId > -1) {
            next.player.weapon = next.weapon[maybeWeaponId].name
            next.weapon = next.weapon
              .slice(0, maybeWeaponId)
              .concat(next.weapon.slice(maybeWeaponId + 1))

            return makeStep()
          }

          const maybeEnemyId = findId(model.enemy)

          if (maybeEnemyId > -1) {
            return [
              {},
              tasks.generateDamage({
                player: model.player,
                enemy: model.enemy[maybeEnemyId]
              }, compose(address, simulateAttack(maybeEnemyId)))
            ]
          }

          if (dangeon[moveTo.y][moveTo.x] === config.objects.space) {
            return makeStep()
          }

          function makeStep () {
            next.player = Object.assign({}, model.player)
            next.player.place = Object.assign({}, model.player.place, moveTo)
            return [next]
          }

          return [{}]
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

    function view () {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      function keyDownHandler (ev) {
        address(actions.keyDown(ev.key))
      }

      document.body.addEventListener('keydown', keyDownHandler)

      const app = (function app () {
        function App ({ dangeon, player, floor }) {
          const { health, power, level, experience } = player
          const weapon = config.weapons[player.weapon].power

          return h('div', {
            className: 'game'
          },
            h('div', { className: 'info' },
              h('div', { className: 'info-item' },
                h('h2', {}, 'Health: '),
                h('p', {}, health)
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Weapon: '),
                h('p', {}, weapon)
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Power: '),
                h('p', {}, (power + weapon).toString())
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Level: '),
                h('p', {}, level.toString())
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Experience: '),
                h('p', {}, experience.toString())
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
                      className: ['dangeon-cell', config.marks[cell]].join(' '),
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
        const { health, weapon, enemy, player } = model
        const conf = config.objects

        const places = list => list.map(obj => obj.place)
        const batchUpdate = Dangeon.batch(Dangeon.update)

        const dangeon = compose(
          batchUpdate(places(health), conf.health),
          batchUpdate(places(weapon), conf.weapon),
          batchUpdate(places(enemy), conf.enemy),
          Dangeon.update(player.place, conf.player)
        )

        return {
          player,
          floor: model.floor,
          dangeon: dangeon(model.dangeon)
        }
      }

      return function render (model) {
        const reflect = reform(model)
        const { App } = app

        return renderer(h(App, reflect))
      }
    }

    return {
      init: createDangeon(),
      render: view()
    }
  }

  return (function start () {
    return compose(
      WebApp.start,
      rogueLikeGame
    )(WebApp.send)
  }())
}(document.getElementById('app-container')))
