//=================================================
//      TELA - CADASTRO E ACESSO A CONTA DO CLIENTE
//=================================================

// ===== CHAVES DO LOCALSTORAGE =====
const CHAVE_USUARIOS = "raizesUsuarios";
const CHAVE_USUARIO_LOGADO = "raizesUsuarioLogado";

// ===== SELECIONAR OS FORMULÁRIOS =====
const formularioLogin = document.getElementById("formulario-login");
const formularioCadastro = document.getElementById("formulario-cadastro");
const formularioRecuperacao = document.getElementById("formulario-recuperacao");

const formLogin = document.getElementById("form-login");
const formCadastro = document.getElementById("form-cadastro");
const formRecuperacao = document.getElementById("form-recuperacao");

// ===== SELECIONAR BOTÕES E LINKS =====
const botaoMostrarCadastro = document.getElementById("mostrar-cadastro");
const botaoMostrarLogin = document.getElementById("mostrar-login");

const linkEsqueciSenha = document.getElementById("link-esqueci-senha");
const botaoVoltarLogin = document.getElementById("voltar-login-recuperacao");


// ====== FUNÇÕES PARA ALTERNAR OS FORMULÁRIOS =====
function mostrarLogin() {
    formularioLogin.hidden = false;
    formularioCadastro.hidden = true;
    formularioRecuperacao.hidden = true;
}

function mostrarCadastro() {
    formularioLogin.hidden = true;
    formularioCadastro.hidden = false;
    formularioRecuperacao.hidden = true;
}

function mostrarRecuperacao() {
    formularioLogin.hidden = true;
    formularioCadastro.hidden = true;
    formularioRecuperacao.hidden = false;
}


// ===== BOTÃO CRIAR CONTA =====
botaoMostrarCadastro.addEventListener("click", function () {
    mostrarCadastro();
});

// ===== BOTÃO VOLTAR PARA O LOGIN =====
botaoMostrarLogin.addEventListener("click", function () {
    mostrarLogin();
});


// ===== LINK ESQUECI MINHA SENHA =====
linkEsqueciSenha.addEventListener("click", function (evento) {
    evento.preventDefault();
    mostrarRecuperacao();
});


// ===== VOLTAR PARA O LOGIN PELA RECUPERAÇÃO =====
botaoVoltarLogin.addEventListener("click", function () {
    mostrarLogin();
});


// ========CONSULTAR CEP =======
const campoCep = document.getElementById("cadastro-cep");

campoCep.addEventListener("blur", async function () {
    const cep = campoCep.value.replace(/\D/g, "");
// O CEP brasileiro deve ter 8 números.
    if (cep.length !== 8) {
        return;
    }

    try {
        const resposta = await fetch(
            `https://viacep.com.br/ws/${cep}/json/`
        );

        if (!resposta.ok) {
            throw new Error("Não foi possível consultar o CEP.");
        }

        const dados = await resposta.json();

        if (dados.erro) {
            alert("CEP não encontrado. Verifique o número digitado.");
            return;
        }

// Preenche os campos com os dados encontrados.
        document.getElementById("cadastro-rua").value =
            dados.logradouro || "";

        document.getElementById("cadastro-bairro").value =
            dados.bairro || "";

        document.getElementById("cadastro-cidade").value =
            dados.localidade || "";

        document.getElementById("cadastro-estado").value =
            dados.uf || "";

    } catch (erro) {
        alert("Não foi possível consultar o CEP. Tente novamente.");

        console.error("Erro ao consultar CEP:", erro);
    }
});


// ======== OBTER USUÁRIOS CADASTRADOS ========
function obterUsuarios() {
    try {
        const usuariosSalvos = localStorage.getItem(CHAVE_USUARIOS);
        if (!usuariosSalvos) {
            return [];
        }

        const usuarios = JSON.parse(usuariosSalvos);

        return Array.isArray(usuarios) ? usuarios : [];

    } catch (erro) {
        console.error("Erro ao recuperar os usuários:", erro);
        return [];
    }
}


// ===== CADASTRAR UM NOVO CLIENTE====
formCadastro.addEventListener("submit", function (evento) {
// Impede o navegador de recarregar a página.
    evento.preventDefault();

// Obtém e organiza os dados dos campos.
    const nome = document.getElementById("cadastro-nome").value.trim();

    const email = document.getElementById("cadastro-email")
        .value.trim().toLowerCase();

    const ddi = document.getElementById("cadastro-ddi").value.trim();
    const ddd = document.getElementById("cadastro-ddd").value.trim();

    const telefone = document.getElementById("cadastro-telefone")
        .value.trim();

    const senha = document.getElementById("cadastro-senha").value;
    const confirmarSenha = document.getElementById("confirmar-senha").value;

    const usuarios = obterUsuarios();

// Verifica se as senhas são iguais.
    if (senha !== confirmarSenha) {
        alert("As senhas não coincidem. Confira e tente novamente.");
        document.getElementById("confirmar-senha").focus();
        return;
    }

// Verifica se o e-mail já foi cadastrado.
    const emailExiste = usuarios.some(function (usuario) {
        return usuario.email === email;
    });

    if (emailExiste) {
        alert("Este e-mail já possui cadastro. Entre na sua conta.");
        mostrarLogin();
        document.getElementById("login-email").value = email;
        return;
    }

// Reúne os dados do cliente.
    const novoUsuario = {
        nome: nome,
        email: email,
        fidelidade: {participante: false,pontos: 0,historico: []},
        telefone: `${ddi} (${ddd}) ${telefone}`,
        senha: senha,
        cep: document.getElementById("cadastro-cep").value.trim(),
        estado: document.getElementById("cadastro-estado").value.trim(),
        cidade: document.getElementById("cadastro-cidade").value.trim(),
        bairro: document.getElementById("cadastro-bairro").value.trim(),
        rua: document.getElementById("cadastro-rua").value.trim(),
        numero: document.getElementById("cadastro-numero").value.trim(),
        complemento: document.getElementById("cadastro-complemento").value.trim(),
        referencia: document.getElementById("cadastro-referencia").value.trim()
    };

    try {
// Adiciona o novo usuário à lista.
        usuarios.push(novoUsuario);
// Salva a lista atualizada no navegador.
        localStorage.setItem(
            CHAVE_USUARIOS,
            JSON.stringify(usuarios)
        );

// Registra o cliente que acabou de entrar.
// Não incluímos a senha nos dados da sessão.
        const usuarioLogado = {
            nome: novoUsuario.nome,
            email: novoUsuario.email,
            fidelidade: novoUsuario.fidelidade,
            telefone: novoUsuario.telefone,
            cep: novoUsuario.cep,
            estado: novoUsuario.estado,
            cidade: novoUsuario.cidade,
            bairro: novoUsuario.bairro,
            rua: novoUsuario.rua,
            numero: novoUsuario.numero,
            complemento: novoUsuario.complemento,
            referencia: novoUsuario.referencia
        };

        localStorage.setItem(
            CHAVE_USUARIO_LOGADO,
            JSON.stringify(usuarioLogado)
        );

        alert("Cadastro realizado com sucesso! Bem-vindo(a) ao Raízes do Nordeste.");

// Encaminha o cliente para o perfil.
        window.location.href = "perfil.html";

    } catch (erro) {
        console.error("Erro ao salvar o cadastro:", erro);
        alert("Não foi possível salvar o cadastro. Tente novamente.");
    }
});


// ===== FAZER LOGIN=====
formLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const senha = document.getElementById("login-senha").value;
    const usuarios = obterUsuarios();
// Procura uma conta com o e-mail informado.
    const usuarioEncontrado = usuarios.find(function (usuario) {
        return usuario.email === email;
    });

// Verifica se a conta existe.
    if (!usuarioEncontrado) {
        alert("E-mail não encontrado. Verifique os dados ou crie sua conta.");
        return;
    }

// Verifica a senha.
    if (usuarioEncontrado.senha !== senha) {
        alert("Senha incorreta. Confira e tente novamente.");
        return;
    }

// Prepara os dados da sessão sem incluir a senha.
    const usuarioLogado = {
        nome: usuarioEncontrado.nome,
        email: usuarioEncontrado.email,
        fidelidade: usuarioEncontrado.fidelidade || {participante: false,pontos: 0,historico: []},
        telefone: usuarioEncontrado.telefone,
        cep: usuarioEncontrado.cep,
        estado: usuarioEncontrado.estado,
        cidade: usuarioEncontrado.cidade,
        bairro: usuarioEncontrado.bairro,
        rua: usuarioEncontrado.rua,
        numero: usuarioEncontrado.numero,
        complemento: usuarioEncontrado.complemento,
        referencia: usuarioEncontrado.referencia
    };

    try {

// Salva quem está conectado.
        localStorage.setItem(
            CHAVE_USUARIO_LOGADO,
            JSON.stringify(usuarioLogado)
        );

        alert("Login realizado com sucesso! Bem-vindo(a) de volta.");

// Encaminha o cliente para o perfil.
        window.location.href = "perfil.html";

    } catch (erro) {
        console.error("Erro ao iniciar a sessão:", erro);
        alert("Não foi possível entrar na conta. Tente novamente.");
    }
});


// recupera senha apenas para demonstração
formRecuperacao.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const email = document.getElementById("recuperacao-email")
        .value.trim().toLowerCase();

    const usuarios = obterUsuarios();

    const usuarioEncontrado = usuarios.some(function (usuario) {
        return usuario.email === email;
    });

    if (usuarioEncontrado) {
        alert(
            "Encontramos seu cadastro. A recuperação real da senha " +
            "ainda será implementada na próxima etapa."
        );
    } else {
        alert(
            "Não encontramos uma conta com esse e-mail. " +
            "Confira o endereço digitado."
        );
    }
});


// ===== ABRIR O FORMULÁRIO INDICADO NA URL=====
const parametrosURL = new URLSearchParams(window.location.search);

const modoAcesso = parametrosURL.get("modo");

if (modoAcesso === "cadastro") {
    mostrarCadastro();
} else if (modoAcesso === "recuperacao") {
    mostrarRecuperacao();
} else {
    mostrarLogin();
}