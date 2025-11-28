import { useEffect, useState, useMemo } from 'react';
import { getAuth } from '~/lib/api';
import { apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import type { VendaSerie } from '~/types/venda';

export default function Vendas() {
    const [vendas, setVendas] = useState<VendaSerie[]>([]);
    const [loading, setLoading] = useState(true);

    // Date state
    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

    // Store filter state
    const [selectedStore, setSelectedStore] = useState<string>('');

    useEffect(() => {
        const dbName = getAuth();
        if (dbName) {
            loadVendas(dbName);
        }
    }, [startDate, endDate]);

    const loadVendas = async (dbName: string) => {
        try {
            // Use selected dates
            const inicioStr = startDate;
            const fimStr = endDate;

            const data = await apiRequest<any[]>(`/vendas/serie?inicio=${inicioStr}&fim=${fimStr}&nivel=dia`, dbName);
            setVendas(data);
        } catch (error) {
            console.error('Error loading vendas:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique stores
    const stores = useMemo(() => {
        const storeMap = new Map<string, string>();
        vendas.forEach(v => {
            if (v.idloja && v.loja) {
                storeMap.set(v.idloja, v.loja);
            }
        });
        return Array.from(storeMap.entries()).map(([id, name]) => ({ id, name }));
    }, [vendas]);

    // Filter data
    const filteredVendas = useMemo(() => {
        if (!selectedStore) return vendas;
        return vendas.filter(v => !v.idloja || v.idloja === selectedStore);
    }, [vendas, selectedStore]);

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    const formatNumber = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR').format(num || 0);
    };

    const renderCards = () => {
        if (loading || !filteredVendas || filteredVendas.length === 0) return null;

        const totalPedidos = filteredVendas.reduce((sum, v) => sum + (v.pedidos || 0), 0);
        const totalFaturamento = filteredVendas.reduce((sum, v) => sum + parseFloat(v.faturamento || '0'), 0);
        const totalPecas = filteredVendas.reduce((sum, v) => sum + parseFloat(v.pecas || '0'), 0);
        const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Pedidos</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalPedidos}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Período selecionado</p>
                        </div>
                        <div className="text-4xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 w-16 h-16 rounded-full flex items-center justify-center">
                            📋
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Faturamento Total</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalFaturamento)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Período selecionado</p>
                        </div>
                        <div className="text-4xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 w-16 h-16 rounded-full flex items-center justify-center">
                            💰
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total de Peças</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(totalPecas)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Período selecionado</p>
                        </div>
                        <div className="text-4xl bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 w-16 h-16 rounded-full flex items-center justify-center">
                            📦
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Ticket Médio</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(ticketMedio)}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Por pedido</p>
                        </div>
                        <div className="text-4xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 w-16 h-16 rounded-full flex items-center justify-center">
                            💵
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendas</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gerenciamento de vendas e pedidos</p>
                    </div>
                </header>

                <div className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-wrap gap-6 items-end">
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />
                        <div className="flex-1 min-w-[200px]">
                            <StoreFilter
                                stores={stores}
                                selectedStore={selectedStore}
                                onStoreChange={setSelectedStore}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8">
                    {renderCards()}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-900">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peças</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {filteredVendas.map((venda, index) => (
                                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                                    {new Date(venda.periodo).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{venda.loja || '-'}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{venda.pedidos}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {parseFloat(venda.pecas || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    R$ {parseFloat(venda.faturamento || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                                    R$ {parseFloat(venda.ticket_medio || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardWrapper>
    );
}
