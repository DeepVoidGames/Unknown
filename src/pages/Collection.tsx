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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Search, Trash2, FilterX, CheckCircle2, Circle, ArrowLeft, BookOpen, LayoutGrid, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { GAME_CONFIG } from '@/config/gameConfig';
import charactersData from '@/data/characters.json';
import cardTypesData from '@/data/cardTypes.json';
import { TYPE_ICONS } from '@/config/rarityConfig';

const Collection = () => {
  const inventory = useGameStore((s) => s.inventory);
  const maxInventory = useGameStore((s) => s.maxInventory);
  const sellCards = useGameStore((s) => s.sellCards);
  const discoveredCards = useGameStore((s) => s.discoveredCards);
  
  const [activeTab, setActiveTab] = useState('inventory');
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  
  // Sell Mode State
  const [isSellMode, setIsSellMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const filteredCards = useMemo(() => {
    return inventory
      .filter(Boolean)
      .map((card) => ({ card, stats: resolveCardStats(card) }))
      .filter(({ stats }) => {
        const matchesSearch = stats.character.name
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesType =
          typeFilter === "ALL" || (card.types || []).includes(typeFilter);
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.card.timestamp - a.card.timestamp;
        if (sortBy === "oldest") return a.card.timestamp - b.card.timestamp;
        if (sortBy === "income") return b.stats.income - a.stats.income;
        return 0;
      });
  }, [inventory, search, typeFilter, sortBy]);

  const pokedexStats = useMemo(() => {
    const totalCharacters = charactersData.length;
    const discoveredCount = Object.keys(discoveredCards).length;
    const percentage = Math.floor((discoveredCount / totalCharacters) * 100);
    
    // Calculate total rarities discovered across all characters
    const totalRaritiesPossible = totalCharacters * cardTypesData.length;
    const totalRaritiesDiscovered = Object.values(discoveredCards).reduce((acc, types) => acc + (types as string[]).length, 0);
    
    // Using 1 decimal place for rarity percentage since it grows slowly
    const rarityPercentage = totalRaritiesPossible > 0 
      ? parseFloat(((totalRaritiesDiscovered / totalRaritiesPossible) * 100).toFixed(1))
      : 0;

    return { totalCharacters, discoveredCount, percentage, rarityPercentage };
  }, [discoveredCards]);

  const filteredPokedex = useMemo(() => {
    return charactersData
      .filter(char => char.name.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => {
        const aDiscovered = !!discoveredCards[a.id];
        const bDiscovered = !!discoveredCards[b.id];
        if (aDiscovered && !bDiscovered) return -1;
        if (!aDiscovered && bDiscovered) return 1;
        return a.id - b.id;
      });
  }, [search, discoveredCards]);

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

    sellCards(selectedIds);
    toast.success(`Sold ${selectedIds.length} cards`, {
      description: `You received ${Math.floor(totalProfit).toLocaleString()} Mega Seeds.`,
    });
    setSelectedIds([]);
    setIsSellMode(false);
    setIsConfirmOpen(false);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground">Citadel Archives</h2>
              <div className="flex gap-4 mt-1">
                <p className="text-muted-foreground font-body text-sm">Inventory: {inventory.length} / {maxInventory}</p>
                <p className="text-primary font-body text-sm font-bold">Registry: {pokedexStats.discoveredCount} / {pokedexStats.totalCharacters}</p>
              </div>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="inventory" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="archives" className="gap-2">
                <BookOpen className="w-4 h-4" />
                Archives
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {activeTab === 'archives' && (
          <div className="bg-card/30 border border-primary/20 rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-2 text-primary">
                    <Circle className="w-3 h-3 fill-current" />
                    Dimensional Discovery
                  </span>
                  <span className="text-primary">{pokedexStats.percentage}%</span>
                </div>
                <Progress value={pokedexStats.percentage} className="h-2" />
              </div>
              <div className="hidden md:block w-px h-10 bg-border/50 mx-4" />
              <div className="space-y-1 flex-1">
                <div className="flex justify-between text-sm font-bold">
                  <span className="flex items-center gap-2 text-primary">
                    <BookOpen className="w-3 h-3" />
                    Rarity Resonance
                  </span>
                  <span className="text-primary">{pokedexStats.rarityPercentage}%</span>
                </div>
                <Progress value={pokedexStats.rarityPercentage} className="h-2" />
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-card/40 p-4 rounded-xl border border-border">
          <div className="relative col-span-1 md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder={activeTab === 'inventory' ? "Search your cards..." : "Search character database..."}
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          {activeTab === 'inventory' ? (
            <>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  {cardTypesData.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.label}</SelectItem>
                  ))}
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
            </>
          ) : (
             <div className="col-span-2 flex items-center px-4 text-sm text-muted-foreground gap-2 italic">
               <Info className="w-4 h-4" />
               Discovered characters appear in color. Collect all rarities for 100% completion!
             </div>
          )}
        </div>

        <Tabs value={activeTab} className="mt-0">
          <TabsContent value="inventory" className="mt-0 space-y-6">
            <div className="flex justify-end">
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
          </TabsContent>

          <TabsContent value="archives" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-items-center">
              {filteredPokedex.map((char) => {
                const typesDiscovered = discoveredCards[char.id] || [];
                const isDiscovered = typesDiscovered.length > 0;
                
                return (
                  <div 
                    key={char.id}
                    className={`relative w-48 bg-card border-2 rounded-xl overflow-hidden transition-all duration-300 ${isDiscovered ? 'border-primary/20 hover:scale-105' : 'border-border/50 grayscale opacity-60'}`}
                  >
                    <div className="h-44 bg-muted relative overflow-hidden">
                      <img 
                        src={char.customImage || `https://rickandmortyapi.com/api/character/avatar/${char.avatarId}.jpeg`} 
                        alt={char.name}
                        className="w-full h-full object-cover"
                      />
                      {!isDiscovered && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                          <span className="font-display font-bold text-white/40 tracking-widest text-xs uppercase text-[10px]">Registry Locked</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <div className="flex justify-between items-start gap-1">
                        <p className="font-display text-[10px] font-bold text-foreground truncate leading-tight flex-1">
                          {isDiscovered ? char.name : "???"}
                        </p>
                        {isDiscovered && (
                          <span className="text-[8px] font-bold text-purple-400 whitespace-nowrap">
                            IQ {char.iq}
                          </span>
                        )}
                      </div>
                      
                      {/* Rarity Indicators */}
                      <div className="flex flex-wrap gap-1">
                        {cardTypesData.map((type) => {
                          const Icon = TYPE_ICONS[type.id] || Circle;
                          const found = typesDiscovered.includes(type.id);
                          return (
                            <div 
                              key={type.id}
                              title={type.label}
                              className={`p-1 rounded-sm border transition-colors ${found ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-transparent border-border/10 text-muted-foreground/20'}`}
                            >
                              <Icon className="w-2.5 h-2.5" />
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="pt-1 border-t border-border/50 flex items-center justify-between opacity-60">
                        <span className="text-[8px] font-body uppercase">
                          {isDiscovered ? char.species : "unknown"}
                        </span>
                        <span className="text-[8px] font-bold text-primary">
                          #{char.id.toString().padStart(3, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Sell Mode Floating Bar */}
      {isSellMode && activeTab === 'inventory' && (
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
                onClick={() => setIsConfirmOpen(true)}
                disabled={selectedIds.length === 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sell All
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to sell {selectedIds.length} cards for {Math.floor(selectedTotalProfit).toLocaleString()} Mega Seeds. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkSell}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sell Cards
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default Collection;
