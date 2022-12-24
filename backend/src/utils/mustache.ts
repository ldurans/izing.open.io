import Mustache from "mustache";
import Ticket from "../models/Ticket";

const getGreeting = (): string => {
  const hh = new Date().getHours();
  let greeting = "";

  if (hh >= 6 && hh <= 11) {
    greeting = "Bom dia";
  } else if (hh > 11 && hh <= 17) {
    greeting = "Boa tarde";
  } else if (hh > 17 && hh <= 23) {
    greeting = "Boa noite";
  } else {
    greeting = "Boa madrugada";
  }

  return greeting;
};

export const generateMessage = (body: string, ticket: Ticket): string => {
  const view = {
    nomecontato: ticket ? ticket.contact.name : "",
    nomeatendente: ticket ? ticket?.user?.name : "",
    atendimentonumero: ticket ? ticket.id : "",
    saudacao: getGreeting()
  };
  return Mustache.render(body, view);
};
