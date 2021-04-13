import Tag from "../../models/Tag";
import AppError from "../../errors/AppError";

interface Request {
  id: string;
  tenantId: number | string;
}

const DeleteTagService = async ({ id, tenantId }: Request): Promise<void> => {
  const tag = await Tag.findOne({
    where: { id, tenantId }
  });

  if (!tag) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }
  try {
    await tag.destroy();
  } catch (error) {
    throw new AppError("ERR_TAG_CONTACTS_EXISTS", 404);
  }
};

export default DeleteTagService;
