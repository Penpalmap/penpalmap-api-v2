import bcrypt from 'bcrypt';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import User from './user.model';
import { UserDto } from './dto/user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import UserLanguage from './user-language.model';
import { UpdateUserDto } from './dto/update-user.dto';
import UserImage from './user-image.model';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { UserImageDto } from './dto/user-image.dto';
import { OrderImagesDto } from './dto/order-images.dto';
import { onlineUsers } from '../global';
import { MinioService } from '../minio/minio.service';
import { PageDto } from '../shared/pagination/page.dto';
import { RoleService } from '../role/role.service';
import { isAdmin } from '../shared/authorization.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(UserLanguage)
    private readonly userLanguageRepository: Repository<UserLanguage>,
    @InjectRepository(UserImage)
    private readonly userImageRepository: Repository<UserImage>,
    private readonly minioService: MinioService,
    private readonly roleService: RoleService,
  ) {}

  static userToDto(user: User): UserDto {
    return {
      id: user.id,
      blockedUsers: user.blockedUsers?.map(UserService.userToDto),
      name: user.name,
      email: user.email,
      googleId: user.googleId,
      geom: user.geom,
      points: user.points,
      image: user.image,
      gender: user.gender,
      birthday: user.birthday,
      bio: user.bio,
      isNewUser: user.isNewUser,
      connections: user.connections,
      languageUsed: user.languageUsed,
      avatarNumber: user.avatarNumber,
      userImages: user.userImages?.map((userImage) => ({
        id: userImage.id,
        src: userImage.src,
        position: userImage.position,
      })),
      userLanguages: user.userLanguages?.map((userLanguage) => ({
        id: userLanguage.id,
        language: userLanguage.language,
        level: userLanguage.level,
      })),
      isOnline: onlineUsers.has(user.id),
      updatedAt: user.updatedAt,
      roles: user.roles?.map(RoleService.roleToDto),
    };
  }
  // Get all users
  async getUsers(dto: QueryUserDto): Promise<PageDto<UserDto>> {
    const [users, total] = await this.userRepository.findAndCount({
      where: {
        email: dto.email,
        googleId: dto.googleId,
        roles: dto.roleIds ? { id: In(dto.roleIds) } : undefined,
      },
      take: dto.limit,
      skip: dto.offset,
      order: {
        [dto.orderBy]: dto.order,
      },
      relations: {
        roles: Boolean(dto.roleIds),
      },
    });
    const page = new PageDto<User>(dto.limit, dto.offset, total, users);
    return page.map((user) =>
      UserService.userToDto({ ...user, roles: undefined }),
    );
  }

  // Get user
  async getUserById(id: string): Promise<UserDto> {
    return UserService.userToDto(await this.getUserByIdRaw(id));
  }

  async getUserByIdRaw(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        blockedUsers: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getUserByLoginRaw(email?: string, googleId?: string): Promise<User> {
    if (!email && !googleId) {
      throw new BadRequestException('Email or googleId is required');
    }

    const user = await this.userRepository.findOne({
      where: {
        email: email,
        googleId: googleId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  // Create user
  async createUser(loggedUser: User, dto: CreateUserDto): Promise<UserDto> {
    if (!isAdmin(loggedUser)) {
      throw new ForbiddenException('You cannot create a user');
    }
    const user = await this.createUserRaw(dto);
    return UserService.userToDto(user);
  }

  async createUserRaw(dto: CreateUserDto): Promise<User> {
    const roles = dto.roleIds
      ? await Promise.all(
          dto.roleIds.map((roleId) => this.roleService.getRoleByIdRaw(roleId)),
        )
      : [];
    const commonFields: DeepPartial<Omit<User, 'password' | 'googleId'>> = {
      bio: dto.bio,
      birthday: dto.birthday,
      email: dto.email,
      gender: dto.gender,
      languageUsed: dto.languageUsed,
      name: dto.name,
      userLanguages: dto.userLanguages,
      userImages: [],
      roles,
    };

    if (dto.googleId) {
      // If a user tries to create an new account with a googleId
      // we should check if the user already exists
      const userWithGoogleId = await this.userRepository.findOne({
        where: {
          googleId: dto.googleId,
        },
      });
      if (userWithGoogleId) {
        throw new ConflictException('A user with this googleId already exists');
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
        ...commonFields,
        googleId: dto.googleId,
      });
    }

    // No googleId provided, we first check a password is provided
    if (!dto.password) {
      throw new BadRequestException('Password or googleId is required');
    }

    // Then we check if the user already exists with the same email
    const userWithEmail = await this.userRepository.findOne({
      where: {
        email: dto.email,
      },
    });
    if (userWithEmail) {
      throw new ConflictException('User already exists');
    }

    // The user does not exist, we should create a new user from scratch
    // Hash the password
    const newUser = await this.userRepository.save({
      ...commonFields,
      password: await bcrypt.hash(dto.password, 10),
    });

    return newUser;
  }

  // Update user
  async updateUser(
    loggedUser: User,
    id: string,
    dto: UpdateUserDto,
  ): Promise<UserDto> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException('You cannot update this user');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        blockedUsers: true,
        roles: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const blockedUsers = dto.blockedUserIds
      ? await this.userRepository.find({
          where: { id: In(dto.blockedUserIds) },
        })
      : user.blockedUsers;

    const roles = dto.roleIds
      ? await Promise.all(
          dto.roleIds.map((roleId) => this.roleService.getRoleById(roleId)),
        )
      : user.roles;

    const newUser = await this.userRepository.save({
      ...user,
      name: dto.name ?? user.name,
      gender: dto.gender ?? user.gender,
      birthday: dto.birthday ?? user.birthday,
      bio: dto.bio ?? user.bio,
      languageUsed: dto.languageUsed ?? user.languageUsed,
      geom:
        dto.latitude && dto.longitude
          ? {
              type: 'Point',
              coordinates: [dto.longitude, dto.latitude],
            }
          : user.geom,
      isNewUser: dto.isNewUser ?? user.isNewUser,
      userLanguages: dto.userLanguages ?? user.userLanguages,
      blockedUsers,
      roles,
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
      throw new NotFoundException('User not found');
    }

    return await this.userRepository.save({
      ...user,
      password: await bcrypt.hash(password, 10),
    });
  }

  // Delete user
  async deleteUser(loggedUser: User, id: string): Promise<void> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException('You cannot delete this user');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
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
            type: 'Point',
            coordinates: user.geom.coordinates.map(
              (coord) => coord + Math.random() * 0.01 - 0.05,
            ),
          }
        : undefined;
      return UserService.userToDto(user);
    });
  }

  async incrementUserConnection(id: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.save({
      ...user,
      connections: user.connections + 1,
    });
  }

  async updateUserPassword(
    loggedUser: User,
    id: string,
    dto: UpdatePasswordDto,
  ): Promise<void> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException('You cannot update this user');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.password) {
      throw new ForbiddenException('User has no password');
    }
    if (dto.newPassword === dto.oldPassword) {
      throw new BadRequestException(
        'New password must be different from old password',
      );
    }
    const isPasswordValid = await bcrypt.compare(
      dto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new ForbiddenException('Old password is not valid');
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save({ ...user, password: hashedPassword });
  }

  async uploadImage(
    loggedUser: User,
    userId: string,
    dto: UploadImageDto,
  ): Promise<UserImageDto> {
    if (!isAdmin(loggedUser) && loggedUser.id !== userId) {
      throw new ForbiddenException('You cannot upload an image for this user');
    }
    const mapBucketName = 'map';
    const profilsBucketName = 'profils';

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldImage = await this.userImageRepository.findOne({
      where: {
        position: dto.position,
        user: {
          id: userId,
        },
      },
      relations: {
        user: true,
      },
    });
    if (oldImage) {
      throw new ConflictException('Image already exists');
    }

    // Create map and profils buckets if they don't exist asynchronously
    await Promise.all([
      this.minioService.bucketExists(mapBucketName).then(async (exists) => {
        if (!exists) {
          await this.minioService.createBucket(mapBucketName);
          await this.minioService.setBucketPublicAccess(mapBucketName, true);
        }
      }),
      this.minioService.bucketExists(profilsBucketName).then(async (exists) => {
        if (!exists) {
          await this.minioService.createBucket(profilsBucketName);
          await this.minioService.setBucketPublicAccess(
            profilsBucketName,
            true,
          );
        }
      }),
    ]);

    const imageName = `${uuid()}.webp`;

    // Save map image only if it's the first image
    if (dto.position == 1) {
      const mapImage = await sharp(dto.image.buffer)
        .resize(100, 100)
        .webp({ quality: 50 })
        .toBuffer();
      await this.minioService.uploadObject(mapBucketName, imageName, mapImage);
      await this.userRepository.save({
        ...user,
        image: `${
          process.env.MINIO_EXTERNAL_URL ?? 'http://localhost:9000'
        }/${mapBucketName}/${imageName}`,
      });
    }

    // Save profils image
    const profilsImage = await sharp(dto.image.buffer)
      .resize(200, 200)
      .webp({ quality: 90 })
      .toBuffer();
    await this.minioService.uploadObject(
      profilsBucketName,
      imageName,
      profilsImage,
    );

    // Save image UUID in database and return image
    const image = await this.userImageRepository.save({
      src: `${
        process.env.MINIO_EXTERNAL_URL ?? 'http://localhost:9000'
      }/${profilsBucketName}/${imageName}`,
      position: dto.position,
      user,
    });
    return {
      id: image.id,
      src: image.src,
      position: image.position,
    };
  }

  async reorderImages(
    loggedUser: User,
    id: string,
    dto: OrderImagesDto,
  ): Promise<void> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException('You cannot reorder images for this user');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.userImages) {
      throw new ForbiddenException('No images found for this user');
    }
    if (user.userImages.length !== dto.order.length) {
      throw new BadRequestException('Images length is not the same');
    }

    await Promise.all(
      user.userImages
        .toSorted((ua1, ua2) => ua1.position - ua2.position)
        .map((image, index) =>
          this.userImageRepository.save({
            ...image,
            position: dto.order[index],
          }),
        ),
    );
  }

  async deleteImage(
    loggedUser: User,
    id: string,
    position: number,
  ): Promise<void> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException('You cannot delete an image for this user');
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.userImages) {
      throw new ForbiddenException('No images found for this user');
    }

    const imageToDelete = user.userImages.find(
      (image) => image.position == position,
    );
    if (!imageToDelete) {
      throw new NotFoundException('Image not found');
    }

    await this.userImageRepository.delete({
      id: imageToDelete.id,
    });

    const [_, bucketName, objectName] = new URL(
      imageToDelete.src,
    ).pathname.split('/');
    await this.minioService.deleteObject(bucketName, objectName);
  }

  async setDefaultImage(
    loggedUser: User,
    id: string,
    position: number,
  ): Promise<void> {
    if (!isAdmin(loggedUser) && loggedUser.id !== id) {
      throw new ForbiddenException(
        'You cannot set a default image for this user',
      );
    }
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: {
        userImages: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user.userImages) {
      throw new ForbiddenException('No images found for this user');
    }

    const imageToSetDefault = user.userImages.find(
      (image) => image.position === position,
    );
    if (!imageToSetDefault) {
      throw new NotFoundException('Image not found');
    }

    await this.userRepository.save({
      ...user,
      image: imageToSetDefault.src,
    });
  }
}
