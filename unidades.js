// ========================================
//      TELA - UNIDADES
// ========================================

// ===== BOTÕES PARA ESCOLHER A UNIDADE ARMAZENAR ESSA INFORMAÇÃO =====
// Identifica todos os botões de escolha
const botoesUnidade = document.querySelectorAll(".botao-unidade");

// Chave utilizada para guardar a unidade escolhida
const CHAVE_UNIDADE = "raizesUnidadeSelecionada";

// Percorre todos os botões
botoesUnidade.forEach(function (botao) {
    botao.addEventListener("click", function () {
// Identifica a unidade escolhida
        const unidadeEscolhida = botao.dataset.unidade;
// Guarda a unidade no localStorage
        localStorage.setItem(CHAVE_UNIDADE, unidadeEscolhida);

// Verifica se o cliente está trocando a unidade durante a finalização
        const retornarFinalizacao = sessionStorage.getItem("retornarFinalizacao");

        if (retornarFinalizacao === "true") {
// Remove a informação temporária
            sessionStorage.removeItem("retornarFinalizacao");
// Retorna para a finalização do pedido
            window.location.href = "finalizar-pedido.html";
        } else {
// Encaminha o cliente para o cardápio
            window.location.href = "cardapio.html";
        }

    });
});