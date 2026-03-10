
import { FileUpload } from './components/FileUpload';
import { ChatInterface } from './components/ChatInterface';
import { Database, Sparkles } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20 text-foreground font-sans">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background -z-10" />

      {/* Navigation */}
      <header className="border-b border-border/40 bg-background/60 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Database className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Data Assistant</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide uppercase mb-6 border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Analytics
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
            genAI -  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">BI</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Upload your PDF documents and CSV files to instantly unlock insights. Ask questions in natural language and receive rich data visualizations and sources.
          </p>
        </div>

        <FileUpload />

      </main>

      {/* Global Chat Overlay */}
      <ChatInterface />
    </div>
  );
}

export default App;
