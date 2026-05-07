import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "./prisma";

// ── Protección contra fuerza bruta ────────────────────────────────────────────
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_ATTEMPTS  = 5;
const LOCK_MS       = 15 * 60 * 1000; // bloqueo de 15 minutos

function checkBruteForce(email: string): { blocked: boolean; remaining: number } {
  const now   = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry) return { blocked: false, remaining: MAX_ATTEMPTS };

  // Si el bloqueo ya expiró, reiniciar
  if (entry.lockedUntil && now > entry.lockedUntil) {
    loginAttempts.delete(email);
    return { blocked: false, remaining: MAX_ATTEMPTS };
  }

  if (entry.count >= MAX_ATTEMPTS) return { blocked: true, remaining: 0 };

  return { blocked: false, remaining: MAX_ATTEMPTS - entry.count };
}

function recordFailedAttempt(email: string) {
  const now   = Date.now();
  const entry = loginAttempts.get(email);

  if (!entry) {
    loginAttempts.set(email, { count: 1, lockedUntil: 0 });
    return;
  }

  entry.count++;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCK_MS;
  }
}

function clearAttempts(email: string) {
  loginAttempts.delete(email);
}

// ── NextAuth ──────────────────────────────────────────────────────────────────
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email as string;

        // Verificar bloqueo por fuerza bruta
        const { blocked } = checkBruteForce(email);
        if (blocked) return null;

        const user = await prisma.adminUser.findUnique({ where: { email } });

        if (!user) {
          recordFailedAttempt(email);
          return null;
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.password as string
        );

        if (!valid) {
          recordFailedAttempt(email);
          return null;
        }

        // Login exitoso — limpiar intentos
        clearAttempts(email);

        return {
          id:    user.id    as string,
          email: user.email as string,
          name:  user.name  as string,
        };
      },
    }),
  ],
  pages:   { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  secret:  process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
});
