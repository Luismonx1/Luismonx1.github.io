import { createCliente } from '/src/api.js';

const cadastroForm = document.getElementById('cadastroForm');
const nomeInput = document.getElementById('nome');
const emailInput = document.getElementById('email');
const telefoneInput = document.getElementById('telefone');
const senhaInput = document.getElementById('senha');
const confirmarSenhaInput = document.getElementById('confirmarSenha');
const cadastrarBtn = document.getElementById('cadastrarBtn');
const feedbackMessage = document.getElementById('feedbackMessage');

// --- 2. Adicionar o Event Listener para o Botão de Cadastro ---
cadastrarBtn.addEventListener('click', async (event) => {
    event.preventDefault();

    // --- 3. Obter os Valores dos Campos do Formulário ---
    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const telefone = telefoneInput.value.trim();
    const senha = senhaInput.value;
    const confirmarSenha = confirmarSenhaInput.value;

    // --- 4. Validações Básicas no Frontend ---
    if (!nome || !email || !telefone || !senha || !confirmarSenha) {
        feedbackMessage.textContent = 'Por favor, preencha todos os campos obrigatórios.';
        feedbackMessage.style.color = 'red';
        return;
    }

    if (senha !== confirmarSenha) {
        feedbackMessage.textContent = 'As senhas não coincidem!';
        feedbackMessage.style.color = 'red';
        return;
    }

    if (senha.length < 6) {
        feedbackMessage.textContent = 'A senha deve ter no mínimo 6 caracteres.';
        feedbackMessage.style.color = 'red';
        return;
    }

    // --- 5. Montar o Objeto de Dados para Enviar à API ---
    const dadosCliente = {
        nome: nome,
        email: email,
        telefone: telefone,
        senha: senha // A senha será transformada em hash antes de ser enviada para o backend
    };

    // --- 6. Enviar os Dados para o Backend usando a Função da API ---
    try {
        feedbackMessage.textContent = 'Cadastrando...'; 
        feedbackMessage.style.color = 'black';

        const clienteCadastrado = await createCliente(dadosCliente);

        feedbackMessage.textContent = `Cliente "${clienteCadastrado.nome}" cadastrado com sucesso!`;
        feedbackMessage.style.color = 'green';

        // --- 7. Reseta ou redireciona a pessoa após o preenchimento do formulário
        cadastroForm.reset();

        setTimeout(() => {
            window.location.href = '../../paginas/inicio/inicio.html';
        }, 2000);

    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        feedbackMessage.textContent = `Erro ao cadastrar: ${error.message}`;
        feedbackMessage.style.color = 'red';
    }
});