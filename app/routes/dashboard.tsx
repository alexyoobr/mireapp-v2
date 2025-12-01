import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getAuth, apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import { useFilter } from '~/components/FilterContext';

interface KPIPeriodo {
    inicio: string;
    fim: string;
    faturamento: number;
    pedidos: number;
    pecas: number;
    ticket_medio: number;
    clientes_ativos: number;
    clientes_novos: number;
    preco_medio_produto: number;
}

interface KPICrescimento {
    faturamento_pct: number;
    pecas_pct: number;
    pedidos_pct: number;
    ticket_medio_pct: number;
    clientes_ativos_pct: number;
    clientes_novos_pct: number;
    preco_medio_produto_pct: number;
}

interface KPIComparativoData {
    periodo_atual: KPIPeriodo;
    periodo_anterior: KPIPeriodo;
    crescimento: KPICrescimento;
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [dbName, setDbName] = useState<string>('');
    const [kpiData, setKpiData] = useState<KPIComparativoData | null>(null);
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
        const auth = getAuth();
        if (!auth) {
            navigate('/login');
            return;
        }
        setDbName(auth);

        // Only load stores if not already loaded
        if (stores.length === 0) {
            loadStores(auth);
        }

        loadKPIs(auth);
    }, [navigate, startDate, endDate, selectedStore]);

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

    const loadKPIs = async (db: string) => {
        setLoading(true);
        try {
            const inicioStr = startDate;
            const fimStr = endDate;

            // Calculate previous year dates
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T00:00:00');

            const prevStart = new Date(start);
            prevStart.setFullYear(start.getFullYear() - 1);

            const prevEnd = new Date(end);
            prevEnd.setFullYear(end.getFullYear() - 1);

            const prevInicioStr = prevStart.toISOString().split('T')[0];
            const prevFimStr = prevEnd.toISOString().split('T')[0];

            let currentUrl = `/kpis?inicio=${inicioStr}&fim=${fimStr}`;
            let prevUrl = `/kpis?inicio=${prevInicioStr}&fim=${prevFimStr}`;

            if (selectedStore) {
                const storeParam = `&idloja=${selectedStore}`;
                currentUrl += storeParam;
                prevUrl += storeParam;
            }

            // Fetch both periods in parallel
            const [currentData, prevData] = await Promise.all([
                apiRequest<any>(currentUrl, db),
                apiRequest<any>(prevUrl, db)
            ]);

            // Map API response to internal structure
            const mapToPeriodo = (data: any, inicio: string, fim: string): KPIPeriodo => ({
                inicio,
                fim,
                faturamento: data.total_vendido_periodo || 0,
                pedidos: data.total_pedidos || 0,
                pecas: data.total_pecas_vendidas || 0,
                ticket_medio: data.ticket_medio_geral || 0,
                clientes_ativos: 0, // Not returned by /kpis endpoint anymore
                clientes_novos: data.clientes_novos || 0,
                preco_medio_produto: data.preco_medio_produto || 0
            });

            const periodoAtual = mapToPeriodo(currentData, inicioStr, fimStr);
            const periodoAnterior = mapToPeriodo(prevData, prevInicioStr, prevFimStr);

            // Calculate growth
            const calculateGrowth = (current: number, previous: number) => {
                if (!previous) return 0;
                return ((current - previous) / previous) * 100;
            };

            const crescimento: KPICrescimento = {
                faturamento_pct: calculateGrowth(periodoAtual.faturamento, periodoAnterior.faturamento),
                pedidos_pct: calculateGrowth(periodoAtual.pedidos, periodoAnterior.pedidos),
                pecas_pct: calculateGrowth(periodoAtual.pecas, periodoAnterior.pecas),
                ticket_medio_pct: calculateGrowth(periodoAtual.ticket_medio, periodoAnterior.ticket_medio),
                clientes_ativos_pct: 0,
                clientes_novos_pct: calculateGrowth(periodoAtual.clientes_novos, periodoAnterior.clientes_novos),
                preco_medio_produto_pct: calculateGrowth(periodoAtual.preco_medio_produto, periodoAnterior.preco_medio_produto)
            };

            setKpiData({
                periodo_atual: periodoAtual,
                periodo_anterior: periodoAnterior,
                crescimento
            });

        } catch (error) {
            console.error('Error loading KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number | undefined) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const formatNumber = (value: number | undefined) => {
        return new Intl.NumberFormat('pt-BR').format(value || 0);
    };

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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Visão geral dos principais indicadores</p>
                </div>

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

                {/* KPI Cards */}
                {loading || !kpiData ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            <KPICard
                                title="Total de Pedidos"
                                value={formatNumber(kpiData.periodo_atual.pedidos)}
                                previousValue={formatNumber(kpiData.periodo_anterior.pedidos)}
                                growth={kpiData.crescimento.pedidos_pct}
                                icon="📋"
                                color="blue"
                                description="Pedidos no período"
                            />
                            <KPICard
                                title="Faturamento Total"
                                value={formatCurrency(kpiData.periodo_atual.faturamento)}
                                previousValue={formatCurrency(kpiData.periodo_anterior.faturamento)}
                                growth={kpiData.crescimento.faturamento_pct}
                                icon="💰"
                                color="green"
                                description="Receita total"
                            />
                            <KPICard
                                title="Ticket Médio"
                                value={formatCurrency(kpiData.periodo_atual.ticket_medio)}
                                previousValue={formatCurrency(kpiData.periodo_anterior.ticket_medio)}
                                growth={kpiData.crescimento.ticket_medio_pct}
                                icon="💵"
                                color="yellow"
                                description="Por pedido"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <KPICard
                                title="Novos Clientes"
                                value={formatNumber(kpiData.periodo_atual.clientes_novos)}
                                previousValue={formatNumber(kpiData.periodo_anterior.clientes_novos)}
                                growth={kpiData.crescimento.clientes_novos_pct}
                                icon="👥"
                                color="purple"
                                description="Novos clientes no período"
                            />
                            <KPICard
                                title="Total Produtos"
                                value={formatNumber(kpiData.periodo_atual.pecas)}
                                previousValue={formatNumber(kpiData.periodo_anterior.pecas)}
                                growth={kpiData.crescimento.pecas_pct}
                                icon="📦"
                                color="pink"
                                description="Produtos vendidos"
                            />
                            <KPICard
                                title="Preço Médio Produto"
                                value={formatCurrency(kpiData.periodo_atual.preco_medio_produto)}
                                previousValue={formatCurrency(kpiData.periodo_anterior.preco_medio_produto)}
                                growth={kpiData.crescimento.preco_medio_produto_pct}
                                icon="🏷️"
                                color="indigo"
                                description="Média por produto"
                            />
                        </div>

                        {/* Quick Links */}
                        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Acesso Rápido</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <QuickLink
                                    title="Vendas"
                                    description="Análise detalhada de vendas"
                                    icon="💰"
                                    href="/vendas"
                                />
                                <QuickLink
                                    title="Clientes"
                                    description="Gestão de clientes"
                                    icon="👥"
                                    href="/clientes"
                                />
                                <QuickLink
                                    title="Produtos"
                                    description="Análise de produtos"
                                    icon="📦"
                                    href="/produtos"
                                />
                                <QuickLink
                                    title="Vendedores"
                                    description="Performance de vendedores"
                                    icon="🎯"
                                    href="/vendedores"
                                />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardWrapper>
    );
}

function KPICard({ title, value, previousValue, growth, icon, color, description }: {
    title: string;
    value: string;
    previousValue?: string;
    growth?: number;
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
    };

    const isPositive = growth && growth >= 0;
    const growthFormatted = growth ? `${Math.abs(growth).toFixed(1)}%` : '0%';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-all hover:scale-105">
            <div className="flex items-center justify-between mb-4">
                <div className={`text-4xl ${colorClasses[color as keyof typeof colorClasses]} w-14 h-14 rounded-full flex items-center justify-center`}>
                    {icon}
                </div>
                {growth !== undefined && (
                    <div className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isPositive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                        {isPositive ? '↑' : '↓'} {growthFormatted}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>

            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                {previousValue && (
                    <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                        Ant: {previousValue}
                    </p>
                )}
            </div>
        </div>
    );
}

function QuickLink({ title, description, icon, href }: {
    title: string;
    description: string;
    icon: string;
    href: string;
}) {
    return (
        <a
            href={href}
            className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 hover:shadow-md transition-all group"
        >
            <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {title}
                </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </a>
    );
}
