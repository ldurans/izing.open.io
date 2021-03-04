import {
  Table,
  Column,
  Model,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AutoIncrement,
  CreatedAt,
  UpdatedAt
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

  @Column
  messageRandom: string;

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
