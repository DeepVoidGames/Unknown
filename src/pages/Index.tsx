import { Header } from "@/components/game/Header";
import { PortalArea } from "@/components/game/PortalArea";
import { CollectionTab } from "@/components/game/CollectionTab";
import { Footer } from "@/components/game/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Map, Beaker, Dna } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PortalArea />

      <div className="flex justify-center py-6 bg-muted/20 border-y border-border gap-4 flex-wrap">
        <Link to="/packs">
          <Button
            variant="outline"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg transition-all border-primary/20 hover:border-primary/40 hover:bg-primary/10 hover:text-white"
          >
            <Package className="w-5 h-5 text-primary" />
            Portal Shop
          </Button>
        </Link>
        <Link to="/splicer">
          <Button
            variant="outline"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg transition-all border-secondary/20 hover:border-secondary/40 hover:bg-secondary/10 hover:text-white"
          >
            <Dna className="w-5 h-5 text-secondary" />
            Genetic Splicer
          </Button>
        </Link>
        <Link to="/dimension">
          <Button
            variant="outline"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg transition-all border-sky-500/20 hover:border-sky-500/40 hover:bg-sky-500/10 hover:text-white"
          >
            <Map className="w-5 h-5 text-sky-500" />
            Dimension Rift
          </Button>
        </Link>
        <Link to="/upgrades">
          <Button
            variant="outline"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg transition-all border-primary/20 hover:border-primary/40 hover:bg-primary/10 hover:text-white"
          >
            <Beaker className="w-5 h-5 text-primary" />
            Rick's Lab
          </Button>
        </Link>
      </div>

      <CollectionTab />
      <Footer />
    </div>
  );
};

export default Index;
