import { AuthScreen } from "@/components/auth/AuthScreen";
import { SignInForm } from "@/components/auth/SignInForm";

const page = () => {
  return (
    <AuthScreen>
      <SignInForm />
    </AuthScreen>
  );
};

export default page;
