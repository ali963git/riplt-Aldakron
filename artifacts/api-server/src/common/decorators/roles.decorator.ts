import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<'USER' | 'EDITOR' | 'ADMIN'>) =>
  SetMetadata(ROLES_KEY, roles);
