import User from '../user/user.model';

export function isAdmin(user: User): boolean {
  return user.roles?.map((role) => role.name).includes('admin') ?? false;
}
