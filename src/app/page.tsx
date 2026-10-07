import { currentMember } from "@/lib/session";
import { Landing } from "@/components/landing/landing";

export default async function Home({ searchParams }: PageProps<"/">) {
  const [member, params] = await Promise.all([currentMember(), searchParams]);
  const error = typeof params.error === "string" ? params.error : null;
  return <Landing signedInAs={member?.name ?? null} error={error} />;
}
