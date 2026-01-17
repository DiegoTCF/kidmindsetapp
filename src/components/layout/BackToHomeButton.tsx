import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BackToHomeButtonProps {
  className?: string;
}

export function BackToHomeButton({ className }: BackToHomeButtonProps) {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate('/home-test')}
      className={`flex items-center gap-2 text-muted-foreground hover:text-foreground ${className || ''}`}
    >
      <ArrowLeft className="w-4 h-4" />
      Back to Home
    </Button>
  );
}
