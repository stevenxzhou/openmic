import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider, { CredentialInput } from "next-auth/providers/credentials";
import type { Profile, User, AuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt"
import { getUserByEmail } from "@/lib/data";

interface GoogleProfile extends Profile {
  given_name: string,
  family_name: string
}

const nextBaseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";
const nextHostUrl = process.env.NEXT_PUBLIC_HOST_URL || "";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET!,
  session: {
    strategy: "jwt",
    maxAge: 30*24*60*60
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: `${nextBaseUrl}`,
        secure: true,
        maxAge: 900
      },
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text", placeholder: "jsmith" },
        password: { label: "Password", type: "password" }
      },
      
      async authorize(credentials, req) {
        try {
          const res = await fetch(
            `${nextHostUrl}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                username: credentials?.username,
                password: credentials?.password
              })
            }
          );

          if (res.status !== 200) {
            return null;
          }

          const data = await res.json();

          // Add logic here to look up the user from the credentials supplied
          const user = { id: String(data.id), email: data.email, first_name: data.first_name, role: data.role};

          return user;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    })
  ],
  callbacks: {

    async signIn({ profile, user, credentials}: {profile?: Profile | GoogleProfile | null, user: User, credentials?: Record<string, CredentialInput>;}) {

      // Local account credentials
      if (credentials) return true;

      // Social IDPs
      if (!profile?.email) return false;

      const res = await fetch(
        `${nextHostUrl}/api/users/check?email=${encodeURIComponent(profile.email)}`
      );
      const data = await res.json();

      if (!data.exists) {
        return `${nextHostUrl}/signup/profile?email=${encodeURIComponent(profile.email)}&first_name=${encodeURIComponent((profile as GoogleProfile).given_name)}&last_name=${encodeURIComponent((profile as GoogleProfile).family_name)}`;
      }

      return true;
    },

    async jwt({ token, user, profile}: {token: JWT, user?: User, profile?: Profile | GoogleProfile | null}) {

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.first_name = (user as any).first_name;
        token.role = (user as any).role;
        token.isNewUser = (user as any).isNewUser;
      }

      if (profile && profile.email) {
        // Fetch user from your DB by email
        const dbUser = await getUserByEmail(profile.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.first_name = dbUser.first_name;
          token.role = dbUser.role;
        }
      }

      return token;
    },

    async session({ session, token }) {

      // Copy custom fields from token to session.user
      if (session.user) {
        session.user.id = (token as any).id;
        session.user.first_name = (token as any).first_name;
        session.user.role = (token as any).role;
        // Add any other fields you want
      }
      return session;
    },

    async redirect({ url, baseUrl }: {url: string, baseUrl: string }) {
      return `${nextHostUrl}/events`;
    }
  },
  pages: {
    signIn: `${nextHostUrl}/login`
  }
};