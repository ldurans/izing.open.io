import { Context } from "telegraf/typings/context";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

const VerifyContact = async (
  ctx: Context,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;
  const chatInfo: any = await ctx.getChat();
  try {
    profilePicUrl = chatInfo.photo?.small_file_id
      ? await ctx.telegram.getFileLink(chatInfo.photo?.small_file_id)
      : undefined;
  } catch (error) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name:
      `${chatInfo.first_name} ${chatInfo.last_name}` || chatInfo.username || "",
    number: chatInfo.id,
    profilePicUrl: profilePicUrl ? String(profilePicUrl) : undefined,
    tenantId,
    pushname: chatInfo.username || "",
    isUser: true,
    isWAContact: false,
    isGroup: false,
    origem: "telegram",
    telegramId: chatInfo.id
  };

  const contact = await CreateOrUpdateContactService(contactData);
  return contact;
};

export default VerifyContact;
