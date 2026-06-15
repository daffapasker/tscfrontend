import AuthLayout from "@/layouts/AuthLayout";
import LoginSwitcher from "@/components/LoginSwitcher";

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginSwitcher />
    </AuthLayout>
  );
}