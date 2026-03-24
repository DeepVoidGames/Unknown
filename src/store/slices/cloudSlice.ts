import { StateCreator } from "zustand";
import { GameStore } from "../gameStore";

export interface CloudSlice {
  nickname: string;
  lastCloudSave: number;
  setNickname: (name: string) => void;
  setLastCloudSave: (ts: number) => void;
}

export const createCloudSlice: StateCreator<
  GameStore,
  [],
  [],
  CloudSlice
> = (set) => ({
  nickname: "Rick",
  lastCloudSave: 0,
  setNickname: (name) => set({ nickname: name }),
  setLastCloudSave: (ts) => set({ lastCloudSave: ts }),
});
