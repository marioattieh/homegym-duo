import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isMember } from "@/lib/members";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 90 },
  pages: { signIn: "/", error: "/" },
  trustHost: true,
  callbacks: {
    signIn({ profile }) {
      return Boolean(profile?.email_verified) && isMember(profile?.email);
    },
  },
});
