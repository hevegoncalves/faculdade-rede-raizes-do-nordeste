//=============================================
//      TELA - PERFIL
//=============================================

// ===== CHAVES DO PROJETO =====
const CHAVE_USUARIO = "raizesUsuarioLogado";
const CHAVE_CARRINHO = "raizesCarrinho";
const CHAVE_PEDIDOS = "raizesPedidos";
const CHAVE_USUARIOS = "raizesUsuarios";


// ===== ELEMENTOS DO PERFIL =====
const nomeCliente = document.getElementById("nome-cliente");

const perfilNome = document.getElementById("perfil-nome");
const perfilEmail = document.getElementById("perfil-email");
const perfilTelefone = document.getElementById("perfil-telefone");
const perfilEndereco = document.getElementById("perfil-endereco");

const quantidadeCarrinho = document.getElementById("quantidade-carrinho");
const botaoSair = document.getElementById("botao-sair");

// ===== ELEMENTOS DO PROGRAMA DE FIDELIDADE =====
const adesaoFidelidade = document.getElementById("adesao-fidelidade");
const painelFidelidade = document.getElementById("painel-fidelidade");

const aceitarFidelidade = document.getElementById("aceitar-fidelidade");
const botaoAderirFidelidade = document.getElementById("botao-aderir-fidelidade");

const mensagemAdesaoFidelidade = document.getElementById("mensagem-adesao-fidelidade");
const pontosPerfil = document.getElementById("pontos-perfil");


// ===== CARREGAR DADOS DO CLIENTE =====
function carregarDadosCliente() {
    const dadosSalvos = localStorage.getItem(CHAVE_USUARIO);
    if (!dadosSalvos) {
        nomeCliente.textContent = "cliente";

        perfilNome.textContent = "Faça login para visualizar seus dados.";
        perfilEmail.textContent = "Não informado";
        perfilTelefone.textContent = "Não informado";
        perfilEndereco.textContent = "Não informado";
        return;
    }

    try {
        const cliente = JSON.parse(dadosSalvos);

        nomeCliente.textContent = cliente.nome || "cliente";
        perfilNome.textContent = cliente.nome || "Não informado";
        perfilEmail.textContent = cliente.email || "Não informado";
        perfilTelefone.textContent = cliente.telefone || "Não informado";

// Monta o endereço a partir dos campos cadastrados.
        const partesEndereco = [
            cliente.rua,
            cliente.numero,
            cliente.complemento,
            cliente.bairro,
            cliente.cidade,
            cliente.estado,
            cliente.cep
        ].filter(Boolean);

        perfilEndereco.textContent =
            partesEndereco.length > 0
                ? partesEndereco.join(", ")
                : "Não informado";

    } catch (erro) {
        console.error("Erro ao carregar os dados do cliente:", erro);
        nomeCliente.textContent = "cliente";
        perfilNome.textContent = "Não foi possível carregar os dados.";
    }
}

// ===== CARREGAR PROGRAMA DE FIDELIDADE =====
function carregarFidelidade() {

    const dadosSalvos = localStorage.getItem(CHAVE_USUARIO);

    if (!dadosSalvos) {
        adesaoFidelidade.hidden = true;
        painelFidelidade.hidden = true;
        return;
    }

    try {

        const cliente = JSON.parse(dadosSalvos);

        const fidelidade = cliente.fidelidade || {
            participante: false,
            pontos: 0,
            historico: []
        };

        if (fidelidade.participante) {
            adesaoFidelidade.hidden = true;
            painelFidelidade.hidden = false;
            pontosPerfil.textContent = Number(fidelidade.pontos) || 0;
        } else {
            adesaoFidelidade.hidden = false;
            painelFidelidade.hidden = true;

        }

    } catch (erro) {
        console.error("Erro ao carregar a fidelidade:", erro);
    }
}

// ===== CONFIRMAR PARTICIPAÇÃO NA FIDELIDADE =====
function aderirFidelidade() {
    if (!aceitarFidelidade.checked) {
        return;
    }

    const dadosSalvos = localStorage.getItem(CHAVE_USUARIO);

    if (!dadosSalvos) {
        mensagemAdesaoFidelidade.textContent =
            "Faça login para participar do programa.";
        return;
    }

    try {
        const cliente = JSON.parse(dadosSalvos);

        const usuarios = JSON.parse(localStorage.getItem(CHAVE_USUARIOS)) || [];

        const indiceUsuario = usuarios.findIndex(usuario =>
            usuario.email.toLowerCase() === cliente.email.toLowerCase()
        );

        if (indiceUsuario === -1) {
            mensagemAdesaoFidelidade.textContent =
                "Não foi possível localizar seu cadastro.";
            return;
        }

        const fidelidadeAtual =
            usuarios[indiceUsuario].fidelidade || {};

        if (fidelidadeAtual.participante) {
            mensagemAdesaoFidelidade.textContent =
                "Você já participa do programa.";
            return;
        }

        const fidelidade = {
            participante: true,
            pontos: Number(fidelidadeAtual.pontos) || 0,
            historico: Array.isArray(fidelidadeAtual.historico)
                ? fidelidadeAtual.historico
                : [],
            dataAdesao: new Date().toISOString()
        };

// Atualiza o cadastro principal.
        usuarios[indiceUsuario].fidelidade = fidelidade;

        localStorage.setItem(
            CHAVE_USUARIOS,
            JSON.stringify(usuarios)
        );

// Atualiza a sessão do cliente.
        cliente.fidelidade = fidelidade;

        localStorage.setItem(
            CHAVE_USUARIO,
            JSON.stringify(cliente)
        );

        mensagemAdesaoFidelidade.textContent =
            "Parabéns! Sua participação foi confirmada!";
        carregarFidelidade();

    } catch (erro) {
        console.error("Erro ao registrar participação:", erro);

        mensagemAdesaoFidelidade.textContent =
            "Não foi possível confirmar sua participação. Tente novamente.";
    }
}


// ===== CONTAR OS ITENS DO CARRINHO =====
function atualizarCarrinho() {
    let carrinho = [];
    try {
        carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];
        if (!Array.isArray(carrinho)) {
            carrinho = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar o carrinho:", erro);
    }

// Soma as quantidades de todos os produtos.
    const totalItens = carrinho.reduce((total, produto) => {
        return total + (Number(produto.quantidade) || 0);
    }, 0);

    if (totalItens === 0) {
        quantidadeCarrinho.textContent =
            "Seu carrinho está vazio. Que tal escolher algo delicioso?";
    } else if (totalItens === 1) {
        quantidadeCarrinho.textContent =
            "Você tem 1 item aguardando para finalizar a compra.";
    } else {
        quantidadeCarrinho.textContent =
            `Você tem ${totalItens} itens aguardando para finalizar a compra.`;
    }
}


// ===== SAIR DA CONTA =====
botaoSair.addEventListener("click", function () {
    localStorage.removeItem(CHAVE_USUARIO);

    window.location.href = "cadastro.html?modo=login";
});

// ===== HISTÓRICO DE PEDIDOS DO CLIENTE =====
function carregarMeusPedidos() {
    const areaPedidos = document.querySelector(".area-pedidos");

    if (!areaPedidos) {
        return;
    }

    const dadosUsuario = localStorage.getItem(CHAVE_USUARIO);

    if (!dadosUsuario) {
        areaPedidos.innerHTML = `
            <h2>Meus pedidos</h2>
            <p>Faça login para visualizar seus pedidos.</p>
        `;
        return;
    }

    let cliente;

    try {
        cliente = JSON.parse(dadosUsuario);
    } catch (erro) {
        console.error("Erro ao carregar os dados do cliente:", erro);
        return;
    }

    let pedidos = [];

    try {
        pedidos = JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];
        if (!Array.isArray(pedidos)) {
            pedidos = [];
        }
    } catch (erro) {
        console.error("Erro ao carregar os pedidos:", erro);
    }

// Mostrar somente os pedidos do cliente conectado.
    const meusPedidos = pedidos
        .filter(pedido =>
            pedido.cliente &&
            pedido.cliente.email &&
            cliente.email &&
            pedido.cliente.email.toLowerCase() ===
                cliente.email.toLowerCase()
        )
        .reverse();

    if (meusPedidos.length === 0) {
        areaPedidos.innerHTML = `
            <h2>Meus pedidos</h2>
            <p>Você ainda não realizou nenhum pedido.</p>
            <a href="pedidos.html" class="botao-carrinho">
                CONHECER O CARDÁPIO
            </a>
        `;
        return;
    }

    areaPedidos.innerHTML = `
        <h2>Meus pedidos</h2>
        <p class="texto-secao">
            Confira suas compras e acompanhe suas entregas.
        </p>

        <div class="lista-meus-pedidos">
            ${meusPedidos.map(pedido => {
                const produtos = Array.isArray(pedido.produtos)
                    ? pedido.produtos
                    : [];

                const listaProdutos = produtos.length > 0
                    ? produtos.map(produto => `
                        <li>
                            ${escaparTexto(produto.nome || "Produto")}
                            — ${Number(produto.quantidade) || 0} un.
                        </li>
                    `).join("")
                    : "<li>Produtos não informados.</li>";

                const dataPedido = pedido.data
                    ? new Date(pedido.data).toLocaleString("pt-BR")
                    : "Data não informada";

                const total = Number(pedido.total) || 0;

                const status = pedido.status || "Pedido confirmado";

                const avaliacao = pedido.avaliacao
                    ? `
                        <div class="avaliacao-pedido">
                            <strong>Sua avaliação:</strong>
                            <span>${"★".repeat(
                                Math.min(
                                    5,
                                    Math.max(
                                        0,
                                        Number(pedido.avaliacao.nota) || 0
                                    )
                                )
                            )}</span>
                            <p>
                                ${escaparTexto(
                                    pedido.avaliacao.comentario ||
                                    "Você avaliou este pedido."
                                )}
                            </p>
                        </div>
                    `
                    : "";

                return `
                    <article class="cartao-pedido">
                        <div class="cabecalho-pedido">
                            <div>
                                <h3>Pedido #${escaparTexto(
                                    pedido.id || "Não informado"
                                )}</h3>
                                <p class="data-pedido">${escaparTexto(
                                    dataPedido
                                )}</p>
                            </div>

                            <span class="status-pedido">
                                ${escaparTexto(status)}
                            </span>
                        </div>

                        <div class="produtos-pedido">
                            <h4>Produtos</h4>
                            <ul>
                                ${listaProdutos}
                            </ul>
                        </div>

                        <p class="total-pedido">
                            Total: ${total.toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL"
                            })}
                        </p>

                        ${avaliacao}

                        <a
                            href="acompanhar-pedido.html?id=${encodeURIComponent(
                                pedido.id || ""
                            )}"
                            class="botao-acompanhar"
                        >
                            ACOMPANHAR PEDIDO
                        </a>
                    </article>
                `;
            }).join("")}
        </div>
    `;
}

// ===== PROTEGER OS TEXTOS EXIBIDOS NA PÁGINA =====
function escaparTexto(valor) {
    return String(valor).replace(/[&<>"']/g, caractere => {
        const caracteres = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        };

        return caracteres[caractere];
    });
}

// ===== EVENTOS DA FIDELIDADE =====
aceitarFidelidade.addEventListener("change", function () {
    botaoAderirFidelidade.disabled = !aceitarFidelidade.checked;
});

botaoAderirFidelidade.addEventListener("click", aderirFidelidade);


// ===== INICIALIZAR A PÁGINA =====
carregarDadosCliente();
atualizarCarrinho();
carregarMeusPedidos();
carregarFidelidade();