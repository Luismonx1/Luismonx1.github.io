import { loginCliente } from '/src/api.js';

function cadastrar() {
    window.location.href = '../cadastro/cadastro.html';
}

// --- 1. Capturar Elementos do DOM (Login Form) ---
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const senhaInput = document.getElementById('senha');
const entrarBtn = document.getElementById('entrarBtn');
const feedbackMessage = document.getElementById('feedbackMessage'); // Mensagem para o formulário de login

// --- 2. Capturar Elementos do DOM (Recuperar Senha Modal) ---
const modalRecuperarSenha = document.getElementById('modalRecuperarSenha');
const emailRecuperacaoInput = document.getElementById('emailRecuperacao');
const enviarEmailBtn = document.getElementById('enviarEmailBtn');
const mensagemEmail = document.getElementById('mensagemEmail'); // Mensagem para o modal de recuperação de senha

// --- 3. Adicionar o Event Listener para o Botão "Entrar" (Login Form) ---
entrarBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    // --- 3. Obter os Valores dos Campos ---
    const email = emailInput.value.trim();
    const senha = senhaInput.value;

    // --- 4. Validações ---
    if (!email || !senha) {
        feedbackMessage.textContent = 'Por favor, preencha todos os campos.';
        feedbackMessage.style.color = 'red';
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        feedbackMessage.textContent = 'Por favor, insira um e-mail válido.';
        feedbackMessage.style.color = 'red';
        return;
    }

    // --- 5. Enviar os Dados de Login para o Backend ---
    try {
        feedbackMessage.textContent = 'Entrando...';
        feedbackMessage.style.color = 'black';

        const response = await loginCliente(email, senha);

        localStorage.setItem('userId', response.id_cliente);
        localStorage.setItem('userName', response.nome);
        localStorage.setItem('userPhone', response.telefone);
        console.log('UserID salvo no localStorage:', localStorage.getItem('userId'));

        feedbackMessage.textContent = response.message;
        feedbackMessage.style.color = 'green';

        // Redireciona para a página inicial após um pequeno atraso
        setTimeout(() => {
            window.location.href = '../../paginas/inicio/inicio.html';
        }, 2000);

    } catch (error) {
        console.error('Erro no login:', error);
        feedbackMessage.textContent = `Erro: ${error.message || 'Ocorreu um erro desconhecido no login.'}`;
        feedbackMessage.style.color = 'red';
    }
});

loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    entrarBtn.click();
});


// --- Funções e Event Listeners para o Modal de Recuperação de Senha ---

// Abre o modal de recuperação de senha
document.querySelector(".forgot").addEventListener("click", () => {
    modalRecuperarSenha.style.display = "block";
    // Opcional: Limpar campos e mensagens ao abrir
    emailRecuperacaoInput.value = '';
    mensagemEmail.textContent = ''; 
    mensagemEmail.style.color = 'black';
});

// Fecha o modal de recuperação de senha
document.querySelector("#modalRecuperarSenha .close").addEventListener("click", () => {
    modalRecuperarSenha.style.display = "none";
});

window.addEventListener("click", (event) => {
    if (event.target == modalRecuperarSenha) {
        modalRecuperarSenha.style.display = "none";
    }
});

enviarEmailBtn.addEventListener("click", () => {
    const email = emailRecuperacaoInput.value.trim();

    if (!email) {
        mensagemEmail.textContent = 'Por favor, digite seu e-mail.';
        mensagemEmail.style.color = 'red';
        return;
    }
    if (!email.includes('@') || !email.includes('.')) {
        mensagemEmail.textContent = 'Por favor, insira um e-mail válido.';
        mensagemEmail.style.color = 'red';
        return;
    }

    console.log(`Email para recuperação de senha (ainda não implementado): ${email}`);
    mensagemEmail.textContent = 'Link de recuperação enviado com sucesso para o email';
    mensagemEmail.style.color = 'green'; 
});