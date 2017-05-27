/* globals R, React, ReactDOM */

import WebApp from './web-app'

(function application (root$) {
  const debug = R.curry(function debug (msg, arg) {
    console.log('===================== DEBUG ================')
    console.log(msg, ': ', arg)
    console.log('====================== END =================')
    return arg
  })

  const config = (function config () {
    const roomSizeRate = 0.8           // of zone size
    const corridorSizeRate = 0.6       // of room size. Can be corrected
    const zoneSizeFactor = 2           // factor to zone size calculation
    const privateArea = 10              // private area around a game object
                                       // can be corrected
    const base = {
      pause: 5000,                 // pause before to start a new game
      sizeOfPreferences: 5,        // is used by zone generator
      dangeonRedundancy: 10,       // how many dungeon trees are created to choose from
      enemyFactor: 0.75             // per room
    }

    // zone size is based on the number of rooms on the floor
    //
    // game objects distribution
    //   weapon: one per floor
    //   health: depending on enemies and their average damage

    const viewport = {
      width: 1024,
      height: 624,
      rows: 30,
      cols: 50
    }

    const objects = makeEnum([
      'wall',
      'player',
      'enemy',
      'weapon',
      'health',
      'space',
      'entry',
      'exit'
    ])

    const floors = {
      'floor-1': { rows: 60, cols: 90, rooms: 9 },
      'floor-2': { rows: 90, cols: 120, rooms: 13 },
      'floor-3': { rows: 120, cols: 150, rooms: 18 },
      'floor-4': { rows: 150, cols: 180, rooms: 21 },
      'floor-5': { rows: 32, cols: 52, rooms: 3 }
    }

    const levels = {
      'level-1': { power: 20, breakpoint: 40, health: 100 },
      'level-2': { power: 40, breakpoint: 80, health: 200 },
      'level-3': { power: 80, breakpoint: 160, health: 400 },
      'level-4': { power: 160, breakpoint: 320, health: 800 },
      'level-5': { power: 320, breakpoint: 640, health: 1600 },
      'level-6': { power: 640, breakpoint: 1280, health: 3200 },
      'level-7': { power: 1280, breakpoint: 2560, health: 6400 },
      'level-8': { power: 2560, breakpoint: 5120, health: 12800 },
      'level-9': { power: 5120, breakpoint: 10240, health: 25600 },
      'level-10': { power: 10240, breakpoint: 20480, health: 51200 }
    }

    const weapons = {
      noWeapon: { power: 2, sd: 0.3 },
      stick: { power: 4, sd: 0.2 },
      cane: { level: 1, power: 10, sd: 0.15 },
      'bone knife': { level: 2, power: 20, sd: 0.13 },
      'copper dagger': { level: 3, power: 40, sd: 0.1 },
      'bronze ax': { level: 4, power: 80, sd: 0.08 },
      'simple sword': { level: 5, power: 160, sd: 0.05 }
    }

    const enemies = {
      goblin: { level: 1, power: 18, health: 90, value: 10 },
      skeleton: { level: 2, power: 16, health: 180, value: 20 },
      gnoll: { level: 3, power: 74, health: 360, value: 40 },
      dwarf: { level: 4, power: 144, health: 720, value: 80 },
      boss: { level: 5, power: 1580, count: 1, health: 9600, value: 900 }
    }

    const health = {
      'small potion': { level: 1, health: 50 },
      'potion': { level: 2, health: 100 },
      'medium potion': { level: 3, health: 200 },
      'great potion': { level: 4, health: 400 },
      'grand potion': { level: 5, health: 800 }
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
      const halfRoomSize = Math.ceil(minRoomSize / 2)

      const corridorSize = maybeSize < halfRoomSize
        ? maybeSize
        : halfRoomSize

      const privateAreaSize = (privateArea > halfRoomSize / 2)
        ? Math.ceil(halfRoomSize / 2)
        : privateArea

      return R.merge(obj, { zoneSize, roomSize, corridorSize, privateAreaSize })
    }

    function updateFloors (obj) {
      const result = {}
      R.forEach(key => { result[key] = addSizes(obj[key]) }, R.keys(obj))
      return result
    }

    function makeEnum (list) {
      const result = {}
      R.forEach(x => { result[x] = Symbol(x) }, list)
      return result
    }

    function makeMarks (obj) {
      const result = {}
      R.forEach(
        key => { result[obj[key]] = 'cell-' + key },
        R.keys(obj)
      )

      return result
    }

    return R.merge(base, {
      viewport,
      objects,
      marks: makeMarks(objects),
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

    function health (type) {
      return config.health[type].health
    }

    function floor (name) {
      if (R.type(name) === 'Number') {
        return config.floors['floor-' + name]
      }

      return config.floors[name]
    }

    function level (name) {
      if (R.type(name) === 'Number') {
        return config.levels['level-' + name]
      }

      return config.levels[name]
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

    function cellHeight () {
      const v = config.viewport
      // 12px is padding
      return Math.floor((v.height - 24) / v.rows)
    }

    function cellWidth () {
      const v = config.viewport
      return Math.floor((v.width - 24) / v.cols)
    }

    function mark (name) {
      const gameObj = config.objects[name]

      if (gameObj === undefined) {
        throw new Error(`There is no game object for name ${name}`)
      }

      return config.marks[config.objects[name]]
    }

    return {
      weapon,
      enemy,
      health,
      floor,
      level,
      roomSize,
      zoneSize,
      corridorSize,
      cellHeight: cellHeight(),
      cellWidth: cellWidth(),
      mark
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
    const moveUp = p => update(p.x, p.y - 1, p)
    const moveDown = p => update(p.x, p.y + 1, p)
    const moveLeft = p => update(p.x - 1, p.y, p)
    const moveRight = p => update(p.x + 1, p.y, p)

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

    function update (x, y, p) {
      const result = createPoint(p.level, x, y)

      if (result.error) { return p }

      return result
    }

    function generate (floor, dangeon) {
      const { rows, cols } = Stat.floor(floor)
      const createPoint = create(floor)

      function randomPoint () {
        const col = Random.inRange(0, cols)
        const row = Random.inRange(0, rows)

        const point = createPoint(col, row)
        // const isSpaceInPoint = R.compose(Cell.isSpace, Dangeon.get(point))
        const isAreaFree = R.compose(
          R.all(R.equals(true)),
          R.map(Cell.isSpace),
          Dangeon.privateArea(point)
        )

        // if (isSpaceInPoint(dangeon)) {
        if (isAreaFree(dangeon)) {
          return point
        }

        return randomPoint()
      }

      return randomPoint()
    }

    function privateRange (axis, limit, point) {
      const floor = Stat.floor(point.level)
      const maybeMin = point[axis] - floor.privateAreaSize
      const maybeMax = point[axis] + floor.privateAreaSize + 1

      const min = (maybeMin < 0) ? 0 : maybeMin
      const max = (maybeMax > limit) ? limit : maybeMax

      return R.range(min, max)
    }

    function privateArea (point) {
      const level = point.level
      const floor = Stat.floor(level)
      const result = []

      R.forEach(row => {
        R.forEach(
          col => result.push(createPoint(level, col, row)),
          privateRange('x', floor.cols, point)
        )
      }, privateRange('y', floor.rows, point))

      return result
    }

    return {
      create,
      moveUp,
      moveDown,
      moveLeft,
      moveRight,
      generate,
      privateArea
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

    function relativePosition (left, right, axis) {
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
    function fill (axis, width, length, value) {
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

    function createDirect (axis, size, left, right) {
      const pair = axis === 'x' ? 'y' : 'x'
      const top = Math.max(left.r1[axis], right.r1[axis])
      const bottom = Math.min(left.r2[axis], right.r2[axis])
      const { p1, p2 } = calcWidth(size, top, bottom)

      const width = R.range(p1, p2)
      const length = R.range(left.r2[pair], right.r1[pair])

      return fill(axis, width, length, config.objects.space)
    }

    function fillAngular (axis, top, sideTop, bottom, sideBottom) {
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
        fill(axis, widthTop, lengthTop, config.objects.space),
        fill(pair, widthBottom, lengthBottom, config.objects.space)
      )
    }

    function createAngular (axis, size, left, right) {
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

        return fillAngular(axis, top, sideTop, bottom, sideBottom)
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

      return fillAngular(axis, top, sideTop, bottom, sideBottom)
    }

    function create (floor, splitAxis, { left, right }) {
      const axis = splitAxis === 'x' ? 'y' : 'x'
      const analysis = Room.relativePosition(left, right, axis)
      const size = Stat.corridorSize(floor)

      if (analysis.intersection > size) {
        return createDirect(axis, size, left, right)
      }

      if (analysis.exceeding > size) {
        return createAngular(axis, size, left, right)
      }

      return { error: true }
    }

    return {
      create
    }
  }())

  const Dangeon = (function Dangeon () {
    const get = R.curry((pos, dangeon) => dangeon[pos.y][pos.x])

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

    function update (point, cell, dangeon) {
      if (point === undefined) { return dangeon }

      const pointIsWall = R.compose(Cell.isWall, get(point))

      if (pointIsWall(dangeon)) {
        throw new Error(`Position 'x:${point.x}, y:${point.y}' is occupied by a wall.`)
      }

      return set(point, cell, dangeon)
    }

    function set (pos, cell, dangeon) {
      const result = dangeon.concat()
      const row = dangeon[pos.y].concat()

      row[pos.x] = cell
      result[pos.y] = row

      return result
    }

    function fill (rows, cols, value, dangeon) {
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

    function fromSample (floor, node, dangeon) {
      const { axis, r1, r2, left, right } = node

      if (dangeon.error) { return dangeon }

      if (r1 !== undefined) {
        const rows = R.range(r1.y, r2.y)
        const cols = R.range(r1.x, r2.x)
        return fill(rows, cols, config.objects.space, dangeon)
      }

      const withRooms = fromSample(
        floor,
        left,
        fromSample(floor, right, dangeon)
      )

      const withCorridors = Tunnel.create(
        floor,
        axis,
        Room.neighbors(node)
      )

      if (withRooms.error || withCorridors.error) {
        return { error: true }
      }

      return withCorridors(withRooms)
    }

    function privateArea (point, dangeon) {
      return R.map(
        get(R.__, dangeon),
        Point.privateArea(point)
      )
    }

    return {
      create,
      get,
      set: R.curry(set),
      update: R.curry(update),
      batch,
      fill: R.curry(fill),
      fromSample: R.curry(fromSample),
      privateArea: R.curry(privateArea)
    }
  }())

  const Viewport = (function Viewport () {
    function create (floor, place) {
      if (place === undefined) {
        return createAtCenter(floor)
      }

      return createAtPlace(floor, place)
    }

    function createAtCenter (floor) {
      const { rows, cols } = Stat.floor(floor)
      const vRows = config.viewport.rows
      const vCols = config.viewport.cols
      const halfCols = Math.round(cols / 2)
      const halfRows = Math.round(rows / 2)
      const halfVCols = Math.round(vCols / 2)
      const halfVRows = Math.round(vRows / 2)

      const p0 = Point.create(floor)(
        halfCols - halfVCols,
        halfRows - halfVRows
      )

      const p1 = Point.create(floor)(
        halfCols + (vCols - halfVCols),
        halfRows + (vRows - halfVRows)
      )

      return { p0, p1 }
    }

    function createAtPlace (floor, place) {
      const { rows, cols } = Stat.floor(floor)
      const vRows = config.viewport.rows
      const vCols = config.viewport.cols
      const halfVRows = Math.round(vRows / 2)
      const halfVCols = Math.round(vCols / 2)
      const pointOnFloor = Point.create(floor)

      const maybeX0 = place.x - halfVCols
      const maybeX1 = place.x + (vCols - halfVCols)

      const maybeY0 = place.y - halfVRows
      const maybeY1 = place.y + (vRows - halfVRows)

      const [x0, x1] = align(maybeX0, maybeX1, 0, cols)
      const [y0, y1] = align(maybeY0, maybeY1, 0, rows)

      return { p0: pointOnFloor(x0, y0), p1: pointOnFloor(x1, y1) }
    }

    function align (a, b, boundA, boundB) {
      if (a < boundA) {
        return [boundA, b - a]
      }

      if (b >= boundB) {
        return [a - (b - boundB) - 1, boundB - 1]
      }

      return [a, b]
    }

    return {
      create
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
        const enemyDamage = Weapon.randomDamage(enemy)

        return () => address(keeper({
          player: Weapon.randomDamage(player),
          enemy: enemyDamage
        }))
      }

      function pause (delay, keeper) {
        return () => setTimeout(() => address(keeper), delay)
      }

      function generateDangeon (level, p1, p2, dangeon, guard = 0) {
        const sample = DangeonTree.create(level, { p1, p2 })
        const result = Dangeon.fromSample(level, sample, dangeon)

        if (dangeon.error) {
          if (guard > 9) {
            throw new Error('Configuration Error! Wrong room / cooridor settings.')
          }

          return generateDangeon(level, p1, p2, dangeon, guard + 1)
        }

        return result
      }

      function findItem (list, level) {
        return R.find(
          key => list[key].level === level,
          R.keys(list)
        )
      }

      const placePlayer = R.curry((level, player, entry, dangeon) => {
        if (R.keys(entry).length > 0) {
          const entryPoint = R.head(R.values(entry)).place
          const point = Point.moveRight(entryPoint)
          return { player: R.assoc('place', point, player) }
        }

        const point = Point.generate(level, dangeon)

        return { player: R.assoc('place', point, player) }
      })

      const genStep = R.curry(
        function genStep (base, level, mark, [result, dangeon]) {
          const place = Point.generate(level, dangeon)

          return [
            R.assoc(place.id, R.merge(base, { place }), result),
            Dangeon.update(place, mark, dangeon)
          ]
        }
      )

      const generateEnemies = R.curry((level, count, dangeon) => {
        const type = findItem(config.enemies, level)
        const weapon = findItem(config.weapons, level)
        const mark = Stat.mark('enemy')
        const numOfEnemies = Stat.enemy(type).count || count
        const base = R.merge(Stat.enemy(type), { type, weapon })
        const factor = (numOfEnemies === 1) ? 1 : config.enemyFactor

        const cond = () => Math.random() <= factor

        const [result, next] = R.reduce(acc => {
          if (!cond()) { return acc }

          return genStep(base, level, mark, acc)
        }, [{}, dangeon], R.range(0, numOfEnemies))

        return [{ enemy: result }, next]
      })

      const generateHealth = R.curry((level, count, dangeon) => {
        const type = findItem(config.health, level)
        const mark = Stat.mark('health')
        const base = { type }

        const [result, next] = R.reduce(
          genStep(base, level, mark),
          [{}, dangeon],
          R.range(0, count)
        )

        return [
        { health: result }, next]
      })

      const generateWeapon = R.curry((level, dangeon) => {
        const result = {}
        const place = Point.generate(level, dangeon)
        const type = findItem(config.weapons, level)

        result[place.id] = { type, place }

        return [
          { weapon: result },
          Dangeon.update(place, Stat.mark('weapon'), dangeon)
        ]
      })

      const placeEntrance = R.curry((entrance, cond, level, dangeon) => {
        const mark = Stat.mark(entrance)

        if (!cond) { return [{}, dangeon] }

        if (mark === undefined) {
          throw new Error(`Unknown entrance: ${entrance}`)
        }

        const place = Point.generate(level, dangeon)
        const result = {
          [place.id]: { place }
        }

        return [
          { [entrance]: result },
          Dangeon.update(place, config.marks[entrance], dangeon)
        ]
      })

      function genWorld (model, keep) {
        return () => {
          const level = model.floor
          const { rows, cols } = Stat.floor(level)
          const p1 = { x: 0, y: 0 }
          const p2 = { x: cols, y: rows }

          const send = R.compose(address, keep, R.merge(model))
          const dangeon = generateDangeon(level, p1, p2, model.dangeon)

          const listOfGenerators = [
            generateWeapon(level),
            generateEnemies(level, Stat.floor(level).rooms),
            generateHealth(level, Stat.floor(level).rooms),
            placeEntrance('entry', level > 1, level),
            placeEntrance('exit', level < 5, level)
          ]

          const [items, filledDangeon] = R.reduce(([acc, data], generator) => {
            const result = generator(data)
            return [R.merge(acc, result[0]), result[1]]
          }, [{}, dangeon], listOfGenerators)

          const gameObjects = R.merge(
            items,
            placePlayer(level, model.player, items.entry, filledDangeon)
          )

          return send(R.merge({ dangeon }, gameObjects))
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

      const newGame = () => {
        return createDangeon()
      }

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
          const stats = Stat.level(model.player.level)

          const result = R.compose(
            R.assocPath(['player', 'experience'], expAfter),
            R.dissocPath(['enemy', id])
          )(model)

          if (result.player.experience >= stats.breakpoint) {
            const newLevel = result.player.level + 1
            const newStats = Stat.level(newLevel)

            result.player.level = newLevel
            result.player.experience = result.player.experience - stats.breakpoint
            result.player.power = newStats.power
            result.player.health = newStats.health
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

        const healthType = health[id].type

        const resultHealth = player.health + Stat.health(healthType)
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

      function nextLevel (model) {
        const currentLevel = R.omit(['player', 'archive', 'gameOver'], model)
        const archive = R.append(currentLevel, model.archive)
        return createDangeon(model.floor + 1, archive, model.player)
      }

      function move (step) {
        return function (model) {
          const { player, enemy, health, weapon, exit } = model
          const moveTo = step(player.place)
          const id = moveTo.id
          const isPlaceSpace = R.compose(Cell.isSpace, Dangeon.get(moveTo))

          if (model.gameOver) { return [{}] }

          if (enemy && enemy[id]) { return attackEnemy(moveTo, model) }
          if (weapon && weapon[id]) { return takeWeapon(moveTo, model) }
          if (health && health[id]) { return takeHealth(moveTo, model) }
          if (exit && exit[id]) { return nextLevel(model) }

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

    function createDangeon (newFloor, archivedStates, savedPlayer) {
      function createPlayer (player) {
        if (player) {
          return R.dissoc('place', player)
        }

        return R.merge({
          level: 1,
          experience: 0,
          weapon: 'stick'
        }, {
          power: Stat.level(1).power,
          health: Stat.level(1).health
        })
      }

      const floor = newFloor || 1
      const archive = archivedStates || []

      const player = createPlayer(savedPlayer)
      console.log(player)

      const model = {
        player,
        enemy: {},
        health: {},
        weapon: {},
        entry: {},
        exit: {},
        floor,
        dangeon: Dangeon.create(Stat.floor(floor)),
        archive,
        gameOver: false
      }

      return [
        model,
        tasks.genWorld(model, actions.keepWorld)
      ]
    }

    function view () {
      const h = React.createElement
      const renderer = el => ReactDOM.render(el, root$)

      function keyDownHandler (ev) {
        address(actions.keyDown(ev.key))
      }

      document.body.addEventListener('keydown', keyDownHandler)

      function fillWithObjects (model) {
        const { player } = model
        const { health, weapon, enemy } = model
        const { entry, exit } = model

        const conf = config.objects
        const batchUpdate = Dangeon.batch(Dangeon.update)
        const itemPlaces = R.compose(R.map(R.prop('place')), R.values)

        return R.compose(
          batchUpdate(itemPlaces(health), conf.health),
          batchUpdate(itemPlaces(weapon), conf.weapon),
          batchUpdate(itemPlaces(enemy), conf.enemy),
          batchUpdate(itemPlaces(entry), conf.entry),
          batchUpdate(itemPlaces(exit), conf.exit),
          Dangeon.update(player.place, conf.player)
        )
      }

      const app = (function app () {
        function App ({ dangeon, viewport, player, exit, floor, gameOver }) {
          const { health, power, level, experience } = player
          const weapon = Stat.weapon(player.weapon).power
          const cellHeight = Stat.cellHeight
          const cellWidth = Stat.cellWidth
          const dangeonStyle = {
            width: config.viewport.width,
            height: config.viewport.height
          }

          const rowStyle = {
            height: cellHeight
          }

          const cellStyle = {
            height: cellHeight,
            width: cellWidth
          }

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
            h('div', { className: 'dangeon rounded', style: dangeonStyle },
              R.map(rowId => (
                h('div', { className: 'dangeon-row', key: rowId, style: rowStyle },
                  R.map(cellId => (
                    h('div', {
                      className: [
                        'dangeon-cell',
                        config.marks[dangeon[rowId][cellId]]
                      ].join(' '),
                      key: cellId,
                      style: cellStyle
                    })
                  ), R.range(viewport.p0.x, viewport.p1.x))
                )
              ), R.range(viewport.p0.y, viewport.p1.y))
            )
          )
        }

        return { App }
      }())

      function reform (model) {
        const { dangeon, floor, player } = model
        const fill = fillWithObjects(model)
        const viewport = Viewport.create(
          floor,
          player.place
        )

        return R.merge(model, { dangeon: fill(dangeon), viewport })
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
