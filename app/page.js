import AuthForm from "@/components/auth-form";

export default async function Home({ searchParams }) {
  //this prop is automatcily added to all page components by nextJS
  //will contain an object that has one key,
  //  for any query parameter that might have been set to the currently active URL
  const formMode = searchParams.mode || "login";
  return <AuthForm mode={formMode} />;
}
