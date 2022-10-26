import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

export const authOptions: NextAuthOptions = {
  // Configure one or more authentication providers
  providers: [
    DiscordProvider({
      clientId: process.env.CLIENT_ID as string,
      clientSecret: process.env.CLIENT_SECRET as string,
    }),
  ],

  // When the user signs in, get their token
  callbacks: {
    async jwt({ token, account }) {
      // Persist the user ID to the token right after signin
      if (account) {
        console.log(account);
        token.userId = account.providerAccountId;
      }
      return token;
    },
    
    async session({ session, token, user }) {
      // @ts-ignore
      session.userId = token.userId;
      return session;
    },
  },
};

export default NextAuth(authOptions);
