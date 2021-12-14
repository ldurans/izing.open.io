import { DirectThreadFeedResponse } from "instagram-private-api";
import { IgApiClientMQTT } from "instagram_mqtt";
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

interface Session extends IgApiClientMQTT {
  id?: number;
}

const InstagramVerifyContact = async (
  threadData: DirectThreadFeedResponse,
  instaBot: Session,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;
  let user;
  try {
    user = threadData.thread?.users[0];
    profilePicUrl = user.profile_pic_url;
  } catch (error) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name: user?.full_name || user.username || "",
    number: "",
    profilePicUrl: profilePicUrl ? String(profilePicUrl) : undefined,
    tenantId,
    pushname: user.username || "",
    isUser: true,
    isWAContact: false,
    isGroup: false,
    origem: "instagram",
    instagramPK: user.pk
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

export default InstagramVerifyContact;
