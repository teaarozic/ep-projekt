import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { logger } from '@/lib/logger.js';

dotenv.config();

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;

if (process.env.NODE_ENV !== 'test') {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID!,
        clientSecret: GOOGLE_CLIENT_SECRET!,
        callbackURL: GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          const name =
            profile.displayName || profile.name?.givenName || 'Unknown User';

          if (!email) {
            return done(new Error('Google profile has no email'), undefined);
          }

          let user = await prisma.user.findUnique({ where: { email } });

          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                name: profile.displayName || null,
                password: null,
                provider: 'google',
                role: 'USER',
                status: 'Active',
              },
            });
          }

          done(null, {
            id: user.id,
            email: user.email,
            name,
            provider: 'google',
            role: user.role,
          });
        } catch (err) {
          logger.error('Google OAuth error', { error: err });
          done(err, undefined);
        }
      }
    )
  );
}

interface OAuthUser {
  id?: string;
  email?: string;
  name?: string;
  provider?: string;
}

passport.serializeUser(
  (user: OAuthUser, done: (err: unknown, id?: unknown) => void) => {
    done(null, user);
  }
);

passport.deserializeUser(
  (obj: unknown, done: (err: unknown, user?: unknown) => void) => {
    done(null, obj as OAuthUser);
  }
);

export default passport;
