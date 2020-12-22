import Setting from "../../models/Setting";

const ListSettingsService = async (
  tenantId: number | string
): Promise<Setting[] | undefined> => {
  const settings = await Setting.findAll({
    where: { tenantId }
  });

  return settings;
};

export default ListSettingsService;
