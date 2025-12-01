import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/kpis': 'http://localhost:3000',
      '/kpis/comparativo': 'http://localhost:3000',
      '/clientes': 'http://localhost:3000',
      '/clientes/ranking': 'http://localhost:3000',
      '/clientes/rfm': 'http://localhost:3000',
      '/clientes/top-categorias': 'http://localhost:3000',
      '/produtos/mix': 'http://localhost:3000',
      '/produtos/analise': 'http://localhost:3000',
      '/produtos/colecao': 'http://localhost:3000',
      '/produtos/cor': 'http://localhost:3000',
      '/produtos/tamanho': 'http://localhost:3000',
      '/produtos/ranking': 'http://localhost:3000',
      '/produtos/sku': 'http://localhost:3000',
      '/produtos/mensal': 'http://localhost:3000',
      '/produtos/parados': 'http://localhost:3000',
      '/produtos/vida-util': 'http://localhost:3000',
      '/produtos/margem': 'http://localhost:3000',
      '/produtos/margem-categoria': 'http://localhost:3000',
      '/produtos/sell-through-semanal': 'http://localhost:3000',
      '/produtos/giro-cobertura': 'http://localhost:3000',
      '/produtos/ruptura': 'http://localhost:3000',
      '/pedidos': 'http://localhost:3000',
      '/vendas': 'http://localhost:3000',
      '/vendas/serie': 'http://localhost:3000',
      '/vendas/evolucao-mensal': 'http://localhost:3000',
      '/vendas/lojas-ranking': 'http://localhost:3000',
      '/vendedores/ranking': 'http://localhost:3000',
      '/vendedores/mensal': 'http://localhost:3000',
      '/vendedores/rfm': 'http://localhost:3000',
      '/relatorios': 'http://localhost:3000',
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
