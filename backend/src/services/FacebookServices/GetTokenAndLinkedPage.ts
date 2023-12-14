/* eslint-disable camelcase */
// import AppError from "../../errors/AppError";
import axios from "axios";
import AppError from "../../errors/AppError";
import Whatsapp from "../../models/Whatsapp";
import SetLogoutLinkedPage from "./SetLogoutLinkedPage";
import { getIO } from "../../libs/socket";

interface Request {
  whatsapp: Whatsapp;
  accountId: string;
  userToken: string;
  tenantId: number | string;
}

const api_version = "v16.0";
const baseUrl = `https://graph.facebook.com/${api_version}`;
const app_id = process.env.VUE_FACEBOOK_APP_ID;
const app_secret = process.env.FACEBOOK_APP_SECRET_KEY;

const getLongLivedAccessToken = async (short_lived_token: string) => {
  const { data } = await axios.get(
    `${baseUrl}/oauth/access_token?grant_type=fb_exchange_token&client_id=${app_id}&client_secret=${app_secret}&fb_exchange_token=${short_lived_token}`
  );
  return data.access_token;
};

const getPermanentPageAccessToken = async (
  long_lived_access_token: string,
  account_id: string
) => {
  const {
    data: { data }
  } = await axios.get(
    `${baseUrl}/${account_id}/accounts?access_token=${long_lived_access_token}`
  );
  // const page_item = data.find((item: any) => item.name === page_name);
  return data.length && data[0]; // page_item.access_token;
};

const getPageInfo = async (accountId: string, userToken: string) => {
  const urlPageInfo = `${baseUrl}/${accountId}/accounts?limit=25&access_token=${userToken}`;

  // pegar informações das páginas
  const {
    data: { data }
  } = await axios({
    method: "GET",
    url: urlPageInfo
  });

  return data;
};

const GetTokenAndLinkedPage = async ({
  whatsapp,
  accountId,
  userToken,
  tenantId
}: Request): Promise<void> => {
  try {
    const io = getIO();

    const pages = await getPageInfo(accountId, userToken);

    if (pages.length > 1) {
      throw new AppError(
        "Escolha apenas 1 página. Refaça o processo e selecione apenas 1 página.",
        400
      );
    }

    // caso não existam pages vinculadas, limpar dados do FB.
    if (pages.length === 0) {
      await SetLogoutLinkedPage({ whatsapp, tenantId });
      return;
    }

    // gerar token página
    const long_lived_access_token = await getLongLivedAccessToken(userToken);
    const permanent_page_access_token = await getPermanentPageAccessToken(
      long_lived_access_token,
      accountId
    );

    const dataUpdated = {
      status: "CONNECTED",
      fbPageId: permanent_page_access_token.id,
      fbObject: {
        ...permanent_page_access_token,
        accountId,
        long_lived_access_token
      },
      tokenAPI: permanent_page_access_token.access_token
    };

    // vincular a pagina ao channel e salvar o objeto do facebook
    Whatsapp.update(dataUpdated, { where: { id: whatsapp.id, tenantId } });

    io.emit(`${tenantId}:whatsappSession`, {
      action: "update",
      session: { ...whatsapp, ...dataUpdated }
    });
  } catch (error) {
    console.error("GetTokenAndLinkedPage", error);
    throw new AppError(error, 400);
  }
};

export default GetTokenAndLinkedPage;
