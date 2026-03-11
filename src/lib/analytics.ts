import ReactGA from "react-ga4";

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_ID;

export const initGA = () => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    console.log("GA Initialized");
  }
};

export const trackPageView = (path: string) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.send({ hitType: "pageview", page: path });
  }
};

export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
  if (GA_MEASUREMENT_ID) {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  }
};

export const trackPackOpening = (packName: string, cost: number) => {
  trackEvent("Game", "Pack Opened", packName, cost);
};

export const trackUpgrade = (upgradeType: string, level: number, cost: number) => {
  trackEvent("Game", "Upgrade Purchased", `${upgradeType} - Level ${level}`, cost);
};

export const trackDimensionStart = (level: number) => {
  trackEvent("Game", "Dimension Started", `Level ${level}`);
};

export const trackDimensionEnd = (level: number, reward: number) => {
  trackEvent("Game", "Dimension Ended", `Reached Level ${level}`, reward);
};
