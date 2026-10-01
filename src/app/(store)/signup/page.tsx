import { permanentRedirect } from "next/navigation";

// /signup — brief deliverable alias. Registration at Patel Networks happens
// through the OTP flow (first sign-in creates the account and asks for a
// name), so this entry point lands on the same flow — no separate password
// signup exists in the client's auth backend.

export default function SignupAliasPage() {
  permanentRedirect("/account/login");
}
