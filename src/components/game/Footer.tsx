import { Github, Info } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 px-6 border-t border-border bg-card/20 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-muted-foreground opacity-40">
          <Info className="w-3 h-3" />
          <span className="text-[9px] font-display uppercase tracking-widest">
            Legal Disclaimer
          </span>
        </div>

        <div className="max-w-4xl text-center space-y-2">
          <p className="text-[10px] text-muted-foreground/80 leading-tight font-body">
            Purely hobbyist, non-commercial open-source project. All character names, images, and assets from "Rick and
            Morty" are property of <strong>Adult Swim, Warner Bros. Discovery</strong>.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-x-4 gap-y-1 opacity-60">
            <p className="text-[9px] text-muted-foreground font-body italic">
              &copy; {currentYear} Open Source Multiverse Project.
            </p>
            <a
              href="https://github.com/DeepVoidGames/Unknown"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[9px] text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-3 h-3" />
              <span>GitHub Source</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
