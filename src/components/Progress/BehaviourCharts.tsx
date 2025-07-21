import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { CustomIcon } from "@/components/ui/custom-emoji";
import { supabase } from "@/integrations/supabase/client";

interface BehaviourData {
  behaviour_type: string;
  question_1_rating: number;
  question_2_rating: number;
  question_3_rating: number;
  question_4_rating: number;
  average_score: number;
}

interface BehaviourChartsProps {
  selectedFilter: string;
}

const BEHAVIOUR_CONFIG = {
  brave_on_ball: {
    icon: "flame",
    title: "Brave on the Ball",
    subtitle: "Trying forward actions, dribbling, risky passes",
    questions: [
      "How often did you try to take players on or play forward?",
      "How much intent did you show when doing it — did you really go for it?",
      "Did you take risks even when you made mistakes or lost the ball?",
      "How much did you play to win your 1v1s, not just avoid losing the ball?"
    ],
    scales: [
      "(1 = Not at all, 10 = All the time)",
      "(1 = Hesitant / Half-hearted, 10 = Full commitment every time)",
      "(1 = I avoided it after mistakes, 10 = I kept trying and stayed brave)",
      "(1 = Playing it safe, 10 = Attacking every 1v1 with purpose)"
    ]
  },
  brave_off_ball: {
    icon: "brain",
    title: "Brave off the Ball",
    subtitle: "Getting into the game, showing for the ball, staying involved",
    questions: [
      "How often did you show for the ball or move into space?",
      "How much intent did you show when trying to get involved?",
      "Did you keep moving even when things weren't going well?",
      "Did you create good angles and options for your teammates?"
    ],
    scales: [
      "(1 = I hid or waited, 10 = I was always available and active)",
      "(1 = Passive movements, 10 = Sharp, purposeful movements)",
      "(1 = I gave up a bit, 10 = I kept trying no matter what)",
      "(1 = Rarely, 10 = Constantly helped the team with my positioning)"
    ]
  },
  electric: {
    icon: "trophy",
    title: "Electric",
    subtitle: "Energy, speed, quick reactions, intensity",
    questions: [
      "How much energy did you bring to the game today?",
      "How quick were your reactions during the game?",
      "How fast and sharp were your decisions?",
      "Did you move with speed and urgency when the team needed it?"
    ],
    scales: [
      "(1 = Very flat, 10 = Full of energy the whole time)",
      "(1 = Slow to react, 10 = Switched on and alert)",
      "(1 = I delayed or hesitated, 10 = I made fast, confident choices)",
      "(1 = I jogged or walked a lot, 10 = I exploded into actions)"
    ]
  },
  aggressive: {
    icon: "target",
    title: "Aggressive",
    subtitle: "Competing, pressing, tackling, 1v1 duels",
    questions: [
      "How often did you go into 1v1 duels or physical challenges?",
      "When you pressed or challenged, how committed were you?",
      "How often did you win your battles or at least make it difficult?",
      "How much did you enjoy competing and fighting for the ball?"
    ],
    scales: [
      "(1 = Avoided them, 10 = Went into everything)",
      "(1 = Soft / hesitant, 10 = 100% effort every time)",
      "(1 = Lost most or backed out, 10 = Made it a real fight every time)",
      "(1 = Didn't enjoy it, 10 = Loved the challenge and looked for it)"
    ]
  }
};

const CircularProgress = ({ percentage, size = 120, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff0066"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-bold text-foreground">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const SmallCircularProgress = ({ percentage, size = 60, strokeWidth = 4 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#ff0066"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-foreground">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

export default function BehaviourCharts({ selectedFilter }: BehaviourChartsProps) {
  const [behaviourData, setBehaviourData] = useState<{ [key: string]: BehaviourData }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBehaviourData();
  }, [selectedFilter]);

  const loadBehaviourData = async () => {
    try {
      setLoading(true);
      
      // Get current child ID
      const { data: children } = await supabase
        .from('children')
        .select('id')
        .limit(1);
      
      if (!children || children.length === 0) {
        setLoading(false);
        return;
      }
      
      const childId = children[0].id;

      // Get all behaviour ratings for this child
      const { data: ratings, error } = await supabase
        .from('super_behaviour_ratings')
        .select('*')
        .eq('child_id', childId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (ratings && ratings.length > 0) {
        // Process ratings by behaviour type
        const processedData: { [key: string]: BehaviourData } = {};
        
        // Group ratings by behaviour type and calculate averages
        const groupedRatings: { [key: string]: BehaviourData[] } = {};
        
        ratings.forEach(rating => {
          if (!groupedRatings[rating.behaviour_type]) {
            groupedRatings[rating.behaviour_type] = [];
          }
          groupedRatings[rating.behaviour_type].push(rating as BehaviourData);
        });

        // Calculate averages for each behaviour type
        Object.entries(groupedRatings).forEach(([behaviourType, behavioursArray]) => {
          const avgQ1 = behavioursArray.reduce((sum, b) => sum + (b.question_1_rating || 0), 0) / behavioursArray.length;
          const avgQ2 = behavioursArray.reduce((sum, b) => sum + (b.question_2_rating || 0), 0) / behavioursArray.length;
          const avgQ3 = behavioursArray.reduce((sum, b) => sum + (b.question_3_rating || 0), 0) / behavioursArray.length;
          const avgQ4 = behavioursArray.reduce((sum, b) => sum + (b.question_4_rating || 0), 0) / behavioursArray.length;
          const avgOverall = (avgQ1 + avgQ2 + avgQ3 + avgQ4) / 4;

          processedData[behaviourType] = {
            behaviour_type: behaviourType,
            question_1_rating: avgQ1,
            question_2_rating: avgQ2,
            question_3_rating: avgQ3,
            question_4_rating: avgQ4,
            average_score: avgOverall
          };
        });

        setBehaviourData(processedData);
      }
    } catch (error) {
      console.error('Error loading behaviour data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {Object.keys(BEHAVIOUR_CONFIG).map(behaviourType => (
          <Card key={behaviourType} className="shadow-soft">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-muted rounded-full"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="text-center space-y-2">
                      <div className="w-16 h-16 bg-muted rounded-full mx-auto"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-foreground mb-2">
          🌟 Super Behaviour Analysis
        </h2>
        <p className="text-muted-foreground">
          Your detailed performance across the 4 core football behaviours
        </p>
      </div>

      {Object.entries(BEHAVIOUR_CONFIG).map(([behaviourType, config]) => {
        const data = behaviourData[behaviourType];
        
        if (!data) {
          return (
            <Card key={behaviourType} className="shadow-soft">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <CustomIcon type={config.icon as any} size="xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">{config.title}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{config.subtitle}</p>
                  <div className="text-muted-foreground py-8">
                    <p className="text-sm">Complete some activities to see your {config.title.toLowerCase()} analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }

        const overallPercentage = (data.average_score / 10) * 100;
        const questionPercentages = [
          (data.question_1_rating / 10) * 100,
          (data.question_2_rating / 10) * 100,
          (data.question_3_rating / 10) * 100,
          (data.question_4_rating / 10) * 100
        ];

        return (
          <Card key={behaviourType} className="shadow-soft">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="mb-2 flex justify-center">
                  <CustomIcon type={config.icon as any} size="xl" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{config.title}</h3>
                <p className="text-sm text-muted-foreground">{config.subtitle}</p>
              </div>

              {/* Large Overall Chart */}
              <div className="flex justify-center mb-8">
                <div className="text-center">
                  <CircularProgress percentage={overallPercentage} size={140} strokeWidth={10} />
                  <p className="text-sm font-medium text-foreground mt-3">Overall Average</p>
                  <p className="text-xs text-muted-foreground">{data.average_score.toFixed(1)}/10</p>
                </div>
              </div>

              {/* Individual Question Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.questions.map((question, index) => (
                  <div key={index} className="text-center space-y-3">
                    <div className="flex justify-center">
                      <SmallCircularProgress 
                        percentage={questionPercentages[index]} 
                        size={70} 
                        strokeWidth={5} 
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-foreground leading-tight">{question}</p>
                      <p className="text-xs text-muted-foreground leading-tight">{config.scales[index]}</p>
                      <p className="text-xs font-semibold text-primary">
                        Score: {(() => {
                          const scores = [data.question_1_rating, data.question_2_rating, data.question_3_rating, data.question_4_rating];
                          return scores[index]?.toFixed(1) || 0;
                        })()} /10
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}