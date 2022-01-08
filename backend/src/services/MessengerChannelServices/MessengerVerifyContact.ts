import { MessengerClient } from "messaging-api-messenger";
import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import { EventSender } from "./MessengerTypes";

// _profilePicExpired(user: { profilePic: string }): boolean {
//   try {
//     // Facebook CDN returns expiration time in the key `ext` in URL params like:
//     // https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=11111111111111&width=1024&ext=1543379908&hash=xxxxxxxxxxxx
//     const ext = new URL(user.profilePic).searchParams.get('ext');

//     if (!ext) return true;

//     const timestamp = +ext * 1000;
//     const expireTime = new Date(timestamp);
//     return !(isValid(expireTime) && isAfter(expireTime, new Date()));
//   } catch (e) {
//     return true;
//   }
// }

const MessengerVerifyContact = async (
  contact: EventSender,
  messagerBot: MessengerClient,
  tenantId: string | number
): Promise<Contact> => {
  const senderUser: any = await messagerBot.getPersona(contact.id);

  const profilePicUrl =
    senderUser?.profilePictureUrl || senderUser?.profilePic || undefined;

  const contactName =
    senderUser.name || `${senderUser.firstName} ${senderUser.lastName}` || "";
  const contactData = {
    name: contactName,
    number: senderUser.id,
    messengerId: senderUser.id,
    profilePicUrl,
    tenantId,
    pushname: contactName,
    isUser: false,
    isWAContact: true,
    isGroup: false,
    origem: "messenger"
  };

  const newContact = await CreateOrUpdateContactService(contactData);

  return newContact;
};

export default MessengerVerifyContact;
