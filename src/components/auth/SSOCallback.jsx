"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";

const REDIRECT_URL = "/dashboard";

export function SSOCallback() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleNavigate = async ({ session, decorateUrl }) => {
    if (session?.currentTask) {
      console.error(
        "[SSOCallback] Unhandled session task:",
        session.currentTask,
      );
      return;
    }
    const url = decorateUrl(REDIRECT_URL);
    if (url.startsWith("http")) {
      window.location.href = url;
    } else {
      router.push(url);
    }
  };

  useEffect(() => {
    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      // Happy path: sign-in completed by the OAuth provider
      if (signIn.status === "complete") {
        await signIn.finalize({ navigate: handleNavigate });
        return;
      }

      // Happy path: brand-new account created via OAuth
      if (signUp.status === "complete") {
        await signUp.finalize({ navigate: handleNavigate });
        return;
      }

      // Transfer: OAuth returned a sign-up, but the user already has an account
      if (signUp.isTransferable) {
        const { error } = await signIn.create({ transfer: true });
        if (!error && signIn.status === "complete") {
          await signIn.finalize({ navigate: handleNavigate });
          return;
        }
      }

      // Transfer: OAuth returned a sign-in, but no account exists yet
      if (signIn.isTransferable) {
        const { error } = await signUp.create({ transfer: true });
        if (!error && signUp.status === "complete") {
          await signUp.finalize({ navigate: handleNavigate });
          return;
        }
      }

      console.error(
        "[SSOCallback] Unhandled OAuth callback state — signIn:",
        signIn.status,
        "signUp:",
        signUp.status,
      );
      router.push("/sign-in");
    })();
  }, [clerk, handleNavigate, router, signIn, signUp]);

  return <div id="clerk-captcha" />;
}
