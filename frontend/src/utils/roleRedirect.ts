import type { Role } from '@/utils/auth';

export function roleToPath(role: Role): string {
  switch (role) {
    case 'USER':
    case 'ADMIN':
    case 'SA':
    default:
      return '/dashboard';
  }
}
