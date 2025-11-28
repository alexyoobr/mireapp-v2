import { useEffect, useState } from 'react';
import { getAuth, apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import type { ClienteOverview, ClienteRanking, ClienteRFM } from '~/types/cliente';

type TabType = 'overview' | 'ranking' | 'rfm';

export default function Clientes() {
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dbName = getAuth();
        if (dbName) {
            loadData(dbName, activeTab);
        }
    }, [activeTab]);

    const loadData = async (dbName: string, tab: TabType) => {
        setLoading(true);
        try {
            let endpoint = '';

            // Calculate default date range (last 30 days)
            const fim = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - 30);
            const inicioStr = inicio.toISOString().split('T')[0];
            const fimStr = fim.toISOString().split('T')[0];

            switch (tab) {
                case 'overview': endpoint = `/clientes?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'ranking': endpoint = `/clientes/ranking?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'rfm': endpoint = `/clientes/rfm?inicio=${inicioStr}&fim=${fimStr}`; break;
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

    const tabs: { id: TabType; label: string }[] = [
        { id: 'overview', label: 'Visão Geral' },
        { id: 'ranking', label: 'Ranking' },
        { id: 'rfm', label: 'Análise RFM' },
    ];

    const renderTable = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        if (!data || data.length === 0) {
            return (
                <div className="text-center py-12 text-gray-500">
                    Nenhum dado encontrado para esta visualização.
                </div>
            );
        }

        switch (activeTab) {
            case 'overview':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Localização</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">LTV</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ClienteOverview[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{item.nome}</div>
                                        <div className="text-xs text-gray-500">{item.idcliente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cidade}/{item.uf}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.valor_total_comprado_ltv)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.numero_pedidos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.ticket_medio)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status_cliente === 'Ativo' ? 'bg-green-100 text-green-800' :
                                            item.status_cliente === 'Inativo' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {item.status_cliente}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'ranking':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Peças</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ClienteRanking[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.ranking_faturamento}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{item.nome}</div>
                                        <div className="text-xs text-gray-500">{item.idcliente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.faturamento_total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.total_pedidos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.total_pecas)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.ticket_medio)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'rfm':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Compra</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Recência (Dias)</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Frequência</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Monetário</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ClienteRFM[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{item.nome}</div>
                                        <div className="text-xs text-gray-500">{item.idcliente}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.ultima_compra).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.recencia_dias}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.frequencia}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.monetary)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            default:
                return null;
        }
    };

    const renderCards = () => {
        if (loading || !data || data.length === 0) return null;

        let totalClientes = 0;
        let totalRevenue = 0;
        let avgTicket = 0;
        let activeClients = 0;

        switch (activeTab) {
            case 'overview':
                const overviewData = data as ClienteOverview[];
                totalClientes = overviewData.length;
                totalRevenue = overviewData.reduce((sum, c) => sum + parseFloat(c.valor_total_comprado_ltv || '0'), 0);
                avgTicket = overviewData.reduce((sum, c) => sum + parseFloat(c.ticket_medio || '0'), 0) / totalClientes;
                activeClients = overviewData.filter(c => c.status_cliente === 'Ativo').length;
                break;
            case 'ranking':
                const rankingData = data as ClienteRanking[];
                totalClientes = rankingData.length;
                totalRevenue = rankingData.reduce((sum, c) => sum + parseFloat(c.faturamento_total || '0'), 0);
                avgTicket = rankingData.reduce((sum, c) => sum + parseFloat(c.ticket_medio || '0'), 0) / totalClientes;
                activeClients = totalClientes; // All ranked clients are considered active
                break;
            case 'rfm':
                const rfmData = data as ClienteRFM[];
                totalClientes = rfmData.length;
                totalRevenue = rfmData.reduce((sum, c) => sum + parseFloat(c.monetary || '0'), 0);
                avgTicket = totalRevenue / totalClientes;
                activeClients = rfmData.filter(c => c.recencia_dias <= 90).length; // Active if purchased in last 90 days
                break;
        }

        const activePercentage = totalClientes > 0 ? (activeClients / totalClientes * 100).toFixed(1) : '0';

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total de Clientes</p>
                            <p className="text-2xl font-bold text-gray-900">{totalClientes}</p>
                        </div>
                        <div className="text-4xl bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                            👥
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Faturamento Total</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="text-4xl bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center">
                            💰
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgTicket)}</p>
                        </div>
                        <div className="text-4xl bg-purple-50 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                            📊
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Clientes Ativos</p>
                            <p className="text-2xl font-bold text-gray-900">{activePercentage}%</p>
                            <p className="text-xs text-gray-500 mt-1">{activeClients} de {totalClientes}</p>
                        </div>
                        <div className="text-4xl bg-yellow-50 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center">
                            ✨
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
                        <p className="text-sm text-gray-600 mt-1">Gerenciamento e análise de clientes</p>
                    </div>

                    {/* Tabs */}
                    <div className="px-8 border-t border-gray-200 overflow-x-auto">
                        <nav className="flex space-x-8" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                        ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </header>

                <div className="px-8 py-8">
                    {renderCards()}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            {renderTable()}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}
