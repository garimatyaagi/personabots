import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "rounded-xl border border-border shadow-none bg-white/60",
          },
        }}
      />
    </div>
  );
}
