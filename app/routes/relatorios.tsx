import { useState } from 'react';
import { getToday } from '~/lib/api';
import DashboardWrapper from '~/components/DashboardWrapper';
import DateRangePicker from '~/components/DateRangePicker';
import StoreFilter from '~/components/StoreFilter';
import { useFilter } from '~/components/FilterContext';

export default function Relatorios() {
    // Global filter state
    const {
        startDate,
        endDate,
        setStartDate,
        setEndDate,
        selectedStore,
        setSelectedStore,
        stores
    } = useFilter();

    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Relatórios</h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Análises e relatórios gerenciais</p>
                    </div>
                </header>

                <div className="px-8 py-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <DateRangePicker
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                        />
                        <StoreFilter
                            stores={stores}
                            selectedStore={selectedStore}
                            onStoreChange={setSelectedStore}
                        />
                    </div>
                </div>

                <div className="px-8 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <ReportCard
                            title="Vendas por Período"
                            description="Análise detalhada de vendas por período"
                            icon="📊"
                        />
                        <ReportCard
                            title="Produtos Mais Vendidos"
                            description="Ranking dos produtos mais vendidos"
                            icon="🏆"
                        />
                        <ReportCard
                            title="Clientes Ativos"
                            description="Relatório de clientes ativos"
                            icon="👥"
                        />
                        <ReportCard
                            title="Análise de Estoque"
                            description="Situação atual do estoque"
                            icon="📦"
                        />
                        <ReportCard
                            title="Faturamento"
                            description="Análise de faturamento mensal"
                            icon="💰"
                        />
                        <ReportCard
                            title="Inadimplência"
                            description="Relatório de contas em atraso"
                            icon="⚠️"
                        />
                    </div>

                    <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <p className="text-gray-500 dark:text-gray-400 text-center">
                            Selecione um relatório acima para visualizar
                        </p>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}

function ReportCard({ title, description, icon }: { title: string; description: string; icon: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start gap-4">
                <div className="text-4xl">{icon}</div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{description}</p>
                </div>
            </div>
        </div>
    );
}
