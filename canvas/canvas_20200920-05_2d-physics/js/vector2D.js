const normalizePositiveDegrees = (degrees) => {
    if (degrees > 360) {
        return normalizePositiveDegrees(degrees - 360)
    } else if (degrees === 360) {
        return 0
    } else {
        return degrees
    }
}

const normalizeNegativeDegrees = (degrees) => {
    if (degrees < 0) {
        return normalizeNegativeDegrees(degrees + 360)
    } else {
        return degrees
    }
}

const normalizeDegrees = (degrees) =>
    degrees > 0
        ? normalizePositiveDegrees(degrees)
        : normalizeNegativeDegrees(degrees)

const degreesToRadians = (degrees) => degrees * (Math.PI / 180)

const radiansToDegrees = (radians) => radians * (180 / Math.PI)

const inspect = (input) => {
    console.log(input)
    return input
}

const floatsAreEqual = (floatA, floatB) => {
    const threshold = 1 / 8192
    return Math.abs(floatA - floatB) < threshold
}

const getVector2D = (x, y) => Object.freeze({ x: x, y: y })

/**
 * If vector is positive, it returns negative and vice-versa
 * @param {Object[Vector2D]} vector
 * @Returns {Object[Vector2D]} negated vector
 */
const negateVector2D = (vector) => getVector2D(-vector.x, -vector.y)

const addVector2D = (vectorA, vectorB) => {
    const resultX = vectorA.x + vectorB.x
    const resultY = vectorA.y + vectorB.y
    return getVector2D(resultX, resultY)
}

const subtractVector2D = (vectorA, vectorB) => {
    const resultX = vectorA.x - vectorB.x
    const resultY = vectorA.y - vectorB.y
    return getVector2D(resultX, resultY)
}

const scaleVector2D = (vector, scalar = 1) => {
    const resultX = vector.x * scalar
    const resultY = vector.y * scalar
    return getVector2D(resultX, resultY)
}

/**
 * Divides a vector by a divisor
 * @param {Object[Vector2D]} vector
 * @param {Number} divisor
 * @Returns {Object[Vector2D]} New vector representing the scaled vector
 */
const divideVector2D = (vector, divisor = 1) => {
    if (divisor === 0) return getVector2D(0, 0)
    const resultX = vector.x / divisor
    const resultY = vector.y / divisor
    return getVector2D(resultX, resultY)
}

const getVector2DLength = (vector) => Math.sqrt(vector.x ** 2 + vector.y ** 2)

const getDotProduct = (vectorA, vectorB) =>
    vectorA.x * vectorB.x + vectorA.y * vectorB.y

/**
 * Returns if angle between vectors is obtuse (1), square (0), or acute (-1)
 * @param {Object[Vector2D]} vectorA
 * @param {Object[Vector2D]} vectorB
 * @returns {Integer} (1) if obtuse, (0) if square, (-1) if acute
 */
const getAngleConditionByDot = (vectorA, vectorB) => {
    const dotProduct = getDotProduct(vectorA, vectorB)
    return floatsAreEqual(dotProduct, 0) ? 0 : dotProduct < 0 ? 1 : -1
}

const getUnitVector = (vector) => {
    const length = getVector2DLength(vector)
    if (length === 0) return vector
    return divideVector2D(vector, length)
}

const getAngleFromDot = (vectorA, vectorB) => {
    const unitVectorA = getUnitVector(vectorA)
    const unitVectorB = getUnitVector(vectorB)
    const dotProduct = getDotProduct(unitVectorA, unitVectorB)
    const angle = Math.acos(dotProduct)
    return radiansToDegrees(angle)
}

/**
 * Squared length of vector via dot product (v.x**2 + v.y**2 = length**2)
 * @param {Object[Vector2D]} vector
 * @returns {Number} squared length of vector
 */
const getSqrdLengthFromDot = (vector) => getDotProduct(vector, vector)

/**
 * Rotates a vector by specified degrees
 * @param {Object[Vector2D]} vector
 * @param {Number} degrees
 * @param {Bool[default: true]} normalize determines if degrees need to be normalized to between 0 and 360. 360 will be set to 0
 * @returns {Object[Vector2D]} a new vector representing the rotated vector
 */
const rotateVector2D = (degrees, vector, normalize = true) => {
    const normalizedDegrees = normalize ? normalizeDegrees(degrees) : degrees
    const radians = degreesToRadians(normalizedDegrees)
    const sine = Math.sin(radians)
    const cosine = Math.cos(radians)
    const resultX = vector.x * cosine - vector.y * sine
    const resultY = vector.x * sine + vector.y * cosine
    return getVector2D(resultX, resultY)
}

const rotateVector2D90Deg = (vector) => {
    const resultX = vector.y * -1
    const resultY = vector.x
    return getVector2D(resultX, resultY)
}

const projectVector2D = (projectedVector, baseVector) => {
    const sqrdBase = getSqrdLengthFromDot(baseVector)
    if (sqrdBase > 0) {
        const dotProduct = getDotProduct(projectedVector, baseVector)
        return scaleVector2D(baseVector, dotProduct / sqrdBase)
    } else {
        return baseVector
    }
}

const getLine2D = (baseVector, directionVector) =>
    Object.freeze({
        base: { ...baseVector },
        direction: { ...directionVector },
    })

const getLineSegment2D = (pointA, pointB) =>
    Object.freeze({
        p1: { ...pointA },
        p2: { ...pointB },
    })

const getCircle2D = (center, radius) =>
    Object.freeze({
        x: center.x,
        y: center.y,
        radius: radius,
    })

const getRectAligned2D = (base, size) =>
    Object.freeze({
        base: { ...base },
        size: { ...size },
    })

const getRectOriented2D = (center, halfExtend, rotation) =>
    Object.freeze({
        center: { ...center },
        halfExtend: { ...halfExtend },
        rotation: rotation,
    })

const checkOverlap = (minA, maxA, minB, maxB) => minB <= maxA && minA <= maxB

const checkCollisionRectRect = (rectA, rectB) => {
    const aLeft = rectA.origin.x
    const aRight = aLeft + rectA.size.x
    const aBottom = rectA.origin.y
    const aTop = aBottom + rectA.size.y

    const bLeft = rectB.origin.x
    const bRight = bLeft + rectB.size.x
    const bBottom = rectB.origin.y
    const bTop = bBottom + rectB.size.y

    const isOverlapping =
        checkOverlap(aLeft, aRight, bLeft, bRight) &&
        checkOverlap(aBottom, aTop, bBottom, bTop)

    return isOverlapping
}

const checkCollisionCircCirc = (circleA, circleB) => {
    const radiusSum = circleA.radius + circleB.radius
    const distance = subtractVector2D(circleA.center, circleB.center)
    const isOverlapping = getVector2DLength(distance) <= radiusSum
    return isOverlapping
}

const checkCollisionPointPoint = (pointA, pointB) =>
    floatsAreEqual(pointA.x, pointB.x) && floatsAreEqual(pointA.y, pointB.y)

// determines if vectors are parallel by checking
// if a line perpendicular LineA, is also perpendicular to lineB
// by using the dot-product method
const checkVectorsParallel = (vectorA, vectorB) => {
    const perpendicularVector = rotateVector2D90Deg(vectorA)
    const isParallel = floatsAreEqual(
        0,
        getAngleConditionByDot(perpendicularVector, vectorB)
    )
    return isParallel
}

const checkEqualVectors = (vectorA, vectorB) =>
    floatsAreEqual(vectorA.x - vectorB.x + (vectorA.y - vectorB.y), 0)

const checkEquivalentLines = (lineA, lineB) => {
    if (!checkVectorsParallel(lineA.direction, lineB.direction)) {
        return false
    } else {
        const subtractedVector = subtractVector2D(lineA.base, lineB.base)
        const isParallel = checkVectorsParallel(
            subtractedVector,
            lineA.direction
        )
        return isParallel
    }
}

const checkCollisionLineLine = (lineA, lineB) => {
    if (checkVectorsParallel(lineA.direction, b.direction)) {
        return checkEquivalentLines(lineA, lineB)
    } else {
        return true
    }
}

const testA = getVector2D(50, 100)
const testB = getVector2D(100, 0)

inspect(getDotProduct(testA, testB))
inspect(getAngleFromDot(testA, testB))

inspect(projectVector2D(testA, testB))
inspect(getLine2D(testA, testB))
inspect(rotateVector2D90Deg(testA))
