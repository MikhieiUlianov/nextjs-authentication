"use server";
import { redirect } from "next/navigation";

import { hashUserPassword, verifyPassword } from "@/lib/hash";
import createUser, { getUserByEmail } from "@/lib/user";
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

export async function login(prvState, formData) {
  const email = formData.get("email");
  const password = formData.get("password");

  const existingUser = getUserByEmail(email);

  if (!existingUser) {
    return {
      errors: {
        email: "Invalid credentials was untered.",
      },
    };
  }
  const isValidPassword = verifyPassword(existingUser.password, password);
  if (!existinisValidPasswordgUser) {
    return {
      errors: {
        password: "Invalid credentials was untered.",
      },
    };
  }
  await createAuthSession(existingUser.id);
  redirect("/training");
}
export async function auth(mode, prevState, formData) {
  if (mode === "login") {
    login(prevState, formData);
  }
  signup(prevState, formData);
}
