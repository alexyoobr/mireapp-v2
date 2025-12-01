import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    proxy: {
      '/auth': 'http://72.61.44.184:3000',
      '/kpis': 'http://72.61.44.184:3000',
      '/kpis/comparativo': 'http://72.61.44.184:3000',
      '/clientes': 'http://72.61.44.184:3000',
      '/clientes/ranking': 'http://72.61.44.184:3000',
      '/clientes/rfm': 'http://72.61.44.184:3000',
      '/clientes/top-categorias': 'http://72.61.44.184:3000',
      '/produtos/mix': 'http://72.61.44.184:3000',
      '/produtos/analise': 'http://72.61.44.184:3000',
      '/produtos/colecao': 'http://72.61.44.184:3000',
      '/produtos/cor': 'http://72.61.44.184:3000',
      '/produtos/tamanho': 'http://72.61.44.184:3000',
      '/produtos/ranking': 'http://72.61.44.184:3000',
      '/produtos/sku': 'http://72.61.44.184:3000',
      '/produtos/mensal': 'http://72.61.44.184:3000',
      '/produtos/parados': 'http://72.61.44.184:3000',
      '/produtos/vida-util': 'http://72.61.44.184:3000',
      '/produtos/margem': 'http://72.61.44.184:3000',
      '/produtos/margem-categoria': 'http://72.61.44.184:3000',
      '/produtos/sell-through-semanal': 'http://72.61.44.184:3000',
      '/produtos/giro-cobertura': 'http://72.61.44.184:3000',
      '/produtos/ruptura': 'http://72.61.44.184:3000',
      '/pedidos': 'http://72.61.44.184:3000',
      '/vendas': 'http://72.61.44.184:3000',
      '/vendas/serie': 'http://72.61.44.184:3000',
      '/vendas/evolucao-mensal': 'http://72.61.44.184:3000',
      '/vendas/lojas-ranking': 'http://72.61.44.184:3000',
      '/vendas/pagamentos/por-tipo': 'http://72.61.44.184:3000',
      '/vendedores/ranking': 'http://72.61.44.184:3000',
      '/vendedores/mensal': 'http://72.61.44.184:3000',
      '/vendedores/rfm': 'http://72.61.44.184:3000',
      '/relatorios': 'http://72.61.44.184:3000',
    },
  },
  plugins: [
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    reactRouter(),
    tsconfigPaths(),
  ],
});
