const IsContactTest = async (
  celularContato: string | undefined,
  celularTeste: string
  // channel: undefined | string
): Promise<boolean> => {
  // const celularContato = ticket.contact.number;
  // Verificar se rotina em teste
  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    // if (ticket.channel !== "telegram") {
    // eslint-disable-next-line no-throw-literal
    return false;
    // }
  }
  // if (channel && ["telegram", "instagram"].includes(channel)) return false;
  return true;
};

export default IsContactTest;
