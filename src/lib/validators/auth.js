import { z } from "zod";

export const MIN_PASSWORD_LENGTH = 8;

const email = z.string().trim().min(1, "Enter your email address").pipe(z.email("Enter a valid email, like yourname@example.com"));

// SIGN-IN
export const signInSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

// SIGN-UP
export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Enter your name"),
  email,
  password: z.string().min(MIN_PASSWORD_LENGTH, `Use a least ${MIN_PASSWORD_LENGTH} characters`),
});