import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Video, FileText, File, CheckCircle2, Clock, Lock, ChevronDown, ChevronUp, Play, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useChildData } from "@/hooks/useChildData";

interface PlayerTask {
  id: string;
  child_id: string;
  title: string;
  description: string | null;
  task_type: 'video' | 'text' | 'file';
  status: 'not_started' | 'in_progress' | 'completed' | 'locked';
  content_url: string | null;
  content_text: string | null;
  file_path: string | null;
  order_index: number;
  due_date: string | null;
  created_at: string;
  completed_at: string | null;
  seen_at: string | null;
}

const taskTypeIcons = {
  video: Video,
  text: FileText,
  file: File,
};

const statusColors = {
  not_started: 'bg-muted text-muted-foreground',
  in_progress: 'bg-warning/20 text-warning',
  completed: 'bg-success/20 text-success',
  locked: 'bg-muted/50 text-muted-foreground',
};

const statusLabels = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  locked: 'Locked',
};

export default function Journey() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { childId, loading: childLoading } = useChildData();
  const [tasks, setTasks] = useState<PlayerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);

  useEffect(() => {
    if (childId) {
      fetchTasks();
      markTasksAsSeen();
    }
  }, [childId]);

  const fetchTasks = async () => {
    if (!childId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('player_tasks')
        .select('*')
        .eq('child_id', childId)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTasks((data as PlayerTask[]) || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load your tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markTasksAsSeen = async () => {
    if (!childId) return;
    
    try {
      await supabase
        .from('player_tasks')
        .update({ seen_at: new Date().toISOString() })
        .eq('child_id', childId)
        .is('seen_at', null);
    } catch (error) {
      console.error('Error marking tasks as seen:', error);
    }
  };

  const markAsComplete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('player_tasks')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status: 'completed' as const, completed_at: new Date().toISOString() }
          : t
      ));

      toast({
        title: "🎉 Task Completed!",
        description: "Great job! Keep up the amazing work!",
      });
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const getNextTask = () => {
    return tasks.find(t => t.status !== 'completed' && t.status !== 'locked');
  };

  const nextTask = getNextTask();

  if (childLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      className="min-h-screen bg-background pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/home-test')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Button>
          
          <h1 className="text-lg font-bold text-foreground">Your Journey</h1>
          
          <div className="w-24" />
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {/* Next Step Card */}
        {nextTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">🎯</span>
                  Your Next Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskCard 
                  task={nextTask} 
                  expanded={true}
                  onToggle={() => {}}
                  onComplete={() => markAsComplete(nextTask.id)}
                  isHighlighted
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* All Tasks */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">All Tasks</h2>
          
          {tasks.length === 0 ? (
            <Card className="bg-muted/30">
              <CardContent className="py-12 text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-muted-foreground">No tasks assigned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your coach will assign tasks for you to complete
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TaskCard
                      task={task}
                      expanded={expandedTask === task.id}
                      onToggle={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      onComplete={() => markAsComplete(task.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface TaskCardProps {
  task: PlayerTask;
  expanded: boolean;
  onToggle: () => void;
  onComplete: () => void;
  isHighlighted?: boolean;
}

function TaskCard({ task, expanded, onToggle, onComplete, isHighlighted }: TaskCardProps) {
  const Icon = taskTypeIcons[task.task_type];
  const isLocked = task.status === 'locked';
  const isCompleted = task.status === 'completed';

  const openContent = () => {
    if (task.content_url) {
      window.open(task.content_url, '_blank');
    }
  };

  return (
    <Card 
      className={`transition-all duration-300 ${
        isHighlighted ? 'ring-2 ring-primary/50' : ''
      } ${isLocked ? 'opacity-60' : ''} ${isCompleted ? 'bg-success/5' : ''}`}
    >
      <CardContent className="p-4">
        {/* Header */}
        <div 
          className="flex items-start gap-3 cursor-pointer"
          onClick={isLocked ? undefined : onToggle}
        >
          {/* Icon */}
          <div className={`p-2 rounded-lg ${isCompleted ? 'bg-success/20' : 'bg-primary/10'}`}>
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : isLocked ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Icon className="w-5 h-5 text-primary" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {task.title}
              </h3>
              <Badge variant="secondary" className={`text-xs ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </Badge>
            </div>
            
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}

            {task.due_date && (
              <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                Due: {new Date(task.due_date).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Expand button */}
          {!isLocked && (
            <Button variant="ghost" size="icon" className="shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && !isLocked && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-border space-y-4">
                {/* Task Content */}
                {task.task_type === 'video' && task.content_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Video Task</p>
                    <Button 
                      onClick={openContent}
                      className="w-full flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch Video
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </div>
                )}

                {task.task_type === 'text' && task.content_text && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Instructions</p>
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground whitespace-pre-wrap">
                      {task.content_text}
                    </div>
                  </div>
                )}

                {task.task_type === 'file' && task.content_url && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">File Task</p>
                    <Button 
                      onClick={openContent}
                      variant="outline"
                      className="w-full flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download File
                      <ExternalLink className="w-3 h-3 ml-auto" />
                    </Button>
                  </div>
                )}

                {/* Complete Button */}
                {!isCompleted && (
                  <Button 
                    onClick={onComplete}
                    className="w-full bg-success hover:bg-success/90"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </Button>
                )}

                {isCompleted && task.completed_at && (
                  <p className="text-xs text-muted-foreground text-center">
                    Completed on {new Date(task.completed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
