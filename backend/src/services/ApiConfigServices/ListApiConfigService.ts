import ApiConfig from "../../models/ApiConfig";

interface Response {
  apis: ApiConfig[];
}

interface Request {
  tenantId: number | string;
}

const ListApiConfigService = async ({
  tenantId
}: Request): Promise<Response> => {
  const apis = await ApiConfig.findAll({
    where: { tenantId },
    order: [["name", "ASC"]]
  });

  return { apis };
};

export default ListApiConfigService;
