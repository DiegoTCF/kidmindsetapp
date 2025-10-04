import CompleteProfileFlow from "@/components/Profile/CompleteProfileFlow";
import { AuthProvider } from "@/hooks/useAuth";

export default function TestProfileFlow() {
  const handleComplete = () => {
    console.log('Profile completed!');
    alert('Profile flow completed!');
  };

  return (
    <AuthProvider>
      <CompleteProfileFlow onComplete={handleComplete} />
    </AuthProvider>
  );
}
