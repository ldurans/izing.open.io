import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";

interface TagData {
  tag: string;
  color: string;
  isActive: boolean;
  userId: number;
  tenantId: number | string;
}

interface Request {
  tagData: TagData;
  tagId: string;
}

const UpdateTagService = async ({ tagData, tagId }: Request): Promise<Tag> => {
  const { tag, color, isActive, userId, tenantId } = tagData;

  const tagModel = await Tag.findOne({
    where: { id: tagId, tenantId },
    attributes: ["id", "tag", "color", "isActive", "userId"]
  });

  if (!tagModel) {
    throw new AppError("ERR_NO_TAG_FOUND", 404);
  }

  await tagModel.update({
    tag,
    color,
    isActive,
    userId
  });

  await tagModel.reload({
    attributes: ["id", "tag", "color", "isActive", "userId"]
  });

  return tagModel;
};

export default UpdateTagService;
