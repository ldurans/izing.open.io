import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactWallet from "../../models/ContactWallet";

interface Request {
  wallets: number[] | string[];
  contactId: string;
  tenantId: string | number;
}

interface Wallet {
  walletId: number | string;
  contactId: number | string;
  tenantId: number | string;
}

const UpdateContactWalletsService = async ({
  wallets,
  contactId,
  tenantId
}: Request): Promise<Contact> => {
  await ContactWallet.destroy({
    where: {
      tenantId,
      contactId
    }
  });

  const contactWallets: Wallet[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  wallets.forEach((wallet: any) => {
    contactWallets.push({
      walletId: !wallet.id ? wallet : wallet.id,
      contactId,
      tenantId
    });
  });

  await ContactWallet.bulkCreate(contactWallets);

  const contact = await Contact.findOne({
    where: { id: contactId, tenantId },
    attributes: ["id", "name", "number", "email", "profilePicUrl"],
    include: [
      "extraInfo",
      "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default UpdateContactWalletsService;
