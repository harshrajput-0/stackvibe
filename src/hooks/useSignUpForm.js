"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";

const REDIRECT_URL = "/dashboard";

// Handles sign-up form state and Clerk authentication,
// including email verification when needed.

export function useSignUpForm() {
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

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

      const [firstName, ...rest] = name.trim().split(/\s+/);

      const { error: submitError } = await signUp.password({
        emailAddress: email,
        password,
        firstName: firstName || undefined,
        lastName: rest.join(" ") || undefined,
      });

      if (submitError) {
        setError(
          submitError?.errors?.[0]?.longMessage ||
            submitError?.message ||
            "Couldn't create your account. Try again.",
        );
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({ navigate });
        return;
      }

      const { error: codeError } = await signUp.verifications.sendEmailCode();
      if (codeError) {
        setError(
          codeError?.errors?.[0]?.longMessage ||
            codeError?.message ||
            "Couldn't send a verification code. Try again.",
        );
        return;
      }
      setNeedsVerification(true);
    },
    [signUp, name, email, password, navigate],
  );

  const submitVerification = useCallback(
    async (event) => {
      event.preventDefault();
      setError("");

      const { error: verifyError } = await signUp.verifications.verifyEmailCode(
        { code },
      );

      if (verifyError) {
        setError("That code didn't work. Please try again.");
        return;
      }

      if (signUp.status === "complete") {
        await signUp.finalize({ navigate });
      } else {
        setError("That code didn't work. Please try again.");
      }
    },
    [signUp, code, navigate],
  );

  const submitOAuth = useCallback(
    async (strategy) => {
      setError("");
      const { error: oauthError } = await signUp.sso({
        strategy,
        redirectCallbackUrl: "/sign-up/sso-callback",
        redirectUrl: REDIRECT_URL,
      });
      if (oauthError) {
        setError(
          oauthError?.errors?.[0]?.longMessage ||
            oauthError?.message ||
            "Couldn't start that sign-up method.",
        );
      }
    },
    [signUp],
  );

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    code,
    setCode,
    error,
    isSubmitting,
    needsVerification,
    submit,
    submitVerification,
    submitOAuth,
  };
}
