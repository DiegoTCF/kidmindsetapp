import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Eye, Heart, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MindsetHub = () => {
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

  const selfTalkPhrases = [
    "I am prepared and ready",
    "I trust my abilities", 
    "Every touch makes me better",
    "I stay calm under pressure",
    "I am focused and confident",
    "I control my mindset"
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center mb-8">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="title-stadium text-4xl md:text-6xl mb-2">
              MINDSET HUB
            </h1>
            <p className="text-electric-blue font-medium text-lg">
              Tools to strengthen your mental game
            </p>
          </div>
        </motion.div>

        {/* Visualization Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="card-stadium card-glow-blue">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-electric-blue/20 rounded-xl flex items-center justify-center">
                  <Eye className="h-5 w-5 text-electric-blue" />
                </div>
                <CardTitle className="heading-coach text-electric-blue">
                  VISUALIZATION
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <Card className="bg-card/50 border border-electric-blue/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bebas text-lg uppercase tracking-wide text-foreground">
                          Match Day Success
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Visualize your perfect performance
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">3 minutes</span>
                        <Button 
                          className="bg-electric-blue hover:bg-electric-blue/90 text-electric-blue-foreground"
                          onClick={() => {/* TODO: Add visualization session */}}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          START SESSION
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 border border-electric-blue/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bebas text-lg uppercase tracking-wide text-foreground">
                          Overcoming Challenges
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          See yourself handling difficult situations
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">2 minutes</span>
                        <Button 
                          className="bg-electric-blue hover:bg-electric-blue/90 text-electric-blue-foreground"
                          onClick={() => {/* TODO: Add visualization session */}}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          START SESSION
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Breathing Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="card-stadium card-glow-green">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-bright-green/20 rounded-xl flex items-center justify-center">
                  <Heart className="h-5 w-5 text-bright-green" />
                </div>
                <CardTitle className="heading-coach text-bright-green">
                  BREATHING
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Card className="bg-card/50 border border-bright-green/20">
                <CardContent className="p-6 text-center">
                  <h3 className="text-bright-green font-bebas text-3xl mb-2">
                    4-4-4 Breathing
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Breathe in for 4 seconds • Hold for 4 seconds • Breathe out for 4 seconds
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button 
                      variant="success"
                      size="lg"
                      onClick={() => navigate('/breathing')}
                      className="text-lg px-8"
                    >
                      <Play className="mr-2 h-5 w-5" />
                      START
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </motion.div>

        {/* Self-Talk Section */}
        <motion.div variants={itemVariants} className="mb-12">
          <Card className="card-stadium card-glow-yellow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-electric-yellow/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-electric-yellow" />
                </div>
                <CardTitle className="heading-coach text-electric-yellow">
                  SELF-TALK
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {selfTalkPhrases.map((phrase, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/50 border border-electric-yellow/20 hover:bg-electric-yellow/5 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <p className="font-medium text-foreground">"{phrase}"</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MindsetHub;