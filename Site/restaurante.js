// ========================================
//      TELA - PAGINA DO RESTAURANTE
// ========================================


// ===== CHAVES DO LOCALSTORAGE =====
const CHAVE_PEDIDOS = "raizesPedidos";

// ===== ELEMENTOS DA PÁGINA =====
const containerPedidos = document.getElementById("container-pedidos");
const mensagemPedidos = document.getElementById("mensagem-pedidos");

const filtroUnidade = document.getElementById("filtro-unidade");
const botaoAtualizar = document.getElementById("botao-atualizar");

const totalPedidosElemento = document.getElementById("total-pedidos");

const pedidosAguardandoElemento = document.getElementById("pedidos-aguardando");

const pedidosRecebidosElemento = document.getElementById("pedidos-recebidos");

const pedidosPreparoElemento = document.getElementById("pedidos-preparo");

const pedidosEntregaElemento = document.getElementById("pedidos-entrega");

const pedidosEntreguesElemento = document.getElementById("pedidos-entregues");

// ===== RECUPERAR OS PEDIDOS =====
function recuperarPedidos() {

    try {

        const pedidosSalvos = JSON.parse(
            localStorage.getItem(CHAVE_PEDIDOS)
        );

        return Array.isArray(pedidosSalvos) ? pedidosSalvos : [];

    } catch (erro) {

        console.error("Erro ao recuperar os pedidos:", erro);

        return [];

    }

}

// ===== SALVAR OS PEDIDOS =====
function salvarPedidos(pedidos) {

    localStorage.setItem(
        CHAVE_PEDIDOS,
        JSON.stringify(pedidos)
    );

}

// ===== FORMATAR VALORES EM REAIS =====
function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ===== PROTEGER TEXTOS EXIBIDOS NO HTML =====
function escaparHTML(valor) {

    return String(valor ?? "").replace(/[&<>"']/g, caractere => {

        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteres[caractere];

    });

}

// ===== IDENTIFICAR A UNIDADE =====
function obterUnidade(pedido) {

    const unidade = pedido.unidade;

    if (typeof unidade === "string") {
        return unidade;
    }

    if (unidade && typeof unidade === "object") {
        return unidade.nome || unidade.unidade || "Não informada";
    }

    return "Não informada";

}

// ===== IDENTIFICAR O NOME DO CLIENTE =====
function obterNomeCliente(pedido) {

    return pedido.cliente?.nome ||
        pedido.cliente?.nomeCompleto ||
        "Cliente não identificado";

}

// ===== IDENTIFICAR O ENDEREÇO =====
function obterEndereco(pedido) {

    const endereco = pedido.enderecoEntrega ||
        pedido.endereco ||
        pedido.cliente?.endereco;

    if (typeof endereco === "string") {
        return endereco;
    }

    if (endereco && typeof endereco === "object") {

        return [
            endereco.rua,
            endereco.numero,
            endereco.complemento,
            endereco.bairro,
            endereco.cidade,
            endereco.estado,
            endereco.cep
        ].filter(Boolean).join(", ");

    }

    return "Endereço não informado";

}

// ===== IDENTIFICAR OS PRODUTOS =====
function obterProdutos(pedido) {

    if (Array.isArray(pedido.produtos)) {
        return pedido.produtos;
    }

    if (Array.isArray(pedido.itens)) {
        return pedido.itens;
    }

    return [];

}

// ===== ATUALIZAR O RESUMO DOS PEDIDOS =====
function atualizarResumo(pedidos) {

    totalPedidosElemento.textContent = pedidos.length;

// Pedidos aguardando confirmação do restaurante.
    pedidosAguardandoElemento.textContent =
        pedidos.filter(pedido =>
            pedido.status === "Pedido confirmado"
        ).length;

// Pedidos recebidos pelo restaurante.
    pedidosRecebidosElemento.textContent =
        pedidos.filter(pedido =>
            pedido.status === "Recebido pelo restaurante"
        ).length;

// Pedidos em preparação.
    pedidosPreparoElemento.textContent =
        pedidos.filter(pedido =>
            pedido.status === "Preparando seu pedido"
        ).length;

// Pedidos que saíram para entrega.
    pedidosEntregaElemento.textContent =
        pedidos.filter(pedido =>
            pedido.status === "Saiu para entrega"
        ).length;

// Pedidos concluídos.
    pedidosEntreguesElemento.textContent =
        pedidos.filter(pedido =>
            pedido.status === "Entregue"
        ).length;

}

// ===== IDENTIFICAR A APARÊNCIA DO STATUS =====
function obterClasseStatus(status) {
    if (status === "Preparando seu pedido") {
        return "preparo";
    }

    if (status === "Saiu para entrega") {
        return "entrega";
    }

    if (status === "Entregue") {
        return "entregue";
    }

    return "";

}

// ===== CRIAR A LISTA DE PRODUTOS =====
function montarListaProdutos(produtos) {
    if (produtos.length === 0) {
        return "<li>Nenhum produto encontrado.</li>";
    }

    return produtos.map(produto => {

        const nome = escaparHTML(
            produto.nome || produto.name || "Produto"
        );

        const quantidade = Number(produto.quantidade) || 1;

        const preco = Number(
            produto.preco ?? produto.price
        ) || 0;

        return `
            <li>
                ${quantidade}x ${nome} —
                ${formatarMoeda(preco * quantidade)}
            </li>
        `;

    }).join("");

}

// ===== MOSTRAR A AVALIAÇÃO DO CLIENTE =====
function montarAvaliacao(pedido) {

    const avaliacao = pedido.avaliacao;

    if (!avaliacao || !avaliacao.nota) {

        return `
            <div class="avaliacao-pedido">
                <h4>Avaliação do cliente</h4>
                <p>O cliente ainda não avaliou este pedido.</p>
            </div>
        `;

    }

    const nota = Math.min(
        5,
        Math.max(1, Number(avaliacao.nota) || 0)
    );

    const estrelas = "★".repeat(nota) +
        "☆".repeat(5 - nota);

    const comentario = escaparHTML(
        avaliacao.comentario || "O cliente não deixou um comentário."
    );

    let dataFormatada = "";

    if (avaliacao.data) {

        const data = new Date(avaliacao.data);

        if (!Number.isNaN(data.getTime())) {
            dataFormatada = data.toLocaleString("pt-BR");
        }

    }

    return `
        <div class="avaliacao-pedido">

            <h4>Avaliação do cliente</h4>

            <p class="estrelas-avaliacao">
                ${estrelas}
                <span>${nota}/5</span>
            </p>

            <p>
                <strong>Comentário:</strong>
                ${comentario}
            </p>

            ${dataFormatada ? `
                <small>Enviada em: ${escaparHTML(dataFormatada)}</small>
            ` : ""}

        </div>
    `;

}

// ===== CRIAR OS BOTÕES DE AÇÃO =====
function montarAcoes(pedido) {

    if (pedido.status === "Pedido confirmado") {

        return `
            <p>Este pedido está aguardando a confirmação do restaurante.</p>

            <button
                type="button"
                data-acao="receber"
                data-id="${escaparHTML(pedido.id)}"
            >
                Confirmar recebimento
            </button>
        `;

    }

    if (pedido.status === "Recebido pelo restaurante") {

        return `
            <p>Pedido recebido pelo restaurante. Aguarde para iniciar a preparação.</p>

            <button
                type="button"
                data-acao="preparar"
                data-id="${escaparHTML(pedido.id)}"
            >
                Iniciar preparo
            </button>
        `;

    }

    if (pedido.status === "Preparando seu pedido") {

        return `
            <p>O pedido está sendo preparado.</p>

            <button
                type="button"
                data-acao="entrega"
                data-id="${escaparHTML(pedido.id)}"
            >
                Saiu para entrega
            </button>
        `;

    }

    if (pedido.status === "Saiu para entrega") {

        return `
            <p>O pedido já saiu para entrega. Aguardando confirmação do cliente.</p>
        `;

    }

    if (pedido.status === "Entregue") {

        return `
            <p>O cliente confirmou o recebimento deste pedido.</p>
        `;

    }

    return `
        <p>Status não reconhecido. Verifique o pedido.</p>
    `;

}


// ===== MOSTRAR UM PEDIDO =====
function montarCartaoPedido(pedido) {

    const produtos = obterProdutos(pedido);

    const nomeCliente = escaparHTML(obterNomeCliente(pedido));

    const unidade = escaparHTML(obterUnidade(pedido));

    const endereco = escaparHTML(obterEndereco(pedido));

    const email = escaparHTML(
        pedido.cliente?.email || "Não informado"
    );

    const pagamento = escaparHTML(
        pedido.formaPagamento || "Não informado"
    );

    const status = escaparHTML(
        pedido.status || "Pedido confirmado"
    );

    const total = formatarMoeda(pedido.total);

    return `
        <article class="cartao-pedido">

            <div class="cabecalho-cartao-pedido">

                <div>
                    <h3>Pedido #${escaparHTML(pedido.id)}</h3>

                    <span class="unidade-pedido">
                        Unidade: ${unidade}
                    </span>
                </div>

                <span class="status-pedido ${obterClasseStatus(pedido.status)}">
                    ${status}
                </span>

            </div>

            <div class="dados-pedido">

                <div class="bloco-dados-pedido">

                    <h4>Dados do cliente</h4>

                    <p><strong>Nome:</strong> ${nomeCliente}</p>

                    <p><strong>E-mail:</strong> ${email}</p>

                    <p><strong>Endereço:</strong> ${endereco}</p>

                </div>

                <div class="bloco-dados-pedido">

                    <h4>Produtos do pedido</h4>

                    <ul class="lista-produtos-pedido">
                        ${montarListaProdutos(produtos)}
                    </ul>

                    <p><strong>Pagamento:</strong> ${pagamento}</p>

                    <p class="total-pedido-restaurante">
                        Total: ${total}
                    </p>

                </div>

            </div>

            <div class="acoes-restaurante">
                ${montarAcoes(pedido)}
            </div>

            ${montarAvaliacao(pedido)}

        </article>
    `;

}

// ===== MOSTRAR TODOS OS PEDIDOS =====
function mostrarPedidos() {

    const pedidos = recuperarPedidos();

    atualizarResumo(pedidos);

    const unidadeSelecionada = filtroUnidade.value;

    let pedidosFiltrados = pedidos;

    if (unidadeSelecionada !== "todas") {

        pedidosFiltrados = pedidos.filter(pedido =>

            obterUnidade(pedido).toLowerCase() ===
            unidadeSelecionada.toLowerCase()

        );

    }

// Pedidos mais recentes primeiro.
    pedidosFiltrados = [...pedidosFiltrados].reverse();

    containerPedidos.innerHTML = "";

    if (pedidosFiltrados.length === 0) {

        mensagemPedidos.textContent =
            pedidos.length === 0
                ? "Ainda não existem pedidos registrados."
                : "Não existem pedidos para esta unidade.";

        return;

    }

    mensagemPedidos.textContent =
        `${pedidosFiltrados.length} pedido(s) encontrado(s).`;

    containerPedidos.innerHTML = pedidosFiltrados
        .map(pedido => montarCartaoPedido(pedido))
        .join("");

}

// ===== ATUALIZAR O STATUS DO PEDIDO =====
function atualizarStatusPedido(id, novoStatus) {

    const pedidos = recuperarPedidos();

    const pedido = pedidos.find(item =>
        String(item.id) === String(id)
    );

    if (!pedido) {

        alert("Não foi possível localizar este pedido.");

        mostrarPedidos();

        return;

    }

// Impede pular etapas ou alterar pedido já entregue.
    const proximosStatus = {

        "Pedido confirmado": "Recebido pelo restaurante",

        "Recebido pelo restaurante": "Preparando seu pedido",

        "Preparando seu pedido": "Saiu para entrega"

    };

    if (proximosStatus[pedido.status] !== novoStatus) {

        alert("Não foi possível realizar essa alteração de status.");

        return;

    }

    pedido.status = novoStatus;

    pedido.dataAtualizacaoStatus = new Date().toISOString();

    salvarPedidos(pedidos);

    mostrarPedidos();

}

// ===== CLIQUES NOS BOTÕES DOS PEDIDOS =====
containerPedidos.addEventListener("click", function (evento) {

    const botao = evento.target.closest("button[data-acao]");

    if (!botao) {
        return;
    }

    const id = botao.dataset.id;

    const acao = botao.dataset.acao;

    const statusPorAcao = {

        receber: "Recebido pelo restaurante",

        preparar: "Preparando seu pedido",

        entrega: "Saiu para entrega"

    };

    const novoStatus = statusPorAcao[acao];

    if (!novoStatus) {
        return;
    }

    atualizarStatusPedido(id, novoStatus);

});

// ===== FILTRAR POR UNIDADE =====
filtroUnidade.addEventListener("change", function () {

    mostrarPedidos();

});

// ===== BOTÃO DE ATUALIZAÇÃO =====
botaoAtualizar.addEventListener("click", function () {

    mostrarPedidos();

});

// ===== ATUALIZAR QUANDO OUTRA ABA ALTERAR OS PEDIDOS =====
window.addEventListener("storage", function (evento) {

    if (
        evento.key === CHAVE_PEDIDOS ||
        evento.key === null
    ) {

        mostrarPedidos();

    }

});

// ===== INICIALIZAÇÃO =====
mostrarPedidos();
