const errors = [
  {
    error: 'ERR_SESSION_EXPIRED',
    description: 'Sua conexão expirou.',
    detail: 'A validade da sua conexão expurou. É necessário realizar novo login.'
  },
  {
    error: 'ERR_API_CONFIG_NOT_FOUND',
    description: 'Configurações de API não localizadas.',
    detail: 'Atualize a página e tente novamente. Caso o erro persista, faço contato com o suporte.'
  },
  // {
  //   error: 'ERR_CREATING_MESSAGE',
  //   description: 'Problemas ao criar a mensagem via API.',
  //   detail: 'Verifique se todas as informaçẽos requeridas foram enviadas. Tente novamente e se o erro persistir, fale com o suporte.'
  // },
  {
    error: 'ERR_NO_CONTACT_FOUND',
    description: 'Contato não localizado no sistema.',
    detail: 'Verifique se o número realmente está salvo no sistema de forma correta ou cadastre o contato.'
  },
  {
    error: 'ERR_DUPLICATED_CONTACT',
    description: 'Contato já cadastrado no sistema.',
    detail: 'Localize o contato já cadastro.'
  },
  {
    error: 'ERR_CONTACT_TICKETS_REGISTERED',
    description: 'O contato não pode ser apagado.',
    detail: 'O contato possui atendimentos registrados e não pode ser excluso para garantir a integridade da informação.'
  },
  {
    error: 'ERR_CREATING_MESSAGE',
    description: 'Mensagem não foi criada.',
    detail: 'Verifique se a conexão com o Whatsapp está ativa ou se a mensagem não feriu os termos do whatsapp.'
  },
  {
    error: 'ERR_NO_TICKET_FOUND',
    description: 'Atendimento não localizado.',
    detail: 'Não localizamos o atendimento informado. Atualize a página (F5) e tente novamente. Consulte o suporte caso o erro persista'
  },
  {
    error: 'ERR_AUTO_REPLY_RELATIONED_TICKET',
    description: 'Não é possível apagar o registro.',
    detail: 'O fluxo já foi utilizado em diversos atendimentos.'
  },
  {
    error: 'ERR_NO_AUTO_REPLY_FOUND',
    description: 'Fluxo informado não encontrado.',
    detail: 'Verifique se o fluxo realmente existe. Atualize a página e tente novamente.'
  },
  {
    error: 'ERR_NO_STEP_AUTO_REPLY_FOUND',
    description: 'Não localizao etapa para o fluxo.',
    detail: 'Verifique o cadastro das etapas do chatbot. Confirme se a etapa realmente existe.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS_OR_NOT_ACESSIBLE',
    description: 'Campanha não existe ou não está acessível.',
    detail: 'Verifique se a campanha ainda existe ou se está disponível.'
  },
  {
    error: 'ERROR_CAMPAIGN_NOT_EXISTS',
    description: 'Campanha não localizada.',
    detail: 'Verifique se a campanha ainda existe ou se está disponível.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_FOUND',
    description: 'Campanha não localizada.',
    detail: 'Verifique se a campanha ainda existe ou se está disponível.'
  },
  {
    error: 'ERR_NO_UPDATE_CAMPAIGN_NOT_IN_CANCELED_PENDING',
    description: 'Campanha não está cancelada ou pendente.',
    detail: 'Somente campanhas nos status mencionados podem ser alteradas.'
  },
  {
    error: 'ERROR_CAMPAIGN_DATE_NOT_VALID',
    description: 'Data para programação inválida.',
    detail: 'A data precisa ser maior que a data atual.'
  },
  {
    error: 'ERR_NO_CAMPAIGN_CONTACTS_NOT_FOUND',
    description: 'A campanha não existe.',
    detail: 'A campanha não localizada. Atualize a página.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS_NOT_EXISTS',
    description: 'Campanha não existe. Contatos não vínculados.',
    detail: 'Possívelmente a campanha já foi apagada e não existem contatos vínculados. Atualize a pagína.'
  },
  {
    error: 'ERR_CAMPAIGN_CONTACTS',
    description: 'Probleme com a campanha.',
    detail: 'Atualize a página e tente novamente.'
  },
  {
    error: 'ERR_NO_FAST_REPLY_FOUND',
    description: 'Resposta rápida não localizada.',
    detail: 'Verifique se o registro realmente existe. Atualize a página e tente novamente.'
  },
  {
    error: 'ERR_FAST_REPLY_EXISTS',
    description: 'Resposta rápida não existe.',
    detail: 'Possívelmente o registro já foi deletado. Atualize a página.'
  },
  {
    error: 'ERR_NO_QUEUE_FOUND',
    description: 'Fila não localizada.',
    detail: 'Possívelmente o registro já foi deletado. Atualize a página.'
  },
  {
    error: 'ERR_QUEUE_TICKET_EXISTS',
    description: 'Fila possui atendimentos vinculados. ',
    detail: 'Não é possível apagar o registro para manter a integridade das informações.'
  },
  {
    error: 'ERR_NO_TAG_FOUND',
    description: 'Etiqueta não localizada.',
    detail: 'Possívelmente o registro já foi deletado. Atualize a página.'
  },
  {
    error: 'ERR_TAG_CONTACTS_EXISTS',
    description: 'Etiqueta possui contatos vinculados. ',
    detail: 'Não é possível apagar o registro para manter a integridade das informações.'
  },
  {
    error: 'ERR_NO_SETTING_FOUND',
    description: 'Configuração não existe.',
    detail: 'Atualize a pagína e tente novamente. Consulte o suporte caso o erro persista.'
  },
  {
    error: 'ERR_NO_TENANT_FOUND',
    description: 'Não localizamos empresa cadastrada ou ativa.',
    detail: 'Atualize a pagína e tente novamente. Consulte o suporte caso o erro persista.'
  },
  {
    error: 'ERR_CREATING_TICKET',
    description: 'Não foi possível criar o atendimento.',
    detail: 'Atualize a pagína e tente novamente. Consulte o suporte caso o erro persista.'
  },
  {
    error: 'ERR_NO_STATUS_SELECTED',
    description: 'Nenhum status selecionado.',
    detail: 'É necessário selecionar status para listar o atendimentos.'
  },
  {
    error: 'ERR_INVALID_CREDENTIALS',
    description: 'Usuário e/ou senha inválidos.',
    detail: 'Os dados de login são inválidos. Caso o problmea persista, procure um administrador do sistema para redefinição das crendenciais.'
  },
  {
    error: 'ERR_NO_USER_FOUND',
    description: 'Usuário não localizado.',
    detail: 'Verifique se o usuário realmente existe. Atualize a página se necessário.'
  },
  {
    error: 'ERR_WAPP_INVALID_CONTACT',
    description: 'Número informado no contato é inválido',
    detail: 'O número não é um contato vinculdo à uma conta do Whatsapp.'
  },
  {
    error: 'ERR_WAPP_CHECK_CONTACT',
    description: 'Ocorreu um erro ao válidar o contato pelo whatsapp.',
    detail: 'Verifique se a conexão com o whatsapp está ativa. Se necessário, atualize a página e tente novamente em alguns instantes.'
  },
  {
    error: 'ERR_DELETE_WAPP_MSG',
    description: 'O Whatsapp não permitiu apagar a mensagem.',
    detail: 'Não é possível apagar mensagens antigas. Se a mensagem for das últimas 24h, verifique se a conexão com o whatsapp está ativa. Se necessário, atualize a página e tente novamente em alguns instantes.'
  },
  {
    error: 'ERR_SENDING_WAPP_MSG',
    description: 'Mensagem não enviada pelo Whatsapp.',
    detail: 'Verifique se a conexão com o whatsapp está ativa. Se necessário, atualize a página e tente novamente em alguns instantes.'
  },
  {
    error: 'ERR_WAPP_NOT_INITIALIZED',
    description: 'Sessão com o Whatsapp não inicializada',
    detail: 'Verifique o status da conexão com o whatsapp do sistema. Necessário que a conexão seja estabelecida com sucesso.'
  },
  {
    error: 'ERR_CONTACTS_NOT_EXISTS_WHATSAPP',
    description: 'Contato não existe no Whatsapp.',
    detail: 'O número não é um contato válido para o Whatsapp.'
  },
  {
    error: 'ERR_NO_WAPP_FOUND',
    description: 'Sessão não localizada.',
    detail: 'Verifique se o registro realmente existe. Se necessário, atualize a página.'
  },
  {
    error: 'ERR_OTHER_OPEN_TICKET',
    description: 'Já existe um atendimento aberto para o contato.',
    detail: 'Localize o contato na lista de atendimentos.'
  },
  {
    error: 'ERR_NO_DEF_WAPP_FOUND',
    description: 'Não existe uma conexão marcado com "PADRÃO".',
    detail: 'Necessário realizar a definição no menu de sessões.'
  },
  {
    error: 'ERR_FETCH_WAPP_MSG',
    description: 'Não foi possível localizar mensagens.',
    detail: 'Valide o status de conexão com o whatsapp.'
  },
  {
    error: 'ERROR_USER_MESSAGES_NOT_EXISTS',
    description: 'Não foi possivel apagar Usuário.',
    detail: 'Usuários que possuem conversas não são possiveis de apagar.'
  },
  {
    error: 'ERR_NO_PERMISSION',
    description: 'Usuário sem permissão.',
    detail: 'Seu usuário não possui permissão para executar a ação.'
  }

]

export default errors
