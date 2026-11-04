//=============================================
//      TELA - CONFIRMAR PEDIDO
//=============================================

// ===== CHAVES DO PROJETO ===== 
const CHAVE_CARRINHO = "raizesCarrinho";
const CHAVE_USUARIO_LOGADO = "raizesUsuarioLogado";
const CHAVE_PEDIDO_CONFERENCIA = "raizesPedidoEmConferencia";
const CHAVE_PEDIDOS = "raizesPedidos";
const CHAVE_USUARIOS = "raizesUsuarios";


// ===== ELEMENTOS DA TELA =====
const listaResumoProdutos = document.getElementById("lista-resumo-produtos");
const subtotalConfirmacao = document.getElementById("subtotal-confirmacao");
const taxaConfirmacao = document.getElementById("taxa-confirmacao");
const descontoConfirmacao = document.getElementById("desconto-confirmacao");
const linhaDesconto = document.getElementById("linha-desconto");
const totalConfirmacao = document.getElementById("total-confirmacao");
const nomeConfirmacao = document.getElementById("nome-confirmacao");
const enderecoConfirmacao = document.getElementById("endereco-confirmacao");
const pagamentoConfirmacao = document.getElementById("pagamento-confirmacao");
const mensagemConfirmacao = document.getElementById("mensagem-confirmacao");
const unidadeConfirmacao = document.getElementById("unidade-confirmacao");
const botaoVoltarCarrinho = document.getElementById("botao-voltar-carrinho");
const botaoConfirmarCompra = document.getElementById("botao-confirmar-compra");


// ===== VARIÁVEIS DA COMPRA =====
let pedidoEmConferencia = null;


// transforma valores em reais
function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Monta o endereço a partir dos campos cadastrados
function montarEndereco(endereco) {
    if (!endereco) {
        return "Endereço não informado";
    }

    const partesEndereco = [
        endereco.rua,
        endereco.numero,
        endereco.complemento,
        endereco.bairro,
        endereco.cidade,
        endereco.estado,
        endereco.cep
    ].filter(Boolean);
    return partesEndereco.length > 0
        ? partesEndereco.join(", ")
        : "Endereço não informado";
}

// calcular subtotal dos produtos
function calcularSubtotal(produtos) {
    return produtos.reduce((total, produto) => {
        const preco = Number(produto.preco) || 0;
        const quantidade = Number(produto.quantidade) || 0;
        return total + preco * quantidade;
    }, 0);
}


// ===== EXIBIR AS COMIDAS DO PEDIDO ===== 
function mostrarProdutos(produtos) {
    listaResumoProdutos.innerHTML = "";

    produtos.forEach(produto => {
        const item = document.createElement("div");
        item.classList.add("produto-resumo");

        const informacoes = document.createElement("div");

        const nome = document.createElement("p");
        nome.classList.add("nome-produto");
        nome.textContent = produto.nome;

        const quantidade = document.createElement("p");
        quantidade.textContent =
            `Quantidade: ${produto.quantidade}`;

        informacoes.append(nome, quantidade);

        const preco = document.createElement("p");
        preco.classList.add("detalhes-produto");

        const subtotalProduto =
            Number(produto.preco) * Number(produto.quantidade);

        preco.textContent =
            `${formatarMoeda(subtotalProduto)}`;

        item.append(informacoes, preco);

        listaResumoProdutos.appendChild(item);
    });
}


// ===== CARREGA DADOS PARA CONFIRMAR ===== 
function carregarPedido() {
    const pedidoSalvo = localStorage.getItem(CHAVE_PEDIDO_CONFERENCIA);

    if (!pedidoSalvo) {
        mensagemConfirmacao.textContent =
            "Não encontramos um pedido para conferir. " +
            "Volte à finalização e preencha os dados da compra.";

        botaoConfirmarCompra.disabled = true;
        return;
    }

    try {
        pedidoEmConferencia = JSON.parse(pedidoSalvo);

// Confere se existem produtos.
        if (
            !Array.isArray(pedidoEmConferencia.produtos) ||
            pedidoEmConferencia.produtos.length === 0
        ) {
            throw new Error("O pedido não possui produtos.");
        }

// Exibe os produtos.
        mostrarProdutos(pedidoEmConferencia.produtos);

// confirma unidade
        unidadeConfirmacao.textContent =
            pedidoEmConferencia.unidade ||
            localStorage.getItem("raizesUnidadeSelecionada") ||
            "Não informada";

// Recupera os valores.
        const subtotal = calcularSubtotal(pedidoEmConferencia.produtos);
        const taxaEntrega =Number(pedidoEmConferencia.taxaEntrega) || 0;
        const desconto =Number(pedidoEmConferencia.desconto) || 0;
        const total = Math.max(0,subtotal + taxaEntrega - desconto);

// Exibe os valores.
        subtotalConfirmacao.textContent =
            formatarMoeda(subtotal);

        taxaConfirmacao.textContent =
            formatarMoeda(taxaEntrega);

        descontoConfirmacao.textContent =
            formatarMoeda(desconto);

        totalConfirmacao.textContent =
            formatarMoeda(total);

// Exibe o desconto somente quando existir.
        linhaDesconto.hidden = desconto <= 0;

// Exibe os dados do cliente.
        nomeConfirmacao.textContent =
            pedidoEmConferencia.cliente?.nome ||
            "Nome não informado";

// Exibe o endereço escolhido para o pedido.
        enderecoConfirmacao.textContent =
            montarEndereco(pedidoEmConferencia.enderecoEntrega);

// Exibe a forma de pagamento.
        pagamentoConfirmacao.textContent =
            pedidoEmConferencia.formaPagamento ||
            "Forma de pagamento não informada";

// Exibe confirmar unidade
        mensagemConfirmacao.textContent = "";

        botaoConfirmarCompra.disabled = false;

    } catch (erro) {
        console.error(
            "Erro ao carregar o pedido para conferência:",
            erro
        );

        mensagemConfirmacao.textContent =
            "Não foi possível carregar o resumo do pedido. " +
            "Volte à finalização e tente novamente.";

        botaoConfirmarCompra.disabled = true;
    }
}


// ===== VOLTAR PARA ALTERAR AS COMIDAS ===== 
botaoVoltarCarrinho.addEventListener("click", function () {
// O carrinho continua salvo no localStorage.
// O pedido em conferência também será preservado.
    window.location.href = "pedidos.html";
});


// ===== DESCONTAR PONTOS DE FIDELIDADE =====
function descontarPontosFidelidade(cliente, pontosUtilizados) {
    if (pontosUtilizados <= 0) {
        return;
    }

    const usuarios = JSON.parse(
        localStorage.getItem(CHAVE_USUARIOS)
    ) || [];

    const indiceUsuario = usuarios.findIndex(usuario =>
        usuario.email?.toLowerCase() === cliente.email?.toLowerCase()
    );

    if (indiceUsuario === -1) {
        throw new Error("Cliente não encontrado para descontar os pontos.");
    }

    const usuario = usuarios[indiceUsuario];

    const fidelidade = usuario.fidelidade;

    if (!fidelidade || !fidelidade.participante) {
        throw new Error("Cliente não participa do programa de fidelidade.");
    }

    const saldoAtual = Number(fidelidade.pontos) || 0;

    if (pontosUtilizados > saldoAtual) {
        throw new Error("Saldo de pontos insuficiente.");
    }

    fidelidade.pontos = saldoAtual - pontosUtilizados;

    fidelidade.historico = Array.isArray(fidelidade.historico)
        ? fidelidade.historico
        : [];

    fidelidade.historico.push({
        pedidoId: pedidoEmConferencia.id,
        tipo: "utilizacao",
        pontos: pontosUtilizados,
        data: new Date().toISOString()
    });

    usuario.fidelidade = fidelidade;

    localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify(usuarios)
    );

    cliente.fidelidade = fidelidade;

    localStorage.setItem(
        CHAVE_USUARIO_LOGADO,
        JSON.stringify(cliente)
    );
}

// ===== CONFIRMAR A COMPRA ===== 
botaoConfirmarCompra.addEventListener("click", function () {
    if (!pedidoEmConferencia) {
        mensagemConfirmacao.textContent =
            "Não há pedido disponível para confirmar.";
        return;
    }

// Impede dois cliques seguidos.
    botaoConfirmarCompra.disabled = true;

    let pedidosSalvos = [];

    try {
        pedidosSalvos =
            JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];

        if (!Array.isArray(pedidosSalvos)) {
            pedidosSalvos = [];
        }

// Recupera a conta conectada.
        const usuarioSalvo = localStorage.getItem(
            CHAVE_USUARIO_LOGADO
        );

        if (!usuarioSalvo) {
            mensagemConfirmacao.textContent =
                "Entre na sua conta antes de confirmar a compra.";

            botaoConfirmarCompra.disabled = false;
            return;
        }

        const cliente = JSON.parse(usuarioSalvo);

// Verifica se o pedido já foi confirmado.
        const pedidoExistente = pedidosSalvos.find(pedido =>
            pedido.id === pedidoEmConferencia.id
        );

        if (pedidoExistente) {
            mensagemConfirmacao.textContent = "Este pedido já foi confirmado.";
            botaoConfirmarCompra.hidden = true;
            botaoVoltarCarrinho.hidden = true;
            return;
        }
        
// Recalcula os valores para não depender apenas
// dos valores exibidos na tela.
        const subtotal = calcularSubtotal(pedidoEmConferencia.produtos);
        const taxaEntrega =Number(pedidoEmConferencia.taxaEntrega) || 0;
        const desconto =Number(pedidoEmConferencia.desconto) || 0;
        const total = Math.max(0,subtotal + taxaEntrega - desconto);

// Cria o registro definitivo do pedido.
        const pedidoFinalizado = {
            ...pedidoEmConferencia,

            pontosUtilizados: Number(pedidoEmConferencia.pontosUtilizados) || 0,
            pontosFidelidadeCreditados: false,

            cliente: {
                nome: cliente.nome || "Cliente",
                email: cliente.email || ""
            },

            produtos: pedidoEmConferencia.produtos.map(produto => ({
                ...produto
            })),

            enderecoEntrega: {
                ...pedidoEmConferencia.enderecoEntrega
            },

            subtotal: subtotal,
            taxaEntrega: taxaEntrega,
            desconto: desconto,
            total: total,

            status: "Pedido confirmado",
            data: new Date().toISOString()
        };

// Salva o pedido no histórico.
        pedidosSalvos.push(pedidoFinalizado);

        localStorage.setItem(CHAVE_PEDIDOS,JSON.stringify(pedidosSalvos));

// Limpa o carrinho após confirmar.
        localStorage.removeItem(CHAVE_CARRINHO);

// Remove o rascunho da conferência.
        localStorage.removeItem(CHAVE_PEDIDO_CONFERENCIA);

// Exibe a confirmação.
        mensagemConfirmacao.textContent =
            `Compra confirmada! Número do pedido: ${pedidoFinalizado.id}.`;

        botaoVoltarCarrinho.hidden = true;
        botaoConfirmarCompra.hidden = true;

// Abre a tela de acompanhamento do pedido confirmado.
        setTimeout(function () {
            window.location.href =
                `acompanhar-pedido.html?id=${pedidoFinalizado.id}`;
}, 1500);

    } catch (erro) {
        console.error("Erro ao confirmar a compra:", erro);

        mensagemConfirmacao.textContent =
            "Não foi possível registrar a compra. Tente novamente.";

        botaoConfirmarCompra.disabled = false;
    }
});


// ===== INICIALIZAR A PÁGINA ===== 
carregarPedido();
