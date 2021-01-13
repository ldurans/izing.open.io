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
  BelongsTo
} from "sequelize-typescript";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import ContactCustomField from "./ContactCustomField";
import Tenant from "./Tenant";
import Ticket from "./Ticket";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @AllowNull(false)
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Column
  profilePicUrl: string;

  @AllowNull(true)
  @Default(null)
  @Column
  pushname: string;

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

export default Contact;
