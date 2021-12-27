/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
interface WabaMessageText {
  text: {
    body: string;
  };
}

interface messageId {
  id: string;
}

interface WabaResponse {
  messages: messageId[];

}

interface WabaMessageDocument {
  caption?: string;
  filename?: string;
  id?: string;
  mime_type?: string;
  sha256?: string;
}

interface WabaMessageMedia {
  id?: string;
  caption?: string;
  mime_type?: string;
  sha256?: string;
}

interface WabaMessage {
  id?: string;
  fromMe?: boolean;
  // eslint-disable-next-line camelcase
  recipient_type: "individual" | "group";
  to: string;
  type:
  | "text"
  | "voice"
  | "template"
  | "image"
  | "video"
  | "audio"
  | "document";
  text?: {
    body: string;
  };
  video?: WabaMessageMedia;
  image?: WabaMessageMedia;
  document?: WabaMessageDocument;
  audio?: WabaMessageMedia;
  voice?: WabaMessageMedia;
  timestamp: string;
}

interface WabaContact {
  profile: {
    name: string;
  };
  // eslint-disable-next-line camelcase
  wa_id: string;
}

interface WabaContext {
  messages: WabaMessage[];
  contacts: WabaContact[];
}
