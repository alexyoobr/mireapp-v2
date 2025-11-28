import { usePWA } from '~/lib/pwa';

export default function InstallPWA() {
    const { isInstallable, installApp, isInstalled } = usePWA();

    if (isInstalled) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>App Instalado</span>
            </div>
        );
    }

    if (!isInstallable) {
        return null;
    }

    return (
        <button
            onClick={installApp}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm hover:shadow-md"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Instalar App</span>
        </button>
    );
}
