// ============================================= 
//      TELA - MENU PARA ACESSIBILIDADES
// ============================================= 

// ===== BOTÃO MENU =====
const botaoMenu = document.querySelector(".botao-menu");
const menuNavegacao = document.querySelector(".menu-navegacao");

// ===== ABRIR E FECHAR MENU =====
if (botaoMenu && menuNavegacao) {

    botaoMenu.addEventListener("click", function () {

        const menuAberto = menuNavegacao.classList.toggle("aberto");

        botaoMenu.setAttribute("aria-expanded", menuAberto);

    });

// Fecha o menu ao selecionar uma opção.
    const linksMenu = menuNavegacao.querySelectorAll("a");

    linksMenu.forEach(function (link) {

        link.addEventListener("click", function () {

            menuNavegacao.classList.remove("aberto");

            botaoMenu.setAttribute("aria-expanded", "false");

        });

    });

// Fecha o menu ao clicar fora dele.
    document.addEventListener("click", function (evento) {

        const clicouNoMenu = menuNavegacao.contains(evento.target);

        const clicouNoBotao = botaoMenu.contains(evento.target);

        if (!clicouNoMenu && !clicouNoBotao) {

            menuNavegacao.classList.remove("aberto");

            botaoMenu.setAttribute("aria-expanded", "false");

        }

    });

// Fecha o menu ao pressionar ESC.
    document.addEventListener("keydown", function (evento) {
        if (evento.key === "Escape") {

            menuNavegacao.classList.remove("aberto");

            botaoMenu.setAttribute("aria-expanded", "false");

        }

    });

}

// ====== VERIFICAR SE O CLIENTE ESTÁ LOGADO =====
function verificarContaCliente() {

    const usuarioSalvo = localStorage.getItem("raizesUsuarioLogado");

    let usuarioLogado = null;

    if (usuarioSalvo) {

        try {

            usuarioLogado = JSON.parse(usuarioSalvo);

        } catch (erro) {

            console.error("Erro ao recuperar usuário:", erro);

        }

    }

// Define o destino do botão Minha conta.
    const linkMinhaConta = document.querySelector(".link-cadastro");

    if (linkMinhaConta) {

        linkMinhaConta.href = usuarioLogado
            ? "perfil.html"
            : "cadastro.html";

    }

}

// Executa a verificação ao carregar a página.
verificarContaCliente();
