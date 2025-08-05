import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Target, TrendingUp, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="title-stadium mb-6">
            Mental Training
            <br />
            <span className="text-impact">FIELD</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 font-medium">
            Desenvolva o mindset de um campeão. Treine sua mente como treina seu corpo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4">
              <Zap className="mr-2 h-5 w-5" />
              Começar Treino
            </Button>
            <Button variant="secondary" size="lg" className="text-lg px-8 py-4">
              <Brain className="mr-2 h-5 w-5" />
              Ver Progresso
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="card-glow-pink">
            <CardHeader>
              <div className="w-12 h-12 bg-neon-pink/20 rounded-xl flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-neon-pink" />
              </div>
              <CardTitle>Mindset Training</CardTitle>
              <CardDescription>
                Desenvolva confiança, foco e mentalidade vencedora
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Explorar Técnicas
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow-blue">
            <CardHeader>
              <div className="w-12 h-12 bg-bright-blue/20 rounded-xl flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-bright-blue" />
              </div>
              <CardTitle>Goal Setting</CardTitle>
              <CardDescription>
                Defina e alcance seus objetivos no futebol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full">
                Definir Metas
              </Button>
            </CardContent>
          </Card>

          <Card className="card-glow-green">
            <CardHeader>
              <div className="w-12 h-12 bg-deep-green/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-deep-green" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Acompanhe sua evolução mental e técnica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="success" className="w-full">
                Ver Estatísticas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stadium Quote Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="bg-gradient-to-br from-card/50 to-card/30 border-neon-pink/20">
            <CardContent className="p-8">
              <blockquote className="text-impact text-2xl md:text-3xl mb-4">
                "O FUTEBOL É 90% MENTAL. A OUTRA METADE É FÍSICA."
              </blockquote>
              <p className="text-bright-blue font-bold text-lg">- Yogi Berra (adaptado)</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
