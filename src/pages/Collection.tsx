import { useState, useMemo } from 'react';
import { useGameStore, resolveCardStats } from '@/store/gameStore';
import { Header } from '@/components/game/Header';
import { GameCard } from '@/components/game/GameCard';
import { Footer } from '@/components/game/Footer';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Trash2, FilterX, CheckCircle2, Circle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { GAME_CONFIG } from '@/config/gameConfig';

const Collection = () => {
  const inventory = useGameStore((s) => s.inventory);
  const maxInventory = useGameStore((s) => s.maxInventory);
  const sellCards = useGameStore((s) => s.sellCards);
  
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Sell Mode State
  const [isSellMode, setIsSellMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredCards = useMemo(() => {
    return inventory
      .map(card => ({ card, stats: resolveCardStats(card) }))
      .filter(({ card, stats }) => {
        const matchesSearch = stats.character.name.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'ALL' || (card.types || []).includes(typeFilter);
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return b.card.timestamp - a.card.timestamp;
        if (sortBy === 'oldest') return a.card.timestamp - b.card.timestamp;
        if (sortBy === 'income') return b.stats.income - a.stats.income;
        return 0;
      });
  }, [inventory, search, typeFilter, sortBy]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkSell = () => {
    if (selectedIds.length === 0) return;
    
    const totalProfit = inventory
      .filter(c => selectedIds.includes(c.id))
      .reduce((acc, c) => {
        const stats = resolveCardStats(c);
        return acc + (stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER);
      }, 0);

    if (confirm(`Sell ${selectedIds.length} selected cards for ${Math.floor(totalProfit).toLocaleString()} Mega Seeds?`)) {
      sellCards(selectedIds);
      toast.success(`Sold ${selectedIds.length} cards`, {
        description: `You received ${Math.floor(totalProfit).toLocaleString()} Mega Seeds.`,
      });
      setSelectedIds([]);
      setIsSellMode(false);
    }
  };

  const selectedTotalProfit = useMemo(() => {
    return inventory
      .filter(c => selectedIds.includes(c.id))
      .reduce((acc, c) => {
        const stats = resolveCardStats(c);
        return acc + (stats.income * GAME_CONFIG.SELL_PRICE_MULTIPLIER);
      }, 0);
  }, [inventory, selectedIds]);

  return (
    <div className="min-h-screen bg-background pb-32">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground">Your Collection</h2>
              <p className="text-muted-foreground font-body">{inventory.length} / {maxInventory} cards collected</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={isSellMode ? "destructive" : "outline"}
              onClick={() => {
                setIsSellMode(!isSellMode);
                setSelectedIds([]);
              }}
              className={`font-bold transition-colors ${!isSellMode ? 'hover:bg-destructive hover:text-destructive-foreground hover:border-destructive' : ''}`}
            >
              {isSellMode ? "Cancel Sell Mode" : "Sell Mode"}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/40 p-4 rounded-xl border border-border">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search cards or characters..." 
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="COMMON">Common</SelectItem>
              <SelectItem value="RARE">Rare</SelectItem>
              <SelectItem value="HOLO">Holo</SelectItem>
              <SelectItem value="FULL_ART">Full Art</SelectItem>
              <SelectItem value="SILVER">Silver</SelectItem>
              <SelectItem value="GOLD">Gold</SelectItem>
              <SelectItem value="REVERT">Revert</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="income">Highest Income</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
            {filteredCards.map(({ card }) => {
              const isSelected = selectedIds.includes(card.id);
              return (
                <div 
                  key={card.id} 
                  className={`relative transition-all duration-200 ${isSellMode ? 'cursor-pointer' : ''}`}
                  onClick={() => isSellMode && toggleSelect(card.id)}
                >
                  {isSellMode && (
                    <div className="absolute top-2 left-2 z-30 pointer-events-none">
                      {isSelected ? (
                        <CheckCircle2 className="w-6 h-6 text-primary fill-background rounded-full" />
                      ) : (
                        <Circle className="w-6 h-6 text-white/50 bg-black/20 rounded-full" />
                      )}
                    </div>
                  )}
                  <div className={isSelected ? 'scale-95 opacity-80' : ''}>
                    <GameCard card={card} />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <FilterX className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-display font-bold">No cards found</p>
              <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
            </div>
            <Button variant="outline" onClick={() => { setSearch(''); setTypeFilter('ALL'); }}>
              Clear All Filters
            </Button>
          </div>
        )}
      </main>

      {/* Sell Mode Floating Bar */}
      {isSellMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-50 animate-in slide-in-from-bottom-10 duration-300">
          <div className="bg-destructive border-2 border-destructive-foreground/20 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
            <div className="text-destructive-foreground">
              <p className="font-display font-bold text-lg">{selectedIds.length} Selected</p>
              <p className="text-xs opacity-80">
                Total: {Math.floor(selectedTotalProfit).toLocaleString()} Seeds
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
                onClick={() => setSelectedIds([])}
              >
                Clear
              </Button>
              <Button 
                variant="secondary" 
                size="default" 
                className="font-bold"
                onClick={handleBulkSell}
                disabled={selectedIds.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sell All
              </Button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Collection;
