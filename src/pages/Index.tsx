// Update this page (the content is just a fallback if you fail to update the page)

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
         style={{ background: 'var(--gradient-bg)' }}>
      {/* Floating gradient orbs for depth */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-32 right-32 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-pink-400/8 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      {/* Main content */}
      <div className="text-center relative z-10 max-w-2xl px-6">
        <h1 className="text-6xl font-bold mb-6 gradient-text">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground mb-8 leading-relaxed">Start building your amazing project with modern design and beautiful gradients!</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="gradient-primary text-white px-8 py-3 rounded-xl shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium">
            Get Started
          </button>
          <button className="glass px-8 py-3 rounded-xl shadow-modern hover:shadow-glow transition-all duration-300 font-medium">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
