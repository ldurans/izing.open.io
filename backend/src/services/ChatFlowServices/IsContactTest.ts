const IsContactTest = async (
  celularContato: string | undefined,
  celularTeste: string,
  channel: undefined | string
): Promise<boolean> => {
  // Verificar se rotina em teste e contato informado é compatível
  if (channel !== "whatsapp") return false;
  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    return true;
  }
  return false;
};

export default IsContactTest;
