import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useProfile } from "@/hooks/useProfile";

interface DNADisplayProps {
  onEdit: () => void;
}

export function DNADisplay({ onEdit }: DNADisplayProps) {
  const { profile } = useProfile();

  if (!profile?.role || !profile?.strengths?.length) {
    return null;
  }

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-bold">YOUR DNA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Strengths:</strong> {profile.strengths.join(', ')}</p>
        <p><strong>How I Help:</strong> {profile.help_team?.join(', ') || 'None selected'}</p>
        <Button 
          onClick={onEdit} 
          variant="outline"
          className="mt-3"
        >
          Edit
        </Button>
      </CardContent>
    </Card>
  );
}