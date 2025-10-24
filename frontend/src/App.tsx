import { useApi } from './useApi';

function App() {
  const { data, loading, error } = useApi('/api/hello');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
        
        {/* Moving gradient blocks */}
        <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-10 animate-slide_right" />
        <div className="absolute bottom-1/3 left-1/4 w-56 h-56 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-2xl opacity-10 animate-slide_left" />

        {/* Animated dots */}
        <div className="absolute top-1/4 left-1/2 w-3 h-3 bg-blue-400 rounded-full animate-pulse_slow" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-purple-400 rounded-full animate-pulse_slow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-2/3 left-1/4 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-pulse_slow" style={{ animationDelay: "2s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center">
        {/* Header Container */}
        <div className="text-center space-y-6 px-4">
          {/* Main Title with glow effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 blur-2xl opacity-30 animate-pulse" />
            <h1 className="relative text-6xl md:text-7xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                RPI Waybill
              </span>
            </h1>
            <h1 className="relative text-6xl md:text-7xl font-black tracking-tight mt-2">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Printer
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 font-light">
            Professional Shipping Label Management
          </p>

          {/* API Status Display */}
          <div className="mt-8 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl">
            {loading && <p className="text-blue-300">🔄 Connecting to backend...</p>}
            {error && <p className="text-red-400">❌ Error: {error}</p>}
            {data && (
              <div className="text-green-300">
                <p>✅ {data.message}</p>
                <p className="text-sm text-slate-400 mt-1">Status: {data.status}</p>
              </div>
            )}
          </div>

          {/* Animated accent line */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <div className="h-1 w-12 bg-gradient-to-r from-transparent to-blue-500" />
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <div className="h-1 w-12 bg-gradient-to-l from-transparent to-purple-500" />
          </div>
        </div>

        {/* Floating Cards */}
        <div className="relative z-20 mt-16 flex gap-8 flex-wrap justify-center px-4">
          {[
            { icon: "📦", title: "Fast Printing", delay: "0s" },
            { icon: "🎯", title: "Accurate Tracking", delay: "0.5s" },
            { icon: "⚡", title: "Reliable", delay: "1s" },
          ].map((item, index) => (
            <div
              key={index}
              className="group"
              style={{ animationDelay: item.delay }}
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 hover:scale-105 hover:shadow-2xl w-40 animate-float"
                style={{ animationDelay: item.delay }}>
                <div className="text-4xl mb-3 text-center">{item.icon}</div>
                <p className="text-white font-semibold text-center">{item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent" />
      </div>
    </div>
  )
}

export default App
