"use client";

import Link from "next/link";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import { SocialButtons } from "./SocialButtons";
import { Input, Divider, Button } from "../ui";
import FormHeader from "./FormHeader";

export function SignUpForm() {
  const {
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
  } = useSignUpForm();

  if (needsVerification) {
    return (
      <div className="w-full max-w-90">
        <h2>Check your email</h2>
        <p className="sub">Enter the verification code we sent to {email}.</p>
        <form onSubmit={submitVerification}>
          <Input
            id="auth-code"
            name="code"
            label="Verification code"
            variant="text"
            inputMode="numeric"
            placeholder="123456"
            autoComplete="one-time-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
          {error && (
            <div className="field">
              <div className="error">{error}</div>
            </div>
          )}
          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying…" : "Verify email"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-90">
      <FormHeader
        heading="Create your account"
        description="Start building with StackVibe for free"
      />

      <form onSubmit={submit}>
        <Input
          id="auth-name"
          name="name"
          label="Name"
          variant="text"
          placeholder="Jane Doe"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
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
          autoComplete="new-password"
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
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <Divider />
      <SocialButtons
        onGoogle={() => submitOAuth("oauth_google")}
        onGithub={() => submitOAuth("oauth_github")}
      />

      <div className="mt-6.5 text-center text-[13px] text-gray-500">
        Already have an account?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-gray-700! hover:text-gray-900! hover:underline"
        >
          Sign in
        </Link>
      </div>

      {/* Required mount point for Clerk's invisible bot-protection challenge */}
      <div id="clerk-captcha" />
    </div>
  );
}
