import Tenant from "../../models/Tenant";

const AdminListTenantsService = async (): Promise<Tenant[]> => {
  const tenants = await Tenant.findAll({
    order: [["name", "ASC"]]
  });

  return tenants;
};

export default AdminListTenantsService;
