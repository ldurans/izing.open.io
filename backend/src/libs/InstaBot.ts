/* eslint-disable camelcase */
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user,
  IgApiClient
  // IgLoginTwoFactorRequiredError
} from "instagram-private-api";
import { IgApiClientMQTT, withFbnsAndRealtime } from "instagram_mqtt";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
// import { getIO } from "./socket";
import { logger } from "../utils/logger";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
  | AccountRepositoryLoginResponseLogged_in_user
  | AccountRepositoryCurrentUserResponseUser;
}

const sessions: Session[] = [];

export const initInstaBot = async (connection: Whatsapp): Promise<Session> => {
  try {
    // const io = getIO();
    let sessionCfg;
    let loggedUser;
    // const { tenantId } = connection;
    const username = `@${connection.instagramUser}`;
    const password = connection.instagramKey;
    // const password = "";
    if (!username || !password) {
      throw new Error("Not credentials");
    }

    if (connection && connection.session) {
      sessionCfg = JSON.parse(connection.session);
    }

    // se não funcionar, necessário adequar o "as"
    const ig = withFbnsAndRealtime(new IgApiClient()) as Session;
    ig.id = connection.id;

    ig.state.generateDevice(username);

    if (connection.session) {
      const { accountLogin } = ig;
      await ig.importState(JSON.parse(connection.session));
      ig.accountLogin = accountLogin;
    } else {
      // await ig.simulate.preLoginFlow();
      loggedUser = await ig.account.login(username, password);
      ig.accountLogin = loggedUser;
      process.nextTick(async () => {
        await ig.simulate.postLoginFlow();
      });
      sessionCfg = await ig.exportState();
      await connection.update({
        session: sessionCfg
      });
    }

    await ig.realtime.connect({
      irisData: await ig.feed.directInbox().request()
    });
    // PartialObserver<FbnsNotificationUnknown>
    // ig.fbns.push$.subscribe((data: any) => {

    await ig.fbns.connect({
      autoReconnect: true
    });

    const sessionIndex = sessions.findIndex(s => s.id === connection.id);
    if (sessionIndex === -1) {
      ig.id = connection.id;
      if (!ig.accountLogin) {
        ig.accountLogin = await ig.account.currentUser();
      }
      sessions.push(ig);
    } else {
      ig.id = connection.id;
      if (!ig.accountLogin) {
        ig.accountLogin = await ig.account.currentUser();
      }
      sessions[sessionIndex] = ig;
    }

    return ig;
  } catch (err) {
    logger.error(`initWbot error | Error: ${err}`);
    throw new AppError(`${err}`, 404);
    // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.'
  }
};

export const getInstaBot = (channelId: number): Session => {
  // logger.info(`channelId: ${ channelId } | checkState: ${ checkState }`);
  const sessionIndex = sessions.findIndex(s => s.id === channelId);

  return sessions[sessionIndex];
};

export const removeInstaBot = (connection: Whatsapp): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === connection.id);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].account.logout();
      sessions[sessionIndex].realtime.disconnect();
      sessions[sessionIndex].fbns.disconnect();
      sessions.splice(sessionIndex, 1);
    }
    connection.update({
      session: ""
    });
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`);
  }
};
