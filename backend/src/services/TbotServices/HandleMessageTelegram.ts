import { Context, Types, Telegraf } from "telegraf";

interface Session extends Telegraf {
  id?: number;
}

const getMediaInfo = (msg: any) => {
  // eslint-disable-next-line prettier/prettier
  const mediaType = msg.photo ? "image" : msg.video ? "video" : msg.audio ? "audio" : msg.voice ? "voice" : msg.sticker && !msg.sticker.is_animated ? "sticker" : "document";
  const mediaObj = msg[mediaType];
  // eslint-disable-next-line prettier/prettier
  const [type, mimeType, SAD, fileName, fileId, caption, SAV] = [mediaType, mediaObj.mime_type ? mediaObj.mime_type : "", false, null, mediaObj.file_id ? mediaObj.file_id : mediaObj[0].file_id, msg.caption ? msg.caption : "", mediaType == "voice"];
  switch (mediaType) {
    case "image":
      return {
        type,
        mimeType: "image/png",
        SAD,
        fileName,
        fileId,
        caption,
        SAV
      };
      break;
    case "video":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "audio":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "voice":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "sticker":
      return {
        type,
        mimeType: "image/webp",
        SAD,
        fileName,
        fileId,
        caption,
        SAV,
        SAS: true
      };
      break;
    default:
      return {
        type,
        mimeType,
        SAD: true,
        fileName: mediaObj.file_name ? mediaObj.file_name : null,
        fileId,
        caption,
        SAV
      };
      break;
  }
};

const HandleMessage = async (ctx: Context, tbot: Session): Promise<void> => {
  console.log("tbot", tbot);
  const { message } = ctx;
  const chat = message?.chat;
  const me = await ctx.telegram.getMe();
  const chatInfo = await ctx.getChat();
  const fromMe = me.id === ctx.message?.from.id;
  console.log("me", me, fromMe, chatInfo);
  if (!message?.text && chat?.id) {
    const mediaInfo = await getMediaInfo(ctx.message);
    const fileInfo = await ctx.telegram.getFile(mediaInfo.fileId);
    console.log("fileInfo", fileInfo);
    console.log("mediaInfo", mediaInfo);
  }
  // const unreadMessages = fromMe ? 0 : chat.unreadCount;

  // console.log("ctx", Context);
};

export default HandleMessage;
