import { rpc } from "@/lib/db/rpc";
import { requireRole } from "@/lib/auth/session";
import { PlaygroundHome } from "@/components/playground/PlaygroundHome";
import type { StudentHome } from "@/types";

export default async function PlaygroundPage() {
  const { token } = await requireRole(["student"]);
  const home = await rpc<StudentHome>("api_student_home", { p_token: token });
  return <PlaygroundHome home={home} />;
}
