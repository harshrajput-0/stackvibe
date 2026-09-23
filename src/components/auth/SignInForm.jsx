"use client";

import { useSignInForm } from "@/hooks/useSignInForm";
import { Input, Button, FormError } from "@/components/ui";
import { AuthFormLayout } from "./AuthFormLayout";

export function SignInForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    fieldErrors,
    isSubmitting,
    submit,
    submitOAuth,
  } = useSignInForm();

  return (
    <AuthFormLayout
      heading="Sign in"
      description="Welcome back. Choose how you'd like to continue."
      oauth={{
        onGoogle: () => submitOAuth("oauth_google"),
        onGithub: () => submitOAuth("oauth_github"),
      }}
      switchTo={{
        prompt: "New to StackVibe?",
        label: "Create an account",
        href: "/sign-up",
      }}
    >
      <form onSubmit={submit} noValidate>
        <Input
          id="auth-email"
          name="email"
          label="Email"
          variant="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={fieldErrors.email}
          className="mt-4"
        />
        <Input
          id="auth-pass"
          name="password"
          label="Password"
          variant="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          className="mt-4"
        />
        <FormError>{error}</FormError>
        <Button
          variant="primary"
          type="submit"
          loading={isSubmitting}
          className="mt-5.5 w-full"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </AuthFormLayout>
  );
}
