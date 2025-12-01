import { useEffect, useState, useMemo } from 'react';
import { getAuth, apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import type { VendaSerie } from '~/types/venda';
import type { ClienteRanking } from '~/types/cliente';
import type { ProdutoRanking } from '~/types/produto';
import { useFilter } from '~/components/FilterContext';

type TabType = 'vendas' | 'clientes' | 'produtos' | 'contas';

export default function Vendas() {
    const [activeTab, setActiveTab] = useState<TabType>('vendas');
    const [rawData, setRawData] = useState<{
        vendas: VendaSerie[];
        clientes: any[];
        produtos: any[];
    }>({ vendas: [], clientes: [], produtos: [] });
    const [loading, setLoading] = useState(true);
    const [dbName, setDbName] = useState<string>('');

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
        const auth = getAuth();
        if (auth) {
            setDbName(auth);

            // Only load stores if not already loaded
            if (stores.length === 0) {
                loadStores(auth);
            }

            loadData(auth);
        }
    }, [startDate, endDate, selectedStore]);

    const loadStores = async (db: string) => {
        try {
            const response = await apiRequest<any[]>(`/vendas/lojas-ranking?inicio=${startDate}&fim=${endDate}`, db);
            const uniqueStores = new Map<string, string>();
            response.forEach(item => {
                if (item.idloja && item.loja) {
                    uniqueStores.set(item.idloja, item.loja);
                }
            });
            setStores(Array.from(uniqueStores.entries()).map(([id, name]) => ({ id: String(id), name })));
        } catch (error) {
            console.error('Error loading stores:', error);
        }
    };

    const loadData = async (db: string) => {
        setLoading(true);
        try {
            const inicioStr = startDate;
            const fimStr = endDate;

            let vendasUrl = `/vendas/serie?inicio=${inicioStr}&fim=${fimStr}&nivel=dia`;
            let clientesUrl = `/clientes?inicio=${inicioStr}&fim=${fimStr}`;
            let produtosUrl = `/produtos/analise?inicio=${inicioStr}&fim=${fimStr}`;

            if (selectedStore) {
                const storeParam = `&idloja=${selectedStore}`;
                vendasUrl += storeParam;
                clientesUrl += storeParam;
                produtosUrl += storeParam;
            }

            const [vendasData, clientes, produtos] = await Promise.all([
                apiRequest<VendaSerie[]>(vendasUrl, db),
                apiRequest<any[]>(clientesUrl, db),
                apiRequest<any[]>(produtosUrl, db),
            ]);

            setRawData({ vendas: vendasData, clientes, produtos });
        } catch (error) {
            console.error('Error loading data:', error);
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
        { id: 'vendas', label: 'Vendas' },
        { id: 'clientes', label: 'Top Clientes' },
        { id: 'produtos', label: 'Top Produtos' },
        { id: 'contas', label: 'Contas' },
    ];

    const renderCards = () => {
        if (loading) return null;

        if (activeTab === 'vendas') {
            const totalPedidos = rawData.vendas.reduce((sum, v) => sum + (v.pedidos || 0), 0);
            const totalFaturamento = rawData.vendas.reduce((sum, v) => sum + parseFloat(v.faturamento || '0'), 0);
            const totalPecas = rawData.vendas.reduce((sum, v) => sum + parseFloat(v.pecas || '0'), 0);
            const totalDevolucoes = rawData.vendas.reduce((sum, v) => sum + parseFloat(v.devolucoes || '0'), 0);
            const totalPecasLiquidas = rawData.vendas.reduce((sum, v) => sum + parseFloat(v.pecas_liquidas || '0'), 0);
            const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-6">
                    <StatCard title="Total de Pedidos" value={totalPedidos} icon="📋" color="blue" />
                    <StatCard title="Faturamento Total" value={formatCurrency(totalFaturamento)} icon="💰" color="green" />
                    <StatCard title="Total de Peças" value={formatNumber(totalPecas)} icon="📦" color="purple" />
                    <StatCard title="Devoluções" value={formatNumber(totalDevolucoes)} icon="↩️" color="red" />
                    <StatCard title="Peças Líquidas" value={formatNumber(totalPecasLiquidas)} icon="✅" color="indigo" />
                    <StatCard title="Ticket Médio" value={formatCurrency(ticketMedio)} icon="💵" color="yellow" />
                </div>
            );
        }

        if (activeTab === 'clientes') {
            const totalClientes = rawData.clientes.length;
            const totalRevenue = rawData.clientes.reduce((sum, c) => sum + parseFloat(c.faturamento_total || c.valor_total_comprado_ltv || '0'), 0);
            const avgTicket = totalClientes > 0 ? totalRevenue / totalClientes : 0;

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total de Clientes" value={totalClientes} icon="👥" color="blue" />
                    <StatCard title="Faturamento Total" value={formatCurrency(totalRevenue)} icon="💰" color="green" />
                    <StatCard title="Ticket Médio" value={formatCurrency(avgTicket)} icon="📊" color="purple" />
                </div>
            );
        }

        if (activeTab === 'produtos') {
            const totalProdutos = rawData.produtos.length;
            const totalRevenue = rawData.produtos.reduce((sum, p) => sum + parseFloat(p.valor_vendido || '0'), 0);
            const totalQtd = rawData.produtos.reduce((sum, p) => sum + parseFloat(p.quantidade_vendida || p.quantidade || '0'), 0);

            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    <StatCard title="Total de Produtos" value={totalProdutos} icon="📦" color="blue" />
                    <StatCard title="Faturamento Total" value={formatCurrency(totalRevenue)} icon="💰" color="green" />
                    <StatCard title="Quantidade Vendida" value={formatNumber(totalQtd)} icon="📊" color="purple" />
                </div>
            );
        }

        return null;
    };

    const renderTable = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
            );
        }

        switch (activeTab) {
            case 'vendas':
                return <VendasTab data={rawData.vendas} stores={stores} selectedStore={selectedStore} />;
            case 'clientes':
                return <ClientesTab data={rawData.clientes} stores={stores} selectedStore={selectedStore} />;
            case 'produtos':
                return <ProdutosTab data={rawData.produtos} stores={stores} selectedStore={selectedStore} />;
            case 'contas':
                return <ContasTab dbName={dbName} />;
            default:
                return null;
        }
    };

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Vendas</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Análise detalhada de vendas, clientes e produtos</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-200 dark:border-gray-700 overflow-x-auto">
                        <nav className="flex px-8 min-w-max" aria-label="Tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                                        whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm transition-colors flex-shrink-0
                                        ${activeTab === tab.id
                                            ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}
                                    `}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
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

function StatCard({ title, value, icon, color }: { title: string; value: string | number; icon: string; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        green: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400',
        purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
        yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400',
        red: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
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

function VendasTab({ data, stores, selectedStore }: { data: VendaSerie[]; stores: { id: string; name: string }[]; selectedStore: string }) {
    return (
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Loja</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pedidos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peças</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Devoluções</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Peças Líq.</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Faturamento</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket Médio</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.map((venda, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(venda.periodo).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {venda.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : 'Todas')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">{venda.pedidos}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            {parseFloat(venda.pecas || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 text-right">
                            {parseFloat(venda.devolucoes || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 dark:text-indigo-400 text-right font-medium">
                            {parseFloat(venda.pecas_liquidas || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            R$ {parseFloat(venda.faturamento || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white text-right">
                            R$ {parseFloat(venda.ticket_medio || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function ClientesTab({ data, stores, selectedStore }: { data: ClienteRanking[]; stores: { id: string; name: string }[]; selectedStore: string }) {
    return (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {cliente.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : '-')}
                        </td>
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
    );
}

function ProdutosTab({ data, stores, selectedStore }: { data: ProdutoRanking[]; stores: { id: string; name: string }[]; selectedStore: string }) {
    return (
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
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {produto.loja || (selectedStore ? stores.find(s => s.id === selectedStore)?.name : '-')}
                        </td>
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
