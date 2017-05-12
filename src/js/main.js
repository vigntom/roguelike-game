/* globals R, React, ReactDOM */

import WebApp from './web-app'

function debug (message) {
  return function (x) {
    console.log(message + x)
    return x
  }
}

(function application (root$) {
  const config = {
    pause: 2000,
    size: {
      rows: 10,
      cols: 26
    },
    objects: {
      wall: 'x',
      player: 'p',
      enemy: 'e',
      weapon: 'w',
      health: 'h',
      space: 'o',
      exit: 't'
    },

    marks: {
      x: 'cell-wall',
      p: 'cell-player',
      e: 'cell-enemy',
      w: 'cell-weapon',
      h: 'cell-health',
      o: 'cell-space',
      t: 'cell-exit'
    },

    floors: {
      // '1': { rows: 30, cols: 90, enemies: [3, 5], weapon: 'cane', health: [5, 7] },
      '1': { rows: 10, cols: 26, enemies: [3, 5], weapons: 1, health: [5, 7] },
      '2': { rows: 60, cols: 120, enemies: [6, 10], weapons: 1, health: [8, 11] },
      '3': { rows: 90, cols: 150, enemies: [9, 12], weapons: 1, health: [11, 15] },
      '4': { rows: 120, cols: 180, enemies: [10, 15], weapons: 1, health: [13, 18] },
      '5': { rows: 50, cols: 50, enemies: [0, 0], boss: 1, health: [3, 5], weapons: 1 }
    },

    weapons: {
      noWeapon: { power: 0, sd: 0.3 },
      stick: { power: 5, sd: 0.2 },
      cane: { level: '1', power: 10, sd: 0.15 },
      'bone knife': { level: '2', power: 15, sd: 0.13 },
      'copper dagger': { level: '3', power: 20, sd: 0.1 },
      'bronze ax': { level: '4', power: 25, sd: 0.08 },
      'simple sword': { level: '5', attack: 30, sd: 0.05 }
    },

    levels: {
      '1': { power: 10, breakpoint: 20 },
      '2': { power: 15, breakpoint: 40 },
      '3': { power: 20, breakpoint: 60 },
      '4': { power: 25, breakpoint: 80 }
    },

    enemies: {
      goblin: { level: '1', power: 5, health: 75, value: 10, weapon: 'stick' },
      skeleton: { level: '2', power: 10, health: 90, value: 20, weapon: 'cane' },
      gnoll: { level: '3', power: 15, health: 110, value: 35, weapon: 'copper dagger' },
      dwarf: { level: '4', power: 20, health: 125, value: 40, weapon: 'bronze ax' },
      boss: { level: '5', power: 30, health: 200, value: 100, weapon: 'simple sword' }
    },

    health: {
      'small potion': { level: '1', health: 25 },
      'potion': { level: '2', health: 50 },
      'medium potion': { level: '3', health: 75 },
      'great potion': { level: '4', health: 90 },
      'grand potion': { level: '5', health: 110 }
    }
  }

  const Stat = (function Stat () {
    function weapon (type) {
      return config.weapons[type]
    }

    function enemy (type) {
      return config.enemies[type]
    }

    return {
      weapon,
      enemy
    }
  }())

  const Point = (function Point () {
    const moveUp = p => create(p.x, p.y - 1)
    const moveDown = p => create(p.x, p.y + 1)
    const moveLeft = p => create(p.x - 1, p.y)
    const moveRight = p => create(p.x + 1, p.y)

    function create (x, y) {
      const size = config.size
      if (y < size.rows && x < size.cols) {
        const id = y * size.cols + x
        return { x, y, id }
      }

      throw new Error(`Point 'x:${x}, y:${y}' is out of the borders`)
    }

    return {
      create,
      moveUp,
      moveDown,
      moveLeft,
      moveRight
    }
  }())

  const Cell = (function Cell () {
    const isWall = cell => cell === config.objects.wall
    const isSpace = cell => cell === config.objects.space

    function create (value) {
      const valueExists = R.compose(R.any(x => x === value), R.keys)

      if (valueExists(config.objects) === undefined) {
        throw new Error(`Can't create Cell with value: #{value} !`)
      }

      return value
    }

    return {
      create,
      isWall,
      isSpace
    }
  }())

  const Dangeon = (function Dangeon () {
    const itemPlaces = R.compose(R.map(R.prop('place')), R.values)

    function create (rows, cols) {
      const testDangeon = [
        'xxxxxxxxxxxxxxxxxxxxxxxxxx',
        'xooooooooxxxooooooooooooox',
        'xooooooooxxxxxooooooooooox',
        'xxxooooooooxxxoxxoooooooox',
        'xxoooooooooxoooxxxxxxxxxxx',
        'xxxooooooxxxoxxxxxxxxxxxxx',
        'xxxxxoooooooooooooooooooox',
        'xoooxooooxooooooooooooooox',
        'xooooooooxooooooooooooooox',
        'xxxxxxxxxxxxxxxxxxxxxxxxxx'
      ]

      const fromStrToCell = R.compose(R.map(Cell.create), R.split(''))
      return R.map(fromStrToCell, testDangeon)
    }

    function batch (fn) {
      return (points, cell) =>
        R.reduce((accDangeon, point) => (
          fn(point, cell)(accDangeon)
        ), R.__, points)
    }

    function update (point, cell) {
      if (point === undefined) { return R.identity }

      return function (dangeon) {
        const pointIsWall = R.compose(Cell.isWall, get(point))

        if (pointIsWall(dangeon)) {
          throw new Error(`Position 'x:${point.x}, y:${point.y}' is occupied by a wall.`)
        }

        return set(point, cell, dangeon)
      }
    }

    function get (pos) {
      return dangeon => dangeon[pos.y][pos.x]
    }

    function set (pos, cell, dangeon) {
      const result = dangeon.concat()
      const row = dangeon[pos.y].concat()

      row[pos.x] = cell
      result[pos.y] = row

      return result
    }

    function itemMap (list) {
      const result = {}
      list.forEach(obj => {
        result[obj.place.id] = obj
      })

      return result
    }

    function fill ({ health, weapon, enemy, player, dangeon }) {
      const conf = config.objects
      const batchUpdate = batch(update)

      const fillDangeon = R.compose(
        batchUpdate(itemPlaces(health), conf.health),
        batchUpdate(itemPlaces(weapon), conf.weapon),
        batchUpdate(itemPlaces(enemy), conf.enemy),
        update(player.place, conf.player)
      )

      return fillDangeon(dangeon)
    }

    return {
      create,
      get,
      set,
      update,
      batch,
      itemMap,
      itemPlaces,
      fill
    }
  }())

  const Weapon = (function Weapon () {
    function minDamage (weapon) {
      return Math.ceil(weapon.power * (1 - 3 * weapon.sd))
    }

    function maxDamage (weapon) {
      return Math.floor(weapon.power * (1 + 3 * weapon.sd))
    }

    function create (type) {
      return config.weapons[type]
    }

    return {
      create,
      minDamage,
      maxDamage
    }
  }())

  function rogueLikeGame (address) {
    const tasks = (function tasks () {
      function batchAccum (tasks, init) {
        return () => R.reduce((acc, fn) => (
          fn(acc)()
        ), init, tasks)
      }

      function randomInRange (min, max) {
        return min + Math.floor(Math.random() * (max - min + 1))
      }

      function randomDamage (damager) {
        const weapon = Weapon.create(damager.weapon)
        const min = Weapon.minDamage(weapon)
        const max = Weapon.maxDamage(weapon)

        return damager.power + randomInRange(min, max)
      }

      function generateDamage ({ player, enemy }, keeper) {
        const enemyDamage = R.compose(randomDamage, Stat.enemy)

        return () => address(keeper({
          player: randomDamage(player),
          enemy: enemyDamage(enemy.type)
        }))
      }

      function pause (delay, keeper) {
        return () => setTimeout(() => address(keeper), delay)
      }

      function gameObjSize (sizeConf) {
        if (R.is(Array, sizeConf)) {
          return randomInRange(sizeConf[0], sizeConf[1])
        }

        return sizeConf
      }

      function generatePoint (floor, dangeon) {
        const { rows, cols } = config.floors[floor]

        function randomPoint () {
          const col = randomInRange(0, cols - 1)
          const row = randomInRange(0, rows - 1)
          const point = Point.create(col, row)
          const isSpaceInPoint = R.compose(Cell.isSpace, Dangeon.get(point))

          if (isSpaceInPoint(dangeon)) {
            return point
          }

          return randomPoint()
        }

        return randomPoint()
      }

      function generateGameObjects (name) {
        return keeper => model => {
          return () => {
            const { floor } = model
            const conf = config.floors[floor]
            const size = gameObjSize(conf[name])
            const stdObj = config[name]

            const type = R.find(x => (
              stdObj[x].level === floor
            ), R.keys(stdObj))

            const health = stdObj[type].health
            const formAndSend = R.compose(
              address, keeper, Dangeon.itemMap, R.last, R.mapAccum
            )

            return formAndSend(
              (dangeon) => {
                const place = generatePoint(floor, dangeon)
                const updatedDangeon = Dangeon.update(place, conf[name])(dangeon)
                return [updatedDangeon, { place, type, health }]
              }, Dangeon.fill(model), R.range(0, size))
          }
        }
      }

      function generatePlayer (keeper) {
        return ({ floor, dangeon, player }) => () => {
          const send = R.compose(address, keeper)
          return send(generatePoint(floor, dangeon))
        }
      }

      return {
        batchAccum,
        generateEnemies: generateGameObjects('enemies'),
        generateWeapons: generateGameObjects('weapons'),
        generateHealth: generateGameObjects('health'),
        generatePlayer,
        generateDamage,
        pause
      }
    }())

    const actions = (function actions () {
      const noop = () => [{}]
      const keep = key => value => model => [R.assoc(key, value, model)]
      const keyMoveMap = new Map()

      keyMoveMap.set('ArrowUp', move(Point.moveUp))
      keyMoveMap.set('ArrowDown', move(Point.moveDown))
      keyMoveMap.set('ArrowLeft', move(Point.moveLeft))
      keyMoveMap.set('ArrowRight', move(Point.moveRight))

      keyMoveMap.set('w', move(Point.moveUp))
      keyMoveMap.set('s', move(Point.moveDown))
      keyMoveMap.set('a', move(Point.moveLeft))
      keyMoveMap.set('d', move(Point.moveRight))

      const makeStep = (place, model) => (
        R.assocPath(['player', 'place'], place, model)
      )

      const newGame = () => createDangeon()

      function analyzeAttack (place, model) {
        const id = place.id
        const enemy = model.enemy[id]
        const player = model.player

        if (player.health <= 0) {
          return [
            R.assoc('gameOver', true, model),
            tasks.pause(config.pause, newGame)
          ]
        }

        if (enemy.health <= 0) {
          const expAfter = player.experience + Stat.enemy(enemy.type).value
          const level = config.levels[model.player.level]

          const result = R.compose(
            R.assocPath(['player', 'experience'], expAfter),
            R.dissocPath(['enemy', id])
          )(model)

          if (result.player.experience >= level.breakpoint) {
            result.player.level += 1
            result.player.experience = result.player.experience - level.breakpoint
          }

          return [makeStep(place, result)]
        }

        return [model]
      }

      function simulateAttack (place) {
        return function (damage) {
          return function (model) {
            const id = place.id
            const playerHealth = model.player.health
            const enemyHealth = model.enemy[id].health

            const playerRest = playerHealth - damage.enemy
            const enemyRest = enemyHealth - damage.player

            const simulate = R.compose(
              R.assocPath(['player', 'health'], playerRest),
              R.assocPath(['enemy', id, 'health'], enemyRest)
            )

            return analyzeAttack(place, simulate(model))
          }
        }
      }

      function takeHealth (place, model) {
        const { player, health } = model
        const id = place.id

        const resultHealth = player.health + health[id].health
        const take = R.compose(
          R.assocPath(['player', 'health'], resultHealth),
          R.dissocPath(['health', id])
        )

        return [makeStep(place, take(model))]
      }

      function takeWeapon (place, model) {
        const { player, weapon } = model
        const id = place.id

        if (Stat.weapon(player.weapon).power < Stat.weapon(weapon[id].type).power) {
          const take = R.compose(
            R.assocPath(['player', 'weapon'], weapon[id].type),
            R.dissocPath(['weapon', id])
          )

          return [makeStep(place, take(model))]
        }

        return [makeStep(place, R.dissocPath(['weapon', id], model))]
      }

      function attackEnemy (place, model) {
        const { player, enemy } = model
        const id = place.id

        return [
          {},
          tasks.generateDamage({
            player,
            enemy: enemy[id]
          }, simulateAttack(place))
        ]
      }

      function move (step) {
        return function (model) {
          const { player, enemy, health, weapon } = model
          const moveTo = step(player.place)
          const id = moveTo.id
          const isPlaceSpace = R.compose(Cell.isSpace, Dangeon.get(moveTo))

          if (model.gameOver) { return [{}] }
          if (enemy[id]) { return attackEnemy(moveTo, model) }
          if (weapon[id]) { return takeWeapon(moveTo, model) }
          if (health[id]) { return takeHealth(moveTo, model) }

          if (isPlaceSpace(model.dangeon)) {
            return [makeStep(moveTo, model)]
          }

          return [{}]
        }
      }

      function keepPlayerPlace (place) {
        return (model) => {
          return [R.assocPath(['player', 'place'], place, model)]
        }
      }

      return {
        noop,
        keep,
        keepPlayerPlace,
        keyDown: key => {
          const action = keyMoveMap.get(key)

          if (action === undefined) { return noop }
          return action
        }
      }
    }())

    function createDangeon () {
      const initialState = {
        player: {
          level: 1,
          health: 100,
          power: 10,
          experience: 0,
          weapon: 'stick'
        },

        floor: '1',

        dangeon: Dangeon.create(10, 26),

        rows: 10,
        cols: 26,
        gameOver: false
      }

      return [
        initialState,
        tasks.batchAccum([
          tasks.generateEnemies(actions.keep('enemy')),
          tasks.generateWeapons(actions.keep('weapon')),
          tasks.generateHealth(actions.keep('health')),
          tasks.generatePlayer(actions.keepPlayerPlace)
        ], initialState)]
    }

    function view () {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      function keyDownHandler (ev) {
        address(actions.keyDown(ev.key))
      }

      document.body.addEventListener('keydown', keyDownHandler)

      const app = (function app () {
        function App ({ dangeon, player, floor, gameOver }) {
          const { health, power, level, experience } = player
          console.log(player)
          const weapon = Stat.weapon(player.weapon).power

          return h('div', {
            className: 'game'
          },
            h('div', { className: 'game-state' + ' ' + (gameOver ? 'game-over' : 'game-ok') },
              h('h2', {}, 'Game over!')
            ),
            h('div', { className: 'info' },
              h('div', { className: 'info-item' },
                h('h2', {}, 'Health: '),
                h('p', {}, health)
              ),
              h('div', { className: 'info-item' },
                h('h2', {}, 'Weapon: '),
                h('p', {}, player.weapon)
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
              R.map(rowId => (
                h('div', { className: 'dangeon-row', key: rowId },
                  R.map(cellId => (
                    h('div', {
                      className: [
                        'dangeon-cell',
                        config.marks[dangeon[rowId][cellId]]
                      ].join(' '),
                      key: cellId
                    })
                  ), R.range(0, dangeon[rowId].length))
                )
              ), R.range(0, dangeon.length))
            )
          )
        }

        return { App }
      }())

      function reform (model) {
        return R.merge(model, { dangeon: Dangeon.fill(model) })
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
    return R.compose(
      WebApp.start,
      rogueLikeGame
    )(WebApp.send)
  }())
}(document.getElementById('app-container')))
