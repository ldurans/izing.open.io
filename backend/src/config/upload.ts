import path from "path";
import multer from "multer";
import { format } from "date-fns";

const publicFolder = path.resolve(__dirname, "..", "..", "public");
export default {
  directory: publicFolder,

  storage: multer.diskStorage({
    destination: publicFolder,
    filename(req, file, cb) {
      let fileName;
      if (file.mimetype?.toLocaleLowerCase().endsWith("xml")) {
        fileName = file.originalname;
      } else {
        const { originalname } = file;
        const ext = path.extname(originalname);
        const name = originalname.replace(ext, "");
        const date = format(new Date(), "ddMMyyyyHHmmssSSS");
        fileName = `${name}_${date}${ext}`;
      }

      return cb(null, fileName);
    }
  })
};
