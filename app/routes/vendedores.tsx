import { useEffect, useState, useMemo } from 'react';
import { getAuth, apiRequest, formatDateBR } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import type { VendedorRanking, VendedorMensal, VendedorRFM } from '~/types/vendedor';
import { useFilter } from '~/components/FilterContext';

type TabType = 'ranking' | 'mensal' | 'rfm';

export default function Vendedores() {
    const [activeTab, setActiveTab] = useState<TabType>('ranking');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Global filter state
    const {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        selectedStore,
        setSelectedStore,
        stores,
        setStores
    } = useFilter();

    useEffect(() => {
        const dbName = getAuth();
        if (dbName) {
            // Only load stores if not already loaded
            if (stores.length === 0) {
                loadStores(dbName);
            }
            loadData(dbName, activeTab);
        }
    }, [activeTab, startDate, endDate, selectedStore]);

    const loadStores = async (dbName: string) => {
        try {
            const response = await apiRequest<any[]>(`/vendas/lojas-ranking?inicio=${startDate}&fim=${endDate}`, dbName);
            const uniqueStores = new Map<string, string>();
            response.forEach(item => {
                if (item.idloja && item.loja) {
                    uniqueStores.set(item.idloja, item.loja);
                }
            });
            const storesArray = Array.from(uniqueStores.entries()).map(([id, name]) => ({ id: String(id), name }));
            setStores(storesArray);
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    };

    const loadData = async (dbName: string, tab: TabType) => {
        setLoading(true);
        try {
            // Convert to DD/MM/YYYY for API
            const inicioBR = formatDateBR(startDate);
            const fimBR = formatDateBR(endDate);

            let endpoint = '';
            switch (tab) {
                case 'ranking':
                    endpoint = `/vendedores/ranking?datainicial=${inicioBR}&datafinal=${fimBR}`;
                    break;
                case 'mensal':
                    endpoint = `/vendedores/mensal?datainicial=${inicioBR}&datafinal=${fimBR}`;
                    break;
                case 'rfm':
                    endpoint = `/vendedores/rfm?datainicial=${inicioBR}&datafinal=${fimBR}`;
                    break;
            }

            if (selectedStore) {
                endpoint += `&idloja=${selectedStore}`;
            }

            const responseData = await apiRequest<any[]>(endpoint, dbName);
            setData(responseData);
        } catch (error) {
            console.error(`Error loading ${tab} data:`, error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    const formatNumber = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR').format(num || 0);
    };

    const totals = useMemo(() => {
        if (!data.length) return null;

        if (activeTab === 'ranking') {
            const totalFaturamento = data.reduce((acc, item) => acc + (Number(item.faturamento_total || item.faturamento) || 0), 0);
            const totalPedidos = data.reduce((acc, item) => acc + (Number(item.total_pedidos || item.pedidos) || 0), 0);
            const totalPecas = data.reduce((acc, item) => acc + (Number(item.total_pecas || item.pecas || item.quantidade) || 0), 0);
            const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

            return [
                { title: 'Faturamento Total', value: formatCurrency(totalFaturamento), icon: '💰', color: 'green', description: 'Soma de todas as vendas' },
                { title: 'Total de Pedidos', value: totalPedidos.toString(), icon: '📋', color: 'blue', description: 'Quantidade total de pedidos' },
                { title: 'Total de Peças', value: formatNumber(totalPecas), icon: '👕', color: 'purple', description: 'Peças vendidas' },
                { title: 'Ticket Médio Geral', value: formatCurrency(ticketMedio), icon: '💵', color: 'yellow', description: 'Média por pedido' },
            ];
        } else if (activeTab === 'mensal') {
            const totalFaturamento = data.reduce((acc, item) => acc + (Number(item.faturamento) || 0), 0);
            const totalPedidos = data.reduce((acc, item) => acc + (Number(item.pedidos) || 0), 0);
            const totalPecas = data.reduce((acc, item) => acc + (Number(item.quantidade) || 0), 0);
            const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

            return [
                { title: 'Faturamento no Período', value: formatCurrency(totalFaturamento), icon: '💰', color: 'green', description: 'Soma do faturamento mensal' },
                { title: 'Total de Pedidos', value: totalPedidos.toString(), icon: '📋', color: 'blue', description: 'Pedidos no período' },
                { title: 'Total de Peças', value: formatNumber(totalPecas), icon: '👕', color: 'purple', description: 'Peças vendidas no período' },
                { title: 'Ticket Médio Mensal', value: formatCurrency(ticketMedio), icon: '💵', color: 'yellow', description: 'Média mensal por pedido' },
            ];
        } else if (activeTab === 'rfm') {
            const totalMonetary = data.reduce((acc, item) => acc + (Number(item.monetary) || 0), 0);
            const avgRecencia = data.reduce((acc, item) => acc + (Number(item.recencia_dias) || 0), 0) / (data.length || 1);
            const avgFrequencia = data.reduce((acc, item) => acc + (Number(item.frequencia) || 0), 0) / (data.length || 1);

            return [
                { title: 'Valor Monetário Total', value: formatCurrency(totalMonetary), icon: '💎', color: 'indigo', description: 'Valor total acumulado' },
                { title: 'Média de Recência', value: `${Math.round(avgRecencia)} dias`, icon: '📅', color: 'orange', description: 'Tempo médio desde última compra' },
                { title: 'Média de Frequência', value: avgFrequencia.toFixed(1), icon: '🔄', color: 'teal', description: 'Média de compras por vendedor' },
                { title: 'Vendedores Analisados', value: data.length.toString(), icon: '👥', color: 'blue', description: 'Total de vendedores na lista' },
            ];
        }
        return null;
    }, [data, activeTab]);

    const renderTable = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-gray-500 dark:text-gray-400">
                    <span className="text-4xl mb-4">🔍</span>
                    <p>Nenhum dado encontrado para o período selecionado.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'ranking':
                return (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ranking</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peças</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((item: any, index) => (
                                <tr key={item.idvendedor} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-bold">#{index + 1}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {item.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : 'Todas')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.faturamento_total || item.faturamento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.total_pedidos || item.pedidos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatNumber(item.total_pecas || item.pecas || item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.ticket_medio)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'mensal':
                return (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês/Ano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peças</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((item: VendedorMensal, index) => (
                                <tr key={`${item.idvendedor}-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{item.mes_ano}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {item.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : 'Todas')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.faturamento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.pedidos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatNumber(item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.ticket_medio)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'rfm':
                return (
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Vendedor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Última Venda</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recência (Dias)</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Frequência</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Valor Monetário</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.map((item: VendedorRFM) => (
                                <tr key={item.idvendedor} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{item.nome}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {item.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : 'Todas')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {new Date(item.ultima_venda).toLocaleDateString('pt-BR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.recencia_dias}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{item.frequencia}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.monetary)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
        }
    };

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Análise de Vendedores</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Desempenho e ranking da equipe de vendas</p>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 flex space-x-8 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('ranking')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'ranking'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Ranking Geral
                        </button>
                        <button
                            onClick={() => setActiveTab('mensal')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'mensal'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Desempenho Mensal
                        </button>
                        <button
                            onClick={() => setActiveTab('rfm')}
                            className={`pb-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'rfm'
                                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                                }`}
                        >
                            Análise RFM
                        </button>
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
                    {/* Summary Cards */}
                    {totals && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {totals.map((card, index) => (
                                <SummaryCard
                                    key={index}
                                    title={card.title}
                                    value={card.value}
                                    icon={card.icon}
                                    color={card.color}
                                    description={card.description}
                                />
                            ))}
                        </div>
                    )}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="overflow-x-auto">
                            {renderTable()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

function SummaryCard({ title, value, icon, color, description }: {
    title: string;
    value: string;
    icon: string;
    color: string;
    description: string;
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
        pink: 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400',
        orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
        teal: 'bg-teal-50 text-teal-600 dark:bg-teal-900/20 dark:text-teal-400',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className={`text-3xl ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue} w-12 h-12 rounded-full flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{description}</p>
        </div>
    );
}
