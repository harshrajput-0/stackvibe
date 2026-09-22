"use client";

import Link from "next/link";
import { useSignInForm } from "@/hooks/useSignInForm";
import { SocialButtons } from "./SocialButtons";
import { Input, Divider, Button } from "@/components/ui";
import FormHeader from "./FormHeader";

export function SignInForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    isSubmitting,
    submit,
    submitOAuth,
  } = useSignInForm();

  return (
    <div className="w-full max-w-90">
      <FormHeader
        heading="Sign in"
        description="Welcome back. Choose how you'd like to continue."
      />
      <SocialButtons
        onGoogle={() => submitOAuth("oauth_google")}
        onGithub={() => submitOAuth("oauth_github")}
      />

      <Divider />

      <form onSubmit={submit}>
        <Input
          id="auth-email"
          name="email"
          label="Email"
          variant="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
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
          required
        />
        {error && (
          <div className="field">
            <div className="error">{error}</div>
          </div>
        )}
        <Button
          variant="primary"
          type="submit"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>



      <div className="mt-6.5 text-center text-[13px] text-gray-500">
        New to StackVibe?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-gray-700! hover:text-gray-900! hover:underline"
        >
          Create an account
        </Link>
      </div>
    </div>
  );
}
