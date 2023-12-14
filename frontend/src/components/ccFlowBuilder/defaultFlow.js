const data = {
  name: 'Fluxo Inicial',
  nodeList: [
    {
      id: 'start',
      name: 'Início',
      type: 'start',
      left: '26px',
      top: '100px',
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
      id: 'configurations',
      name: 'Configurações',
      type: 'configurations',
      left: '340px',
      top: '100px',
      viewOnly: true,
      ico: 'mdi-alert-circle-outline',
      configurations: {
        notOptionsSelectMessage: {
          message: '',
          stepReturn: 'A' // 'A' - atual | 'S' - inicial
        },
        notResponseMessage: {
          time: 10,
          type: 1, // '1' - Fila | '2' - Usuario
          destiny: ''
        },
        welcomeMessage: {
          message: ''
        },
        maxRetryBotMessage: {
          number: 3,
          type: 1,
          destiny: ''
        }
      }
    },
    {
      id: 'nodeC',
      name: 'Boas vindas!',
      type: 'node',
      left: '26px',
      top: '301px',
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
  }]
}

export function getDefaultFlow () {
  return data
}
