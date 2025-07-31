import { cookies } from "next/headers";
import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";

import db from "./db";
//adapter: where and how
const adapter = new BetterSqlite3Adapter(db, {
  //user:configuration object the name of table, where users will be stored
  //  (needs to know in which DB they are stored)
  user: "users",

  //sessions: where sessions are stored, or where it  should store sessions,
  //  what is the name of a table in DB where is should besotref
  session: "sessions",
});

const lucia = new Lucia(adapter, {
  //automatcily will create this cookie which contains the sessions id
  sessionCookie: {
    expires: false,
    attributes: {
      //entofrce this cookkie to work only in prosuction
      secure: process.env.NODE_ENV === "production",
    },
  },
});

export async function createAuthSession(userId) {
  //automatcily creates a new session session on session table, and automatily creates a new unique session id that belongs to this session
  const session = await lucia.createSession(userId, {});
  //getting data which should br set by a lucia, and pass id to id, where we want to extract it.
  //  and we get an object which should be set as a data for this session
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function verifyAuth() {
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  const sessionId = sessionCookie.value;

  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  //it will look into DB, and try to see if there is such a sessin with this ID, and if it is still a valid session
  const result = await lucia.validateSession(sessionId);

  try {
    if (result.session && result.session.fresh) {
      //recreate and actually prolong it so to say
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}

  //returs shape= return {
  //     user: null,
  //     session: null,
  //   };
  return result;
}

export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    return {
      error: "Unauthorized!",
    };
  }

  //it will reach out to the DB and delete this session under the hood.
  await lucia.invalidateSession(session.id);

  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
