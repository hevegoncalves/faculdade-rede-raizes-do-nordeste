//=============================================
//      TELA - PEDIDOS
//=============================================

// ===== FUNCIONALIDADES =====
// Nome usado para guardar o carrinho no navegador
const CHAVE_CARRINHO = "raizesCarrinho";

// Recupera e valida os produtos que já estavam no carrinho
function recuperarCarrinho() {
    try {
        const dadosSalvos = localStorage.getItem(CHAVE_CARRINHO);
        
        if (!dadosSalvos) {
            return [];
        }

        const produtosSalvos = JSON.parse(dadosSalvos);

        if (!Array.isArray(produtosSalvos)) {
            return [];
        }

        return produtosSalvos.filter(produto => {
            return (
                produto &&
                typeof produto.id === "string" &&
                typeof produto.nome === "string" &&
                produto.nome.trim() !== "" &&
                Number.isFinite(produto.preco) &&
                produto.preco >= 0 &&
                Number.isInteger(produto.quantidade) &&
                produto.quantidade > 0
            );
        });

    } catch (erro) {
        console.error("Erro ao recuperar o carrinho:", erro);
        return [];
    }
}

// Armazena os produtos recuperados na variável carrinho
let carrinho = recuperarCarrinho();

// Elementos do HTML
const botoesAdicionar = document.querySelectorAll(".botao-adicionar");
const listaCarrinho = document.getElementById("itens-carrinho");
const mensagemCarrinhoVazio = document.getElementById("carrinho-vazio");
const subtotalCarrinho = document.getElementById("subtotal-carrinho");
const botaoFinalizar = document.getElementById("botao-finalizar");

// Formata os valores como moeda brasileira.
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// Salva o carrinho no navegador.
function salvarCarrinho() {
    localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
}

// Calcula o subtotal dos produtos.
function calcularSubtotal() {
    return carrinho.reduce((total, produto) => {
        return total + produto.preco * produto.quantidade;
    }, 0);
}

// Adiciona um produto ao carrinho.
function adicionarProduto(botao) {
    const id = botao.dataset.id;
    const nome = botao.dataset.name;
    const preco = Number(botao.dataset.price);

    if (!id || !nome || !Number.isFinite(preco) || preco < 0) {
        alert("Não foi possível adicionar este produto. Confira os dados do cardápio.");
        return;
    }

// Verifica se o produto já está no carrinho.
    const produtoExistente = carrinho.find(produto => produto.id === id);

    if (produtoExistente) {
        produtoExistente.quantidade += 1;
    } else {
        carrinho.push({
            id: id,
            nome: nome,
            preco: preco,
            quantidade: 1
        });
    }

    salvarCarrinho();
    atualizarCarrinho();
}

// Altera a quantidade de um produto.
function alterarQuantidade(id, variacao) {
    const produto = carrinho.find(item => item.id === id);

    if (!produto) {
        return;
    }

    produto.quantidade += variacao;

// Remove o produto se a quantidade chegar a zero.
    if (produto.quantidade <= 0) {
        carrinho = carrinho.filter(item => item.id !== id);
    }

    salvarCarrinho();
    atualizarCarrinho();
}

// Remove um produto do carrinho.
function removerProduto(id) {
    carrinho = carrinho.filter(produto => produto.id !== id);

    salvarCarrinho();
    atualizarCarrinho();
}

// Exibe os produtos e atualiza o subtotal.
function atualizarCarrinho() {
    listaCarrinho.innerHTML = "";

    const carrinhoEstaVazio = carrinho.length === 0;

    mensagemCarrinhoVazio.hidden = !carrinhoEstaVazio;
    botaoFinalizar.disabled = carrinhoEstaVazio;

    carrinho.forEach(produto => {
        const item = document.createElement("div");
        item.className = "item-carrinho";

        const nome = document.createElement("strong");
        nome.textContent = produto.nome;

        const preco = document.createElement("p");
        preco.textContent = formatarMoeda(produto.preco) + " cada";

        const quantidade = document.createElement("p");
        quantidade.textContent = `Quantidade: ${produto.quantidade}`;

        const subtotalItem = document.createElement("p");
        subtotalItem.textContent = "Subtotal: " +
            formatarMoeda(produto.preco * produto.quantidade);

        const controles = document.createElement("div");
        controles.className = "controles-carrinho";

        const botaoDiminuir = document.createElement("button");
        botaoDiminuir.type = "button";
        botaoDiminuir.textContent = "−";
        botaoDiminuir.setAttribute("aria-label", "Diminuir " + produto.nome);
        botaoDiminuir.addEventListener("click", () => {
            alterarQuantidade(produto.id, -1);
        });

        const botaoAumentar = document.createElement("button");
        botaoAumentar.type = "button";
        botaoAumentar.textContent = "+";
        botaoAumentar.setAttribute("aria-label", "Aumentar " + produto.nome);
        botaoAumentar.addEventListener("click", () => {
            alterarQuantidade(produto.id, 1);
        });

        const botaoRemover = document.createElement("button");
        botaoRemover.type = "button";
        botaoRemover.textContent = "Remover";
        botaoRemover.setAttribute("aria-label", "Remover " + produto.nome + " do carrinho");
        botaoRemover.addEventListener("click", () => {
            removerProduto(produto.id);
        });

        controles.append(botaoDiminuir, botaoAumentar, botaoRemover);
        item.append(nome, preco, quantidade, subtotalItem, controles);
        listaCarrinho.appendChild(item);
    });

    subtotalCarrinho.textContent = formatarMoeda(calcularSubtotal());
}

// Ativa os botões "Adicionar ao carrinho".
botoesAdicionar.forEach(botao => {
    botao.addEventListener("click", () => {
        adicionarProduto(botao);
    });
});

// Abre a página de finalização.
botaoFinalizar.addEventListener("click", () => {
    if (carrinho.length === 0) {
        return;
    }

    window.location.href = "finalizar-pedido.html";
});

// Mostra os produtos que já estavam salvos ao abrir a página.
atualizarCarrinho();