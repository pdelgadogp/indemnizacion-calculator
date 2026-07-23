import PasswordGate from "@/components/password-gate";
import Calculator from "@/components/calculator";

export default function Home() {
  return (
    <PasswordGate>
      <Calculator />
    </PasswordGate>
  );
}
