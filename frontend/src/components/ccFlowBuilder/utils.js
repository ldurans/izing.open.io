export function hasLine (data, from, to) {
  for (let i = 0; i < data.lineList.length; i++) {
    const line = data.lineList[i]
    if (line.from === from && line.to === to) {
      return true
    }
  }
  return false
}

export function hashOppositeLine (data, from, to) {
  return hasLine(data, to, from)
}

export function getConnector (jsp, from, to) {
  const connection = jsp.getConnections({
    source: from,
    target: to
  })[0]
  return connection
}

export function uuid () {
  return Math.random().toString(36).substr(3, 10)
}
