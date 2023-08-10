import { StoreSlice } from './store';

export interface CustomSlice {
  lastToken: boolean;
  typeAI: number;
  imageStatus: number;
  setLastToken: (lastToken: boolean) => void;
  setTypeAI: (typeAI: number) => void;
  setImageStatus: (imageStatus: number) => void;
}

export const createCustomSlice: StoreSlice<CustomSlice> = (set, get) => ({
  lastToken: false,
  typeAI: 0,
  imageStatus: 0,
  setLastToken: (lastToken: boolean) => {
    set((prev) => ({ ...prev, lastToken }));
  },
  setTypeAI: (typeAI: number) => {
    set((prev) => ({ ...prev, typeAI }));
  },
  setImageStatus: (imageStatus: number) => {
    set((prev) => ({ ...prev, imageStatus }));
  },
});
