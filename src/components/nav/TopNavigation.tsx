import { LogOut, Settings, GraduationCap, UserCheck, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdmin } from "@/hooks/useAdmin";
import { MoreVertical } from "lucide-react";

interface TopNavigationProps {
  isGrownUpZone?: boolean;
}

export function TopNavigation({ isGrownUpZone = false }: TopNavigationProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { isAdmin } = useAdmin();

  const handleLogout = async () => {
    if (isGrownUpZone) {
      // For grown up zone, just clear session and navigate to home
      sessionStorage.removeItem('kidmindset_parent_auth');
      navigate('/');
    } else {
      // For player view, sign out completely
      await signOut();
    }
  };

  const handleGrownUpZone = () => {
    navigate('/grown-up');
  };

  const handleJoinAcademy = () => {
    // Placeholder - non-functional for now
    console.log('Join the academy clicked');
  };

  const handleIndividualMentorship = () => {
    // Placeholder - non-functional for now
    console.log('Apply for individual mentorship clicked');
  };

  const handleAdminArea = () => {
    navigate('/admin');
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-sm hover:bg-accent"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {!isGrownUpZone && (
            <>
              <DropdownMenuItem onClick={handleGrownUpZone}>
                <Settings className="mr-2 h-4 w-4" />
                Grown Up Zone
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem onClick={handleAdminArea}>
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Dashboard
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
            </>
          )}
          
          {isGrownUpZone && (
            <>
              <DropdownMenuItem onClick={handleJoinAcademy}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Join the Academy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleIndividualMentorship}>
                <UserCheck className="mr-2 h-4 w-4" />
                Apply for Individual Mentorship
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            {isGrownUpZone ? 'Exit Grown Up Zone' : 'Sign Out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}