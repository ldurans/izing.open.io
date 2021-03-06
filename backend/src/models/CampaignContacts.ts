import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  CreatedAt,
  UpdatedAt,
  Default,
  DataType,
  AllowNull
} from "sequelize-typescript";
import Campaign from "./Campaign";
import Contact from "./Contact";
import Message from "./Message";

@Table
class CampaignContacts extends Model<CampaignContacts> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Default(0)
  @Column
  ack: number;

  @Column(DataType.TEXT)
  body: string;

  @Column
  messageRandom: string;

  @AllowNull
  @Default(null)
  @Column
  mediaName: string;

  @Default(null)
  @AllowNull
  @Column(DataType.INTEGER)
  timestamp: number;

  @ForeignKey(() => Message)
  @Column
  messageId: string;

  @BelongsTo(() => Message, "messageId")
  message: Message;

  @ForeignKey(() => Campaign)
  @Column
  campaignId: string;

  @BelongsTo(() => Campaign, "campaignId")
  campaign: Campaign;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact, "contactId")
  contact: Contact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default CampaignContacts;
