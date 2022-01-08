import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Default,
  HasMany,
  BeforeCreate,
  ForeignKey,
  BelongsTo,
  BelongsToMany
} from "sequelize-typescript";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import Campaign from "./Campaign";
import CampaignContacts from "./CampaignContacts";
import ContactCustomField from "./ContactCustomField";
import ContactTag from "./ContactTag";
import ContactWallet from "./ContactWallet";
// import Message from "./Message";
import Tags from "./Tag";
import Tenant from "./Tenant";
import Ticket from "./Ticket";
import User from "./User";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(true)
  @Column
  number: string;

  @AllowNull(true)
  @Default(null)
  @Column
  email: string;

  @Column
  profilePicUrl: string;

  @AllowNull(true)
  @Default(null)
  @Column
  pushname: string;

  @AllowNull(true)
  @Default(null)
  @Column
  telegramId: string;

  @AllowNull(true)
  @Default(null)
  @Column
  messengerId: string;

  @AllowNull(true)
  @Default(null)
  @Column
  instagramPK: number;

  @Default(false)
  @Column
  isUser: boolean;

  @Default(false)
  @Column
  isWAContact: boolean;

  @Default(false)
  @Column
  isGroup: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  // @HasMany(() => ContactTag)
  // tags: ContactTag[];

  @BelongsToMany(() => Tags, () => ContactTag, "contactId", "tagId")
  tags: Tags[];

  @BelongsToMany(() => User, () => ContactWallet, "contactId", "walletId")
  wallets: ContactWallet[];

  @HasMany(() => CampaignContacts)
  campaignContacts: CampaignContacts[];

  @BelongsToMany(
    () => Campaign,
    () => CampaignContacts,
    "contactId",
    "campaignId"
  )
  campaign: Campaign[];

  @ForeignKey(() => Tenant)
  @Column
  tenantId: number;

  @BelongsTo(() => Tenant)
  tenant: Tenant;

  @BeforeCreate
  static async getProfilePicUrl(instance: Contact): Promise<void> {
    const profilePicUrl = await GetProfilePicUrl(
      instance.number,
      instance.tenantId
    );
    instance.profilePicUrl = profilePicUrl;
  }
}

// Contact.sequelize?.define("Contact", {
//   scheduledMessages: {
//     type: DataTypes.VIRTUAL,
//     async get() {
//       const contactId = 4077;
//       const messages = await Message.findAll({
//         where: {
//           contactId,
//           scheduleDate: { [Op.not]: null },
//           status: "pending"
//         },
//         logging: console.log
//       });
//       return messages;
//     }
//   }
// });

export default Contact;
