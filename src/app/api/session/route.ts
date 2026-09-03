import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, destroySession, getCurrentUser } from "@/lib/auth";
import { handle, jsonError } from "@/lib/api";
import { parseEmail } from "@/lib/validation";

/** Who am I? Used by the client to render the account switcher. */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

/** Mocked sign-in: an email is enough, because there are no passwords. */
export async function POST(request: Request) {
  return handle(async () => {
    const email = parseEmail((await request.json()).email);
    const user = await db.user.findUnique({ where: { email } });
    if (!user)
      return jsonError("No seeded account with that email. Try alice@example.com.", 404);

    await createSession(user.id);
    return NextResponse.json({ user });
  });
}

export async function DELETE() {
  await destroySession();
  return NextResponse.json({ ok: true });
}
