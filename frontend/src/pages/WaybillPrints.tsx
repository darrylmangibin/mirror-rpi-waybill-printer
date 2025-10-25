import { Link } from 'react-router-dom'

function WaybillPrints() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden relative">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-20 animate-float" />
        <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-cyan-500 rounded-full blur-3xl opacity-20 animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-20 px-4">
        {/* Header */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-6xl md:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Waybill Prints
            </span>
          </h1>
          <p className="text-xl text-slate-300">Manage your shipping labels and waybill prints</p>
        </div>

        {/* Content Area - Placeholder */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-4xl w-full">
          <div className="text-center text-slate-300">
            <p className="text-lg">📋 Waybill Prints will be displayed here</p>
            <p className="text-sm text-slate-400 mt-2">Coming soon: list of all waybill prints</p>
          </div>
        </div>

        {/* Back Button */}
        <div className="relative z-20 mt-8">
          <Link 
            to="/"
            className="px-6 py-2 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/20 transition-all duration-300"
          >
            ← Back to Home
          </Link>
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

export default WaybillPrints
