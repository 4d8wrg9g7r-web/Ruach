import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn } from "../../auth";

async function loginAction(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (err) {
    if (err instanceof AuthError) {
      redirect("/login?error=invalid");
    }
    throw err;
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-2xl font-semibold">Sign in to Ruach</h1>
      <p className="mb-6 text-sm text-slate-500">
        Dev seed login: <code>owner@ruach.dev</code> / <code>devpassword123</code>
      </p>
      {params.error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">Invalid email or password.</p>}
      <form action={loginAction} className="flex flex-col gap-3">
        <label className="text-sm font-medium">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button type="submit" className="mt-2 rounded bg-blue-600 px-3 py-2 font-medium text-white hover:bg-blue-700">
          Sign in
        </button>
      </form>
    </main>
  );
}
