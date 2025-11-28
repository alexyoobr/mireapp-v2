import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getAuth, clearAuth, apiRequest } from '~/lib/api';
import Sidebar from '~/components/Sidebar';
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
    const [stats, setStats] = useState<Stats>({
        totalVendas: 0,
        totalClientes: 0,
        totalProdutos: 0,
        valorTotal: 0,
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'vendas' | 'clientes' | 'produtos' | 'contas'>('vendas');

    useEffect(() => {
        const auth = getAuth();
        if (!auth) {
            navigate('/login');
            return;
        }
        setDbName(auth);
        loadDashboardData(auth);
    }, [navigate]);

    const loadDashboardData = async (db: string) => {
        setLoading(true);
        try {
            // Calculate date range (last 30 days)
            const fim = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - 30);

            const inicioStr = inicio.toISOString().split('T')[0];
            const fimStr = fim.toISOString().split('T')[0];

            // Load stats from different endpoints
            const [clientes, produtos, vendasData] = await Promise.all([
                apiRequest<any[]>(`/clientes?inicio=${inicioStr}&fim=${fimStr}`, db),
                apiRequest<any[]>(`/produtos/analise?inicio=${inicioStr}&fim=${fimStr}`, db),
                apiRequest<VendaSerie[]>(`/vendas/serie?inicio=${inicioStr}&fim=${fimStr}&nivel=dia`, db),
            ]);

            // Aggregate vendas data
            const totalVendas = vendasData.reduce((sum, v) => sum + (v.pedidos || 0), 0);
            const valorTotal = vendasData.reduce((sum, v) => sum + (parseFloat(v.faturamento) || 0), 0);

            setStats({
                totalClientes: clientes.length,
                totalProdutos: produtos.length,
                totalVendas: totalVendas,
                valorTotal: valorTotal,
            });
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    if (!dbName) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar dbName={dbName} onLogout={handleLogout} />
            <main className="flex-1 ml-64 transition-all duration-300">
                <div className="min-h-screen bg-gray-50">
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
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="border-b border-gray-200">
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
                                    {activeTab === 'vendas' && <VendasTab dbName={dbName} />}
                                    {activeTab === 'clientes' && <ClientesTab dbName={dbName} />}
                                    {activeTab === 'produtos' && <ProdutosTab dbName={dbName} />}
                                    {activeTab === 'contas' && <ContasTab dbName={dbName} />}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
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
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${active
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
        >
            {label}
        </button>
    );
}

function VendasTab({ dbName }: { dbName: string }) {
    const [vendas, setVendas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadVendas();
    }, []);

    const loadVendas = async () => {
        try {
            // Get last 30 days of daily sales data
            const fim = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - 30);

            const inicioStr = inicio.toISOString().split('T')[0];
            const fimStr = fim.toISOString().split('T')[0];

            const data = await apiRequest<any[]>(`/vendas/serie?inicio=${inicioStr}&fim=${fimStr}&nivel=dia`, dbName);
            setVendas(data);
        } catch (error) {
            console.error('Error loading vendas:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Carregando vendas...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peças</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {vendas.slice(0, 10).map((venda, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {new Date(venda.periodo).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venda.pedidos}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {parseFloat(venda.pecas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                R$ {parseFloat(venda.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                R$ {parseFloat(venda.ticket_medio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ClientesTab({ dbName }: { dbName: string }) {
    const [clientes, setClientes] = useState<ClienteRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClientes();
    }, []);

    const loadClientes = async () => {
        try {
            const data = await apiRequest<ClienteRanking[]>('/clientes/ranking', dbName);
            setClientes(data);
        } catch (error) {
            console.error('Error loading clientes:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Carregando clientes...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {clientes.slice(0, 10).map((cliente) => (
                        <tr key={cliente.idcliente} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{cliente.ranking_faturamento}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="font-medium">{cliente.nome}</div>
                                <div className="text-xs text-gray-500">{cliente.idcliente}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {parseFloat(cliente.faturamento_total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{cliente.total_pedidos}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {parseFloat(cliente.ticket_medio).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function ProdutosTab({ dbName }: { dbName: string }) {
    const [produtos, setProdutos] = useState<ProdutoRanking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProdutos();
    }, []);

    const loadProdutos = async () => {
        try {
            const data = await apiRequest<ProdutoRanking[]>('/produtos/ranking', dbName);
            setProdutos(data);
        } catch (error) {
            console.error('Error loading produtos:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="text-center py-8">Carregando produtos...</div>;

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.slice(0, 10).map((produto) => (
                        <tr key={produto.idproduto} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{produto.rank_faturamento}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                                <div className="font-medium">{produto.descricao}</div>
                                <div className="text-xs text-gray-500">{produto.idproduto}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {parseFloat(produto.valor_vendido).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                                {parseFloat(produto.quantidade).toLocaleString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{produto.pedidos}</td>
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
            <p className="text-gray-500">Seção de contas em desenvolvimento</p>
            <p className="text-sm text-gray-400 mt-2">Conectado ao banco: {dbName}</p>
        </div>
    );
}
