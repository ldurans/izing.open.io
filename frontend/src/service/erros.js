const backendErrors = {
  ERR_NO_DEF_WAPP_FOUND:
    'Nenhum WhatsApp padrão encontrado. Verifique a página de conexões.',
  ERR_WAPP_NOT_INITIALIZED:
    'Esta sessão do WhatsApp não foi inicializada. Verifique a página de conexões.',
  ERR_WAPP_INITIALIZED:
    'Não está conectado com o Whatsapp. Estamos reiniciando a conexão. Tente novamente em alguns segundos.',
  ERR_WAPP_CHECK_CONTACT:
    'Não foi possível verificar o contato do WhatsApp. Verifique a página de conexões',
  ERR_WAPP_INVALID_CONTACT: 'Este não é um número de Whatsapp válido.',
  ERR_WAPP_DOWNLOAD_MEDIA:
    'Não foi possível baixar mídia do WhatsApp. Verifique a página de conexões.',
  ERR_INVALID_CREDENTIALS:
    'Erro de autenticação. Por favor, tente novamente.',
  ERR_SENDING_WAPP_MSG:
    'Erro ao enviar mensagem do WhatsApp. Verifique a página de conexões.',
  ERR_DELETE_WAPP_MSG: 'Não foi possível excluir a mensagem do WhatsApp.',
  ERR_OTHER_OPEN_TICKET: 'Já existe um Ticket aberto para este contato.',
  ERR_SESSION_EXPIRED: 'Sessão expirada. Por favor entre.',
  ERR_USER_CREATION_DISABLED:
    'A criação do usuário foi desabilitada pelo administrador.',
  ERR_NO_PERMISSION: 'Você não tem permissão para acessar este recurso.',
  ERR_DUPLICATED_CONTACT: 'Já existe um contato com este número.',
  ERR_NO_SETTING_FOUND: 'Nenhuma configuração encontrada com este ID.',
  ERR_NO_CONTACT_FOUND: 'Nenhum contato encontrado com este ID.',
  ERR_NO_TICKET_FOUND: 'Nenhum Ticket encontrado com este ID.',
  ERR_NO_USER_FOUND: 'Nenhum usuário encontrado com este ID.',
  ERR_NO_WAPP_FOUND: 'Nenhum WhatsApp encontrado com este ID.',
  ERR_CREATING_MESSAGE: 'Erro ao criar mensagem no banco de dados.',
  ERR_CREATING_TICKET: 'Erro ao criar Ticket no banco de dados.',
  ERR_FETCH_WAPP_MSG:
    'Erro ao buscar a mensagem no WhtasApp, talvez ela seja muito antiga.'
}

export default backendErrors
