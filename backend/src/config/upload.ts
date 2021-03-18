import path from "path";
import multer from "multer";
import { format } from "date-fns";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      const { originalname } = file;
      const ext = path.extname(originalname);
      const name = originalname.replace(ext, "");
      const date = format(new Date(), "ddMMyyyyHHmmssSSS");
      const fileName = `${name}_${date}${ext}`;

      return cb(null, fileName);
    }
  })
};
