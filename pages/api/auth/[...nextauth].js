import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import { connectToDatabase } from "../../../lib/db";
import { verifyPassword } from "../../../lib/auth";

export default NextAuth({
  session: true,
  providers: [
    Providers.Credentials({
      async authorize(credentials) {
        const client = await connectToDatabase();
        const usersCollection = client.db().collection("users");
        const existUser = usersCollection.findOne({ email: credentials.email });

        if (!existUser) {
          client.close();
          throw new Error("Account does not exist");
        }

        const isValid = await verifyPassword(
          credentials.password,
          existUser.password
        );

        if (!isValid) {
          client.close();
          throw new Error("Password is not valid.");
        }
        return { email: existUser.email };
        client.close();
      },
    }),
  ],
});
