import { Suspense } from "react";
import { AccountExperience } from "@/components/account/AccountExperience";

export const metadata = {
  title: "Account | Plus One Caps",
  description:
    "Sign in to view past orders, reuse artwork, and reorder custom hats.",
};

function AccountFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-ink-soft">
      Loading account…
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountExperience />
    </Suspense>
  );
}
