// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Modern gradient background */}
      <div className="absolute inset-0 gradient-card opacity-30"></div>
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="text-center relative z-10">
        <h1 className="text-6xl font-bold mb-6 gradient-text">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">Start building your amazing project with modern design and gradients!</p>
        <div className="space-x-4">
          <button className="gradient-primary text-white px-8 py-3 rounded-xl shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300">
            Get Started
          </button>
          <button className="border border-white/20 bg-background/50 backdrop-blur-sm px-8 py-3 rounded-xl shadow-modern hover:bg-accent transition-all duration-300">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
