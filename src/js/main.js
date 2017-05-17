/* globals R, React, ReactDOM */

import WebApp from './web-app'

(function application (root$) {
  const config = {
    pause: 2000,        // pause to start a new game
    privateArea: 1,
    corridorWidth: 2,
    // minRoomSize: 3,
    // minZoneSize: 7,
    minRoomSize: 7,
    minZoneSize: 15,
    sizeOfPreferences: 5,
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
      'floor-1': { rows: 60, cols: 90, enemies: [3, 5], weapons: 1, health: [5, 7] },
      // 'floor-1': { rows: 8, cols: 15, enemies: [3, 5], weapons: 1, health: [5, 7] },
      'floor-2': { rows: 90, cols: 120, enemies: [6, 10], weapons: 1, health: [8, 11] },
      'floor-3': { rows: 120, cols: 150, enemies: [9, 12], weapons: 1, health: [11, 15] },
      'floor-4': { rows: 150, cols: 180, enemies: [10, 15], weapons: 1, health: [13, 18] },
      'floor-5': { rows: 50, cols: 50, enemies: [0, 0], boss: 1, health: [3, 5], weapons: 1 }
    },

    levels: {
      'level-1': { power: 10, breakpoint: 20 },
      'level-2': { power: 15, breakpoint: 40 },
      'level-3': { power: 20, breakpoint: 60 },
      'level-4': { power: 25, breakpoint: 80 }
    },

    weapons: {
      noWeapon: { power: 0, sd: 0.3 },
      stick: { power: 5, sd: 0.2 },
      cane: { level: 1, power: 10, sd: 0.15 },
      'bone knife': { level: 2, power: 15, sd: 0.13 },
      'copper dagger': { level: 3, power: 20, sd: 0.1 },
      'bronze ax': { level: 4, power: 25, sd: 0.08 },
      'simple sword': { level: 5, attack: 30, sd: 0.05 }
    },

    enemies: {
      goblin: { level: 1, power: 5, health: 75, value: 10, weapon: 'stick' },
      skeleton: { level: 2, power: 10, health: 90, value: 20, weapon: 'cane' },
      gnoll: { level: 3, power: 15, health: 110, value: 35, weapon: 'copper dagger' },
      dwarf: { level: 4, power: 20, health: 125, value: 40, weapon: 'bronze ax' },
      boss: { level: 5, power: 30, health: 200, value: 100, weapon: 'simple sword' }
    },

    health: {
      'small potion': { level: 1, health: 25 },
      'potion': { level: 2, health: 50 },
      'medium potion': { level: 3, health: 75 },
      'great potion': { level: 4, health: 90 },
      'grand potion': { level: 5, health: 110 }
    }
  }

  const Stat = (function Stat () {
    function weapon (type) {
      return config.weapons[type]
    }

    function enemy (type) {
      return config.enemies[type]
    }

    function floor (name) {
      if (R.type(name) === 'Number') {
        return config.floors['floor-' + name]
      }

      return config.floors[name]
    }

    return {
      weapon,
      enemy,
      floor
    }
  }())

  const Random = (function Random () {
    function inRange (min, max) {
      return min + Math.floor(Math.random() * (max - min))
    }

    function oneFrom (list) {
      return list[inRange(0, list.length)]
    }

    return {
      inRange,
      oneFrom
    }
  }())

  const Point = (function Point () {
    const moveUp = p => update(p, p.x, p.y - 1)
    const moveDown = p => update(p, p.x, p.y + 1)
    const moveLeft = p => update(p, p.x - 1, p.y)
    const moveRight = p => update(p, p.x + 1, p.y)

    function createPoint (level, x, y) {
      const size = Stat.floor(level)
      const id = y * size.cols + x
      const isInRowRange = y >= 0 && y < size.rows
      const isInColRange = x >= 0 && x < size.cols

      if (isInRowRange && isInColRange) {
        return { x, y, id, level }
      }

      return { error: true }
    }

    function create (level) {
      return (x, y) => {
        const result = createPoint(level, x, y)

        if (result.error) {
          throw new Error(`Point 'x:${x}, y:${y}' is out of the borders`)
        }

        return result
      }
    }

    function update (p, x, y) {
      const result = createPoint(p.level, x, y)

      if (result.error) { return p }

      return result
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

  const Dangeon = (function Dangeon () {
    const itemPlaces = R.compose(R.map(R.prop('place')), R.values)

    function create ({ rows, cols }) {
      const fillWith = R.compose(
        R.repeat(R.__, rows),
        R.repeat(R.__, cols)
      )

      return fillWith(config.objects.wall)
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

    function fill ({ health, weapon, enemy, player }) {
      const conf = config.objects
      const batchUpdate = batch(update)

      return R.compose(
        batchUpdate(itemPlaces(health), conf.health),
        batchUpdate(itemPlaces(weapon), conf.weapon),
        batchUpdate(itemPlaces(enemy), conf.enemy),
        update(player.place, conf.player)
      )
    }

    function addBorders (dangeon) {
      const borderRow = R.repeat('x', dangeon[0].length + 2)

      const addColBorders = R.map(
        R.compose(
          R.append('x'),
          R.prepend('x')
        )
      )

      const addBorders = R.compose(
        R.append(borderRow),
        R.prepend(borderRow),
        addColBorders
      )

      return addBorders(dangeon)
    }

    return {
      create,
      get,
      set,
      update,
      batch,
      itemMap,
      itemPlaces,
      fill,
      addBorders
    }
  }())

  function rogueLikeGame (address) {
    const tasks = (function tasks () {
      function batchAccum (tasks, init) {
        return () => R.reduce((acc, fn) => (
          fn(acc)()
        ), init, tasks)
      }

      function randomDamage (damager) {
        const weapon = Weapon.create(damager.weapon)
        const min = Weapon.minDamage(weapon)
        const max = Weapon.maxDamage(weapon)

        return damager.power + Random.inRange(min, max + 1)
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

      function gameObjCount (sizeConf) {
        if (R.is(Array, sizeConf)) {
          return randomInRange(sizeConf[0], sizeConf[1] + 1)
        }

        return sizeConf
      }

      function generatePoint (floor, dangeon) {
        const { rows, cols } = Stat.floor(floor)
        const createPoint = Point.create(floor)

        function randomPoint () {
          const col = Random.inRange(0, cols)
          const row = Random.inRange(0, rows)
          const point = createPoint(col, row)
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
            const floor = model.floor
            const stat = Stat.floor(floor)
            const size = gameObjCount(stat[name])
            const curObj = config[name]

            const type = R.find(x => (
              curObj[x].level === floor
            ), R.keys(curObj))

            const health = curObj[type].health
            const formAndSend = R.compose(
              address, keeper, Dangeon.itemMap, R.last, R.mapAccum
            )

            const fill = Dangeon.fill(model)

            return formAndSend(
              (dangeon) => {
                const place = generatePoint(floor, dangeon)
                const updatedDangeon = Dangeon.update(place, stat[name])(dangeon)
                const result = (health === undefined)
                  ? { place, type }
                  : { place, type, health }

                return [updatedDangeon, result]
              }, fill(model.dangeon), R.range(0, size))
          }
        }
      }

      function generatePlayer (keeper) {
        return ({ floor, dangeon, player }) => () => {
          const send = R.compose(address, keeper)
          return send(generatePoint(floor, dangeon))
        }
      }

      function genWorld (initialState, keep) {
        return () => {
          const level = initialState.floor
          const { rows, cols } = Stat.floor(level)
          const p1 = { x: 0, y: 0 }
          const p2 = { x: cols, y: rows }

          function split (axis, splitAt, p1, p2) {
            const p12 = R.assoc(axis, splitAt, p2)
            const p21 = R.assoc(axis, splitAt + 1, p1)

            return {
              left: { p1, p2: p12 },
              right: { p1: p21, p2 }
            }
          }

          function formRoom (bound) {
            const { p1, p2 } = bound
            const x1 = Random.inRange(p1.x + 1, p2.x - config.minRoomSize - 1)
            const y1 = Random.inRange(p1.y + 1, p2.y - config.minRoomSize - 1)

            const x2 = Random.inRange(x1 + config.minRoomSize, p2.x - 1)
            const y2 = Random.inRange(y1 + config.minRoomSize, p2.y - 1)

            const r1 = { x: x1, y: y1 }
            const r2 = { x: x2, y: y2 }

            return R.merge(bound, { r1, r2 })
          }

          function sampleToDangeon ({ r1, r2, left, right }, dangeon) {
            if (r1 !== undefined) {
              const result = dangeon.concat()

              R.forEach(rowId => {
                const col = result[rowId].concat()

                R.forEach(colId => {
                  col[colId] = '0'
                }, R.range(r1.x, r2.x))

                result[rowId] = col
              }, R.range(r1.y, r2.y))

              return result
            }

            const rightRoom = sampleToDangeon(right, dangeon)
            const bothRooms = sampleToDangeon(left, rightRoom)

            return bothRooms
          }

          function analysisRooms (left, right, axis) {
            const top = Math.min(left.r1[axis], right.r1[axis])
            const bottom = Math.max(left.r2[axis], right.r2[axis])

            const leftLength = left.r2[axis] - left.r1[axis]
            const rightLength = right.r2[axis] - right.r1[axis]

            const topDiff = Math.abs(left.r1[axis] - right.r1[axis])
            const bottomDiff = Math.abs(left.r2[axis] - right.r2[axis])

            const intersection = leftLength + rightLength - bottom + top
            const exceeding = Math.max(topDiff, bottomDiff)

            return { intersection, exceeding }
          }

          function directTunnel (left, right, axis, dangeon) {
            const top = Math.max(left.r1[axis], right.r1[axis])
            const bottom = Math.min(left.r2[axis], right.r2[axis])
            const middle = top + Math.ceil((bottom - top) / 2)
            const pair = axis === 'x' ? 'y' : 'x'

            const width = R.range(middle - config.corridorWidth, middle)
            const length = R.range(left.r2[pair], right.r1[pair])

            const rows = axis === 'x' ? length : width
            const cols = axis === 'x' ? width : length

            const result = dangeon.concat()

            R.forEach(rowId => {
              const row = result[rowId].concat()
              R.forEach(colId => {
                row[colId] = 'o'
              }, cols)

              result[rowId] = row
            }, rows)

            return result
          }

          function angularTunnel (left, right, axis, dangeon) {
            return dangeon
          }

          function zigzagTunnel (left, right, axis, dangeon) {
            return dangeon
          }

          function addCorridor (splitAxis, left, right, dangeon) {
            const axis = splitAxis === 'x' ? 'y' : 'x'
            const analysis = analysisRooms(left, right, axis)

            if (analysis.intersection > config.corridorWidth) {
              return directTunnel(left, right, axis, dangeon)
            }

            if (analysis.exceeding > config.corridorWidth) {
              angularTunnel(left, right, axis, dangeon)
            }

            return zigzagTunnel(left, right, axis, dangeon)
          }

          function sampleToDangeon2 (node, model) {
            const { axis, r1, r2, left, right } = node

            if (r1 !== undefined) {
              const result = model.dangeon.concat()

              R.forEach(rowId => {
                const col = result[rowId].concat()

                R.forEach(colId => {
                  col[colId] = '0'
                }, R.range(r1.x, r2.x))

                result[rowId] = col
              }, R.range(r1.y, r2.y))

              return { room: { r1, r2 }, dangeon: result }
            }

            const rightPart = sampleToDangeon2(right, model)
            const leftPart = sampleToDangeon2(left, rightPart)

            const rRoom = rightPart.room
            const lRoom = leftPart.room

            // console.log('\n---------------------------------------')
            // console.log('axis: ', axis)
            // console.log('left room: ', lRoom)
            // console.log('right room: ', rRoom)
            // console.log('---------------------------------------\n')

            const result = addCorridor(axis, lRoom, rRoom, leftPart.dangeon)

            return {
              room: Random.oneFrom([lRoom, rRoom]),
              dangeon: result
            }
          }

          function randomSplit ({ p1, p2 }, pref) {
            const axes = ['x', 'y']
            const axesWithPref = R.concat(pref, axes)
            const axis = Random.oneFrom(axesWithPref) // axesWithPref[Random.inRange(0, axesWithPref.length)]
            const opposite = axis === 'x' ? 'y' : 'x'
            const newPref = axesWithPref.length > config.sizeOfPreferences
              ? []
              : R.append(opposite, pref)

            const p1prime = p1[axis] + config.minZoneSize
            const p2prime = p2[axis] - config.minZoneSize

            if (p1prime < p2prime) {
              const splitValue = Random.inRange(p1prime, p2prime)
              const { left, right } = split(axis, splitValue, p1, p2)

              return {
                axis,
                p1,
                p2,
                left: randomSplit(left, newPref),
                right: randomSplit(right, newPref)
              }
            }

            return formRoom({ p1, p2 })
          }

          const send = R.compose(address, keep, R.merge(initialState))
          const sample = randomSplit({ p1, p2 }, [])
          // const dangeon = sampleToDangeon(sample, initialState.dangeon)

          const { dangeon } = sampleToDangeon2(sample, initialState)
          // console.log(dangeon)

          return send({ dangeon })
        }
      }

      return {
        batchAccum,
        generateEnemies: generateGameObjects('enemies'),
        generateWeapons: generateGameObjects('weapons'),
        generateHealth: generateGameObjects('health'),
        generatePlayer,
        generateDamage,
        pause,
        genWorld
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
          const level = config.levels['level-' + model.player.level]

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
        const powerOf = x => Stat.weapon(x).power

        if (powerOf(player.weapon) < powerOf(weapon[id].type)) {
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

      function useWorld (world) {
        return () => {
          return [world]
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
        },
        useWorld
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

        floor: 1,

        dangeon: Dangeon.create(Stat.floor(1)),

        gameOver: false
      }

      return [
        initialState,
        tasks.genWorld(initialState, actions.useWorld)
      ]
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
        const prepare = R.compose(
          Dangeon.addBorders,
          Dangeon.fill(model)
        )

        return R.merge(model, { dangeon: prepare(model.dangeon) })
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
