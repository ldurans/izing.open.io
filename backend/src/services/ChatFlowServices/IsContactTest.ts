const IsContactTest = async (
  celularContato: string | undefined,
  celularTeste: string
): Promise<boolean> => {
  // const celularContato = ticket.contact.number;
  // Verificar se rotina em teste
  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    // if (ticket.channel !== "telegram") {
    // eslint-disable-next-line no-throw-literal
    return true;
    // }
  }
  return false;
};

export default IsContactTest;
