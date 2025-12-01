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
    idloja?: string;
    loja?: string;
}

export interface ProdutoAgregacao {
    id?: string; // Generic id field
    idcolecao?: string; // For collection aggregation
    cor?: string; // For color aggregation (without id prefix)
    tamanho?: string; // For size aggregation (without id prefix)
    idcategoria?: string; // For category aggregation
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
    idloja?: string;
    loja?: string;
}

export interface ProdutoSKU {
    modelo: string;
    descricao?: string;
    cor: string;
    tamanho: string;
    sku: string;
    pedidos: number;
    quantidade: string;
    faturamento: string;
    preco_medio: string;
    idloja?: string;
    loja?: string;
}

export interface ProdutoMensal {
    mes_ano: string;
    idproduto: string;
    descricao?: string;
    pedidos: number;
    quantidade: number;
    faturamento: number;
    preco_medio: number;
    idloja?: string;
    loja?: string;
}

export interface ProdutoParado {
    idproduto: string;
    data_ultima_venda: string;
    dias_sem_venda: number;
    idloja?: string;
    loja?: string;
}

export interface ProdutoVidaUtil {
    idproduto: string;
    primeira_venda: string;
    ultima_venda: string;
    dias_vida_util: number;
    idloja?: string;
    loja?: string;
}

export interface ProdutoMargem {
    idproduto: string;
    descricao?: string;
    faturamento: number;
    custo_total: number;
    margem_bruta: number;
    idloja?: string;
    loja?: string;
}
