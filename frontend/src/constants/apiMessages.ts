export function mapApiError(error: string): string {
  switch (error) {
    case 'Invalid email format':
      return 'Please enter a valid email address.';

    case 'Email and password required':
      return 'Email and password are required.';

    case 'Password must be at least 8 characters':
      return 'Password must be at least 8 characters long.';

    case 'Invalid credentials':
      return 'Invalid email or password.';

    case 'User already exists':
      return 'This email is already registered. Please log in instead.';

    default:
      if (error && error.length < 150 && !error.includes('Error')) {
        return error;
      }

      return 'Something went wrong. Please try again.';
  }
}
