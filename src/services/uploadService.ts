import path from "path";
import sharp from "sharp";
import { UserImages } from "../../sequelize/models/UserImages";
import { UploadDataInput } from "../../types/types";
import { User } from "../../sequelize/models/User";

export const UploadService = {
  async uploadUserImage(input: UploadDataInput): Promise<UserImages> {
    let imgProfileSrc =
      `${process.env.API_URL}/images/profils/` + input.file.filename;
    let imgMapSrc = `${process.env.API_URL}/images/map/` + input.file.filename;

    if (input.position == 0) {
      // Resize picture for map

      await sharp(input.file.path)
        .resize(100, 100)
        .jpeg({ quality: 50 })
        .toFile(
          path.resolve(input.file.destination, "map", input.file.filename)
        );

      // Resize picture for profile
      await sharp(input.file.path)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(
          path.resolve(input.file.destination, "profils", input.file.filename)
        );

      // Insert images in database
      const image = {
        src: imgProfileSrc,
        position: input.position,
        userId: input.userId,
      };

      const createImage = await UserImages.create(image as UserImages);
      await User.update(
        { image: imgMapSrc },
        {
          where: {
            id: input.userId,
          },
        }
      );
      return createImage;
    } else {
      // Resize picture for profile
      await sharp(input.file.path)
        .resize(200, 200)
        .jpeg({ quality: 90 })
        .toFile(
          path.resolve(input.file.destination, "profils", input.file.filename)
        );

      // Insert images in database
      const image = {
        src: imgProfileSrc,
        position: input.position,
        userId: input.userId,
      };

      const createImage = await UserImages.create(image as UserImages);

      return createImage;
    }
  },
};
