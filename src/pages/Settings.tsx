import { useGameStore, getGameState } from "@/store/gameStore";
import { Header } from "@/components/game/Header";
import { Footer } from "@/components/game/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, AlertTriangle, ShieldAlert, Cloud, RefreshCw, User, LogIn } from "lucide-react";
import { toast } from "sonner";
import { cloudSave, cloudLoad, getUUID } from "@/lib/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const hardReset = useGameStore((s) => s.hardReset);
  const nickname = useGameStore((s) => s.nickname);
  const setNickname = useGameStore((s) => s.setNickname);
  const lastCloudSave = useGameStore((s) => s.lastCloudSave);
  const setLastCloudSave = useGameStore((s) => s.setLastCloudSave);
  const navigate = useNavigate();

  const handleHardReset = () => {
    const confirm1 = confirm(
      "⚠️ WARNING: This will DELETE ALL your progress, cards, and Mega Seeds. Are you absolutely sure?",
    );
    if (confirm1) {
      const confirm2 = confirm(
        "LAST CHANCE: Are you really sure you want to reset everything? This cannot be undone.",
      );
      if (confirm2) {
        hardReset();
        toast.error("DATA WIPED", {
          description: "Your progress has been completely reset.",
        });
        navigate("/");
      }
    }
  };

  const handleManualSave = async () => {
    const state = useGameStore.getState();
    const stateToSave = getGameState(state);
    const res = await cloudSave(stateToSave);
    if (res && res.success) {
      setLastCloudSave(Date.now());
      toast.success("Saved to The Finite Curve!");
    } else {
      toast.error("Cloud synchronization failed", {
        description: res?.message || "Check your connection to Rick's server."
      });
    }
  };

  const handleManualLoad = async () => {
    const cloudRes = await cloudLoad();
    if (cloudRes.success && cloudRes.data) {
      useGameStore.setState(cloudRes.data);
      toast.success("Loaded from The Central Finite Curve!");
    } else {
      toast.error("Failed to load from cloud", {
        description: cloudRes.message || "No save found or server is offline."
      });
    }
  };


  const handleGoogleLogin = () => {
    toast.info("Google Login", {
      description: "In a real Rickverse, this would redirect you to Google. For now, your device ID is your portal gun."
    });
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
          <h2 className="text-4xl font-display font-bold text-foreground">
            Settings
          </h2>
        </div>

        <div className="space-y-6">
          <section className="p-6 rounded-2xl bg-card border border-primary/20 space-y-6 shadow-[0_0_15px_rgba(34,197,94,0.1)] relative overflow-hidden">
             {/* Glow effect */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
             
            <div className="flex items-center gap-3 text-primary">
              <Cloud className="w-6 h-6" />
              <h3 className="font-display font-bold text-xl uppercase tracking-tight">
                The Central Finite Curve
              </h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                  <User className="w-3 h-3" /> Player Nickname (Leaderboards)
                </label>
                <Input 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Enter Rick name..."
                  className="bg-background/50 border-primary/20 focus-visible:ring-primary"
                />
              </div>

              <div className="p-4 bg-muted/30 border border-border rounded-xl space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Cloud Status</span>
                  <span className="font-mono text-primary flex items-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-pulse" /> 
                    {lastCloudSave 
                      ? (Date.now() - lastCloudSave > 120000 
                        ? "Connecting..." 
                        : `Synced ${new Date(lastCloudSave).toLocaleTimeString()}`)
                      : "Not Synced"}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all">
                         Save to Cloud
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Sync with the Finite Curve?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will overwrite your cloud save with your current local progress.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={handleManualSave} className="bg-primary hover:bg-primary/80">Sync Now</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full border-primary/20 hover:bg-primary/10 hover:text-primary transition-all">
                        Load from Cloud
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Import from the Finite Curve?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will <span className="text-destructive font-bold uppercase">overwrite</span> your current local progress with the cloud data.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Abort</AlertDialogCancel>
                        <AlertDialogAction onClick={handleManualLoad} className="bg-primary hover:bg-primary/80">Import Now</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <Button onClick={handleGoogleLogin} variant="secondary" className="w-full gap-2">
                   <LogIn className="w-4 h-4" /> Login with Google
                </Button>
              </div>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex items-center gap-3 text-primary">
              <img src="/discord-icon.svg" alt="Discord" className="w-6 h-6" />
              <h3 className="font-display font-bold text-xl uppercase">
                <a
                  href="https://discord.gg/WC2PxZQ7ce"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline discord-color"
                >
                  Join Our Community
                </a>
              </h3>
            </div>
          </section>

          <section className="p-6 rounded-2xl bg-card border border-border space-y-6">
            <div className="flex items-center gap-3 text-destructive">
              <ShieldAlert className="w-6 h-6" />
              <h3 className="font-display font-bold text-xl uppercase tracking-tighter">
                Danger Zone
              </h3>
            </div>

            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl space-y-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">Hard Reset</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Instantly wipes all your collected cards, mega seeds, and
                    active slots. You will start over from scratch with a new
                    random starter card.
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
              Rick & Morty Multiverse Portal • Build:{" "}
              <span className="text-primary">7755454</span>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
