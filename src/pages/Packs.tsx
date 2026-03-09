import { useGameStore } from '@/store/gameStore';
import { Header } from '@/components/game/Header';
import { PackOpening } from '@/components/game/PackOpening';
import { Footer } from '@/components/game/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Sparkles, Info, ArrowLeft } from 'lucide-react';
import characters from '@/data/characters.json';
import cardTypes from '@/data/cardTypes.json';
import packs from '@/data/packs.json';

const Packs = () => {
  const inventory = useGameStore((s) => s.inventory);
  
  // Calculate combinations: Characters * (Types + Combined Types)
  const combinations = characters.length * (cardTypes.length + 3); 

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h2 className="text-4xl font-display font-bold text-foreground">Portal Shop</h2>
              <p className="text-muted-foreground font-body">Summon new entities from across the multiverse</p>
            </div>
          </div>
          
          <div className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-right">
            <div className="flex items-center justify-end gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-tighter">Multiverse Stats</span>
            </div>
            <p className="text-2xl font-display font-bold">~{combinations.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Possible Combinations</p>
          </div>
        </div>

        {/* Packs Grid */}
        <div className="grid grid-cols-1 gap-6">
          {packs.map(pack => (
            <PackOpening key={pack.id} packId={pack.id} />
          ))}
        </div>

        <div className="bg-muted/30 rounded-2xl p-8 border border-border/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
               <Info className="w-6 h-6 text-primary" />
            </div>
            <div className="space-y-4">
              <h4 className="font-display font-bold text-lg text-foreground">Interdimensional Summoning Protocol</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every portal stabilization follows strict Rick-approved guidelines. Drop rates are calculated based on the stability of the rift. 
                Higher tier packs use <span className="text-primary font-bold">Quantum Stabilization</span> to ensure higher rarity yields and a much higher chance of <span className="text-primary font-bold">Property Merging</span> (e.g. Holo + Full Art).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                 <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Merge Bonus</p>
                    <p className="text-xs">Combining two special types doubles the total income multiplier of the card.</p>
                 </div>
                 <div className="p-3 bg-background/50 rounded-xl border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Entity Sync</p>
                    <p className="text-xs">Duplicate characters in your inventory still provide a collection bonus!</p>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Packs;
