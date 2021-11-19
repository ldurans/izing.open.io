const dataA = {
  name: 'Fluxo Inicial',
  nodeList: [
    {
      id: 'start',
      name: 'Início',
      type: 'start',
      left: '26px',
      top: '26px',
      ico: 'mdi-play',
      viewOnly: true,
      status: 'success',
      style: {
        // background: 'black',
        // height: '100px',
        // width: '120px'
      }
    },
    {
      id: 'exception',
      name: 'Exceções',
      type: 'exception',
      left: '340px',
      top: '26px',
      ico: 'mdi-alert-circle-outline'
    },
    {
      id: 'nodeC',
      name: 'Boas vindas!',
      type: 'node',
      left: '26px',
      top: '201px',
      interactions: [],
      conditions: [],
      actions: []
      // ico: 'el-icon-present'
    }
  ],
  lineList: [{
    from: 'start',
    to: 'nodeC',
    // connector: 'Bezier',
    // connector: 'Straight',
    // connector: 'Flowchart',
    // anchors: ['Top', 'Bottom'],
    paintStyle: { strokeWidth: 3, stroke: '#8db1dd' }
  }, {
    from: 'nodeB',
    to: 'nodeC'
  }]
}

export function getDataA () {
  return dataA
}
