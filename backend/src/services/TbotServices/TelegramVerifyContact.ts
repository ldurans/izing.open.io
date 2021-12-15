import { Context } from "telegraf/typings/context";
import { Chat, ChatFromGetChat } from "telegraf/typings/core/types/typegram";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

// var getUserProfilePhotos = async (ctx: Context, photo) => {
//   const profile = await ctx.telegram.getUserProfilePhotos(ctx.chat?.id);
//   if (!profile || profile.total_count == 0)
//   ctx.telegram.getFileLink()
//     return ctx.reply(${ first_name(ctx) } ${ last_name(ctx) } \n\n${ messagewelcome(ctx) }, {
//       parse_mode: 'HTML',
//       reply_markup: {
//         inline_keyboard: inKey
//       }
//     })
//   ctx.replyWithPhoto(profile.photos[0][0].file_id, { caption: ${ first_name(ctx) } ${ last_name(ctx) } \n\n${ messagewelcome(ctx) },
//     parse_mode: 'HTML',
//     reply_markup: {
//     inline_keyboard: inKey
//   }
//                       })
// }

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
    number: "",
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
