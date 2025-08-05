import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, Target, TrendingUp, Zap, Wind, Heart, Trophy, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Hero Section */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="heading-process mb-6">
            YOUR PROCESS
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium leading-relaxed">
            Desenvolva o mindset de um campeão.<br />
            <span className="text-impact">Treine sua mente como treina seu corpo.</span>
          </p>
          
          {/* Overall Progress */}
          <div className="max-w-md mx-auto mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Overall Confidence</span>
              <span className="text-lg font-bebas text-neon-pink">73%</span>
            </div>
            <div className="relative">
              <Progress value={73} className="h-4 progress-premium" />
              <div className="absolute inset-0 bg-gradient-to-r from-neon-pink via-electric-blue to-bright-green opacity-90 rounded-full" 
                   style={{ width: '73%' }} />
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center mb-12 max-w-lg mx-auto">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4 flex-1"
            onClick={() => navigate('/breathing')}
          >
            <Wind className="mr-2 h-5 w-5" />
            BREATHING
          </Button>
          <Button variant="secondary" size="lg" className="text-lg px-8 py-4 flex-1">
            <Brain className="mr-2 h-5 w-5" />
            PROGRESS
          </Button>
        </motion.div>

        {/* Main Features Grid */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="card-stadium card-glow-pink">
            <CardHeader>
              <div className="w-12 h-12 bg-neon-pink/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-neon-pink" />
              </div>
              <CardTitle>MINDSET TRAINING</CardTitle>
              <CardDescription>
                Desenvolva confiança, foco e mentalidade vencedora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                EXPLORAR TÉCNICAS
              </Button>
            </CardContent>
          </Card>

          <Card className="card-stadium card-glow-blue">
            <CardHeader>
              <div className="w-12 h-12 bg-electric-blue/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-electric-blue" />
              </div>
              <CardTitle>GOAL SETTING</CardTitle>
              <CardDescription>
                Defina e alcance seus objetivos no futebol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                DEFINIR METAS
              </Button>
            </CardContent>
          </Card>

          <Card className="card-stadium card-glow-green">
            <CardHeader>
              <div className="w-12 h-12 bg-bright-green/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-bright-green" />
              </div>
              <CardTitle>PROGRESS TRACKING</CardTitle>
              <CardDescription>
                Acompanhe sua evolução mental e técnica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="success" className="w-full">
                VER ESTATÍSTICAS
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Mindset Tools Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <h2 className="heading-coach text-center mb-8">
            MINDSET TOOLS
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="card-stadium card-glow-blue hover:card-glow-blue cursor-pointer">
              <CardContent className="p-6 text-center">
                <Wind className="h-8 w-8 text-electric-blue mx-auto mb-3" />
                <h3 className="font-bebas text-lg uppercase tracking-wide mb-2">BREATHING</h3>
                <p className="text-sm text-muted-foreground">4-4-4 Technique</p>
              </CardContent>
            </Card>

            <Card className="card-stadium card-glow-yellow hover:card-glow-yellow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Heart className="h-8 w-8 text-electric-yellow mx-auto mb-3" />
                <h3 className="font-bebas text-lg uppercase tracking-wide mb-2">VISUALIZATION</h3>
                <p className="text-sm text-muted-foreground">Mental Rehearsal</p>
              </CardContent>
            </Card>

            <Card className="card-stadium card-glow-pink hover:card-glow-pink cursor-pointer">
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-neon-pink mx-auto mb-3" />
                <h3 className="font-bebas text-lg uppercase tracking-wide mb-2">SELF-TALK</h3>
                <p className="text-sm text-muted-foreground">Positive Commands</p>
              </CardContent>
            </Card>

            <Card className="card-stadium card-glow-green hover:card-glow-green cursor-pointer">
              <CardContent className="p-6 text-center">
                <Users className="h-8 w-8 text-bright-green mx-auto mb-3" />
                <h3 className="font-bebas text-lg uppercase tracking-wide mb-2">TEAM FOCUS</h3>
                <p className="text-sm text-muted-foreground">Leadership Skills</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Stadium Quote Section */}
        <motion.div variants={itemVariants} className="text-center">
          <Card className="card-stadium bg-gradient-to-br from-card/70 to-card/50 border-neon-pink/30 max-w-4xl mx-auto animate-stadium-glow">
            <CardContent className="p-8">
              <blockquote className="text-impact text-2xl md:text-3xl mb-4 leading-tight">
                "O FUTEBOL É 90% MENTAL.<br />A OUTRA METADE É FÍSICA."
              </blockquote>
              <p className="text-electric-blue font-bold text-lg">- Yogi Berra (adaptado)</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
