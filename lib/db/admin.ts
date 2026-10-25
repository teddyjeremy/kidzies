import "server-only";
import { rpc } from "@/lib/db/rpc";

export interface AdminStudent { id: string; first_name: string; last_name: string; nickname: string | null; level: string; account_id: string | null; student_code: string | null; status: string | null; protected: boolean; last_login_at: string | null; classes: { id: string; name: string }[]; guardians: { id: string; name: string }[] }
export interface AdminGuardian { id: string; name: string; email: string; phone: string | null; has_login: boolean; account_status: string | null; children: { id: string; name: string; relationship: string }[] }
export interface AdminTeacher { id: string; name: string; email: string; account_id: string | null; status: string | null; protected: boolean; classes: { id: string; name: string }[] }
export interface AdminClass { id: string; name: string; level: string; school_year: string; student_count: number; teachers: { id: string; name: string }[] }
export interface AuditRow { id: string; action: string; actor: string | null; actor_role: string | null; target_type: string | null; target_id: string | null; details: unknown; created_at: string }

type Sections = { students: AdminStudent; guardians: AdminGuardian; teachers: AdminTeacher; classes: AdminClass; audit: AuditRow };

export function adminList<K extends keyof Sections>(token: string, section: K, search = ""): Promise<Sections[K][]> {
  return rpc<Sections[K][]>("api_admin_list", { p_token: token, p_section: section, p_search: search.slice(0, 80) });
}
