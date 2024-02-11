## [2.0.1](https://github.com/ldurans/izing.io/compare/v2.0.0...v2.0.1) (2024-02-11)


### Bug Fixes

* correção para envio de mensagens via bot ([be7851e](https://github.com/ldurans/izing.io/commit/be7851e33b1a84c80c343a12ed8ba36f3db2099c))
* evitar propagação de erro na marcação de mensagens lidas. ([43d8aaf](https://github.com/ldurans/izing.io/commit/43d8aaf62f2fd74be101d3593564426154d56a7b))
* evitar redirecionamento para fila/usuário quando ausente na configuração do bot ([4d16262](https://github.com/ldurans/izing.io/commit/4d16262935c6b388d672349b8f88fb4c93e1baae))

# [2.0.0](https://github.com/ldurans/izing.io/compare/v1.9.0...v2.0.0) (2023-12-14)

### Notas Gerais:
- style: reestruturação do estilo da aplicação, modernizando a interface.
- feat: adicionado configuração de bot por conexão
- feat: agora é possível cadastrar as conexões
- feat: adicionado delay na campanha
- feat: adicionado configuração para rejeição de chamada do Whatsapp
- feat: adicionado importação de contatos via CSV
- feat: adicionado importação de contatos via histórico de conversas do whatsapp
- feat: adicionado exportação de contatos
- feat: otimizado fluxo de envio de mensagens
- feat: novo mecânismo para inicio do atendimento, melhorando a experiência do usuário
- feat: adicionado botão para integração com o jitsi, gerando link para meet diretamente no chat

- fix: comunicação do socket melhorada
- fix: ajuste para utilização da opção de "qualquer resposta" no chatbot.

- chore!: retirada do messenger
>BREAKING CHANGE: o suporte ao messenger não está mais disponível
- chore: melhorado o suporte à utilização de carteira

- chore!: mudança na licença do software
>buscando garantir o objetivo pelo qual criamos o projeto, a licença passou a ser AGPLv3 

- perf: foram feitos inúmeras outras otimizações para melhorar a performance e controle do fluxo da aplicação, melhorando a manutenibilidade.    

### Bug Fixes

* ajuste card Ativo/Receptivo ([79f485b](https://github.com/ldurans/izing.io/commit/79f485b74f40dfd261ce3865f1f40679b4ae0259))


### Styles

* reestruturação do estilo da aplicação, modernizando a interface. ([8289c48](https://github.com/ldurans/izing.io/commit/8289c486d89c01a36e9a17fd95a1df9f3a4f742a))


### BREAKING CHANGES

* o suporte ao messenger não está mais disponível
chore: melhorado o suporte à utilização de carteira

chore!: mudança na licença do software
- buscando garantir o objetivo pelo qual criamos o projeto, a licença passou a ser AGPLv3

perf: foram feitos inúmeras outras otimizações para melhorar a performance e controle do fluxo da aplicação, melhorando a manutenibilidade.

Estamos felizes com esse grande lançamento e esperamos que a comunidade possa apoiar a continudade e sua evolução.

# [1.9.0](https://github.com/ldurans/izing.io/compare/v1.8.1...v1.9.0) (2022-12-19)


### Bug Fixes

* ajuste no funcionamento do fluxo chatbot para todos os canais como esperando ([ef36938](https://github.com/ldurans/izing.io/commit/ef369382166312504abcba764c1e5918c03c358d))
* Ajuste no tratamento do horário de atendimento > Necessário que o usuário para a sincronização do timezone no servidor e banco de dados, atualmente isso não é suportado pela aplicação. ([f5500d4](https://github.com/ldurans/izing.io/commit/f5500d4bdb5bfa070b9bcd787990c28b4c4fe118)), closes [#87](https://github.com/ldurans/izing.io/issues/87)
* text in readme segundarias to secundarias ([683792b](https://github.com/ldurans/izing.io/commit/683792b133495de37277e9f7332dc06e4462dd3b))
* tratado erro ao pegar o token de acesso definitivo do messenger. ([9941e23](https://github.com/ldurans/izing.io/commit/9941e23fe40467590c4e22e2d7600c027f3861a0))


### Features

* Adicionado suporte para utilização do redis com autenticação ([9e04814](https://github.com/ldurans/izing.io/commit/9e0481491ef5fd6551b158586f6f26bd2422e80b))
* lógica de desconexão, com tentativa de restauração ([ef74480](https://github.com/ldurans/izing.io/commit/ef74480e44abbd629e8ea62c15b533bc5375ca52))

## [1.8.1](https://github.com/ldurans/izing.io/compare/v1.8.0...v1.8.1) (2022-12-13)


### Bug Fixes

* salvar o estado da opção ativação/inativação assinatura. ([d0c8f23](https://github.com/ldurans/izing.io/commit/d0c8f239572dc7d0231211a2296a40baf15db04f))

# [1.8.0](https://github.com/ldurans/izing.io/compare/v1.7.3...v1.8.0) (2022-12-05)


### Features

* ativar/desativar assinatura ([fd637e8](https://github.com/ldurans/izing.io/commit/fd637e86331bf9d774f08fb6f71658be06312f09)), closes [#72](https://github.com/ldurans/izing.io/issues/72)

## [1.7.3](https://github.com/ldurans/izing.io/compare/v1.7.2...v1.7.3) (2022-12-01)


### Bug Fixes

* ajuste para assegurar o envio conforme sessão do ticket, corrigindo conflito do contato. ([28d28d1](https://github.com/ldurans/izing.io/commit/28d28d11906d3a6aa4c19533f6b4f8ec45cadb89))

## [1.7.2](https://github.com/ldurans/izing.io/compare/v1.7.1...v1.7.2) (2022-11-28)


### Bug Fixes

* ajuste scroll para mensagens recebidas ([3c83796](https://github.com/ldurans/izing.io/commit/3c837964dd6de77f9d1de0c2d6ad0e72e2d09ebd)), closes [#47](https://github.com/ldurans/izing.io/issues/47)
* correção do versionamento do package-lock.json. ([99c9504](https://github.com/ldurans/izing.io/commit/99c9504c52c7de14958628b4b9ad9b660676f647))

## [1.7.1](https://github.com/ldurans/izing.io/compare/v1.7.0...v1.7.1) (2022-11-14)


### Bug Fixes

* **#45:** ajuste no módulo de campanha para exibir as sessões corretamente. ([007c016](https://github.com/ldurans/izing.io/commit/007c016a616b38be768f4049ac84fb508b2f3153)), closes [#45](https://github.com/ldurans/izing.io/issues/45)

# [1.7.0](https://github.com/ldurans/izing.io/compare/v1.6.1...v1.7.0) (2022-11-14)


### Bug Fixes

* ajuste de porta do redis para acesso via gateway localhost. ([379cc05](https://github.com/ldurans/izing.io/commit/379cc050a7076722025a9c4460b7be7d0c1df66b))
* ajuste do qrcode para doações no readme. ([2321405](https://github.com/ldurans/izing.io/commit/2321405a2bc9aa759ad66ce4174e1944de41d930))
* ajuste do tamanho do qrcode para doações no readme. ([052c806](https://github.com/ldurans/izing.io/commit/052c8064ad934e7a0afd3f6d9feea24f6ac5d30b))
* ajuste mime-types para forçar reconhecimento do metodo extension. ([a852226](https://github.com/ldurans/izing.io/commit/a852226c4c46ec28e50e517c56c9671de5eca1a0))
* ajuste no docker para permitir conexão com containers externos ([ee96ffc](https://github.com/ldurans/izing.io/commit/ee96ffca54217011c74c8d5aa2b2db59a3518b9f))
* ajuste no nome dos arquivo de variáveis de exemplo. ([48bd01a](https://github.com/ldurans/izing.io/commit/48bd01a6ef9840bc616b046cf9f6594ab2fd957a))
* ajuste no scroll das mensagens ([c05d3c2](https://github.com/ldurans/izing.io/commit/c05d3c28f7db89ce4936c7dc40042378d56b7951))
* ajuste para exibir o botão do qrcode somente para whatsapp. ([2f99d08](https://github.com/ldurans/izing.io/commit/2f99d08681b5c341c376a33017696909c9c438c8))
* alterado valor defaul do ID para utilizar UUID do Postgres nas tabelas de configuração da api e mensagens da api. ([b87d567](https://github.com/ldurans/izing.io/commit/b87d567a3fac08eafc792f4bbb792de1cad96f01))
* alterado valor defaul do ID para utilizar UUID do Postgres nas tabelas de configuração da api e mensagens da api. ([f7ae28e](https://github.com/ldurans/izing.io/commit/f7ae28ea70935a2e4c7e0b76ec6716b055b70856))
* alterado valor defaul do ID para utilizar UUID do Postgres nas tabelas de configuração da api e mensagens da api. ([bf81d32](https://github.com/ldurans/izing.io/commit/bf81d3258c1065609e2a462323006f009fb14f27))
* controle de erro ao apagar a pasta da sessão do whatsapp ([b794fb8](https://github.com/ldurans/izing.io/commit/b794fb8dc99602009cb21ece1ddd9e055cbea418))
* corrigdo fluxo na gestão da sessão ([d9435f3](https://github.com/ldurans/izing.io/commit/d9435f3e6695060720cc6392a99b7a6ea77784bb))
* corrigido apresentação do QRCode ([64e6067](https://github.com/ldurans/izing.io/commit/64e6067d9d06240d4369001944b6befa29b4bfa9))
* corrigido o campo idFront no model Message ([c105543](https://github.com/ldurans/izing.io/commit/c105543dd84f59164a077f177c7b0d051cde20e0))
* corrigido o funcionamento do número máximo de retentativas do bot. ([22d4ba6](https://github.com/ldurans/izing.io/commit/22d4ba65302df50990cfde17dff19f29bd698316)), closes [#41](https://github.com/ldurans/izing.io/issues/41)
* **docker:** simplificando o docker compose para acesso direto ao backend sem passar pelo nginx. ([96778d9](https://github.com/ldurans/izing.io/commit/96778d94ce439bfd1fcaf8a6b065b61ae1a1ce24))
* retirado envio de "Button Body" indevido nas mensagem, causado pelo wrapper da class button. ([e189fe7](https://github.com/ldurans/izing.io/commit/e189fe73aac596ab34fa2fa3dfe9bdeb270b9010))


### Features

* adicionado identificação para mensagens enviadas ([c8b85a5](https://github.com/ldurans/izing.io/commit/c8b85a5e4c473e1a8c423c99a0b9104f5467a93c))
* adicionado idFront no backend ([3aaf10d](https://github.com/ldurans/izing.io/commit/3aaf10dafca41220a61d80b4b2cf930eeba94d44))

## [1.6.1](https://github.com/ldurans/izing.io/compare/v1.6.0...v1.6.1) (2022-11-06)


### Bug Fixes

* ajustado docker-compose ([ce39dc9](https://github.com/ldurans/izing.io/commit/ce39dc9f914b5ba6c99e294090b0e30bede0cb3d))
* retirado key antiga do newrelic. ([8107820](https://github.com/ldurans/izing.io/commit/810782088ba74d6a6fba10b85db9b67659d69568))

# [1.6.0](https://github.com/ldurans/izing.io/compare/v1.5.0...v1.6.0) (2022-11-04)


### Features

* **seeds:** adicionado seeds com dados iniciais do projeto. ([9b550fc](https://github.com/ldurans/izing.io/commit/9b550fc53bff0a98b85a148d616aacf8dc79e046))

# [1.5.0](https://github.com/ldurans/izing.io/compare/v1.4.3...v1.5.0) (2022-11-03)


### Bug Fixes

* **bull:** atualizado versão. ([d2af79e](https://github.com/ldurans/izing.io/commit/d2af79ed4767a8697e084a91fe7c2b565b3f1cc6))
* **bull:** atualizado versão. ([c2fa874](https://github.com/ldurans/izing.io/commit/c2fa874c1f3822aff982a382f867f472eec13069))
* **bull:** atualizado versão. ([ebac4fa](https://github.com/ldurans/izing.io/commit/ebac4fa9d6f3a13197b2c586ab69a7c6ed372909))
* **bull:** atualizado versão. ([74513de](https://github.com/ldurans/izing.io/commit/74513de6d389b8d048194d495d976daaef958902))
* **bull:** atualizado versão. ([49441e2](https://github.com/ldurans/izing.io/commit/49441e28099b97b65afcf1ef4228610156399c51))
* **bull:** atualizado versão. ([00af4fb](https://github.com/ldurans/izing.io/commit/00af4fb7a278f8f705293009d6fedc41738e0f5f))
* **docker:** ajustes iniciais para docker ([281a83e](https://github.com/ldurans/izing.io/commit/281a83ed2ed0bc90c03c1782e7f5cad3df69b80a))
* **verifyBusinessHours:** desativado momentaneamente para revisão. ([cc71018](https://github.com/ldurans/izing.io/commit/cc71018461bc5bd7592c5f9aebd0c03cd03503a1))
* **wwebjs:** atualização lib whatsapp. ([bd5540d](https://github.com/ldurans/izing.io/commit/bd5540dbab801bad465fd1f8559bc2affdba4fa6))


### Features

* **session:** função para apagar a pasta ao desconectar. ([0e2e181](https://github.com/ldurans/izing.io/commit/0e2e1816bb8ae246fc30a872c8d0e8b1eaff6532))

## [1.4.3](https://github.com/ldurans/izing.io/compare/v1.4.2...v1.4.3) (2022-07-25)


### Bug Fixes

* **bull:** ui queues ([5ddd98b](https://github.com/ldurans/izing.io/commit/5ddd98b028e328822789abb5a01ef1b5982a319a))

## [1.4.2](https://github.com/ldurans/izing.io/compare/v1.4.1...v1.4.2) (2022-07-25)


### Bug Fixes

* **mensagens:** ajuste no envio de mensagens agendadas. ([bc32611](https://github.com/ldurans/izing.io/commit/bc326117da014264f5e241600b8d437b088cd100))

## [1.4.1](https://github.com/ldurans/izing.io/compare/v1.4.0...v1.4.1) (2022-07-24)


### Bug Fixes

* **whtsapp:** correção de mensagem via bot. ([14f747c](https://github.com/ldurans/izing.io/commit/14f747c20f7a6bb4fce78552c345dbea4a239dd3))

# [1.4.0](https://github.com/ldurans/izing.io/compare/v1.3.0...v1.4.0) (2022-07-24)


### Features

* **whtsapp:** implementado rotina de envio de mensagem com rabbitmq. ([7b79ee2](https://github.com/ldurans/izing.io/commit/7b79ee20467ee07fe5bd7b77ecaf5bf18396361a))

# [1.3.0](https://github.com/ldurans/izing.io/compare/v1.2.1...v1.3.0) (2022-07-24)


### Features

* **whtsapp:** implementado rotina de envio de mensagem com rabbitmq. ([3f6ed69](https://github.com/ldurans/izing.io/commit/3f6ed69981f800bbf8e3a418ab092ef99a4ca22f))

## [1.2.1](https://github.com/ldurans/izing.io/compare/v1.2.0...v1.2.1) (2022-07-19)


### Bug Fixes

* **wwebjs:** update wwebjs. ([07cd943](https://github.com/ldurans/izing.io/commit/07cd943efbede169354ba8e795ba74dab44b5abf))

# [1.2.0](https://github.com/ldurans/izing.io/compare/v1.1.0...v1.2.0) (2022-07-11)


### Bug Fixes

* **bot:** retirar espaços do numero de teste para verifição do chatbot. ([1a6be79](https://github.com/ldurans/izing.io/commit/1a6be798cdc457375590c1a2459334fc5615b5ac))
* **contato:** ajuste ao atualizar contato. ([df860bb](https://github.com/ldurans/izing.io/commit/df860bb04e08c3b0e80d1f87eeafafbcc1adca56))
* **instagram:** corrigido unixTime para padrão JS. ([d3daede](https://github.com/ldurans/izing.io/commit/d3daedec35487829be0eadad7e71689174a85e19))
* **marca:** ajuste de marca. ([e2b8688](https://github.com/ldurans/izing.io/commit/e2b86882d6ce9734cad339d63dcd40c881518d6a))
* **sendMessages:** enviar mensagens somente se o ticker não estiver resolvido/fechado. ([0c9030b](https://github.com/ldurans/izing.io/commit/0c9030bd6f2dae0041758821ac020f224be42a10))
* **site:** ajuste href politica de privacidade. ([c2b5719](https://github.com/ldurans/izing.io/commit/c2b571991c670e6aab5828cd2cd8d4e3f2d75c50))
* **site:** rename politica de privacidade ([3b4a111](https://github.com/ldurans/izing.io/commit/3b4a111fc067ecdc1090cc1c72e2e9706bfbc70a))
* **telegram:** ajustado para espelhar alterações messagens. ([dedc83a](https://github.com/ldurans/izing.io/commit/dedc83a9a3195e232e6906a205368b69620ea857))
* **telegram:** ajuste no timstamp para padrão JS. ([3974f2b](https://github.com/ldurans/izing.io/commit/3974f2b3e01dbdbadf6f478dffba9adbcce6f6d6))


### Features

* **channels:** implementado delete de mensagens. ([d4e4f52](https://github.com/ldurans/izing.io/commit/d4e4f52f00306f0f89a3c3394e82c6bb8e55970d))
* **chatbot:** auto distribuição dos tíckets adicionado ao bot ([13aa671](https://github.com/ldurans/izing.io/commit/13aa6714d599bc965848bf06e8d1bbaf7cf17696))
* **chat:** corrigido o fluxo para próximas etapas. ([11f57e1](https://github.com/ldurans/izing.io/commit/11f57e1457affd08030eb5bcd164adf4ddbd7ec0))
* **chat:** implementado rotina de deletar para os canais permitidos. ([9cec580](https://github.com/ldurans/izing.io/commit/9cec5809bcffb8ecb8674972f539ed220640a46d))
* **components:** add suporte messenger ([dd2322b](https://github.com/ldurans/izing.io/commit/dd2322b19e858ad224a8216fcd20afe34744f06c))
* **facebook:** v1 para o canal. ([73d6ef8](https://github.com/ldurans/izing.io/commit/73d6ef88df9408c66fb4358e19133470afa95581))
* **messenger:** adicionado ajustes para aplicativos independentes. ([2389bb3](https://github.com/ldurans/izing.io/commit/2389bb3c9136d1ab75fbf73531be94043c14adb2))
* **sendMessages:** adicionado log para verificação dos envios. ([c55bb1d](https://github.com/ldurans/izing.io/commit/c55bb1d70c9b091f1b3a548bc1cfd425f23c6352))
* **sendMessages:** adicionado log para verificação dos envios. ([a1ede4d](https://github.com/ldurans/izing.io/commit/a1ede4da01020c0e884bf8139fd490004766a397))
* **sendMessages:** adicionado log para verificação dos envios. ([92567a3](https://github.com/ldurans/izing.io/commit/92567a33d0eddc7f28593d82ec7ed651b81fa4e8))
* **sendMessages:** adicionado log para verificação dos envios. ([101a95a](https://github.com/ldurans/izing.io/commit/101a95a1ef36b4935aa627c000c9c16a425f4236))
* **sendMessages:** adicionado log para verificação dos envios. ([574bcfc](https://github.com/ldurans/izing.io/commit/574bcfc4dd08ac0319889d4befd8aa98d141a181))

# [1.1.0](https://github.com/ldurans/izing.io/compare/v1.0.1...v1.1.0) (2022-01-04)


### Features

* **component:** add system version ([e0f7b5a](https://github.com/ldurans/izing.io/commit/e0f7b5aa9882ca0421bb0a97169c9f56b5b4f5d0))

## [1.0.1](https://github.com/ldurans/izing.io/compare/v1.0.0...v1.0.1) (2022-01-04)


### Bug Fixes

* **site:** copyright corrigido. ([8f32fa2](https://github.com/ldurans/izing.io/commit/8f32fa2c45811ee468a7a0f46b1d5ec6faa6ab7a))

# 1.0.0 (2022-01-04)


### Features

* add config semant-release ([73e52c3](https://github.com/ldurans/izing.io/commit/73e52c315b47edf350b54f494017d63a5e2630b9))
