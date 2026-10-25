import { NextResponse } from "next/server";
import { getCurrentUser, getSessionToken } from "@/lib/auth/session";
import { rpc } from "@/lib/db/rpc";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const [user, token] = [await getCurrentUser(), await getSessionToken()];
  if (!user || !token || !["admissions", "admin"].includes(user.role)) return new NextResponse("Forbidden", { status: 403 });
  try {
    const doc = await rpc<{ file_name: string; mime_type: string; data_base64: string }>("api_get_document", { p_token: token, p_doc: id });
    const safeName = doc.file_name.replace(/[^A-Za-z0-9._ -]/g, "_");
    return new NextResponse(Buffer.from(doc.data_base64, "base64"), {
      headers: {
        "Content-Type": doc.mime_type,
        "Content-Disposition": `attachment; filename="${safeName}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }
}
