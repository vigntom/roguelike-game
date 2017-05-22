/* globals R, React, ReactDOM */

import WebApp from './web-app'

function debug (msg) {
  return arg => {
    console.log(msg, ' :', arg)
    return arg
  }
}

(function application (root$) {
  const config = (function config () {
    const roomSizeRate = 0.8           // of zone size
    const corridorSizeRate = 0.4       // of room size
    const zoneSizeFactor = 2           // factor to zone size calculation

    const base = {
      pause: 2000,                 // pause before to start a new game
      sizeOfPreferences: 5,        // is used by zone generator
      enemyCnance: 0.75,           // per room
      roomSizeRate: 0.8,           // of zone size
      corridorSizeRate: 0.4,       // of room size
      dangeonRedundancy: 10        // how many dungeon trees are created to choose from
    }

    // zone size is based on the number of rooms on the floor
    //
    // game objects distribution
    //   weapon: one per floor
    //   health: depending on enemies and their average damage

    const objects = {
      wall: 'x',
      player: 'p',
      enemy: 'e',
      weapon: 'w',
      health: 'h',
      space: 'o',
      exit: 't'
    }

    const marks = {
      x: 'cell-wall',
      p: 'cell-player',
      e: 'cell-enemy',
      w: 'cell-weapon',
      h: 'cell-health',
      o: 'cell-space',
      t: 'cell-exit'
    }

    const floors = {
      'floor-1': { rows: 60, cols: 90, rooms: 9 },
      'floor-2': { rows: 90, cols: 120, rooms: 13 },
      'floor-3': { rows: 120, cols: 150, rooms: 17 },
      'floor-4': { rows: 150, cols: 180, rooms: 21 },
      'floor-5': { rows: 50, cols: 50, rooms: 3 }
    }

    const levels = {
      'level-1': { power: 10, breakpoint: 20 },
      'level-2': { power: 15, breakpoint: 40 },
      'level-3': { power: 20, breakpoint: 60 },
      'level-4': { power: 25, breakpoint: 80 }
    }

    const weapons = {
      noWeapon: { power: 0, sd: 0.3 },
      stick: { power: 5, sd: 0.2 },
      cane: { level: 1, power: 10, sd: 0.15 },
      'bone knife': { level: 2, power: 15, sd: 0.13 },
      'copper dagger': { level: 3, power: 20, sd: 0.1 },
      'bronze ax': { level: 4, power: 25, sd: 0.08 },
      'simple sword': { level: 5, attack: 30, sd: 0.05 }
    }

    const enemies = {
      goblin: { level: 1, power: 5, health: 75, value: 10, weapon: 'stick' },
      skeleton: { level: 2, power: 10, health: 90, value: 20, weapon: 'cane' },
      gnoll: { level: 3, power: 15, health: 110, value: 35, weapon: 'copper dagger' },
      dwarf: { level: 4, power: 20, health: 125, value: 40, weapon: 'bronze ax' },
      boss: { level: 5, power: 30, health: 200, value: 100, weapon: 'simple sword' }
    }

    const health = {
      'small potion': { level: 1, health: 25 },
      'potion': { level: 2, health: 50 },
      'medium potion': { level: 3, health: 75 },
      'great potion': { level: 4, health: 90 },
      'grand potion': { level: 5, health: 110 }
    }

    function addSizes (obj) {
      const roomsPerSide = Math.sqrt(obj.rooms)
      const zonesPerSide = Math.floor(zoneSizeFactor * roomsPerSide)

      const zoneSize = {
        x: Math.ceil(obj.cols / zonesPerSide),
        y: Math.ceil(obj.rows / zonesPerSide)
      }

      const roomSize = {
        x: Math.floor(zoneSize.x * roomSizeRate),
        y: Math.floor(zoneSize.y * roomSizeRate)
      }

      const minRoomSize = Math.min(roomSize.x, roomSize.y)

      const maybeSize = Math.floor(minRoomSize * corridorSizeRate)
      const halfRoomSize = Math.floor(minRoomSize / 2)

      const corridorSize = maybeSize < halfRoomSize
        ? maybeSize
        : halfRoomSize

      return R.merge(obj, { zoneSize, roomSize, corridorSize })
    }

    function updateFloors (obj) {
      const result = {}
      R.forEach(key => { result[key] = addSizes(obj[key]) }, R.keys(obj))
      return result
    }

    return R.merge(base, {
      objects,
      marks,
      floors: updateFloors(floors),
      levels,
      weapons,
      enemies,
      health
    })
  }())

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

    function countOfObj (floorName, objName) {
      const obj = floor(floorName)[objName]
      if (R.is(Array, obj)) {
        return Random.inRange(obj[0], obj[1] + 1)
      }

      return obj
    }

    function roomSize (name) {
      return floor(name).roomSize
    }

    function zoneSize (name) {
      return floor(name).zoneSize
    }

    function corridorSize (name) {
      return floor(name).corridorSize
    }

    return {
      weapon,
      enemy,
      floor,
      roomSize,
      zoneSize,
      corridorSize,
      countOfObj
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

    function generate (floor, dangeon) {
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

    return {
      create,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      generate
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

    function randomDamage (damager) {
      const weapon = create(damager.weapon)
      const min = minDamage(weapon)
      const max = maxDamage(weapon)

      return damager.power + Random.inRange(min, max + 1)
    }

    return {
      create,
      randomDamage
    }
  }())

  const DangeonTree = (function DangeonTree () {
    function split (axis, splitAt, p1, p2) {
      const p12 = R.assoc(axis, splitAt, p2)
      const p21 = R.assoc(axis, splitAt + 1, p1)

      return {
        left: { p1, p2: p12 },
        right: { p1: p21, p2 }
      }
    }

    function create (floor, { p1, p2 }) {
      const { rooms } = Stat.floor(floor)
      const diff = (a, b) => (
        Math.abs(rooms - a[1]) - Math.abs(rooms - b[1])
      )

      const times = R.compose(
        R.head,
        R.head,
        R.sort(diff),
        R.times(() => createTree(floor, { p1, p2 }, 0, []))
      )

      return times(config.dangeonRedundancy)
    }

    function createTree (floor, zone, rooms, pref) {
      const { p1, p2 } = zone
      const axes = ['x', 'y']
      const zoneSize = Stat.zoneSize(floor)
      const axesWithPref = R.concat(pref, axes)
      const axis = Random.oneFrom(axesWithPref)
      const opposite = axis === 'x' ? 'y' : 'x'
      const newPref = axesWithPref.length > config.sizeOfPreferences
        ? [opposite]
        : R.append(opposite, pref)

      const p1prime = p1[axis] + zoneSize[axis]
      const p2prime = p2[axis] - zoneSize[axis]

      if (p1prime < p2prime) {
        const splitValue = Random.inRange(p1prime, p2prime)
        const { left, right } = split(axis, splitValue, p1, p2)

        const [leftChild, leftRooms] = createTree(floor, left, rooms, newPref)
        const [rightChild, rightRooms] = createTree(floor, right, rooms, newPref)

        return [{
          axis,
          p1,
          p2,
          left: leftChild,
          right: rightChild
        }, leftRooms + rightRooms]
      }

      return [R.merge(zone, Room.create(floor, { p1, p2 })), 1]
    }

    return {
      create
    }
  }())

  const Room = (function Room () {
    function create (floor, bound) { // todo: formRoom -> create,
      const { p1, p2 } = bound
      const roomSize = Stat.roomSize(floor)
      const x1 = Random.inRange(p1.x + 1, p2.x - roomSize.x - 1)
      const y1 = Random.inRange(p1.y + 1, p2.y - roomSize.y - 1)

      const x2 = Random.inRange(x1 + roomSize.x, p2.x - 1)
      const y2 = Random.inRange(y1 + roomSize.y, p2.y - 1)

      const r1 = { x: x1, y: y1 }
      const r2 = { x: x2, y: y2 }

      return { r1, r2 }
    }

    function relativePosition (left, right, axis) { // todo: analysisRoom -> relativePosition
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

    function adjacentZone (fn, { left, right }) {
      if (fn(left.p1, left.p2)) { return left }
      if (fn(right.p1, right.p2)) { return right }

      throw new Error(`There is not adjacent zone!`)
    }

    function adjacentRoom (fn, node) {
      if (node.r1 !== undefined) {
        return node
      }

      return adjacentRoom(fn, adjacentZone(fn, node))
    }

    function leftAdjacent (p0, axis) {
      return (p1, p2) => {
        if (axis === 'x') {
          return p1.y === p0.y && p2.x + 1 === p0.x
        }

        return p2.x === p0.x && p2.y === p0.y
      }
    }

    function rightAdjacent (p0, axis) {
      return (p1, p2) => {
        if (axis === 'x') {
          return p1.x === p0.x && p1.y === p0.y
        }

        return p1.y - 1 === p0.y && p2.x === p0.x
      }
    }

    function neighbors (node) {
      const { axis, left, right } = node

      if (node.r1 !== undefined) { return node }

      const adjacentPoint = axis === 'x' ? right.p1 : left.p2
      const testLeft = leftAdjacent(adjacentPoint, axis)
      const testRight = rightAdjacent(adjacentPoint, axis)

      const leftRoom = adjacentRoom(testLeft, left)
      const rightRoom = adjacentRoom(testRight, right)

      return { left: leftRoom, right: rightRoom }
    }

    return {
      create,
      neighbors,
      relativePosition
    }
  }())

  const Tunnel = (function Tunnel () {
    function tunnel (axis, width, length, value) { // todo: <- fill
      const rows = axis === 'x' ? length : width
      const cols = axis === 'x' ? width : length

      return Dangeon.fill(rows, cols, value)
    }

    function calcWidth (size, p1, p2) {
      const halfSize = size / 2
      const mid = p1 + Math.ceil((p2 - p1) / 2)

      return {
        p1: mid - Math.ceil(halfSize),
        p2: mid + Math.floor(halfSize)
      }
    }

    function directTunnel (axis, size, left, right) { // -> direct
      const pair = axis === 'x' ? 'y' : 'x'
      const top = Math.max(left.r1[axis], right.r1[axis])
      const bottom = Math.min(left.r2[axis], right.r2[axis])
      const { p1, p2 } = calcWidth(size, top, bottom)

      const width = R.range(p1, p2)
      const length = R.range(left.r2[pair], right.r1[pair])

      return tunnel(axis, width, length, 'a')
    }

    function fillAngularTunnel (axis, top, sideTop, bottom, sideBottom) { // todo: <- fillAngular
      const pair = axis === 'x' ? 'y' : 'x'
      const widthTop = R.range(sideTop.p1, sideTop.p2)
      const widthBottom = R.range(sideBottom.p1, sideBottom.p2)

      const lengthTop = top.r1[pair] > sideBottom.p1
        ? R.range(sideBottom.p1, top.r1[pair])
        : R.range(top.r2[pair], sideBottom.p1)

      const lengthBottom = sideTop.p1 < bottom.r1[axis]
        ? R.range(sideTop.p1, bottom.r1[axis])
        : R.range(bottom.r2[axis], sideTop.p2)

      return R.pipe(
        tunnel(axis, widthTop, lengthTop, 'o'),
        tunnel(pair, widthBottom, lengthBottom, 'o')
      )
    }

    function angularTunnel (axis, size, left, right) { // todo: createAngular
      const pair = axis === 'x' ? 'y' : 'x'

      if (axis === 'y') {
        const top = (right.r1[axis] < left.r1[axis])
          ? right
          : left
        const bottom = top === right ? left : right

        const p11 = top.r1[axis]
        const p12 = Math.min(top.r2[axis], bottom.r1[axis] - 1)
        const sideTop = calcWidth(size, p11, p12)

        const p21 = bottom.r1[pair]
        const p22 = bottom.r2[pair]
        const sideBottom = calcWidth(size, p21, p22)

        return fillAngularTunnel(axis, top, sideTop, bottom, sideBottom)
      }

      const top = (left.r2[axis] > right.r2[axis])
        ? left
        : right
      const bottom = top === left ? right : left

      const p11 = top.r2[axis]
      const p12 = Math.max(top.r1[axis], bottom.r2[axis] + 1)
      const sideTop = calcWidth(size, p11, p12)

      const p21 = bottom.r1[pair]
      const p22 = bottom.r2[pair]
      const sideBottom = calcWidth(size, p21, p22)

      return fillAngularTunnel(axis, top, sideTop, bottom, sideBottom)
    }

    function addCorridor (floor, splitAxis, { left, right }) { // todo: <- create
      const axis = splitAxis === 'x' ? 'y' : 'x'
      const analysis = Room.relativePosition(left, right, axis)
      const size = Stat.corridorSize(floor)

      if (analysis.intersection > size) {
        return directTunnel(axis, size, left, right)
      }

      if (analysis.exceeding > size) {
        return angularTunnel(axis, size, left, right)
      }

      return { error: true }
    }

    return {
      addCorridor
    }
  }())

  const Dangeon = (function Dangeon () {
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

    function fillWithObjects ({ health, weapon, enemy, player }) {
      const conf = config.objects
      const batchUpdate = batch(update)
      const itemPlaces = R.compose(R.map(R.prop('place')), R.values)

      return R.compose(
        batchUpdate(itemPlaces(health), conf.health),
        batchUpdate(itemPlaces(weapon), conf.weapon),
        batchUpdate(itemPlaces(enemy), conf.enemy),
        update(player.place, conf.player)
      )
    }

    function fill (rows, cols, value) {
      return (dangeon) => {
        const result = dangeon.concat()

        R.forEach(rowId => {
          const row = result[rowId].concat()
          R.forEach(colId => {
            row[colId] = value
          }, cols)

          result[rowId] = row
        }, rows)

        return result
      }
    }

    function addBorders (floor) {
      return (dangeon) => {
        const border = config.objects.wall
        const { cols } = Stat.floor(floor)
        const borderRow = R.repeat(border, cols + 2)

        const addColBorders = R.map(
          R.compose(
            R.append(border),
            R.prepend(border)
          )
        )

        const addBorders = R.compose(
          R.append(borderRow),
          R.prepend(borderRow),
          addColBorders
        )

        return addBorders(dangeon)
      }
    }

    function fromSample (floor, node, data) {
      const { axis, r1, r2, left, right } = node
      const { dangeon, error } = data

      if (error) { return data }

      if (r1 !== undefined) {
        const rows = R.range(r1.y, r2.y)
        const cols = R.range(r1.x, r2.x)
        const fillWithSpaces = fill(rows, cols, config.objects.spaces)

        return { room: { r1, r2 }, dangeon: fillWithSpaces(dangeon) }
      }

      const withRooms = fromSample(
        floor,
        left,
        fromSample(floor, right, data)
      )

      const withCorridors = Tunnel.addCorridor(
        floor,
        axis,
        Room.neighbors(node)
      )

      if (withRooms.error || withCorridors.error) {
        return { error: true }
      }

      return {
        dangeon: withCorridors(withRooms.dangeon)
      }
    }

    return {
      create,
      get,
      set,
      update,
      batch,
      fill,
      fillWithObjects,
      addBorders,
      fromSample
    }
  }())

  function rogueLikeGame (address) {
    const tasks = (function tasks () {
      function batchAccum (tasks, init) {
        return () => R.reduce((acc, fn) => {
          return fn(acc)()
        }, init, tasks)
      }

      function generateDamage ({ player, enemy }, keeper) {
        const enemyDamage = R.compose(Weapon.randomDamage, Stat.enemy)

        return () => address(keeper({
          player: Weapon.randomDamage(player),
          enemy: enemyDamage(enemy.type)
        }))
      }

      function pause (delay, keeper) {
        return () => setTimeout(() => address(keeper), delay)
      }

      // function itemMap (list) {
      //   const result = {}

      //   list.forEach(obj => {
      //     result[obj.place.id] = obj
      //   })

      //   return result
      // }

      // function generateGameObjects (name) {
      //   return keeper => model => {
      //     return () => {
      //       const floor = model.floor
      //       const stat = Stat.floor(floor)
      //       const size = Stat.coundOfObj(floor, name)
      //       const curObj = config[name]

      //       const type = R.find(x => (
      //         curObj[x].level === floor
      //       ), R.keys(curObj))

      //       const health = curObj[type].health
      //       const formAndSend = R.compose(
      //         address, keeper, itemMap, R.last, R.mapAccum
      //       )

      //       const fill = Dangeon.fillWithObjects(model)

      //       return formAndSend(
      //         (dangeon) => {
      //           const place = Point.generate(floor, dangeon)
      //           const updatedDangeon = Dangeon.update(place, stat[name])(dangeon)
      //           const result = (health === undefined)
      //             ? { place, type }
      //             : { place, type, health }

      //           return [updatedDangeon, result]
      //         }, fill(model.dangeon), R.range(0, size))
      //     }
      //   }
      // }

      // function generatePlayer (keeper) {
      //   return ({ floor, dangeon, player }) => () => {
      //     const send = R.compose(address, keeper)
      //     return send(Point.generate(floor, dangeon))
      //   }
      // }

      function generateDangeon (level, p1, p2, initialState, guard = 0) {
        const sample = DangeonTree.create(level, { p1, p2 })
        const dangeon = Dangeon.fromSample(level, sample, initialState)

        if (dangeon.error) {
          if (guard > 9) {
            throw new Error('Configuration Error! Wrong room / cooridor settings.')
          }

          return generateDangeon(level, p1, p2, initialState, guard + 1)
        }

        return dangeon
      }

      function genWorld (initialState, keep) {
        return () => {
          const level = initialState.floor
          const { rows, cols } = Stat.floor(level)
          const p1 = { x: 0, y: 0 }
          const p2 = { x: cols, y: rows }

          const send = R.compose(address, keep, R.merge(initialState))
          return send(generateDangeon(level, p1, p2, initialState))
        }
      }

      return {
        batchAccum,
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

      function keepWorld (world) {
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
        keepWorld
      }
    }())

    function createDangeon () {
      const initialFloor = 1

      const initialState = {
        player: {
          level: 1,
          health: 100,
          power: 10,
          experience: 0,
          weapon: 'stick'
        },

        floor: initialFloor,

        dangeon: Dangeon.create(Stat.floor(initialFloor)),

        gameOver: false
      }

      return [
        initialState,
        tasks.genWorld(initialState, actions.keepWorld)
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
          Dangeon.addBorders(model.floor),
          Dangeon.fillWithObjects(model)
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
