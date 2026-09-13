"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";

const REDIRECT_URL = "/dashboard";

// Manages sign-up form state and handles Clerk's authentication flow,
// including email verification when required.

export function useSignUpForm() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  const submit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isLoaded || isSubmitting) return;
      setError("");
      setIsSubmitting(true);
      try {
        const [firstName, ...rest] = name.trim().split(/\s+/);
        const result = await signUp.create({
          firstName: firstName || undefined,
          lastName: rest.join(" ") || undefined,
          emailAddress: email,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(REDIRECT_URL);
          return;
        }

        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setNeedsVerification(true);
      } catch (err) {
        setError(
          err?.errors?.[0]?.longMessage ||
            err?.errors?.[0]?.message ||
            "Couldn't create your account. Try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isLoaded, isSubmitting, signUp, name, email, password, setActive, router],
  );

  const submitVerification = useCallback(
    async (event) => {
      event.preventDefault();
      if (!isLoaded || isSubmitting) return;
      setError("");
      setIsSubmitting(true);
      try {
        const result = await signUp.attemptEmailAddressVerification({ code });
        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });
          router.push(REDIRECT_URL);
        } else {
          setError("That code didn't work. Please try again.");
        }
      } catch (err) {
        setError(
          err?.errors?.[0]?.longMessage ||
            err?.errors?.[0]?.message ||
            "That code didn't work. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [isLoaded, isSubmitting, signUp, code, setActive, router],
  );

  const submitOAuth = useCallback(
    async (strategy) => {
      if (!isLoaded) return;
      try {
        await signUp.authenticateWithRedirect({
          strategy,
          redirectUrl: "/sign-up/sso-callback",
          redirectUrlComplete: REDIRECT_URL,
        });
      } catch (err) {
        setError(
          err?.errors?.[0]?.longMessage ||
            err?.errors?.[0]?.message ||
            "Couldn't start that sign-up method.",
        );
      }
    },
    [isLoaded, signUp],
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
