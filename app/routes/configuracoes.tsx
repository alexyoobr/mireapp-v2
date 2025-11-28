import DashboardWrapper from '~/components/DashboardWrapper';

export default function Configuracoes() {
    return (
        <DashboardWrapper>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-8 py-6">
                        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
                        <p className="text-sm text-gray-600 mt-1">Configurações do sistema</p>
                    </div>
                </header>

                <div className="px-8 py-8">
                    <div className="max-w-4xl space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Banco de Dados</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Banco Atual
                                    </label>
                                    <input
                                        type="text"
                                        disabled
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                                        placeholder="Conectado"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preferências</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Notificações</p>
                                        <p className="text-sm text-gray-600">Receber notificações do sistema</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">Modo Escuro</p>
                                        <p className="text-sm text-gray-600">Ativar tema escuro</p>
                                    </div>
                                    <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Sobre</h2>
                            <div className="space-y-2 text-sm text-gray-600">
                                <p><span className="font-medium text-gray-900">Versão:</span> 2.0.0</p>
                                <p><span className="font-medium text-gray-900">Desenvolvido por:</span> MireData</p>
                                <p><span className="font-medium text-gray-900">Suporte:</span> suporte@miredata.com.br</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardWrapper>
    );
}
