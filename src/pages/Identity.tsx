import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Fingerprint, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PlayerIdentity from "./PlayerIdentity";
import { BestSelf } from "@/components/mindset/BestSelf";

export default function Identity() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dna");

  return (
    <motion.div 
      className="min-h-screen bg-background"
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
          
          <h1 className="text-lg font-bold text-foreground">Your Identity</h1>
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="dna" className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4" />
              Your DNA
            </TabsTrigger>
            <TabsTrigger value="bestself" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Your Best Self
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dna" className="mt-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Render PlayerIdentity without the wrapper layout */}
              <PlayerIdentity embedded />
            </motion.div>
          </TabsContent>

          <TabsContent value="bestself" className="mt-0">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Render BestSelf without the wrapper layout */}
              <BestSelfEmbedded />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}

// Embedded version of BestSelf without the full-page wrapper
function BestSelfEmbedded() {
  return (
    <div className="pb-20">
      <BestSelf />
    </div>
  );
}
