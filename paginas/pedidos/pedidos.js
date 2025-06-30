import { deleteCliente, getClienteById, updateCliente } from '../../api.js';
import { criarAvaliacao } from '../../api.js';
import { getPedidosPorCliente } from '../../api.js';

// --- LOGIN, LOGOUT, MODAIS DE PERFIL E ALTERAÇÃO DE DADOS ---

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

// --- PEDIDOS (Listagem e Avaliação) ---

document.addEventListener('DOMContentLoaded', () => {
    carregarPedidos();

    // Configura eventos de login/perfil no carregamento
    checkLoginStatusAndConfigureLink();

    if (linkSair) {
      linkSair.addEventListener("click", function (e) {
        e.preventDefault();
        checkLoginStatusAndConfigureLink(e);
      });
    }
    if (fecharModalSair) {
      fecharModalSair.addEventListener("click", () => { modalSair.style.display = "none"; });
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
      closeAlterarDadosModalBtn.addEventListener('click', () => { modalAlterarDados.style.display = 'none'; });
    }
    if (formAlterarDados) {
      formAlterarDados.addEventListener('submit', handleSalvarAlteracoes);
    }
});

async function carregarPedidos() {
    const container = document.querySelector('.pedido-container');
    if (!container) {
      console.error('Elemento .pedido-container não encontrado.');
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      container.innerHTML = '<p>Faça login para ver seus pedidos.</p>';
      return;
    }

    let pedidos = [];
    try {
      pedidos = await getPedidosPorCliente(userId);
    } catch (error) {
      console.error('Erro ao buscar pedidos do servidor:', error);
      container.innerHTML = '<p>Erro ao carregar pedidos. Tente novamente mais tarde.</p>';
      return;
    }

    if (pedidos.length === 0) {
      container.innerHTML = '<p>Você ainda não fez nenhum pedido.</p>';
      return;
    }

    container.innerHTML = ''; // limpa a lista
    pedidos.forEach(pedido => {
      const card = criarCardPedido(pedido);
      container.appendChild(card);
    });
}

function criarCardPedido(pedido) {
    const card = document.createElement('div');
    card.classList.add('pedido-card');

    const dataPedido = new Date(pedido.data_pedido || pedido.data || Date.now());
    const dataFormatada = dataPedido.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const horaFormatada = dataPedido.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const itensPedidoArray = Array.isArray(pedido.itens_pedido) ? pedido.itens_pedido : [];

    const itensTexto = itensPedidoArray.map(item => {
        let desc = item.nome || 'Item';
        if (item.massa) desc += `, Massa: ${item.massa}`;
        if (item.recheio) desc += `, Recheio: ${item.recheio}`;
        if (item.cobertura) desc += `, Cobertura: ${item.cobertura}`;
        if (item.decoracao) desc += `, Decoração: ${item.decoracao}`;
        if (item.saborDocinho) desc += `, Sabor: ${item.saborDocinho}`;
        if (item.quantidadeDocinhos) desc += `, Quantidade: ${item.quantidadeDocinhos}`;
        return desc;
    }).join('; ');

    const statusClass = pedido.status === 'concluido' ? 'concluido-bg' : 'andamento-bg';
    const statusTexto = pedido.status === 'concluido' ? 'Pedido concluído' : 'Pedido em andamento';
    const iconeSrc = pedido.status === 'concluido' ? '../../img/check.png' : '../../img/relogio.png';
    const statusSpanClass = pedido.status === 'concluido' ? 'concluido' : 'andamento';

    card.innerHTML = `
        <div class="icon ${statusClass}">
            <img src="${iconeSrc}" alt="Ícone de Pedido">
        </div>
        <div class="pedido-info">
            <h2>Pedido Nº ${pedido.id_pedido || pedido.id}</h2>
            <p>Feito em ${dataFormatada}</p>
            <p>Tipo: ${pedido.tipo || 'Entrega'}</p>
            <p>Total: R$ ${(Number(pedido.total) || 0).toFixed(2)}</p>
            <div class="status">
                <span class="${statusSpanClass}">${statusTexto}</span>
                <span>${horaFormatada}</span>
            </div>
            <button class="btn-mais" type="button">+ Mais</button>
        </div>
    `;

    // Criar modal
    const modal = document.createElement('div');
    modal.classList.add('modal-avaliacao');

    modal.innerHTML = `
        <div class="modal-conteudo">
            <button class="btn-fechar">&times;</button>
            <h3>Detalhes do Pedido Nº ${pedido.id_pedido || pedido.id}</h3>
            <p><strong>Itens:</strong> ${itensTexto}</p>
            <p><strong>Tipo:</strong> ${pedido.tipo || 'Entrega'}</p>
            <p><strong>Total:</strong> R$ ${(Number(pedido.total) || 0).toFixed(2)}</p>
            <hr>
            <h3>Avalie seu pedido</h3>
            <form class="avaliacao-form" action="#" method="POST">
                <div class="star-rating">
                    ${[5, 4, 3, 2, 1].map(i => `
                        <input type="radio" id="star${pedido.id_pedido}-${i}" name="rating-${pedido.id_pedido}" value="${i}" ${pedido.avaliacao === i ? 'checked' : ''} />
                        <label for="star${pedido.id_pedido}-${i}" title="${i} estrela(s)">&#9733;</label>
                    `).join('')}
                </div>
                <br><br>
                <label for="comentario-${pedido.id_pedido}">Comentário</label>
                <textarea id="comentario-${pedido.id_pedido}" class="input-comentario" placeholder="Deixe seu comentário aqui..." rows="4">${pedido.comentario || ''}</textarea>
                <label for="nome-${pedido.id_pedido}">Seu nome</label>
                <input type="text" id="nome-${pedido.id_pedido}" class="input-nome" placeholder="Seu nome" value="${pedido.nome_cliente || pedido.nomeCliente || ''}" />
                <button type="submit" class="btn-enviar">Enviar Avaliação</button>
            </form>
        </div>
    `;

    // Append do modal ao body (fora do card)
    document.body.appendChild(modal);

    // Abertura do modal
    card.querySelector('.btn-mais').addEventListener('click', () => {
        document.querySelectorAll('.modal-avaliacao.ativo').forEach(m => m.classList.remove('ativo'));
        modal.classList.add('ativo');
    });

    // Fechar modal (ícone X)
    modal.querySelector('.btn-fechar').addEventListener('click', () => {
        modal.classList.remove('ativo');
    });

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('ativo');
        }
    });

    // Envio do formulário de avaliação
    const form = modal.querySelector('.avaliacao-form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        const formData = new FormData(form);
        const nota = parseInt(formData.get(`rating-${pedido.id_pedido}`));
        const comentario = form.querySelector(`#comentario-${pedido.id_pedido}`).value.trim();
        const nome = form.querySelector(`#nome-${pedido.id_pedido}`).value.trim();

        if (!nota || nota < 1 || nota > 5) {
            exibirMensagem('Por favor, selecione uma avaliação válida.', 'erro');
            return;
        }
        if (!nome) {
            exibirMensagem('Por favor, informe seu nome para a avaliação.', 'erro');
            return;
        }

        salvarAvaliacao(pedido.id_pedido, nota, comentario, nome);
        modal.classList.remove('ativo');
    });

    return card;
}


async function salvarAvaliacao(pedidoId, nota, comentario, nomeCliente) {
    const id_cliente = parseInt(localStorage.getItem('userId')) || null;

    if (!id_cliente) {
        exibirMensagem('Você precisa estar logado para enviar uma avaliação.', 'erro');
        return;
    }

    try {
        await criarAvaliacao({
            id_pedido: pedidoId,
            id_cliente,
            nota,
            comentario,
        });

        exibirMensagem('Avaliação enviada com sucesso! Obrigado pelo feedback.', 'sucesso');
        carregarPedidos();

    } catch (error) {
        console.error('Erro ao enviar avaliação:', error);
        exibirMensagem('Erro ao enviar avaliação: ' + error.message, 'erro');
    }
}