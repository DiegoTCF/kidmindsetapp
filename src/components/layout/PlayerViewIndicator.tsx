import { ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminPlayerView } from '@/hooks/useAdminPlayerView';
import { useNavigate } from 'react-router-dom';

export function PlayerViewIndicator() {
  const { isViewingAsPlayer, selectedChild, clearPlayerView } = useAdminPlayerView();
  const navigate = useNavigate();

  if (!isViewingAsPlayer || !selectedChild) {
    return null;
  }

  const handleExitPlayerView = () => {
    clearPlayerView();
    navigate('/admin');
  };

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge variant="secondary" className="bg-primary/20 text-primary">
          <Eye className="w-3 h-3 mr-1" />
          Player View
        </Badge>
        <span className="text-sm font-medium">
          Viewing as <strong>{selectedChild.name}</strong>
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExitPlayerView}
        className="text-xs"
      >
        <ArrowLeft className="w-3 h-3 mr-1" />
        Back to Admin
      </Button>
    </div>
  );
}