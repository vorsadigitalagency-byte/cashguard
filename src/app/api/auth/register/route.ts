import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export async function POST(req: NextRequest) {
  let body: {
    fullName?: string;
    nickName?: string;
    email?: string;
    password?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { fullName, nickName, email, password } = body;

  if (!fullName?.trim() || !email?.trim() || !password) {
    return NextResponse.json(
      { error: "Full name, email, and password are required" },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const SAFE_ROLE = "cashier";

  const { data, error: signUpError } =
    await adminSupabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName.trim() },
    });

  if (signUpError || !data.user) {
    const msg = signUpError?.message?.includes("already")
      ? "An account with this email already exists"
      : "Registration failed. Please try again.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const { error: profileError } = await adminSupabase
    .from("profiles")
    .insert({
      user_id: data.user.id,
      full_name: fullName.trim(),
      nick_name: nickName?.trim() || null,
      role: SAFE_ROLE,
    });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(data.user.id);
    return NextResponse.json(
      { error: "Failed to create profile. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
