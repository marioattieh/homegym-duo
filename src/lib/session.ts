import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isMember, memberByEmail, type Member } from "./members";

export async function currentMember(): Promise<Member | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email || !isMember(email)) return null;
  return memberByEmail(email) ?? null;
}

export async function requireMember(): Promise<Member> {
  const member = await currentMember();
  if (!member) redirect("/");
  return member;
}
