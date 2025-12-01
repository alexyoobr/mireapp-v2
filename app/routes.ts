import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/login.tsx", { id: "index" }),
    route("login", "routes/login.tsx", { id: "login" }),
    route("dashboard", "routes/dashboard.tsx"),
    route("vendas", "routes/vendas.tsx"),
    route("clientes", "routes/clientes.tsx"),
    route("vendedores", "routes/vendedores.tsx"),
    route("produtos", "routes/produtos.tsx"),
    route("relatorios", "routes/relatorios.tsx"),
    route("configuracoes", "routes/configuracoes.tsx"),
] satisfies RouteConfig;
