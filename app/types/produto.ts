export interface ProdutoAnalise {
    idproduto: string;
    descricao: string;
    quantidade_vendida: string;
    valor_vendido: string;
    pedidos_produto: number;
    ticket_medio_produto: string;
    preco_medio_praticado: string;
    hit_rate: string;
    curva_abc_valor: string;
}

export interface ProdutoAgregacao {
    id: string; // idcolecao, cor, or tamanho
    pedidos: number;
    quantidade: string;
    faturamento: string;
    preco_medio: string;
}

export interface ProdutoRanking {
    idproduto: string;
    descricao: string;
    valor_vendido: string;
    quantidade: string;
    pedidos: number;
    rank_faturamento: number;
    rank_quantidade: number;
    rank_frequencia: number;
}

export interface ProdutoSKU {
    modelo: string;
    cor: string;
    tamanho: string;
    sku: string;
    pedidos: number;
    quantidade: string;
    faturamento: string;
    preco_medio: string;
}

export interface ProdutoMensal {
    idproduto: string;
    mes_ano: string;
    pedidos: number;
    quantidade: string;
    faturamento: string;
    preco_medio: string;
}

export interface ProdutoParado {
    idproduto: string;
    data_ultima_venda: string;
    dias_sem_venda: number;
}

export interface ProdutoVidaUtil {
    idproduto: string;
    primeira_venda: string;
    ultima_venda: string;
    dias_vida_util: number;
}

export interface ProdutoMargem {
    idproduto: string;
    faturamento: string;
    quantidade: string;
    custo_total: string;
    margem_bruta: string;
}
