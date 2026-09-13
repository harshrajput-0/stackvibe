"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

const REDIRECT_URL = "/dashboard";

// Handles sign-ip form state and Clerk authentication,
// including email verification when needed.

export function useSignInForm() {
  const { signIn, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isSubmitting = fetchStatus === "fetching";

  const navigate = useCallback(
    async ({ session, decorateUrl }) => {
      if (session?.currentTask) return;
      const url = decorateUrl(REDIRECT_URL);
      if (url.startsWith("http")) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    },
    [router],
  );

  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");

      const { error: submitError } = await signIn.password({
        emailAddress: email,
        password,
      });

      if (submitError) {
        setError(
          submitError?.errors?.[0]?.longMessage ||
            submitError?.message ||
            "Couldn't sign you in. Check your details and try again.",
        );
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize({ navigate });
      } else if (signIn.status === "needs_second_factor") {
        setError("Additional verification is required to finish signing in.");
      } else if (signIn.status === "needs_client_trust") {
        setError(
          "We don't recognize this device. Check your email for a verification code.",
        );
      } else {
        setError("Couldn't sign you in. Check your details and try again.");
      }
    },
    [signIn, email, password, navigate],
  );

  const submitOAuth = useCallback(
    async (strategy) => {
      setError("");
      const { error: oauthError } = await signIn.sso({
        strategy,
        redirectCallbackUrl: "/sign-in/sso-callback",
        redirectUrl: REDIRECT_URL,
      });
      if (oauthError) {
        setError(
          oauthError?.errors?.[0]?.longMessage ||
            oauthError?.message ||
            "Couldn't start that sign-in method.",
        );
      }
    },
    [signIn],
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    submit,
    submitOAuth,
  };
}
