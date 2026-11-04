//=============================================
//      TELA - FINALIZAR PEDIDO
//=============================================

// ===== DADOS DO CLIENTE =====
const CHAVE_USUARIO_LOGADO = "raizesUsuarioLogado";
const CHAVE_CARRINHO = "raizesCarrinho";
const CHAVE_PEDIDOS = "raizesPedidos";
const CHAVE_PEDIDO_CONFERENCIA = "raizesPedidoEmConferencia";

const mensagemLogin = document.getElementById("mensagem-login");
const botaoLogin = document.getElementById("botao-login");
const botaoCadastro = document.getElementById("botao-cadastro");

const dadosCliente = document.getElementById("dados-cliente");
const nomeClienteElemento = document.getElementById("nome-cliente");
const enderecoClienteElemento = document.getElementById("endereco-cliente");

const botaoAlterarEndereco = document.getElementById("botao-alterar-endereco");
const formularioEndereco = document.getElementById("formulario-endereco");
const botaoCancelarEndereco = document.getElementById("botao-cancelar-endereco");
const mensagemEndereco = document.getElementById("mensagem-endereco");


// ===== CAMPOS DO ENDEREÇO =====
const campoCep = document.getElementById("entrega-cep");
const campoEstado = document.getElementById("entrega-estado");
const campoCidade = document.getElementById("entrega-cidade");
const campoBairro = document.getElementById("entrega-bairro");
const campoRua = document.getElementById("entrega-rua");
const campoNumero = document.getElementById("entrega-numero");
const campoComplemento = document.getElementById("entrega-complemento");
const campoReferencia = document.getElementById("entrega-referencia");


// ===== DADOS DO CARRINHO =====
// Taxa fixa provisória para a demonstração.
const TAXA_ENTREGA = 7;

// Recupera os produtos salvos pelo pedidos.js.
let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO)) || [];

// Endereço usado no pedido atual.
// Inicialmente, será o endereço cadastrado pelo cliente.
let enderecoEntregaAtual = null;

const listaProdutos = document.getElementById("lista-produtos");
const mensagemCarrinhoVazio = document.getElementById("mensagem-carrinho-vazio");

const subtotalElemento = document.getElementById("subtotal");
const taxaEntregaElemento = document.getElementById("taxa-entrega");
const totalElemento = document.getElementById("total-pedido");

const botaoConfirmar = document.getElementById("botao-confirmar-pedido");
const mensagemStatus = document.getElementById("mensagem-status");

const botoesPagamento = document.querySelectorAll('input[name="pagamento"]');
const camposCartao = document.getElementById("campos-cartao");

// ===== ELEMENTOS DA FIDELIDADE =====
const pontosDisponiveis = document.getElementById("pontos-disponiveis");
const mensagemFidelidade = document.getElementById("mensagem-fidelidade");
const opcaoUsarPontos = document.getElementById("opcao-usar-pontos");
const usarPontos = document.getElementById("usar-pontos");
const descontoFidelidade = document.getElementById("desconto-fidelidade");

// Saldo e desconto da compra atual.
let saldoPontos = 0;
let descontoAtual = 0;
let pontosUtilizados = 0;

// ===== VERIFICAR SE O CLIENTE ESTÁ CONECTADO =====
function verificarClienteLogado() {
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO_LOGADO);

// Se não houver cliente conectado, mostrar login e cadastro.
    if (!usuarioSalvo) {
        mensagemLogin.hidden = false;
        botaoLogin.hidden = false;
        botaoCadastro.hidden = false;
        dadosCliente.hidden = true;
        return;
    }

    try {
        const cliente = JSON.parse(usuarioSalvo);

// Exibe o nome do cliente.
        nomeClienteElemento.textContent =
            cliente.nome || "Nome não informado";

// Monta o endereço cadastrado.
        const enderecoCadastrado = {
            cep: cliente.cep || "",
            estado: cliente.estado || "",
            cidade: cliente.cidade || "",
            bairro: cliente.bairro || "",
            rua: cliente.rua || "",
            numero: cliente.numero || "",
            complemento: cliente.complemento || "",
            referencia: cliente.referencia || ""
        };

// O endereço inicial do pedido é o endereço do perfil.
        enderecoEntregaAtual = enderecoCadastrado;

        mostrarEnderecoEntrega();

// Oculta as opções de login e cadastro.
        mensagemLogin.hidden = true;
        botaoLogin.hidden = true;
        botaoCadastro.hidden = true;

// Exibe os dados do cliente.
        dadosCliente.hidden = false;

    } catch (erro) {
        console.error("Erro ao recuperar os dados do cliente:", erro);

        mensagemLogin.hidden = false;
        botaoLogin.hidden = false;
        botaoCadastro.hidden = false;
        dadosCliente.hidden = true;
    }
}

// ===== CARREGAR PONTOS DE FIDELIDADE =====

function carregarFidelidade() {

    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO_LOGADO);

    descontoAtual = 0;
    saldoPontos = 0;

    usarPontos.checked = false;
    opcaoUsarPontos.hidden = true;

    descontoFidelidade.textContent = formatarMoeda(0);

    if (!usuarioSalvo) {

        pontosDisponiveis.textContent = "0";

        mensagemFidelidade.textContent =
            "Entre na sua conta para consultar seus pontos.";
        return;
    }

    try {
        const cliente = JSON.parse(usuarioSalvo);

        const fidelidade = cliente.fidelidade || {
            participante: false,
            pontos: 0,
            historico: []
        };
        if (!fidelidade.participante) {

            pontosDisponiveis.textContent = "0";

            mensagemFidelidade.textContent =
                "Participe do Sabores que Premiam para acumular pontos.";
            return;
        }

        saldoPontos = Math.max(0, Number(fidelidade.pontos) || 0);

        pontosDisponiveis.textContent = saldoPontos;

        mensagemFidelidade.textContent =
            "Você está participando do Sabores que Premiam!";

        opcaoUsarPontos.hidden = saldoPontos < 100;

    } catch (erro) {
        console.error("Erro ao carregar os pontos:", erro);

        mensagemFidelidade.textContent =
            "Não foi possível consultar seus pontos.";
    }
}
// ===== CALCULAR DESCONTO DE FIDELIDADE =====
function calcularDescontoFidelidade() {
    descontoAtual = 0;
    pontosUtilizados = 0;

    if (usarPontos.checked && saldoPontos >= 100) {
        const subtotal = calcularSubtotal();
        const valorCompra = subtotal + TAXA_ENTREGA;

        // Cada 100 pontos dão R$ 5 de desconto.
        const faixasDisponiveis = Math.floor(saldoPontos / 100);

        // O desconto não pode ultrapassar o valor da compra.
        const faixasPermitidas = Math.floor(valorCompra / 5);

        const faixasUtilizadas = Math.min(
            faixasDisponiveis,
            faixasPermitidas
        );

        descontoAtual = faixasUtilizadas * 5;
        pontosUtilizados = faixasUtilizadas * 100;
    }

    descontoFidelidade.textContent = formatarMoeda(descontoAtual);

    atualizarValores();
}


// ===== EXIBIR O ENDEREÇO DE ENTREGA =====
function mostrarEnderecoEntrega() {
    if (!enderecoEntregaAtual) {
        enderecoClienteElemento.textContent = "Endereço não informado";
        return;
    }

    const endereco = enderecoEntregaAtual;

    const partesEndereco = [
        endereco.rua,
        endereco.numero,
        endereco.complemento,
        endereco.bairro,
        endereco.cidade,
        endereco.estado,
        endereco.cep
    ].filter(Boolean);

    enderecoClienteElemento.textContent =
        partesEndereco.length > 0
            ? partesEndereco.join(", ")
            : "Endereço não informado";
}


// ===== ABRIR O FORMULÁRIO DE ALTERAÇÃO DE ENDEREÇO =====
botaoAlterarEndereco.addEventListener("click", function () {
    if (!localStorage.getItem(CHAVE_USUARIO_LOGADO)) {
        mensagemEndereco.textContent =
            "Entre na sua conta para informar o endereço de entrega.";
        return;
    }

// Preenche o formulário com o endereço atualmente exibido.
    preencherFormularioEndereco(enderecoEntregaAtual);

    formularioEndereco.hidden = false;
    mensagemEndereco.textContent = "";

    campoCep.focus();
});


// ===== PREENCHER O FORMULÁRIO COM UM ENDEREÇO =====
function preencherFormularioEndereco(endereco) {
    const dados = endereco || {};

    campoCep.value = dados.cep || "";
    campoEstado.value = dados.estado || "";
    campoCidade.value = dados.cidade || "";
    campoBairro.value = dados.bairro || "";
    campoRua.value = dados.rua || "";
    campoNumero.value = dados.numero || "";
    campoComplemento.value = dados.complemento || "";
    campoReferencia.value = dados.referencia || "";
}


// ====== CONSULTAR O CEP PELO VIACEP =====
campoCep.addEventListener("input", function () {
// Mantém apenas números.
    const cepNumerico = campoCep.value.replace(/\D/g, "");

// Formata o CEP como 00000-000.
    if (cepNumerico.length > 5) {
        campoCep.value =
            cepNumerico.substring(0, 5) +
            "-" +
            cepNumerico.substring(5, 8);
    } else {
        campoCep.value = cepNumerico;
    }

// Só consulta quando houver oito números.
    if (cepNumerico.length === 8) {
        consultarCep(cepNumerico);
    }
});


async function consultarCep(cep) {
    mensagemEndereco.textContent = "Consultando CEP...";

    try {
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar o CEP.");
        }

        const dados = await resposta.json();

// O ViaCEP retorna erro quando o CEP não existe.
        if (dados.erro) {
            mensagemEndereco.textContent =
                "CEP não encontrado. Confira os números e tente novamente.";
            return;
        }

// Preenche automaticamente os campos retornados.
        campoEstado.value = dados.uf || "";
        campoCidade.value = dados.localidade || "";
        campoBairro.value = dados.bairro || "";
        campoRua.value = dados.logradouro || "";

        mensagemEndereco.textContent =
            "CEP encontrado! Confira o endereço e informe o número.";

// O cliente pode completar os campos que vierem vazios.
        campoNumero.focus();

    } catch (erro) {
        console.error("Erro ao consultar o CEP:", erro);

        mensagemEndereco.textContent =
            "Não foi possível consultar o CEP. Verifique sua conexão ou preencha o endereço manualmente.";
    }
}

// cancelar e alterar o endereço
botaoCancelarEndereco.addEventListener("click", function () {
    // Fecha o formulário sem modificar o endereço atual.
    formularioEndereco.hidden = true;

// Limpa a mensagem.
    mensagemEndereco.textContent = "";
});


// salvar o endereço para o pedido atual
formularioEndereco.addEventListener("submit", function (evento) {
    evento.preventDefault();

// Confere se o cliente continua conectado.
    if (!localStorage.getItem(CHAVE_USUARIO_LOGADO)) {
        mensagemEndereco.textContent =
            "Entre na sua conta antes de salvar o endereço.";
        return;
    }

// Guarda os dados digitados somente na variável do pedido atual.
    const novoEndereco = {
        cep: campoCep.value.trim(),
        estado: campoEstado.value.trim(),
        cidade: campoCidade.value.trim(),
        bairro: campoBairro.value.trim(),
        rua: campoRua.value.trim(),
        numero: campoNumero.value.trim(),
        complemento: campoComplemento.value.trim(),
        referencia: campoReferencia.value.trim()
    };

// Verifica os campos obrigatórios.
    if (
        !novoEndereco.cep ||
        !novoEndereco.estado ||
        !novoEndereco.cidade ||
        !novoEndereco.bairro ||
        !novoEndereco.rua ||
        !novoEndereco.numero
    ) {
        mensagemEndereco.textContent =
            "Preencha todos os campos obrigatórios do endereço.";
        return;
    }

// Atualiza o endereço usado no checkout.
// Não altera o endereço salvo no perfil do cliente.
    enderecoEntregaAtual = novoEndereco;

// Atualiza o endereço exibido na tela.
    mostrarEnderecoEntrega();

// Fecha o formulário.
    formularioEndereco.hidden = true;

    mensagemEndereco.textContent = "";

    mensagemStatus.textContent =
        "Endereço de entrega atualizado para este pedido.";
});


// ===== MUDAR VALORES PARA REAL =====
function formatarMoeda(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

// calcular subtotal 
function calcularSubtotal() {
    return carrinho.reduce((total, produto) => {
        return total + produto.preco * produto.quantidade;
    }, 0);
}


// ===== ATUALIZAR OS VALORES DA COMPRA =====
function atualizarValores() {
    const subtotal = calcularSubtotal();

    const total = Math.max(
        0,
        subtotal + TAXA_ENTREGA - descontoAtual
    );

    subtotalElemento.textContent = formatarMoeda(subtotal);

    taxaEntregaElemento.textContent = formatarMoeda(TAXA_ENTREGA);

    totalElemento.textContent = formatarMoeda(total);
}


// ====== MOSTRAR OS PRODUTOS DO CARRINHO =====
function mostrarProdutos() {
    listaProdutos.innerHTML = "";

    const carrinhoVazio = carrinho.length === 0;

    mensagemCarrinhoVazio.hidden = !carrinhoVazio;
    botaoConfirmar.disabled = carrinhoVazio;

    carrinho.forEach(produto => {
        const item = document.createElement("div");

        const nome = document.createElement("h3");
        nome.textContent = produto.nome;

        const quantidade = document.createElement("p");
        quantidade.textContent =
            `Quantidade: ${produto.quantidade}`;

        const precoUnitario = document.createElement("p");
        precoUnitario.textContent =
            `Preço unitário: ${formatarMoeda(produto.preco)}`;

        const subtotalItem = document.createElement("p");
        subtotalItem.textContent =
            `Subtotal: ${formatarMoeda(
                produto.preco * produto.quantidade
            )}`;

        item.append(nome, quantidade, precoUnitario, subtotalItem);

        listaProdutos.appendChild(item);
    });

    atualizarValores();
}


// ===== ENCAMINHAR PARA LOGIN =====
botaoLogin.addEventListener("click", function () {
// Após o login, o cliente poderá voltar ao checkout.
    localStorage.setItem(
        "retornarAposLogin",
        "finalizar-pedido.html"
    );

    window.location.href = "cadastro.html?modo=login";
});


// ====== ENCAMINHAR PARA CADASTRO =====
botaoCadastro.addEventListener("click", function () {
// Após o cadastro, o cliente poderá voltar ao checkout.
    localStorage.setItem(
        "retornarAposLogin",
        "finalizar-pedido.html"
    );

    window.location.href = "cadastro.html?modo=cadastro";
});


// ===== CONTROLAR OS CAMPOS DO PAGAMENTO =====
botoesPagamento.forEach(opcao => {
    opcao.addEventListener("change", function () {
        camposCartao.hidden = false;
    });
});


// ===== CONFIRMAR O PEDIDO ========
// ENCAMINHAR PARA A TELA DE CONFERÊNCIA==
botaoConfirmar.addEventListener("click", function () {

// Verifica se o carrinho está vazio.
    if (carrinho.length === 0) {
        mensagemStatus.textContent =
            "Seu carrinho está vazio. Adicione produtos antes de continuar.";
        return;
    }

// Verifica se existe um cliente conectado.
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO_LOGADO);

    if (!usuarioSalvo) {
        mensagemStatus.textContent =
            "Entre na sua conta para continuar com o pedido.";
        return;
    }

// Recupera os dados do cliente.
    let cliente;

    try {
        cliente = JSON.parse(usuarioSalvo);
    } catch (erro) {
        mensagemStatus.textContent =
            "Não foi possível recuperar os dados da sua conta. Entre novamente.";
        return;
    }

// Verifica se o endereço de entrega está completo.
    if (
        !enderecoEntregaAtual ||
        !enderecoEntregaAtual.rua ||
        !enderecoEntregaAtual.numero ||
        !enderecoEntregaAtual.bairro ||
        !enderecoEntregaAtual.cidade ||
        !enderecoEntregaAtual.estado ||
        !enderecoEntregaAtual.cep
    ) {
        mensagemStatus.textContent =
            "Confira seu endereço de entrega antes de continuar.";
        return;
    }

// Verifica se uma forma de pagamento foi selecionada.
    const pagamentoSelecionado = document.querySelector(
        'input[name="pagamento"]:checked'
    );

    if (!pagamentoSelecionado) {
        mensagemStatus.textContent =
            "Selecione uma forma de pagamento para continuar.";
        return;
    }

// Valida os campos fictícios quando o pagamento é por cartão.
    if (
        pagamentoSelecionado.value === "credito" ||
        pagamentoSelecionado.value === "debito"
    ) {
        const nomeCartao =
            document.getElementById("nome-cartao").value.trim();

        const numeroCartao =
            document.getElementById("numero-cartao").value.trim();

        const validadeCartao =
            document.getElementById("validade-cartao").value.trim();

        const codigoCartao =
            document.getElementById("codigo-cartao").value.trim();

        if (
            !nomeCartao ||
            !numeroCartao ||
            !validadeCartao ||
            !codigoCartao
        ) {
            mensagemStatus.textContent =
                "Preencha todos os campos fictícios do cartão.";
            return;
        }
    }

/// Calcula os valores da compra.
const subtotal = calcularSubtotal();
const taxaEntrega = TAXA_ENTREGA;
const desconto = descontoAtual;
const total = Math.max(0, subtotal + taxaEntrega - desconto);


// Converte o código do pagamento em um texto para exibição.
    let formaPagamento = pagamentoSelecionado.value;

    if (formaPagamento === "credito") {
        formaPagamento = "Cartão de crédito (simulação)";
    } else if (formaPagamento === "debito") {
        formaPagamento = "Cartão de débito (simulação)";
    }

// Prepara os dados temporários para a conferência.
const pedidoEmConferencia = {
    id: Date.now(),
    unidade: localStorage.getItem("raizesUnidadeSelecionada"),
    cliente: {
        nome: cliente.nome || "Cliente",
        email: cliente.email || ""
    },
    produtos: carrinho.map(produto => ({ ...produto })),
    enderecoEntrega: { ...enderecoEntregaAtual },
    subtotal: subtotal,
    taxaEntrega: taxaEntrega,
    desconto: desconto,
    pontosUtilizados: pontosUtilizados,
    total: total,
    formaPagamento: formaPagamento
};

// Salva temporariamente os dados da compra.
    try {
        localStorage.setItem(
            CHAVE_PEDIDO_CONFERENCIA,
            JSON.stringify(pedidoEmConferencia)
        );

// Impede cliques repetidos enquanto a página abre.
        botaoConfirmar.disabled = true;

        mensagemStatus.textContent =
            "Preparando o resumo da sua compra...";

// Abre a tela de conferência.
        window.location.href = "confirma-pedido.html";

    } catch (erro) {
        console.error(
            "Erro ao preparar o pedido para conferência:",
            erro
        );

        mensagemStatus.textContent =
            "Não foi possível preparar o pedido. Tente novamente.";

        botaoConfirmar.disabled = false;
    }

});

// ===== EVENTO PARA UTILIZAR PONTOS =====
usarPontos.addEventListener("change", calcularDescontoFidelidade);


// ===== INICIALIZAR A PÁGINA =====
mostrarProdutos();
verificarClienteLogado();
carregarFidelidade();