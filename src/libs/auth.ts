import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
import bcrypt from 'bcryptjs';
import { user } from "@/db/schemas/user";
import { eq, sql } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { v4 as uuidv4 } from "uuid";

export const options = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const foundUser = await db
          .select()
          .from(user)
          .where(eq(user.email, credentials.email))
          .limit(1)
          .then((res) => res[0]);

        if (!foundUser) {
          throw new Error("No user found with this email.");
        }

        if (!foundUser.isVerified && foundUser.activationToken) {
          throw new Error("Please verify your email before logging in.");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          foundUser.password
        );
        if (!isValid) {
          throw new Error("Password does not match.");
        }

        return foundUser;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "google" || account.provider === "github") {
        const email = user.email;

        // Check if the user already exists in the database
        let foundUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email))
          .limit(1)
          .then((res) => res[0]);

        if (!foundUser) {
          // If the user doesn't exist, create a new user
          foundUser = await db
            .insert(user)
            .values({
              email: email,
              username: profile.login || profile.name || email.split("@")[0], // Fallback to email prefix if no username
              name: profile.name || email.split("@")[0],
              image: profile.picture || user.image,
              roles: sql`'["user"]'::json`, // Assign default role 'user'
              isVerified: true, // Consider OAuth users as verified
              activationToken: uuidv4(),
            })
            .returning()
            .then((res) => res[0]);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles; // Updated to handle multiple roles as JSON
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.roles = token.roles; // Updated to handle multiple roles
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export async function getSession(req: unknown) {
  return await getServerSession(options);
}


// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
// import { user } from "@/db/schemas/user";
// import { eq } from "drizzle-orm";
// import { getServerSession } from "next-auth/next";
// import { v4 as uuidv4 } from "uuid";

// export const options = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID as string,
//       clientSecret: process.env.GITHUB_SECRET as string,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID as string,
//       clientSecret: process.env.GOOGLE_SECRET as string,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials: any) {
//         const foundUser = await db
//           .select()
//           .from(user)
//           .where(eq(user.email, credentials.email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           throw new Error("No user found with this email.");
//         }

//         if (!foundUser.isVerified && foundUser.activationToken) {
//           throw new Error("Please verify your email before logging in.");
//         }

//         const isValid = await bcrypt.compare(
//           credentials.password,
//           foundUser.password
//         );
//         if (!isValid) {
//           throw new Error("Password does not match.");
//         }

//         return foundUser;
//       },
//     }),
//   ],
//   callbacks: {
//     async signIn({ user, account, profile }) {
//       if (account.provider === "google" || account.provider === "github") {
//         const email = user.email;

//         // Check if the user already exists in the database
//         let foundUser = await db
//           .select()
//           .from(user)
//           .where(eq(user.email, email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           // If the user doesn't exist, create a new user
//           foundUser = await db
//             .insert(user)
//             .values({
//               email: email,
//               username: profile.login || profile.name || email.split("@")[0], // Fallback to email prefix if no username
//               name: profile.name || email.split("@")[0],
//               image: profile.picture || user.image,
//               role: "user",
//               isVerified: true, // Consider OAuth users as verified
//               activationToken: uuidv4(),
//             })
//             .returning()
//             .then((res) => res[0]);
//         }
//       }
//       return true;
//     },
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.user.role = token.role;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// };

// export async function getSession() {
//   return await getServerSession(options);
// }

// import GitHubProvider from "next-auth/providers/github";
// import GoogleProvider from "next-auth/providers/google";
// import CredentialsProvider from "next-auth/providers/credentials";
// import { db } from "@/db"; // Ensure this path is correct
// import bcrypt from "bcrypt";
// import { user } from "@/db/schemas/user";
// import { eq } from "drizzle-orm";
// import { getServerSession } from "next-auth/next";

// export const options = {
//   providers: [
//     GitHubProvider({
//       clientId: process.env.GITHUB_ID,
//       clientSecret: process.env.GITHUB_SECRET,
//     }),
//     GoogleProvider({
//       clientId: process.env.GOOGLE_ID,
//       clientSecret: process.env.GOOGLE_SECRET,
//     }),
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "email" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         // Fetch user from database
//         const foundUser = await db
//           .select()
//           .from(user)
//           .where(eq(user.email, credentials.email))
//           .limit(1)
//           .then((res) => res[0]);

//         if (!foundUser) {
//           throw new Error("No user found with this email.");
//         }

//         // // Check if user is verified
//         if (!foundUser.isVerified && foundUser.activationToken) {
//           throw new Error("Please verify your email before logging in.");
//         }

//         // Validate password
//         const isValid = await bcrypt.compare(credentials.password, foundUser.password);
//         if (!isValid) {
//           throw new Error("Password does not match.");
//         }

//         return foundUser;
//       },
//     }),
//   ],
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       session.user.role = token.role;
//       return session;
//     },
//   },
//   secret: process.env.NEXTAUTH_SECRET,
//   pages: {
//     signIn: "/login",
//   },
// };

// export async function getSession() {
//   return await getServerSession(options);
// }
