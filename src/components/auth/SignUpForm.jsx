"use client";

import { useSignUpForm } from "@/hooks/useSignUpForm";
import { Input, FieldHint, Button, FormError } from "@/components/ui";
import { MIN_PASSWORD_LENGTH } from "@/lib/validators/auth";
import { AuthFormLayout } from "./AuthFormLayout";

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
    fieldErrors,
    isSubmitting,
    needsVerification,
    submit,
    submitVerification,
    submitOAuth,
  } = useSignUpForm();

  if (needsVerification) {
    return (
      <AuthFormLayout
        heading="Check your email"
        description={`Enter the verification code we sent to ${email}.`}
      >
        <form onSubmit={submitVerification} noValidate>
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
            className="mt-6"
          />
          <FormError>{error}</FormError>
          <Button
            variant="primary"
            type="submit"
            loading={isSubmitting}
            className="mt-5.5 w-full"
          >
            {isSubmitting ? "Verifying…" : "Verify email"}
          </Button>
        </form>
      </AuthFormLayout>
    );
  }

  return (
    <AuthFormLayout
      heading="Create your account"
      description="Free to start. No card needed."
      oauth={{
        onGoogle: () => submitOAuth("oauth_google"),
        onGithub: () => submitOAuth("oauth_github"),
      }}
      switchTo={{
        prompt: "Already have an account?",
        label: "Sign in",
        href: "/sign-in",
      }}
    >
      <form onSubmit={submit} noValidate>
        <Input
          id="auth-name"
          name="name"
          label="Name"
          variant="text"
          placeholder="Jane Doe"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldErrors.name}
          className="mt-4"
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
          error={fieldErrors.email}
          className="mt-4"
        />
        <Input
          id="auth-pass"
          name="password"
          label="Password"
          variant="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={fieldErrors.password}
          hint={
            <FieldHint met={password.length >= MIN_PASSWORD_LENGTH}>
              Use {MIN_PASSWORD_LENGTH} or more characters.
            </FieldHint>
          }
          className="mt-4"
        />
        <FormError>{error}</FormError>
        <Button
          variant="primary"
          type="submit"
          loading={isSubmitting}
          className="mt-5.5 w-full"
        >
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>

      {/* Required mount point for Clerk's invisible bot-protection challenge */}
      <div id="clerk-captcha" />
    </AuthFormLayout>
  );
}
