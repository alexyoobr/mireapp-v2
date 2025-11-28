import { useEffect, useState } from 'react';
import { getAuth, apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import type {
    ProdutoAnalise,
    ProdutoAgregacao,
    ProdutoRanking,
    ProdutoSKU,
    ProdutoMensal,
    ProdutoParado,
    ProdutoVidaUtil,
    ProdutoMargem
} from '~/types/produto';

type TabType = 'analise' | 'colecao' | 'cor' | 'tamanho' | 'ranking' | 'sku' | 'mensal' | 'parados' | 'vida-util' | 'margem';

export default function Produtos() {
    const [activeTab, setActiveTab] = useState<TabType>('analise');
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
            // Calculate default date range (last 30 days)
            const fim = new Date();
            const inicio = new Date();
            inicio.setDate(inicio.getDate() - 30);
            const inicioStr = inicio.toISOString().split('T')[0];
            const fimStr = fim.toISOString().split('T')[0];

            let endpoint = '';
            switch (tab) {
                case 'analise': endpoint = `/produtos/analise?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'colecao': endpoint = `/produtos/colecao?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'cor': endpoint = `/produtos/cor?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'tamanho': endpoint = `/produtos/tamanho?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'ranking': endpoint = `/produtos/ranking?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'sku': endpoint = `/produtos/sku?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'mensal': endpoint = `/produtos/mensal?inicio=${inicioStr}&fim=${fimStr}`; break;
                case 'parados': endpoint = '/produtos/parados'; break;
                case 'vida-util': endpoint = '/produtos/vida-util'; break;
                case 'margem': endpoint = `/produtos/margem?inicio=${inicioStr}&fim=${fimStr}`; break;
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
        { id: 'analise', label: 'Análise Geral' },
        { id: 'ranking', label: 'Ranking' },
        { id: 'colecao', label: 'Por Coleção' },
        { id: 'cor', label: 'Por Cor' },
        { id: 'tamanho', label: 'Por Tamanho' },
        { id: 'sku', label: 'SKU' },
        { id: 'mensal', label: 'Mensal' },
        { id: 'parados', label: 'Parados' },
        { id: 'vida-util', label: 'Vida Útil' },
        { id: 'margem', label: 'Margem' },
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
            case 'analise':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd. Vendida</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Vendido</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket Médio</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Curva ABC</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoAnalise[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{item.descricao}</div>
                                        <div className="text-xs text-gray-500">{item.idproduto}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.quantidade_vendida)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.valor_vendido)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.pedidos_produto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.ticket_medio_produto)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.curva_abc_valor === 'A' ? 'bg-green-100 text-green-800' :
                                            item.curva_abc_valor === 'B' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {item.curva_abc_valor}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'colecao':
            case 'cor':
            case 'tamanho':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {activeTab === 'colecao' ? 'Coleção' : activeTab === 'cor' ? 'Cor' : 'Tamanho'}
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Preço Médio</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoAgregacao[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.pedidos}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.faturamento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.preco_medio)}</td>
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Pedidos</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoRanking[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{item.rank_faturamento}</td>
                                    <td className="px-6 py-4 text-sm text-gray-900">
                                        <div className="font-medium">{item.descricao}</div>
                                        <div className="text-xs text-gray-500">{item.idproduto}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.valor_vendido)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.pedidos}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'sku':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tam</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fat.</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoSKU[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.modelo}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.cor}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tamanho}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.faturamento)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'mensal':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mês/Ano</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qtd</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoMensal[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.mes_ano}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.idproduto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatNumber(item.quantidade)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.faturamento)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'parados':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Venda</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Dias sem Venda</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoParado[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.idproduto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.data_ultima_venda).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium text-right">{item.dias_sem_venda}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'vida-util':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Primeira Venda</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Última Venda</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Dias de Vida</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoVidaUtil[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.idproduto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.primeira_venda).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(item.ultima_venda).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{item.dias_vida_util}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );

            case 'margem':
                return (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Faturamento</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Custo Total</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Margem Bruta</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {(data as ProdutoMargem[]).map((item, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.idproduto}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.faturamento)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.custo_total)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(item.margem_bruta)}</td>
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

        let totalProdutos = 0;
        let totalRevenue = 0;
        let totalQuantity = 0;
        let avgPrice = 0;

        switch (activeTab) {
            case 'analise':
                const analiseData = data as ProdutoAnalise[];
                totalProdutos = analiseData.length;
                totalRevenue = analiseData.reduce((sum, p) => sum + parseFloat(p.valor_vendido || '0'), 0);
                totalQuantity = analiseData.reduce((sum, p) => sum + parseFloat(p.quantidade_vendida || '0'), 0);
                avgPrice = totalRevenue / totalQuantity;
                break;
            case 'ranking':
                const rankingData = data as ProdutoRanking[];
                totalProdutos = rankingData.length;
                totalRevenue = rankingData.reduce((sum, p) => sum + parseFloat(p.valor_vendido || '0'), 0);
                totalQuantity = rankingData.reduce((sum, p) => sum + parseFloat(p.quantidade || '0'), 0);
                avgPrice = totalRevenue / totalQuantity;
                break;
            case 'colecao':
            case 'cor':
            case 'tamanho':
                const agregacaoData = data as ProdutoAgregacao[];
                totalProdutos = agregacaoData.length;
                totalRevenue = agregacaoData.reduce((sum, p) => sum + parseFloat(p.faturamento || '0'), 0);
                totalQuantity = agregacaoData.reduce((sum, p) => sum + parseFloat(p.quantidade || '0'), 0);
                avgPrice = agregacaoData.reduce((sum, p) => sum + parseFloat(p.preco_medio || '0'), 0) / totalProdutos;
                break;
            case 'sku':
                const skuData = data as ProdutoSKU[];
                totalProdutos = skuData.length;
                totalRevenue = skuData.reduce((sum, p) => sum + parseFloat(p.faturamento || '0'), 0);
                totalQuantity = skuData.reduce((sum, p) => sum + parseFloat(p.quantidade || '0'), 0);
                avgPrice = skuData.reduce((sum, p) => sum + parseFloat(p.preco_medio || '0'), 0) / totalProdutos;
                break;
            case 'mensal':
                const mensalData = data as ProdutoMensal[];
                totalProdutos = mensalData.length;
                totalRevenue = mensalData.reduce((sum, p) => sum + parseFloat(p.faturamento || '0'), 0);
                totalQuantity = mensalData.reduce((sum, p) => sum + parseFloat(p.quantidade || '0'), 0);
                avgPrice = mensalData.reduce((sum, p) => sum + parseFloat(p.preco_medio || '0'), 0) / totalProdutos;
                break;
            case 'parados':
                const paradosData = data as ProdutoParado[];
                totalProdutos = paradosData.length;
                break;
            case 'vida-util':
                const vidaUtilData = data as ProdutoVidaUtil[];
                totalProdutos = vidaUtilData.length;
                break;
            case 'margem':
                const margemData = data as ProdutoMargem[];
                totalProdutos = margemData.length;
                totalRevenue = margemData.reduce((sum, p) => sum + parseFloat(p.faturamento || '0'), 0);
                totalQuantity = margemData.reduce((sum, p) => sum + parseFloat(p.quantidade || '0'), 0);
                const totalCost = margemData.reduce((sum, p) => sum + parseFloat(p.custo_total || '0'), 0);
                const totalMargin = margemData.reduce((sum, p) => sum + parseFloat(p.margem_bruta || '0'), 0);
                avgPrice = totalRevenue / totalQuantity;
                break;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total de Produtos</p>
                            <p className="text-2xl font-bold text-gray-900">{totalProdutos}</p>
                        </div>
                        <div className="text-4xl bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                            📦
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
                            <p className="text-sm font-medium text-gray-600 mb-1">Quantidade Vendida</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalQuantity)}</p>
                        </div>
                        <div className="text-4xl bg-purple-50 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                            📊
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Preço Médio</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgPrice)}</p>
                        </div>
                        <div className="text-4xl bg-yellow-50 text-yellow-600 w-16 h-16 rounded-full flex items-center justify-center">
                            💵
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
                        <h1 className="text-3xl font-bold text-gray-900">Análise de Produtos</h1>
                        <p className="text-sm text-gray-600 mt-1">Visão detalhada do desempenho dos produtos</p>
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
