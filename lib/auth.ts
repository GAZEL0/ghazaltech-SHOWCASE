import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/quote-tokens";
import { Prisma } from "@prisma/client";
import { QuoteStatus, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { type AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase();
        const password = credentials.password;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (user?.passwordHash) {
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (isValid) {
            return {
              id: user.id,
              name: user.name ?? user.email,
              email: user.email,
              role: user.role,
              referralCode: user.referralCode ?? null,
            };
          }
        }

        const tokenHash = hashToken(password);
        const quote = await prisma.quote
          .findFirst({
            where: {
              magicToken: tokenHash,
              status: QuoteStatus.SENT,
              expiresAt: { gt: new Date() },
            },
            include: { customRequest: true },
          })
          .catch(() => null);

        if (
          quote &&
          quote.status === QuoteStatus.SENT &&
          quote.customRequest.email.toLowerCase() === email
        ) {
          const userEmail = quote.customRequest.email.toLowerCase();

          const existingUser =
            user ??
            (await prisma.user.create({
              data: {
                email: userEmail,
                name: quote.customRequest.fullName,
                role: Role.CLIENT,
              },
            }));

          if (!quote.customRequest.userId) {
            await prisma.customProjectRequest.update({
              where: { id: quote.customRequestId },
              data: { userId: existingUser.id },
            });
          }

          await prisma.quote.update({
            where: { id: quote.id },
            data: { magicToken: `used:${tokenHash}` },
          });

          return {
            id: existingUser.id,
            name: existingUser.name ?? existingUser.email,
            email: existingUser.email,
            role: existingUser.role,
            referralCode: existingUser.referralCode ?? null,
            quoteId: quote.id,
          };
        }

        const magicLogin = await prisma.auditLog.findFirst({
          where: {
            action: "MAGIC_LOGIN",
            data: {
              path: ["tokenHash"],
              equals: tokenHash,
            } as Prisma.JsonFilter,
          },
          orderBy: { createdAt: "desc" },
        });

        if (!magicLogin) {
          return null;
        }

        const data = (magicLogin.data ?? {}) as {
          email?: string;
          userId?: string;
          expiresAt?: string;
          usedAt?: string;
        };

        const expired = data.expiresAt ? new Date(data.expiresAt) <= new Date() : false;
        if (expired || data.usedAt) {
          return null;
        }

        if (data.email?.toLowerCase() !== email && !data.email) {
          return null;
        }

        const magicUser =
          (data.userId
            ? await prisma.user.findUnique({ where: { id: data.userId } })
            : null) ??
          (await prisma.user.findUnique({
            where: { email: (data.email ?? email).toLowerCase() },
          }));

        if (!magicUser) {
          return null;
        }

        await prisma.auditLog.update({
          where: { id: magicLogin.id },
          data: {
            data: {
              ...data,
              usedAt: new Date().toISOString(),
            },
          },
        });

        return {
          id: magicUser.id,
          name: magicUser.name ?? magicUser.email,
          email: magicUser.email,
          role: magicUser.role,
          referralCode: magicUser.referralCode ?? null,
          quoteId: quote?.id ?? null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
        token.referralCode = (user as { referralCode?: string | null })
          .referralCode;
        token.email = (user as { email?: string | null }).email ?? token.email;
        token.quoteId = (user as { quoteId?: string | null }).quoteId ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? Role.CLIENT;
        session.user.referralCode =
          (token.referralCode as string | null | undefined) ?? null;
        session.user.email =
          (token.email as string | null | undefined) ??
          session.user.email ??
          null;
        (session.user as { quoteId?: string | null }).quoteId =
          (token.quoteId as string | null | undefined) ?? null;
      }
      return session;
    },
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};
