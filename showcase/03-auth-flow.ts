/**
 * Simplified auth flow sample (redacted from production project).
 * Shows:
 * - credential validation
 * - password hash check
 * - token fallback flow
 * - role/session mapping
 */

type Role = "CLIENT" | "ADMIN" | "PARTNER";

type AuthUser = {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
};

async function authorize(credentials?: { email?: string; password?: string }) {
  if (!credentials?.email || !credentials?.password) return null;

  const email = credentials.email.toLowerCase();
  const password = credentials.password;

  const user = await findUserByEmail(email); // redacted data-access
  if (user?.passwordHash && (await compareHash(password, user.passwordHash))) {
    return mapUser(user);
  }

  const tokenHash = hashToken(password);
  const tokenEntry = await findActiveTokenByHash(tokenHash); // redacted business query
  if (!tokenEntry) return null;

  const linkedUser = await resolveTokenUser(tokenEntry, email); // redacted business logic
  if (!linkedUser) return null;

  await markTokenUsed(tokenEntry.id);
  return mapUser(linkedUser);
}

function mapUser(user: {
  id: string;
  email: string;
  role: Role;
  name?: string | null;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name ?? user.email,
  };
}

// Placeholder helpers
declare function findUserByEmail(email: string): Promise<{ id: string; email: string; role: Role; name?: string | null; passwordHash?: string | null } | null>;
declare function compareHash(input: string, hash: string): Promise<boolean>;
declare function hashToken(value: string): string;
declare function findActiveTokenByHash(tokenHash: string): Promise<{ id: string } | null>;
declare function resolveTokenUser(tokenEntry: { id: string }, email: string): Promise<{ id: string; email: string; role: Role; name?: string | null } | null>;
declare function markTokenUsed(id: string): Promise<void>;
