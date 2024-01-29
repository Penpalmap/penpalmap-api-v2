import fs from "fs";
import path from "path";
import sharp from "sharp";
import UserImages from "../user/user-images.model";
import { UploadDataInput } from "./upload-data-input.dto";
import User from "../user/user.model";

export const UploadService = {
  async uploadUserImage(input: UploadDataInput): Promise<UserImages> {
    try {
      const mapDir = path.resolve(input.file.destination, "map");
      const profilsDir = path.resolve(input.file.destination, "profils");

      // Créer le dossier map s'il n'existe pas
      if (!fs.existsSync(mapDir)) {
        fs.mkdirSync(mapDir, { recursive: true });
      }

      // Créer le dossier profils s'il n'existe pas
      if (!fs.existsSync(profilsDir)) {
        fs.mkdirSync(profilsDir, { recursive: true });
      }

      let imgProfileSrc =
        `${process.env.API_URL}/images/profils/` + input.file.filename;
      let imgMapSrc =
        `${process.env.API_URL}/images/map/` + input.file.filename;

      if (input.position == 0) {
        // Redimensionner l'image pour la carte
        await sharp(input.file.path)
          .resize(100, 100)
          .jpeg({ quality: 50 })
          .toFile(path.join(mapDir, input.file.filename));

        // Redimensionner l'image pour le profil
        await sharp(input.file.path)
          .resize(200, 200)
          .jpeg({ quality: 90 })
          .toFile(path.join(profilsDir, input.file.filename));

        // Insérer les images dans la base de données
        const image = {
          src: imgProfileSrc,
          position: input.position,
          userId: input.userId,
        };

        const createImage = await UserImages.create(image as UserImages);
        await User.update(
          { image: imgMapSrc },
          { where: { id: input.userId } }
        );
        return createImage;
      } else {
        // Redimensionner l'image pour le profil
        await sharp(input.file.path)
          .resize(200, 200)
          .jpeg({ quality: 90 })
          .toFile(path.join(profilsDir, input.file.filename));

        // Insérer les images dans la base de données
        const image = {
          src: imgProfileSrc,
          position: input.position,
          userId: input.userId,
        };

        const createImage = await UserImages.create(image as UserImages);

        return createImage;
      }
    } catch (error) {
      console.log(error);
      throw error; // Ajouté pour propager l'erreur
    }
  },
};
