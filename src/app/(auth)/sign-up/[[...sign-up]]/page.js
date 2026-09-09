import { AuthScreen } from "@/components/auth/AuthScreen";
import { SignUpForm } from "@/components/auth/SignUpForm";

const page = () => {
  return (
    <AuthScreen>
        <SignUpForm />
    </AuthScreen>
  )
}

export default page