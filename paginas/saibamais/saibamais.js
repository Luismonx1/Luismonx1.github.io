import { deleteCliente, getClienteById, updateCliente } from '../../api.js';

// --- Variáveis de Referência do DOM 
const modalSair = document.getElementById("modalSair");
const linkSair = document.querySelector(".login");
const fecharModalSair = document.querySelector(".close-sair");
// userNameDisplay precisa de um ID no HTML
const userNameDisplay = document.querySelector('#userNameDisplay'); 
const alterarContaButton = document.getElementById('alterarConta');
const logoutButton = document.getElementById('confirmarSair');
const deleteAccountButton = document.getElementById('apagarConta');

const modalAlterarDados = document.getElementById('modalAlterarDados');
const closeAlterarDadosModalBtn = document.getElementById('closeAlterarDadosModal');
const formAlterarDados = document.getElementById('formAlterarDados');
const alterarNomeInput = document.getElementById('alterarNome');
const alterarTelefoneInput = document.getElementById('alterarTelefone');

// Variável para a div de mensagem de feedback
const mensagemDiv = document.getElementById('mensagem');

/**
 * Exibe uma mensagem de feedback na tela (sucesso, erro, info).
 * Garanta que a div com id="mensagem" existe no seu HTML.
 */
function exibirMensagem(texto, tipo = 'info') {
    if (!mensagemDiv) {
        console.error('Elemento #mensagem não encontrado no HTML. Crie <div id="mensagem" class="mensagem mensagem-esconder"></div>');
        return;
    }
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`; 
    mensagemDiv.classList.remove('mensagem-esconder'); // Remove a classe para exibir

    setTimeout(() => {
        mensagemDiv.classList.add('mensagem-esconder'); // Adiciona de volta para esconder
    }, 3000); // Mensagem desaparece após 3 segundos
}

/**
 * Fecha um modal específico pelo seu ID.
 */
function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
    }
}

// --- Funções de Lógica do Perfil do Usuário e Alteração de Dados ---

/**
 * Verifica o status de login do usuário e configura o comportamento do link ".login" na navbar.
 * Se logado, o link exibirá o nome do usuário e abrirá o modalSair.
 * Se não logado, o link redirecionará para a página de login.
 * @param {Event} [e] - O evento de clique, se houver.
 */
async function checkLoginStatusAndConfigureLink(e) {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');

    if (linkSair) {
        if (userId && userName) {
            linkSair.classList.add('login-info');
            linkSair.innerHTML = `<span class="icon">👤</span><span>${userName}</span>`;

            // Reconfigura o listener para abrir o modalSair (perfil)
            linkSair.onclick = (event) => {
                event.preventDefault();
                if (userNameDisplay) {
                    userNameDisplay.textContent = `Olá, ${userName}!`;
                }
                if (modalSair) {
                    modalSair.style.display = "block";
                }
            };
        } else {
            // Usuário não logado: Altera o link para redirecionar para a página de login
            linkSair.classList.remove('login-info');
            linkSair.innerHTML = `<span class="icon">👤</span>Entrar/Cadastrar`;
            linkSair.href = '../../paginas/login/login.html';
            linkSair.onclick = null;
            linkSair.addEventListener('click', (event) => {
                if (!localStorage.getItem('userId')) {
                    event.preventDefault();
                    window.location.href = '../../paginas/login/login.html';
                }
            });
        }
    } else {
        console.error("Elemento 'linkSair' (com classe .login) não encontrado no HTML.");
    }
}

async function handleAlterarConta() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        exibirMensagem('Carregando seus dados para alteração...', 'info');
        if (modalSair) modalSair.style.display = "none";

        try {
            const cliente = await getClienteById(parseInt(userId));
            if (cliente) {
                if (alterarNomeInput) alterarNomeInput.value = cliente.nome;
                if (alterarTelefoneInput) alterarTelefoneInput.value = cliente.telefone;
                if (modalAlterarDados) modalAlterarDados.style.display = 'block';
            } else {
                exibirMensagem('Não foi possível carregar seus dados.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao carregar dados do cliente:', error);
            exibirMensagem(`Erro ao carregar dados: ${error.message}`, 'erro');
        }

    } else {
        exibirMensagem('Nenhum usuário logado para alterar.', 'erro');
    }
}

async function handleSalvarAlteracoes(e) {
    e.preventDefault();

    const userId = localStorage.getItem('userId');
    if (!userId) {
        exibirMensagem('Sessão expirada. Por favor, faça login novamente.', 'erro');
        return;
    }

    const novoNome = alterarNomeInput ? alterarNomeInput.value.trim() : '';
    const novoTelefone = alterarTelefoneInput ? alterarTelefoneInput.value.trim() : '';

    if (!novoNome || !novoTelefone) {
        exibirMensagem('Nome e telefone são obrigatórios.', 'erro');
        return;
    }

    try {
        exibirMensagem('Salvando suas alterações...', 'info');
        const updatedClient = await updateCliente(parseInt(userId), {
            nome: novoNome,
            telefone: novoTelefone
        });

        if (updatedClient) {
            localStorage.setItem('userName', updatedClient.nome);
            localStorage.setItem('userPhone', updatedClient.telefone);

            exibirMensagem('Dados atualizados com sucesso!', 'sucesso');
            if (modalAlterarDados) modalAlterarDados.style.display = 'none';
            checkLoginStatusAndConfigureLink();
        } else {
            exibirMensagem('Falha ao salvar alterações.', 'erro');
        }
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        exibirMensagem(`Erro ao salvar: ${error.message}`, 'erro');
    }
}

async function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('carrinhoSantosBolos');

    exibirMensagem('Você saiu da sua conta.', 'info');
    if (modalSair) modalSair.style.display = "none";

    checkLoginStatusAndConfigureLink();
}

async function handleDeleteAccount() {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível e apagará todos os seus dados e pedidos!')) {
        const userId = localStorage.getItem('userId');
        if (userId) {
            try {
                exibirMensagem('Excluindo sua conta...', 'info');
                const idToDelete = parseInt(userId);
                if (isNaN(idToDelete)) {
                    throw new Error("ID de usuário inválido para exclusão.");
                }
                await deleteCliente(idToDelete);

                localStorage.removeItem('carrinhoSantosBolos');
                handleLogout();

                exibirMensagem('Sua conta foi excluída com sucesso.', 'sucesso');
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                exibirMensagem(`Erro ao excluir conta: ${error.message}`, 'erro');
            }
        } else {
            exibirMensagem('Nenhum usuário logado para excluir.', 'erro');
        }
    }
    if (modalSair) modalSair.style.display = "none";
}
// --- DOMContentLoaded: Listeners e Inicializações Principais (UNIFICADO) ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicializa a lógica de status de login (Navbar e Modal Sair/Alterar)
    checkLoginStatusAndConfigureLink();

    // 2. Adiciona os Event Listeners para os Modais de Autenticação/Perfil
    if (linkSair) {
        // O checkLoginStatusAndConfigureLink já define o comportamento do clique.
        linkSair.addEventListener("click", function (e) {
            checkLoginStatusAndConfigureLink(e);
        });
    }

    if (fecharModalSair) {
        fecharModalSair.addEventListener("click", function () {
            if (modalSair) modalSair.style.display = "none";
        });
    }

    if (alterarContaButton) {
        alterarContaButton.addEventListener('click', handleAlterarConta);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', handleDeleteAccount);
    }

    if (closeAlterarDadosModalBtn) {
        closeAlterarDadosModalBtn.addEventListener('click', () => {
            if (modalAlterarDados) modalAlterarDados.style.display = 'none';
        });
    }
    if (formAlterarDados) {
        formAlterarDados.addEventListener('submit', handleSalvarAlteracoes);
    }
    // 5. Adiciona listeners para fechar modais ao clicar no X
    // Esta parte agora lida com o "X" de TODOS os modais que tem a classe "close"
    document.querySelectorAll(".modal .close").forEach(closeBtn => {
        closeBtn.addEventListener("click", e => {
            e.preventDefault();
            const modal = closeBtn.closest(".modal");
            if (modal) {
                modal.style.display = "none";
            }
        });
    });

    // 6. Lógica para fechar modais ao clicar fora
    window.onclick = function (event) {
        // Fechar modalSair (perfil)
        if (modalSair && event.target === modalSair) {
            modalSair.style.display = "none";
        }

        // Fechar modalAlterarDados
        if (modalAlterarDados && event.target === modalAlterarDados) {
            modalAlterarDados.style.display = 'none';
        }

        // Fechar outros modais de pedido dinamicamente criados
        // Garante que o clique foi no fundo do modal e que o modal tem a classe 'modal'
        document.querySelectorAll('.modal').forEach(otherModal => {
            // Evita fechar modalSair ou modalAlterarDados que já são tratados acima
            if (event.target === otherModal && otherModal.id !== 'modalSair' && otherModal.id !== 'modalAlterarDados') {
                fecharModal(otherModal.id);
            }
        });
    };
});
window.addEventListener("DOMContentLoaded", () => {
  const avaliacoesContainer = document.querySelector(".avaliaçoes");

  let avaliacoes = JSON.parse(localStorage.getItem("avaliacoes")) || [];

  if (avaliacoes.length > 0) {
   
    const cardsFixos = document.querySelectorAll(".card, .card2");
    cardsFixos.forEach(card => card.remove());

    
    avaliacoes.forEach(avaliacao => {
      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <img src="/src/img/usuario.png" alt="Imagem de Usuário padrão">
        <p id="nome">${avaliacao.nome}</p>
        <p>${avaliacao.data}</p>
        <div class="card-content">
          <p>"${avaliacao.comentario}"</p>
        </div>
      `;

      avaliacoesContainer.appendChild(card);
    });
  }
});
