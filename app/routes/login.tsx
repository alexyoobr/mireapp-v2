import { useState } from 'react';
import { useNavigate } from 'react-router';
import { setAuth, apiRequest } from '~/lib/api';

export default function Login() {
    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!usuario.trim() || !senha.trim()) {
            setError('Por favor, informe usuário e senha');
            return;
        }

        setLoading(true);

        try {
            // Auth request doesn't need x-banco header
            const response = await apiRequest<any>('/auth', '', {
                method: 'POST',
                body: {
                    usuario: usuario,
                    senha: senha
                }
            });

            // Assuming successful response means auth is good.
            // We need to decide what to store as "auth". 
            // For now, let's store 'comum' or maybe the response has the target db?
            // If the previous logic relied on dbName, and now we login with user/pass,
            // maybe we should stick with 'comum' or check the response.

            console.log('Auth response:', response);

            // If we get here, it didn't throw, so it's success.
            // The response contains the 'banco' ID (e.g. "0180")
            const targetDb = response.banco || 'comum';
            setAuth(targetDb);
            navigate('/dashboard');

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Erro ao conectar com o servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-950">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">MireData</h1>
                    <p className="text-gray-600 dark:text-gray-400">Dashboard de Vendas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="usuario" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Usuário
                        </label>
                        <input
                            type="text"
                            id="usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            placeholder="Digite seu usuário"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label htmlFor="senha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                            placeholder="Digite sua senha"
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
