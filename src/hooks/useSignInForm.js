"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

const REDIRECT_URL = "/dashboard";

// Manages sign-in form state and handles Clerk's authentication flow,
// keeping Clerk-specific logic separate from the presentational form.

export function useSignInForm() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isLoaded || isSubmitting) return;
      setError("");
      setIsSubmitting(true);
      try {
        const result = await signIn.create({ identifier: email, password });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(REDIRECT_URL);
        } else {
          setError("Additional verification is required to finish signing in.");
        }
      } catch (err) {
        setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Couldn't sign you in. Check your details and try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isLoaded, isSubmitting, signIn, email, password, setActive, router]
  );

  const submitOAuth = useCallback(
    async (strategy) => {
      if (!isLoaded) return;
      try {
        await signIn.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-in/sso-callback",
          redirectUrlComplete: REDIRECT_URL,
        });
      } catch (err) {
        setError(err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || "Couldn't start that sign-in method.");
      }
    },
    [isLoaded, signIn]
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
