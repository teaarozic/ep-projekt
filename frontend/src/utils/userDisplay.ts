export function getDisplayName(
  user?: { name?: string | null; email?: string | null } | null
): string {
  if (user?.name && user.name.trim() !== '') return user.name;

  if (user?.email) {
    const namePart = user.email.split('@')[0];

    let cleaned = namePart
      .replace(/[._]/g, ' ')
      .replace(/[0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const parts = cleaned.split(' ').filter(Boolean);
    const formatted = parts
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    return formatted || namePart;
  }

  return 'Unknown User';
}

export function getInitials(
  user?: { name?: string | null; email?: string | null } | null
): string {
  if (user?.name && user.name.trim() !== '') {
    const parts = user.name.trim().split(' ');
    return parts
      .filter(Boolean)
      .map((p) => p[0].toUpperCase())
      .slice(0, 2)
      .join('');
  }

  if (user?.email) {
    const namePart = user.email.split('@')[0];

    let cleaned = namePart
      .replace(/[._]/g, ' ')
      .replace(/[0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const parts = cleaned.split(' ').filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  return 'US';
}
