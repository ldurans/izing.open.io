import { Sequelize } from "sequelize-typescript";
import User from "../models/User";
import Setting from "../models/Setting";
import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Whatsapp from "../models/Whatsapp";
import ContactCustomField from "../models/ContactCustomField";
import Message from "../models/Message";
import MessageOffLine from "../models/MessageOffLine";
import AutoReply from "../models/AutoReply";
import StepsReply from "../models/StepsReply";
import StepsReplyAction from "../models/StepsReplyAction";
import Queue from "../models/Queue";
import UsersQueues from "../models/UsersQueues";
import Tenant from "../models/Tenant";
import AutoReplyLogs from "../models/AutoReplyLogs";
import UserMessagesLog from "../models/UserMessagesLog";
import FastReply from "../models/FastReply";
import Tag from "../models/Tag";
import ContactTag from "../models/ContactTag";
import Campaign from "../models/Campaign";
import CampaignContacts from "../models/CampaignContacts";
import ApiConfig from "../models/ApiConfig";

// eslint-disable-next-line
const dbConfig = require("../config/database");
// import dbConfig from "../config/database";

const sequelize = new Sequelize(dbConfig);

const models = [
  User,
  Contact,
  Ticket,
  Message,
  MessageOffLine,
  Whatsapp,
  ContactCustomField,
  Setting,
  AutoReply,
  StepsReply,
  StepsReplyAction,
  Queue,
  UsersQueues,
  Tenant,
  AutoReplyLogs,
  UserMessagesLog,
  FastReply,
  Tag,
  ContactTag,
  Campaign,
  CampaignContacts,
  ApiConfig
];

sequelize.addModels(models);

export default sequelize;
