import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, RotateCcw, Pause } from 'lucide-react';

type BreathingPhase = 'ready' | 'inhale' | 'hold' | 'exhale';

interface BreathingState {
  phase: BreathingPhase;
  timeLeft: number;
  cycleCount: number;
  isActive: boolean;
}

const PHASE_DURATION = 4; // seconds
const PHASE_CONFIG = {
  inhale: { duration: PHASE_DURATION, text: 'Breathe In', color: 'electric-blue' },
  hold: { duration: PHASE_DURATION, text: 'Hold', color: 'electric-yellow' },
  exhale: { duration: PHASE_DURATION, text: 'Breathe Out', color: 'bright-green' }
};

export const BreathingExercise: React.FC = () => {
  const [state, setState] = useState<BreathingState>({
    phase: 'ready',
    timeLeft: 0,
    cycleCount: 0,
    isActive: false
  });

  const intervalRef = useRef<NodeJS.Timeout>();

  const startExercise = () => {
    setState(prev => ({
      ...prev,
      phase: 'inhale',
      timeLeft: PHASE_DURATION,
      isActive: true
    }));
  };

  const pauseExercise = () => {
    setState(prev => ({ ...prev, isActive: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const resetExercise = () => {
    setState({
      phase: 'ready',
      timeLeft: 0,
      cycleCount: 0,
      isActive: false
    });
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const getNextPhase = (currentPhase: BreathingPhase): BreathingPhase => {
    switch (currentPhase) {
      case 'inhale': return 'hold';
      case 'hold': return 'exhale';
      case 'exhale': return 'inhale';
      default: return 'ready';
    }
  };

  useEffect(() => {
    if (state.isActive && state.phase !== 'ready') {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          if (prev.timeLeft <= 1) {
            const nextPhase = getNextPhase(prev.phase);
            const newCycleCount = nextPhase === 'inhale' ? prev.cycleCount + 1 : prev.cycleCount;
            
            return {
              ...prev,
              phase: nextPhase,
              timeLeft: PHASE_DURATION,
              cycleCount: newCycleCount
            };
          }
          
          return {
            ...prev,
            timeLeft: prev.timeLeft - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isActive, state.phase]);

  const getCircleScale = (): number => {
    if (state.phase === 'ready') return 1;
    if (state.phase === 'inhale') return 1.4;
    if (state.phase === 'hold') return 1.4;
    if (state.phase === 'exhale') return 1;
    return 1;
  };

  const getCircleColor = (): string => {
    if (state.phase === 'ready') return 'hsl(330, 100%, 52%)';
    if (state.phase === 'inhale') return 'hsl(195, 100%, 50%)';
    if (state.phase === 'hold') return 'hsl(54, 100%, 50%)';
    if (state.phase === 'exhale') return 'hsl(150, 100%, 50%)';
    return 'hsl(330, 100%, 52%)';
  };

  const getCurrentPhaseConfig = () => {
    if (state.phase === 'ready') return null;
    return PHASE_CONFIG[state.phase as keyof typeof PHASE_CONFIG];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="title-stadium mb-4">
          4-4-4 BREATHING
        </h1>
        <p className="text-muted-foreground text-lg font-medium">
          Mental Training • Focus Enhancement • Stress Relief
        </p>
      </div>

      {/* Main Breathing Area */}
      <Card className="card-stadium w-full max-w-md mb-8">
        <CardContent className="p-8">
          {/* Breathing Circle */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 mb-8">
              <motion.div
                className="absolute inset-0 rounded-full border-4 flex items-center justify-center"
                style={{ 
                  borderColor: getCircleColor(),
                  backgroundColor: `${getCircleColor()}15`,
                  boxShadow: `0 0 30px ${getCircleColor()}40`
                }}
                animate={{ 
                  scale: getCircleScale(),
                }}
                transition={{ 
                  duration: state.phase === 'ready' ? 0.3 : 4,
                  ease: state.phase === 'ready' ? 'easeInOut' : 'linear'
                }}
              >
                <div className="text-center">
                  <div className="text-6xl font-bebas text-foreground mb-2">
                    {state.phase === 'ready' ? 'READY' : state.timeLeft}
                  </div>
                  <AnimatePresence mode="wait">
                    {getCurrentPhaseConfig() && (
                      <motion.div
                        key={state.phase}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-breathing-guide font-bold"
                      >
                        {getCurrentPhaseConfig()?.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>

            {/* Progress Info */}
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm mb-2">
                Cycles Completed: <span className="text-bright-green font-bold">{state.cycleCount}</span>
              </p>
              {state.phase !== 'ready' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-breathing-guide text-lg"
                >
                  {getCurrentPhaseConfig()?.text} for {state.timeLeft} seconds
                </motion.div>
              )}
            </div>

            {/* Control Buttons */}
            <div className="flex gap-4 w-full">
              {state.phase === 'ready' ? (
                <Button 
                  onClick={startExercise}
                  variant="success"
                  size="lg"
                  className="flex-1 text-lg"
                >
                  <Play className="mr-2 h-5 w-5" />
                  START
                </Button>
              ) : (
                <>
                  <Button 
                    onClick={state.isActive ? pauseExercise : startExercise}
                    variant={state.isActive ? "warning" : "success"}
                    size="lg"
                    className="flex-1"
                  >
                    {state.isActive ? (
                      <>
                        <Pause className="mr-2 h-4 w-4" />
                        PAUSE
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        RESUME
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={resetExercise}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    RESET
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="card-stadium w-full max-w-md">
        <CardContent className="p-6">
          <h3 className="heading-coach text-lg mb-4 text-center">
            How It Works
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center text-electric-blue font-bold text-xs mt-0.5">
                1
              </div>
              <p><span className="text-electric-blue font-bold">Breathe In</span> slowly through your nose for 4 seconds</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-electric-yellow/20 flex items-center justify-center text-electric-yellow font-bold text-xs mt-0.5">
                2
              </div>
              <p><span className="text-electric-yellow font-bold">Hold</span> your breath gently for 4 seconds</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-bright-green/20 flex items-center justify-center text-bright-green font-bold text-xs mt-0.5">
                3
              </div>
              <p><span className="text-bright-green font-bold">Breathe Out</span> slowly through your mouth for 4 seconds</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};