"use server";
import { redirect } from "next/navigation";

import { hashUserPassword } from "@/lib/hash";
import createUser from "@/lib/user";
import { createAuthSession } from "@/lib/auth";

export async function signup(prevState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");
  let errors = {};

  if (!email.includes("@")) {
    errors.email = "Please enter a valid email address.";
  }
  if (!password.trim().length > 8) {
    errors.email = "Password must be at least 8 characters long.";
  }

  if (Object.keys(errors).length > 0) return { errors };

  const hashedPassword = hashUserPassword(password);

  try {
    const id = createUser(email, hashedPassword);
    await createAuthSession(id);
    redirect("/training");
  } catch (error) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return {
        errors: {
          email: "It seems like an account for the chosen email already exist",
        },
      };
    }
    throw error;
  }
}

/* 
Session = it is how long user dont need to log in again, so within e.g. 30 days, user can just open the web, and browser will automatcly send cookie to the server, so it is recognized users data, like api or smth like this.
 My understanding how cookies works: user creates an account. When user click create, data is send to the server, server recognize data, and set this data to the users db, with id. At the same time it creates a session, which sets this timer for 30 days, which can let user not to log in again, and just enter the web. When user try to log in within this 30 says, browser, still remember this cookie in memory, then it sends to the server, server take this cookie, and try to find a session with the same session id, if it finds, it sends response, which we can get, and depend on the response, manage accesibility. is it correct understanding ?  */
