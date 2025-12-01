interface StoreFilterProps {
    stores: { id: string; name: string }[];
    selectedStore: string;
    onStoreChange: (storeId: string) => void;
    className?: string;
}

export default function StoreFilter({
    stores,
    selectedStore,
    onStoreChange,
    className = ''
}: StoreFilterProps) {
    console.log('🔍 StoreFilter - Rendering with:', { storesCount: stores.length, stores, selectedStore });
    if (stores.length <= 1) {
        console.log('⚠️ StoreFilter - Not showing (stores.length <= 1)');
        return null;
    }

    return (
        <div className={className}>
            <label
                htmlFor="storeFilter"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
                Loja
            </label>
            <select
                id="storeFilter"
                value={selectedStore}
                onChange={(e) => onStoreChange(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
            >
                <option value="">Todas as Lojas</option>
                {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                        {store.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
