"use client";

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "http://localhost:3000/storyboard",
      },
    });

    if (error) console.error("Login error:", error.message);
  };

  return (
    <div>
      <div className="absolute top-0 right-0 m-4 z-10">
        <button
          onClick={handleGoogleLogin}
          className="bg-black text-white font-bold px-8 py-3 rounded-[3px] shadow-none"
        >
          Log in
        </button>
      </div>
      <img
        src="/heropage.png"
        alt="Hero Image"
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
    </div>
  );
}
