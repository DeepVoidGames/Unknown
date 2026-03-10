import { Header } from "@/components/game/Header";
import { PortalArea } from "@/components/game/PortalArea";
import { CollectionTab } from "@/components/game/CollectionTab";
import { Footer } from "@/components/game/Footer";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Map, Beaker } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PortalArea />

      <div className="flex justify-center py-6 bg-muted/20 border-y border-border gap-4 flex-wrap">
        <Link to="/packs">
          <Button
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
          >
            <Package className="w-5 h-5" />
            Portal Shop
          </Button>
        </Link>
        <Link to="/dimension">
          <Button
            variant="secondary"
            size="lg"
            className="font-display font-bold gap-3 px-8 shadow-lg shadow-secondary/20 hover:shadow-secondary/40 transition-all"
          >
            <Map className="w-5 h-5" />
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
