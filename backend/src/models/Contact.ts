import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  HasMany,
  BeforeCreate
} from "sequelize-typescript";
import GetProfilePicUrl from "../services/WbotServices/GetProfilePicUrl";
import ContactCustomField from "./ContactCustomField";
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
  @Unique
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Column
  profilePicUrl: string;

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

  @BeforeCreate
  static async getProfilePicUrl(instance: Contact): Promise<void> {
    const profilePicUrl = await GetProfilePicUrl(instance.number);
    console.log("BeforeCreate - profilePicUrl", profilePicUrl);
    instance.profilePicUrl = profilePicUrl;
  }
}

export default Contact;
