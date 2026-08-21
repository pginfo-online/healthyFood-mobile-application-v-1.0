import { create } from 'zustand';

export interface CityItem {
  _id: string;
  name: string;
  state: string;
  image?: string;
  coordinates?: { lat: number; lng: number };
}

export interface SavedAddress {
  _id: string;
  label: string;
  receiverName: string;
  receiverPhone: string;
  addressLine1: string;
  addressLine2?: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  isDefault?: boolean;
}

interface AddressDraft {
  city?: string;
  state?: string;
  area?: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
}

interface AddressState {
  selectedCity: CityItem | null;
  currentAddress: SavedAddress | null;
  draft: AddressDraft;
  setSelectedCity: (city: CityItem) => void;
  setCurrentAddress: (address: SavedAddress | null) => void;
  setDraft: (draft: Partial<AddressDraft>) => void;
  clearDraft: () => void;
  getDisplayAddress: () => string;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  selectedCity: {
    _id: 'default_pune',
    name: 'Pune',
    state: 'Maharashtra',
  },
  currentAddress: null,
  draft: {},

  setSelectedCity: (city) => {
    set({
      selectedCity: city,
      draft: { ...get().draft, city: city.name, state: city.state },
    });
  },

  setCurrentAddress: (address) => {
    set({ currentAddress: address });
    if (address && address.city) {
      set({
        selectedCity: {
          _id: `city_${address.city}`,
          name: address.city,
          state: address.state || 'Maharashtra',
        },
      });
    }
  },

  setDraft: (partialDraft) => {
    set({ draft: { ...get().draft, ...partialDraft } });
  },

  clearDraft: () => set({ draft: {} }),

  getDisplayAddress: () => {
    const { currentAddress, selectedCity } = get();
    if (currentAddress) {
      return `${currentAddress.area || currentAddress.addressLine1}, ${currentAddress.city}`;
    }
    if (selectedCity) {
      return `${selectedCity.name}, ${selectedCity.state}`;
    }
    return 'Select Location';
  },
}));
