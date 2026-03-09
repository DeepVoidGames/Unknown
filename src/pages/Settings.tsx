import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/game/Header';
import { Footer } from '@/components/game/Footer';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const hardReset = useGameStore((s) => s.hardReset);
  const navigate = useNavigate();

  const handleHardReset = () => {
    const confirm1 = confirm("⚠️ WARNING: This will DELETE ALL your progress, cards, and Mega Seeds. Are you absolutely sure?");
    if (confirm1) {
      const confirm2 = confirm("LAST CHANCE: Are you really sure you want to reset everything? This cannot be undone.");
      if (confirm2) {
        hardReset();
        toast.error("DATA WIPED", {
          description: "Your progress has been completely reset.",
        });
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="max-w-2xl mx-auto px-6 py-12 flex-1 w-full space-y-12">
        <div className="flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h2 className="text-4xl font-display font-bold text-foreground">Settings</h2>
        </div>

        <div className="space-y-6">
          <section className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex items-center gap-3 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-display font-bold text-xl uppercase tracking-tighter">Danger Zone</h3>
            </div>
            
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Hard Reset</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Instantly wipes all your collected cards, mega seeds, and active slots. 
                    You will start over from scratch with a new random starter card.
                  </p>
                </div>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full font-bold uppercase tracking-widest"
                onClick={handleHardReset}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Hard Reset Progress
              </Button>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-muted/30 border border-border/50 text-center space-y-4">
            <p className="text-[10px] text-muted-foreground font-body uppercase tracking-[0.2em]">
              Rick & Morty Multiverse Portal • Build: <span className="text-primary">7755454</span>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
