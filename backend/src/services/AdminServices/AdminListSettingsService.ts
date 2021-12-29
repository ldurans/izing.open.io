import Setting from "../../models/Setting";

const AdminListSettingsService = async (
  tenantId?: number | string
): Promise<Setting[] | undefined> => {
  const whereCondition: any = {};
  if (tenantId) {
    whereCondition.tenantId = tenantId;
  }
  const settings = await Setting.findAll({
    where: whereCondition,
    order: [["id", "ASC"]]
  });

  return settings;
};

export default AdminListSettingsService;
