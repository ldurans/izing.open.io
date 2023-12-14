import * as Yup from "yup";
import { Request, Response } from "express";
import { head } from "lodash";
import XLSX from "xlsx";
import path from "path";
import { v4 as uuidV4 } from "uuid";
import fs from "fs";
import ListContactsService from "../services/ContactServices/ListContactsService";
import CreateContactService from "../services/ContactServices/CreateContactService";
import ShowContactService from "../services/ContactServices/ShowContactService";
import UpdateContactService from "../services/ContactServices/UpdateContactService";
import DeleteContactService from "../services/ContactServices/DeleteContactService";
import UpdateContactTagsService from "../services/ContactServices/UpdateContactTagsService";

import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import AppError from "../errors/AppError";
import UpdateContactWalletsService from "../services/ContactServices/UpdateContactWalletsService";
import SyncContactsWhatsappInstanceService from "../services/WbotServices/SyncContactsWhatsappInstanceService";
import Whatsapp from "../models/Whatsapp";
import { ImportFileContactsService } from "../services/WbotServices/ImportFileContactsService";
import Contact from "../models/Contact";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
};

interface ExtraInfo {
  name: string;
  value: string;
}
interface ContactData {
  name: string;
  number: string;
  email?: string;
  extraInfo?: ExtraInfo[];
  wallets?: null | number[] | string[];
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, id: userId, profile } = req.user;
  const { searchParam, pageNumber } = req.query as IndexQuery;

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    tenantId,
    profile,
    userId
  });

  return res.json({ contacts, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const newContact: ContactData = req.body;
  newContact.number = newContact.number.replace("-", "").replace(" ", "");

  const schema = Yup.object().shape({
    name: Yup.string().required(),
    number: Yup.string()
      .required()
      .matches(/^\d+$/, "Invalid number format. Only numbers is allowed.")
  });

  try {
    await schema.validate(newContact);
  } catch (err) {
    throw new AppError(err.message);
  }

  const waNumber = await CheckIsValidContact(newContact.number, tenantId);

  const profilePicUrl = await GetProfilePicUrl(newContact.number, tenantId);

  const contact = await CreateContactService({
    ...newContact,
    number: waNumber.user,
    profilePicUrl,
    tenantId
  });

  return res.status(200).json(contact);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { contactId } = req.params;
  const { tenantId } = req.user;

  const contact = await ShowContactService({ id: contactId, tenantId });

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const contactData: ContactData = req.body;
  const { tenantId } = req.user;

  const schema = Yup.object().shape({
    name: Yup.string(),
    number: Yup.string().matches(
      /^\d+$/,
      "Invalid number format. Only numbers is allowed."
    )
  });

  try {
    await schema.validate(contactData);
  } catch (err) {
    throw new AppError(err.message);
  }

  const waNumber = await CheckIsValidContact(contactData.number, tenantId);

  contactData.number = waNumber.user;

  const { contactId } = req.params;

  const contact = await UpdateContactService({
    contactData,
    contactId,
    tenantId
  });

  return res.status(200).json(contact);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { contactId } = req.params;
  const { tenantId } = req.user;

  await DeleteContactService({ id: contactId, tenantId });

  return res.status(200).json({ message: "Contact deleted" });
};

export const updateContactTags = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tags } = req.body;
  const { contactId } = req.params;
  const { tenantId } = req.user;

  const contact = await UpdateContactTagsService({
    tags,
    contactId,
    tenantId
  });

  return res.status(200).json(contact);
};

export const updateContactWallet = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { wallets } = req.body;
  const { contactId } = req.params;
  const { tenantId } = req.user;

  const contact = await UpdateContactWalletsService({
    wallets,
    contactId,
    tenantId
  });

  return res.status(200).json(contact);
};

export const syncContacts = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { tenantId } = req.user;
  const sessoes = await Whatsapp.findAll({
    where: {
      tenantId,
      status: "CONNECTED",
      type: "whatsapp"
    }
  });

  if (!sessoes.length) {
    throw new AppError(
      "Não existem sessões ativas para sincronização dos contatos."
    );
  }

  await Promise.all(
    sessoes.map(async s => {
      if (s.id) {
        if (s.id) {
          await SyncContactsWhatsappInstanceService(s.id, +tenantId);
        }
      }
    })
  );

  return res
    .status(200)
    .json({ message: "Contatos estão sendo sincronizados." });
};

export const upload = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const file: Express.Multer.File = head(files) as Express.Multer.File;
  const { tenantId } = req.user;
  let { tags, wallets } = req.body;

  if (tags) {
    tags = tags.split(",");
  }

  if (wallets) {
    wallets = wallets.split();
  }

  const response = await ImportFileContactsService(
    +tenantId,
    file,
    tags,
    wallets
  );

  // const io = getIO();

  // io.emit(`company-${companyId}-contact`, {
  //   action: "reload",
  //   records: response
  // });

  return res.status(200).json(response);
};

export const exportContacts = async (req: Request, res: Response) => {
  const { tenantId } = req.user;

  const contacts = await Contact.findAll({
    where: { tenantId },
    attributes: ["id", "name", "number", "email"],
    order: [["name", "ASC"]],
    raw: true
  });

  // Cria um novo workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(contacts);

  // Adiciona o worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Contatos");

  // Gera o arquivo Excel no formato .xlsx
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "buffer"
  });

  // Define o nome do arquivo
  const fileName = `${uuidV4()}_contatos.xlsx`;
  const filePath = path.join(__dirname, "..", "..", "public", "downloads");
  const file = path.join(filePath, fileName);

  // Cria os diretórios de downloads se eles não existirem
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(filePath, { recursive: true });
  }

  // Salva o arquivo no diretório de downloads
  fs.writeFile(file, excelBuffer, err => {
    if (err) {
      console.error("Erro ao salvar arquivo:", err);
      return res.status(500).send("Erro ao exportar contatos");
    }
    const { BACKEND_URL } = process.env;
    const downloadLink = `${BACKEND_URL}:${process.env.PROXY_PORT}/public/downloads/${fileName}`;

    res.send({ downloadLink });
  });
};
