// =======================================================
//      TELA - VERIFICAR SE O CLIENTE ESCOLHEU UMA UNIDADE
// =======================================================

// ===== VERIFICAR UNIDADE =====
const unidadeSelecionada = localStorage.getItem("raizesUnidadeSelecionada");

// Verifica se o cliente ainda não escolheu uma unidade
if (!unidadeSelecionada) {

// Exibe a mensagem na página atual
    alert("Para acessar o cardápio, escolha uma de nossas unidades.");

// Após clicar em OK, encaminha para a página de unidades
    window.location.href = "unidades.html";

}