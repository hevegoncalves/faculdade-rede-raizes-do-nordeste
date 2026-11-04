// =============================================
//      TELA - ACOMPANHAR PEDIDO
// =============================================

// ===== CHAVES DO LOCALSTORAGE =====
const CHAVE_PEDIDOS = "raizesPedidos";
const CHAVE_USUARIO_LOGADO = "raizesUsuarioLogado";
const CHAVE_USUARIOS = "raizesUsuarios";


// ===== ELEMENTOS DA PÁGINA =====
const numeroPedidoElemento = document.getElementById("numero-pedido");
const mensagemStatus = document.getElementById("mensagem-status");

const iconeEtapa = document.getElementById("icone-etapa");
const tituloEtapa = document.getElementById("titulo-etapa");
const descricaoEtapa = document.getElementById("descricao-etapa");

const etapasElementos = document.querySelectorAll(".etapa");

const botaoAvancarEtapa = document.getElementById(
    "botao-avancar-etapa"
);

const avisoSimulacao = document.getElementById("aviso-simulacao");

const areaAvaliacao = document.getElementById("area-avaliacao");

const botaoConfirmarEntrega = document.getElementById(
    "botao-confirmar-entrega"
);

const formularioAvaliacao = document.getElementById(
    "formulario-avaliacao"
);

const notaAvaliacao = document.getElementById("nota-avaliacao");

const comentarioAvaliacao = document.getElementById(
    "comentario-avaliacao"
);

const mensagemAvaliacao = document.getElementById(
    "mensagem-avaliacao"
);



// ===== ETAPAS DO PEDIDO =====
const etapasPedido = [
    {
        titulo: "Pedido confirmado",
        descricao: "Recebemos sua compra! Estamos organizando seu pedido.",
        icone: "🧾",
        status: "Pedido confirmado"
    },
    {
        titulo: "Preparando seu pedido",
        descricao: "Nossos cozinheiros estão preparando seus pratos com carinho!",
        icone: "👨‍🍳",
        status: "Preparando seu pedido"
    },
    {
        titulo: "Saiu para entrega",
        descricao: "Seu pedido está a caminho. Prepare-se para saborear!",
        icone: "🛵",
        status: "Saiu para entrega"
    },
    {
        titulo: "Pedido entregue",
        descricao: "Seu pedido chegou! Esperamos que aproveite sua refeição.",
        icone: "📦",
        status: "Entregue"
    }
];

// ===== VARIÁVEIS DO ACOMPANHAMENTO =====
let pedidosSalvos = [];
let pedidoAtual = null;
let indiceEtapaAtual = 0;


// ===== RECUPERAR O CLIENTE CONECTADO =====
function recuperarCliente() {
    const usuarioSalvo = localStorage.getItem(
        CHAVE_USUARIO_LOGADO
    );

    if (!usuarioSalvo) {
        return null;
    }

    try {
        return JSON.parse(usuarioSalvo);
    } catch (erro) {
        console.error("Erro ao recuperar o cliente:", erro);
        return null;
    }
}


// ===== SALVAR OS PEDIDOS =====
function salvarPedidos() {
    localStorage.setItem(
        CHAVE_PEDIDOS,
        JSON.stringify(pedidosSalvos)
    );
}

// ===== ACUMULAR PONTOS DE FIDELIDADE =====
function acumularPontosFidelidade(pedido) {
    if (!pedido || pedido.status !== "Entregue") {
        return;
    }

// Evita contabilizar o mesmo pedido novamente.
    if (pedido.pontosFidelidadeCreditados) {
        return;
    }

    const usuarios = JSON.parse(
        localStorage.getItem(CHAVE_USUARIOS)
    ) || [];

    const indiceUsuario = usuarios.findIndex(usuario =>
        usuario.email?.toLowerCase() ===
        pedido.cliente?.email?.toLowerCase()
    );

    if (indiceUsuario === -1) {
        return;
    }

    const usuario = usuarios[indiceUsuario];

    const fidelidade = usuario.fidelidade || {
        participante: false,
        pontos: 0,
        historico: []
    };

// Somente participantes recebem pontos.
    if (!fidelidade.participante) {
        return;
    }

// Um ponto para cada real gasto.
    const pontosGanhos = Math.floor(
        Math.max(0, Number(pedido.total) || 0)
    );

    if (pontosGanhos <= 0) {
        return;
    }

    fidelidade.pontos =
        (Number(fidelidade.pontos) || 0) + pontosGanhos;

    fidelidade.historico = Array.isArray(fidelidade.historico)
        ? fidelidade.historico
        : [];

    fidelidade.historico.push({
        pedidoId: pedido.id,
        tipo: "acumulo",
        pontos: pontosGanhos,
        data: new Date().toISOString()
    });

    usuario.fidelidade = fidelidade;

// Atualiza o cadastro principal.
    localStorage.setItem(
        CHAVE_USUARIOS,
        JSON.stringify(usuarios)
    );

// Marca o pedido como contabilizado.
    pedido.pontosFidelidadeCreditados = true;

    salvarPedidos();

// Atualiza a sessão se o mesmo cliente estiver conectado.
    const usuarioLogado = recuperarCliente();
    if (
        usuarioLogado &&
        usuarioLogado.email?.toLowerCase() ===
        usuario.email.toLowerCase()
    ) {

        usuarioLogado.fidelidade = fidelidade;

        localStorage.setItem(
            CHAVE_USUARIO_LOGADO,
            JSON.stringify(usuarioLogado)
        );
    }

    mensagemAvaliacao.textContent =
        `Entrega confirmada! Você recebeu ${pontosGanhos} pontos de fidelidade.`;
}

function localizarPedido() {
    const cliente = recuperarCliente();

// Verifica se existe um cliente conectado.
    if (!cliente) {
        numeroPedidoElemento.textContent =
            "Não foi possível identificar sua conta.";

        mensagemStatus.textContent =
            "Entre na sua conta para consultar seus pedidos.";
        if (botaoAvancarEtapa) {
            botaoAvancarEtapa.disabled = true;
        }
        if (botaoConfirmarEntrega) {
            botaoConfirmarEntrega.disabled = true;
        }
        return false;
    }

// Recupera os pedidos salvos.
    try {
        pedidosSalvos =
            JSON.parse(localStorage.getItem(CHAVE_PEDIDOS)) || [];

        if (!Array.isArray(pedidosSalvos)) {
            pedidosSalvos = [];
        }

    } catch (erro) {

        console.error("Erro ao recuperar os pedidos:", erro);

        pedidosSalvos = [];
    }

// Recupera o número do pedido informado na URL.
    const parametrosURL = new URLSearchParams(
        window.location.search
    );

    const idInformado = parametrosURL.get("id");

// Mostra somente os pedidos do cliente conectado.
    const pedidosDoCliente = pedidosSalvos.filter(pedido => {
        return pedido.cliente?.email?.toLowerCase() ===
            cliente.email?.toLowerCase();

    });

// Verifica se o cliente possui pedidos.
    if (pedidosDoCliente.length === 0) {
        numeroPedidoElemento.textContent =
            "Nenhum pedido encontrado.";

        mensagemStatus.textContent =
            "Faça uma compra para acompanhar seu pedido por aqui.";
        if (botaoAvancarEtapa) {
            botaoAvancarEtapa.disabled = true;
        }

        if (botaoConfirmarEntrega) {
            botaoConfirmarEntrega.disabled = true;
        }
        return false;
    }

// Localiza um pedido específico ou seleciona o mais recente.
    if (idInformado) {
        pedidoAtual = pedidosDoCliente.find(pedido => {
            return String(pedido.id) === idInformado;
        });
    } else {
        pedidoAtual = pedidosDoCliente.reduce((maisRecente, pedido) => {
            if (!maisRecente) {
                return pedido;
            }
            return Number(pedido.id) > Number(maisRecente.id)
                ? pedido
                : maisRecente;
        }, null);
    }

// Verifica se o pedido foi encontrado.
    if (!pedidoAtual) {
        numeroPedidoElemento.textContent =
            "Pedido não encontrado.";

        mensagemStatus.textContent =
            "Não encontramos esse pedido na sua conta.";
        if (botaoAvancarEtapa) {
            botaoAvancarEtapa.disabled = true;
        }
        if (botaoConfirmarEntrega) {
            botaoConfirmarEntrega.disabled = true;
        }
        return false;
    }

    numeroPedidoElemento.textContent =
        `Número do pedido: ${pedidoAtual.id}`;
    return true;
}


// =====IDENTIFICAR A ETAPA ATUAL DO PEDIDO =====
function identificarEtapaAtual() {
    if (!pedidoAtual) {
        return;
    }

    const status = pedidoAtual.status;

    if (
        status === "Pedido confirmado" ||
        status === "Recebido pelo restaurante"
    ) {
        indiceEtapaAtual = 0;
        return;
    }

    const indiceEncontrado = etapasPedido.findIndex(
        etapa => etapa.status === status
    );

    if (indiceEncontrado !== -1) {
        indiceEtapaAtual = indiceEncontrado;
    }
}


// ==== ATUALIZAR A APARÊNCIA DAS ETAPAS =====
function atualizarListaEtapas() {
    etapasElementos.forEach((elemento, indice) => {
        const indicador = elemento.querySelector(
            ".indicador-status"
        );

        elemento.classList.remove("atual", "concluida");

        if (indice < indiceEtapaAtual) {
            elemento.classList.add("concluida");
            indicador.textContent = "Concluído";
        } else if (indice === indiceEtapaAtual) {
            elemento.classList.add("atual");

            indicador.textContent =
                pedidoAtual.status === "Entregue"
                    ? "Concluído"
                    : "Etapa atual";
        } else {
            indicador.textContent = "Aguardando";
        }
    });
}


// ===== MOSTRAR A ETAPA ATUA L=====
function atualizarAcompanhamento() {
    if (!pedidoAtual) {
        return;
    }

    const etapa = etapasPedido[indiceEtapaAtual];

    iconeEtapa.textContent = etapa.icone;
    tituloEtapa.textContent = etapa.titulo;
    descricaoEtapa.textContent = etapa.descricao;

    mensagemStatus.textContent =
        `Status atual: ${pedidoAtual.status}`;

    atualizarListaEtapas();

    const pedidoEntregue = pedidoAtual.status === "Entregue";

    const saiuParaEntrega =
        pedidoAtual.status === "Saiu para entrega";

// O cliente não pode avançar as etapas manualmente.
if (botaoAvancarEtapa) {
    botaoAvancarEtapa.hidden = true;
    botaoAvancarEtapa.disabled = true;
}

// O aviso de simulação não é mais necessário.
if (avisoSimulacao) {
    avisoSimulacao.hidden = true;
}

// A confirmação só aparece depois que o restaurante
// informa que o pedido saiu para entrega.
    areaAvaliacao.hidden =
        !saiuParaEntrega && !pedidoEntregue;

    botaoConfirmarEntrega.hidden =
        !saiuParaEntrega;

 // Depois da confirmação, libera a avaliação.
    if (pedidoEntregue) {

        formularioAvaliacao.hidden = Boolean(
            pedidoAtual.avaliacao
        );

        if (pedidoAtual.avaliacao) {
            mensagemAvaliacao.textContent =
                "Obrigado! Sua avaliação já foi registrada.";
        }
    } else {

        formularioAvaliacao.hidden = true;

    }
}


// ==== CONFIRMAR O RECEBIMENTO ====
botaoConfirmarEntrega.addEventListener("click", function () {
    if (!pedidoAtual || pedidoAtual.status === "Entregue") {
        return;
    }

    if (pedidoAtual.status !== "Saiu para entrega") {
        mensagemAvaliacao.textContent =
            "Aguarde até a etapa de entrega para confirmar o recebimento.";
        return;
    }

    const confirmar = window.confirm(
        "Você confirma que recebeu seu pedido?"
    );

    if (!confirmar) {
        return;
    }

    pedidoAtual.status = "Entregue";
    pedidoAtual.dataEntrega = new Date().toISOString();

    try {
        salvarPedidos();

        acumularPontosFidelidade(pedidoAtual);

        atualizarAcompanhamento();

        areaAvaliacao.hidden = false;
        formularioAvaliacao.hidden = false;

        mensagemAvaliacao.textContent =
            "Recebimento confirmado! Agora você pode avaliar sua experiência.";

    } catch (erro) {
        console.error("Erro ao confirmar a entrega:", erro);

        mensagemAvaliacao.textContent =
            "Não foi possível registrar a entrega. Tente novamente.";
    }
});


// ===== REGISTRAR A AVALIAÇÃO =====
formularioAvaliacao.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!pedidoAtual || pedidoAtual.status !== "Entregue") {
        mensagemAvaliacao.textContent =
            "Confirme o recebimento antes de enviar sua avaliação.";

        return;
    }

    if (pedidoAtual.avaliacao) {
        mensagemAvaliacao.textContent =
            "Este pedido já possui uma avaliação.";

        formularioAvaliacao.hidden = true;

        return;
    }

    const nota = Number(notaAvaliacao.value);

    const comentario = comentarioAvaliacao.value.trim();

    if (!Number.isInteger(nota) || nota < 1 || nota > 5) {
        mensagemAvaliacao.textContent =
            "Selecione uma nota de 1 a 5.";

        return;
    }

// Registra a avaliação no pedido.
    pedidoAtual.avaliacao = {
        nota: nota,
        comentario: comentario,
        data: new Date().toISOString()
    };

    try {
        salvarPedidos();

        mensagemAvaliacao.textContent =
            "Obrigado por avaliar o Raízes do Nordeste! ❤️";

        formularioAvaliacao.hidden = true;

    } catch (erro) {
        console.error("Erro ao salvar a avaliação:", erro);

    // Evita manter a avaliação apenas na memória se o salvamento falhar.
        delete pedidoAtual.avaliacao;

        mensagemAvaliacao.textContent =
            "Não foi possível salvar sua avaliação. Tente novamente.";
    }
});


//=====ATUALIZAR QUANDO O RESTAURANTE ALTERAR O PEDIDO=====
window.addEventListener("storage", function (evento) {
    if (evento.key === CHAVE_PEDIDOS) {

// Recupera novamente os pedidos salvos.
        if (localizarPedido()) {

            identificarEtapaAtual();

            atualizarAcompanhamento();
        }
    }
});

// ===== INICIALIZAR A PÁGINA =====
if (localizarPedido()) {
    identificarEtapaAtual();
    atualizarAcompanhamento();
}