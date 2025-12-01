import { createContext, useContext, useState, type ReactNode } from 'react';
import { getToday } from '~/lib/api';

interface Store {
    id: string;
    name: string;
}

interface FilterContextType {
    startDate: string;
    endDate: string;
    selectedStore: string;
    stores: Store[];
    setStartDate: (date: string) => void;
    setEndDate: (date: string) => void;
    setSelectedStore: (store: string) => void;
    setStores: (stores: Store[]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [startDate, setStartDate] = useState(() => getToday());
    const [endDate, setEndDate] = useState(() => getToday());
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [stores, setStores] = useState<Store[]>([]);

    return (
        <FilterContext.Provider
            value={{
                startDate,
                endDate,
                selectedStore,
                stores,
                setStartDate,
                setEndDate,
                setSelectedStore,
                setStores,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
}

export function useFilter() {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
}
