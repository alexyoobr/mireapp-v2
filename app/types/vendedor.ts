export interface VendedorRanking {
    idvendedor: string;
    nome: string;
    faturamento_total: string;
    total_pedidos: number;
    total_pecas: string;
    ticket_medio: string;
    ranking_faturamento: number;
    ranking_pedidos: number;
    ranking_pecas: number;
    idloja?: string;
    loja?: string;
}

export interface VendedorMensal {
    mes_ano: string;
    idvendedor: string;
    nome: string;
    quantidade: string | number;
    faturamento: string | number;
    pedidos: number;
    ticket_medio: string | number;
    idloja?: string;
    loja?: string;
}

export interface VendedorRFM {
    idvendedor: string;
    nome: string;
    ultima_venda: string;
    recencia_dias: number;
    frequencia: number;
    monetary: string;
    idloja?: string;
    loja?: string;
}
