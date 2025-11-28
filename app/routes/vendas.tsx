import { useEffect, useState } from 'react';
import { getAuth } from '~/lib/api';
import { apiRequest } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import type { VendaSerie } from '~/types/venda';

export default function Vendas() {
    const [vendas, setVendas] = useState<VendaSerie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dbName = getAuth();
        if (dbName) {
            loadVendas(dbName);
        }
    }, []);

    const loadVendas = async (dbName: string) => {
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

    const formatCurrency = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num || 0);
    };

    const formatNumber = (value: string | number) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return new Intl.NumberFormat('pt-BR').format(num || 0);
    };

    const renderCards = () => {
        if (loading || !vendas || vendas.length === 0) return null;

        const totalPedidos = vendas.reduce((sum, v) => sum + (v.pedidos || 0), 0);
        const totalFaturamento = vendas.reduce((sum, v) => sum + parseFloat(v.faturamento || '0'), 0);
        const totalPecas = vendas.reduce((sum, v) => sum + parseFloat(v.pecas || '0'), 0);
        const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total de Pedidos</p>
                            <p className="text-2xl font-bold text-gray-900">{totalPedidos}</p>
                            <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                        </div>
                        <div className="text-4xl bg-blue-50 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center">
                            📋
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Faturamento Total</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalFaturamento)}</p>
                            <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                        </div>
                        <div className="text-4xl bg-green-50 text-green-600 w-16 h-16 rounded-full flex items-center justify-center">
                            💰
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Total de Peças</p>
                            <p className="text-2xl font-bold text-gray-900">{formatNumber(totalPecas)}</p>
                            <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
                        </div>
                        <div className="text-4xl bg-purple-50 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                            📦
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Ticket Médio</p>
                            <p className="text-2xl font-bold text-gray-900">{formatCurrency(ticketMedio)}</p>
                            <p className="text-xs text-gray-500 mt-1">Por pedido</p>
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
                        <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
                        <p className="text-sm text-gray-600 mt-1">Gerenciamento de vendas e pedidos</p>
                    </div>
                </header>

                <div className="px-8 py-8">
                    {renderCards()}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
                                        {vendas.map((venda, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {new Date(venda.periodo).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{venda.pedidos}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {parseFloat(venda.pecas || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    R$ {parseFloat(venda.faturamento || '0').toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
