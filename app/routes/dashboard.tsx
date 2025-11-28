import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { getAuth, apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import type { ClienteRanking } from '~/types/cliente';
import type { ProdutoRanking } from '~/types/produto';
import type { VendaSerie } from '~/types/venda';

interface Stats {
    totalVendas: number;
    totalClientes: number;
    totalProdutos: number;
    valorTotal: number;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState<string>('');
    const [rawData, setRawData] = useState<{
        clientes: any[];
        produtos: any[];
        vendas: VendaSerie[];
    }>({ clientes: [], produtos: [], vendas: [] });

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'vendas' | 'clientes' | 'produtos' | 'contas'>('vendas');

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
        const auth = getAuth();
        if (!auth) {
            navigate('/login');
            return;
        }
        setDbName(auth);
        loadDashboardData(auth);
    }, [navigate, startDate, endDate]);

    const loadDashboardData = async (db: string) => {
        setLoading(true);
        try {
            // Use selected dates
            const inicioStr = startDate;
            const fimStr = endDate;

            // Load stats from different endpoints
            const [clientes, produtos, vendasData] = await Promise.all([
                apiRequest<any[]>(`/clientes?inicio=${inicioStr}&fim=${fimStr}`, db),
                apiRequest<any[]>(`/produtos/analise?inicio=${inicioStr}&fim=${fimStr}`, db),
                apiRequest<VendaSerie[]>(`/vendas/serie?inicio=${inicioStr}&fim=${fimStr}&nivel=dia`, db),
            ]);

            setRawData({ clientes, produtos, vendas: vendasData });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Extract unique stores from data
    const stores = useMemo(() => {
        const storeMap = new Map<string, string>();

        // Helper to add stores from data arrays
        const addStores = (data: any[]) => {
            data.forEach(item => {
                if (item.idloja && item.loja) {
                    storeMap.set(item.idloja, item.loja);
                }
            });
        };

        addStores(rawData.vendas);
        addStores(rawData.clientes);
        addStores(rawData.produtos);

        return Array.from(storeMap.entries()).map(([id, name]) => ({ id, name }));
    }, [rawData]);

    // Filter data based on selected store
    const filteredData = useMemo(() => {
        if (!selectedStore) return rawData;

        return {
            clientes: rawData.clientes.filter(c => !c.idloja || c.idloja === selectedStore),
            produtos: rawData.produtos.filter(p => !p.idloja || p.idloja === selectedStore),
            vendas: rawData.vendas.filter(v => !v.idloja || v.idloja === selectedStore),
        };
    }, [rawData, selectedStore]);

    // Calculate stats from filtered data
    const stats = useMemo(() => {
        const totalVendas = filteredData.vendas.reduce((sum, v) => sum + (v.pedidos || 0), 0);
        const valorTotal = filteredData.vendas.reduce((sum, v) => sum + (parseFloat(v.faturamento) || 0), 0);

        return {
            totalClientes: filteredData.clientes.length,
            totalProdutos: filteredData.produtos.length,
            totalVendas: totalVendas,
            valorTotal: valorTotal,
        };
    }, [filteredData]);

    if (!dbName) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
                {/* Filters */}
                <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total de Vendas"
                        value={stats.totalVendas}
                        icon="📊"
                        color="blue"
                    />
                    <StatCard
                        title="Clientes"
                        value={stats.totalClientes}
                        icon="👥"
                        color="green"
                    />
                    <StatCard
                        title="Produtos"
                        value={stats.totalProdutos}
                        icon="📦"
                        color="purple"
                    />
                    <StatCard
                        title="Valor Total"
                        value={`R$ ${stats.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        icon="💰"
                        color="yellow"
                    />
                </div>

                {/* Tabs */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <nav className="flex space-x-8 px-6" aria-label="Tabs">
                            <TabButton
                                active={activeTab === 'vendas'}
                                onClick={() => setActiveTab('vendas')}
                                label="Vendas"
                            />
                            <TabButton
                                active={activeTab === 'clientes'}
                                onClick={() => setActiveTab('clientes')}
                                label="Top Clientes"
                            />
                            <TabButton
                                active={activeTab === 'produtos'}
                                onClick={() => setActiveTab('produtos')}
                                label="Top Produtos"
                            />
                            <TabButton
                                active={activeTab === 'contas'}
                                onClick={() => setActiveTab('contas')}
                                label="Contas"
                            />
                        </nav>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'vendas' && <VendasTab data={filteredData.vendas} />}
                                {activeTab === 'clientes' && <ClientesTab data={filteredData.clientes} />}
                                {activeTab === 'produtos' && <ProdutosTab data={filteredData.produtos} />}
                                {activeTab === 'contas' && <ContasTab dbName={dbName} />}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        yellow: 'bg-yellow-50 text-yellow-600',
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                </div>
                <div className={`text-4xl ${colorClasses[color as keyof typeof colorClasses]} w-16 h-16 rounded-full flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
    return (
        <button
            onClick={onClick}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${active
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'
                }`}
        >
            {label}
        </button>
    );
}

function VendasTab({ data }: { data: VendaSerie[] }) {
    return (
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
                    {data.slice(0, 10).map((venda, index) => (
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
    );
}

function ClientesTab({ data }: { data: ClienteRanking[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.slice(0, 10).map((cliente) => (
                        <tr key={cliente.idcliente} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{cliente.ranking_faturamento}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="font-medium">{cliente.nome}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{cliente.idcliente}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{cliente.loja || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                {parseFloat(cliente.faturamento_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">{cliente.total_pedidos}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                {parseFloat(cliente.ticket_medio).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ProdutosTab({ data }: { data: ProdutoRanking[] }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qtd</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                    </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {data.slice(0, 10).map((produto) => (
                        <tr key={produto.idproduto} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{produto.rank_faturamento}</td>
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="font-medium">{produto.descricao}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{produto.idproduto}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{produto.loja || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                {parseFloat(produto.valor_vendido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                                {parseFloat(produto.quantidade).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{produto.pedidos}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ContasTab({ dbName }: { dbName: string }) {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Seção de contas em desenvolvimento</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Conectado ao banco: {dbName}</p>
        </div>
    );
}
