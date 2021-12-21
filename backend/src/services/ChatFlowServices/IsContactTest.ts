const IsContactTest = async (
  celularContato: string | undefined,
  celularTeste: string
  // channel: undefined | string
): Promise<boolean> => {
  // Verificar se rotina em teste e contato informado é compatível
  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    // if (ticket.channel !== "telegram") {
    return true;
    // }
  }
  // if (channel && ["telegram", "instagram"].includes(channel)) return false;
  return false;
};

export default IsContactTest;
