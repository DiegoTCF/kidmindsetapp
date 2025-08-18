import { useProfile } from "@/hooks/useProfile";
import { useChildData } from "@/hooks/useChildData";

export function DNAReminder() {
  const { profile } = useProfile();
  const { childId } = useChildData();

  console.log('[DNAReminder] profile:', profile, 'childId:', childId);

  if (!profile?.role) {
    return null;
  }

  return (
    <div className="bg-white/10 border border-white/20 rounded-lg p-3 mb-4">
      <h4 className="font-bold text-white mb-2">Remember Who You Are</h4>
      <p className="text-sm text-white"><strong>Role:</strong> {profile.role}</p>
      {profile.strengths && profile.strengths.length > 0 && (
        <p className="text-sm text-white"><strong>Strengths:</strong> {profile.strengths.join(', ')}</p>
      )}
      {profile.help_team && profile.help_team.length > 0 && (
        <p className="text-sm text-white"><strong>How I Help:</strong> {profile.help_team.join(', ')}</p>
      )}
    </div>
  );
}