export interface ClienteOverview {
    idcliente: string;
    nome: string;
    cidade: string;
    uf: string;
    valor_total_comprado_ltv: string;
    numero_pedidos: number;
    ticket_medio: string;
    status_cliente: string;
    segmento_cliente: string;
    ultima_compra: string;
    recencia_dias: number;
    bloqueado: number;
    restricao: number;
    idloja?: string;
    loja?: string;
}

export interface ClienteRanking {
    idcliente: string;
    nome: string;
    faturamento_total: string;
    total_pedidos: number;
    total_pecas: string;
    ticket_medio: string;
    ranking_faturamento: number;
    ranking_pecas: number;
    ranking_frequencia: number;
    ranking_ticket_medio: number;
    idloja?: string;
    loja?: string;
}

export interface ClienteRFM {
    idcliente: string;
    nome: string;
    ultima_compra: string;
    recencia_dias: number;
    frequencia: number;
    monetary: string;
    idloja?: string;
    loja?: string;
}
