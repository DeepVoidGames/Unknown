import { Header } from "@/components/game/Header";
import { PortalArea } from "@/components/game/PortalArea";
import { CollectionTab } from "@/components/game/CollectionTab";
import { Footer } from "@/components/game/Footer";
import { Link } from "react-router-dom";
import { Package, Map, Beaker, Dna, ArrowRight } from "lucide-react";

const Index = () => {
  const menuItems = [
    {
      to: "/packs",
      label: "Portal Shop",
      description: "Acquire new experimental cards",
      icon: Package,
      color: "text-primary",
      borderColor: "border-primary/20",
      hoverBg: "hover:bg-primary/10",
      hoverBorder: "hover:border-primary/40",
    },
    {
      to: "/splicer",
      label: "Genetic Splicer",
      description: "Combine DNA to create anomalies",
      icon: Dna,
      color: "text-secondary",
      borderColor: "border-secondary/20",
      hoverBg: "hover:bg-secondary/10",
      hoverBorder: "hover:border-secondary/40",
    },
    {
      to: "/dimension",
      label: "Dimension Rift",
      description: "Explore unknown realities",
      icon: Map,
      color: "text-sky-400",
      borderColor: "border-sky-500/20",
      hoverBg: "hover:bg-sky-500/10",
      hoverBorder: "hover:border-sky-500/40",
    },
    {
      to: "/upgrades",
      label: "Rick's Lab",
      description: "Enhance your portal technology",
      icon: Beaker,
      color: "text-emerald-400",
      borderColor: "border-emerald-500/20",
      hoverBg: "hover:bg-emerald-500/10",
      hoverBorder: "hover:border-emerald-500/40",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <PortalArea />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {menuItems.map((item) => (
            <Link 
              key={item.to} 
              to={item.to}
              className={`group relative overflow-hidden rounded-xl border ${item.borderColor} bg-muted/20 p-6 transition-all duration-300 ${item.hoverBg} ${item.hoverBorder} hover:shadow-[0_0_20px_rgba(0,0,0,0.1)] hover:-translate-y-1`}
            >
              <div className="flex flex-col h-full space-y-4">
                <div className="flex justify-between items-start">
                  <div className={`p-3 rounded-lg bg-background/50 border ${item.borderColor} ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-5 h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                </div>
                
                <div>
                  <h3 className="font-display font-bold text-xl tracking-tight">
                    {item.label}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className={`absolute -right-4 -bottom-4 w-24 h-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                  <item.icon className="w-full h-full" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <CollectionTab />
      <Footer />
    </div>
  );
};

export default Index;
