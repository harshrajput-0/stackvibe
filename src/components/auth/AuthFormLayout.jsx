import Link from "next/link";
import { Divider } from "@/components/ui";
import FormHeader from "./FormHeader";
import { SocialButtons } from "./SocialButtons";

/**
 * AuthFormLayout — everything sign in, sign up and the email-verification
 * step have in common: heading, optional social buttons + divider, the form
 * itself (`children`), and an optional "switch to the other page" line.
 *
 * Pass `oauth` ({ onGoogle, onGithub }) to show the social buttons and
 * `switchTo` ({ prompt, label, href }) to show the footer link.
 */
export function AuthFormLayout({
  heading,
  description,
  oauth,
  switchTo,
  children,
}) {
  return (
    <div className="w-full max-w-95">
      <FormHeader heading={heading} description={description} />

      {oauth && (
        <>
          <SocialButtons onGoogle={oauth.onGoogle} onGithub={oauth.onGithub} />
          <Divider className="mt-5.5 mb-1">or use email</Divider>
        </>
      )}

      {children}

      {switchTo && (
        <div className="mt-6.5 text-center text-[13px] text-(--gray-500)">
          {switchTo.prompt}{" "}
          <Link
            href={switchTo.href}
            className="font-semibold text-(--gray-700)! hover:text-(--gray-900)! hover:underline"
          >
            {switchTo.label}
          </Link>
        </div>
      )}
    </div>
  );
}
