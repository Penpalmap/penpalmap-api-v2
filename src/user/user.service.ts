import bcrypt from "bcrypt";
import sharp from "sharp";
import { v4 as uuid } from "uuid";
import User from "./user.model";
import { onlineUsers } from "../globals";
import UserImage from "./user-image.model";
import UserLanguage from "./user-language.model";
import { MinioService } from "../minio/minio.service";
import { In, Point, Repository } from "typeorm";
import { PostgresqlService } from "../postgresql/postgresql.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UserDto } from "./dto/user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { QueryUserDto } from "./dto/query-user.dto";
import { UploadImageDto } from "./dto/upload-image.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { OrderImagesDto } from "./dto/order-images.dto";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from "../shared/exception/http4xx.exception";

export class UserService {
  private static instance: UserService;
  private readonly userRepository: Repository<User>;
  private readonly userLanguageRepository: Repository<UserLanguage>;
  private readonly userImageRepository: Repository<UserImage>;

  private readonly MinioService: MinioService;

  private constructor() {
    const dataSource = PostgresqlService.getInstance().getDataSource();

    this.userRepository = dataSource.getRepository(User);
    this.userLanguageRepository = dataSource.getRepository(UserLanguage);
    this.userImageRepository = dataSource.getRepository(UserImage);

    this.MinioService = MinioService.getInstance();
  }

  static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }

    return UserService.instance;
  }

  static userToDto(user: User): UserDto {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      geom: user.geom,
      points: user.points,
      iamge: user.image,
      gender: user.gender,
      birthday: user.birthday,
      bio: user.bio,
      isNewUser: user.isNewUser,
      connections: user.connections,
      languageUsed: user.languageUsed,
      avatarNumber: user.avatarNumber,
      userImages: user.userImages,
      isOnline: onlineUsers.has(user.id),
    };
  }
  // Get all users
  async getUsers(dto: QueryUserDto): Promise<UserDto[]> {
    const users = await this.userRepository.find({
      where: {
        email: dto.email,
        googleId: dto.googleId,
      },
    });
    return users.map(UserService.userToDto);
  }

  // Get user
  async getUserById(id: string): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return UserService.userToDto(user);
  }

  async getUserByLoginRaw(email?: string, googleId?: string): Promise<User> {
    if (!email && !googleId) {
      throw new BadRequestException("Email or googleId is required");
    }

    const user = await this.userRepository.findOne({
      where: {
        email: email,
        googleId: googleId,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  // Create user
  async createUser(dto: CreateUserDto): Promise<UserDto> {
    const user = await this.createUserRaw(dto);
    return UserService.userToDto(user);
  }

  async createUserRaw(dto: CreateUserDto): Promise<User> {
    if (dto.googleId) {
      // If a user tries to create an new account with a googleId
      // we should check if the user already exists
      const userWithGoogleId = await this.userRepository.findOne({
        where: {
          googleId: dto.googleId,
        },
      });
      if (userWithGoogleId) {
        throw new ConflictException("A user with this googleId already exists");
      }

      // No user with this googleId, we should check if the user already exists with the same email
      const userWithEmail = await this.userRepository.findOne({
        where: {
          email: dto.email,
        },
      });

      if (userWithEmail) {
        // If a user with the same email exists, we should update the user with the googleId
        return await this.userRepository.save({
          ...userWithEmail,
          googleId: dto.googleId,
        });
      }

      // No user with the same email, we should create a new user from scratch
      return await this.userRepository.save({
        name: dto.name,
        email: dto.email,
        googleId: dto.googleId,
      });
    }

    // No googleId provided, we first check a password is provided
    if (!dto.password) {
      throw new BadRequestException("Password is required");
    }

    // Then we check if the user already exists with the same email
    const userWithEmail = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });
    if (userWithEmail) {
      throw new ConflictException("User already exists");
    }

    // The user does not exist, we should create a new user from scratch
    // Hash the password
    const newUser = await this.userRepository.save({
      name: dto.name,
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
    });

    if (dto.userLanguages) {
      await this.userLanguageRepository.insert(
        dto.userLanguages.map((lang) => ({ ...lang, user: newUser }))
      );
    }

    return newUser;
  }

  // Update user
  async updateUser(id: string, dto: UpdateUserDto): Promise<UserDto> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        blockedUsers: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const geom: Point | undefined =
      dto.latitude && dto.longitude
        ? {
            type: "Point",
            coordinates: [dto.longitude, dto.latitude],
          }
        : user.geom;

    const blockedUsers = dto.blockedUserIds
      ? await this.userRepository.find({
          where: { id: In(dto.blockedUserIds) },
        })
      : user.blockedUsers;

    // Ajouter les nouvelles langues
    if (dto.userLanguages) {
      await this.userLanguageRepository.delete({ user });
      await this.userLanguageRepository.insert(
        dto.userLanguages.map((lang) => ({ ...lang, user }))
      );
    }

    const newUser = await this.userRepository.save({
      ...user,
      name: dto.name,
      email: dto.email,
      gender: dto.gender,
      birthday: dto.birthday,
      bio: dto.bio,
      blockedUsers,
      languageUsed: dto.languageUsed,
      geom,
    });
    return UserService.userToDto(newUser);
  }

  async updatePasswordRaw(id: string, password: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return await this.userRepository.save({
      ...user,
      password: await bcrypt.hash(password, 10),
    });
  }

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await Promise.all([
      this.userLanguageRepository.delete({ user }),
      this.userImageRepository.delete({ user }),
    ]);

    await this.userRepository.delete({
      id: user.id,
    });
  }

  async getUsersInMap(): Promise<UserDto[]> {
    const now = Date.now();

    const ONE_DAY = 24 * 60 * 60 * 1000; // Nombre de millisecondes en un jour
    const MAX_DAYS = 365; // Nombre de jours après lesquels le score se stabilise près de la valeur minimale (à ajuster selon les besoins)

    const users = await this.userRepository.find({
      relations: {
        userImages: true,
      },
    });

    return users.map((user) => {
      const updateTimestamp = user.updatedAt.getTime();
      const daysSinceUpdate = (now - updateTimestamp) / ONE_DAY;

      const score = 100 * Math.exp(-daysSinceUpdate / MAX_DAYS);
      const finalScore = Math.max(1, Math.min(Math.round(score), 100));

      user.points = finalScore;
      user.geom = user.geom
        ? {
            type: "Point",
            coordinates: user.geom.coordinates.map(
              (coord) => coord + Math.random() * 0.01 - 0.05
            ),
          }
        : undefined;
      return UserService.userToDto(user);
    });
  }

  async incrementUserConnection(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    await this.userRepository.save({
      ...user,
      connections: user.connections + 1,
    });
  }

  async updateUserPassword(id: string, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.password) {
      throw new ForbiddenException("User has no password");
    }
    if (dto.newPassword === dto.oldPassword) {
      throw new BadRequestException(
        "New password must be different from old password"
      );
    }
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new ForbiddenException("Old password is not valid");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save({ ...user, password: hashedPassword });
  }

  async uploadImage(userId: string, dto: UploadImageDto): Promise<UserImage> {
    const mapBucketName = "map";
    const profilsBucketName = "profils";

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Create map and profils buckets if they don't exist asynchronously
    await Promise.all([
      this.MinioService.bucketExists(mapBucketName).then(async (exists) => {
        if (!exists) {
          await this.MinioService.createBucket(mapBucketName);
          await this.MinioService.setBucketPublicAccess(mapBucketName, true);
        }
      }),
      this.MinioService.bucketExists(profilsBucketName).then(async (exists) => {
        if (!exists) {
          await this.MinioService.createBucket(profilsBucketName);
          await this.MinioService.setBucketPublicAccess(
            profilsBucketName,
            true
          );
        }
      }),
    ]);

    const imageName = `${uuid()}.webp`;

    // Save map image only if it's the first image
    if (dto.position == 0) {
      const mapImage = await sharp(dto.image.buffer)
        .resize(100, 100)
        .webp({ quality: 50 })
        .toBuffer();
      await this.MinioService.saveFile(mapBucketName, imageName, mapImage);
      await this.userRepository.save({
        image: `${
          process.env.MINIO_EXTERNAL_URL ?? "http://localhost:9000"
        }/${mapBucketName}/${imageName}`,
      });
    }

    // Save profils image
    const profilsImage = await sharp(dto.image.buffer)
      .resize(200, 200)
      .webp({ quality: 90 })
      .toBuffer();
    await this.MinioService.saveFile(
      profilsBucketName,
      imageName,
      profilsImage
    );

    // Save image UUID in database and return image
    const image = await this.userImageRepository.save({
      src: `${
        process.env.MINIO_EXTERNAL_URL ?? "http://localhost:9000"
      }/${profilsBucketName}/${imageName}`,
      position: dto.position,
      user,
    });
    return image;
  }

  async reorderImages(id: string, dto: OrderImagesDto): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.userImages) {
      throw new ForbiddenException("No images found for this user");
    }
    if (user.userImages.length !== dto.order.length) {
      throw new BadRequestException("Images length is not the same");
    }

    await Promise.all(
      user.userImages
        .toSorted((ua1, ua2) => ua1.position - ua2.position)
        .map((image, index) =>
          this.userImageRepository.save({
            ...image,
            position: dto.order[index],
          })
        )
    );
  }

  async deleteImage(id: string, position: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.userImages) {
      throw new ForbiddenException("No images found for this user");
    }

    const imageToDelete = user.userImages.find(
      (image) => image.position === position
    );
    if (!imageToDelete) {
      throw new NotFoundException("Image not found");
    }

    await this.userImageRepository.delete({
      id: imageToDelete.id,
    });

    const [bucketName, objectName] = new URL(imageToDelete.src).pathname.split(
      "/"
    );
    await this.MinioService.deleteFile(bucketName, objectName);
  }

  async setDefaultImage(id: string, position: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (!user.userImages) {
      throw new ForbiddenException("No images found for this user");
    }

    const imageToSetDefault = user.userImages.find(
      (image) => image.position === position
    );
    if (!imageToSetDefault) {
      throw new NotFoundException("Image not found");
    }

    await this.userRepository.save({
      ...user,
      image: imageToSetDefault.src,
    });
  }
}
