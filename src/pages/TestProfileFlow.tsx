import CompleteProfileFlow from "@/components/Profile/CompleteProfileFlow";

export default function TestProfileFlow() {
  const handleComplete = () => {
    console.log('Profile completed!');
  };

  return <CompleteProfileFlow onComplete={handleComplete} />;
}
