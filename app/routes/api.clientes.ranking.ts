import type { LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
    // Mock data for client ranking
    const ranking = Array.from({ length: 10 }, (_, i) => ({
        idcliente: `CLI-${i + 1}`,
        nome: `Cliente Top ${i + 1}`,
        ranking_faturamento: i + 1,
        faturamento_total: (100000 - i * 5000).toFixed(2),
        total_pedidos: 50 - i,
        total_pecas: 500 - i * 10,
        ticket_medio: (2000).toFixed(2)
    }));

    return Response.json(ranking);
}
