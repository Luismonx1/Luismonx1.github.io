import { deleteCliente, getClienteById, updateCliente } from '../../api.js';

// --- Seleção de Elementos do DOM (Variáveis Globais) ---
const modalSair = document.getElementById("modalSair");
const linkSair = document.querySelector(".login"); // Link "Perfil" na navbar
const fecharModalSair = document.querySelector(".close-sair"); 
const userNameDisplay = document.querySelector('#modalSair .perfil-header h2'); 
const alterarContaButton = document.getElementById('alterarConta');
const logoutButton = document.getElementById('confirmarSair'); 
const deleteAccountButton = document.getElementById('apagarConta'); 

const modalAlterarDados = document.getElementById('modalAlterarDados');
const closeAlterarDadosModalBtn = document.getElementById('closeAlterarDadosModal');
const formAlterarDados = document.getElementById('formAlterarDados');
const alterarNomeInput = document.getElementById('alterarNome');
const alterarTelefoneInput = document.getElementById('alterarTelefone');

// --- Variável do Carrinho ---
let carrinho = [];

// --- Funções Auxiliares (Globais) ---

/**
 * Salva o estado atual do carrinho no localStorage.
 */
function salvarCarrinho() {
    localStorage.setItem('carrinhoSantosBolos', JSON.stringify(carrinho));
}

/**
 * Carrega o carrinho do localStorage ao iniciar a página.
 */
function carregarCarrinho() {
    const carrinhoSalvo = localStorage.getItem('carrinhoSantosBolos');
    if (carrinhoSalvo) {
        carrinho = JSON.parse(carrinhoSalvo);
        atualizarCarrinhoModal(); // Atualiza a exibição do carrinho após carregar
    }
}

/**
 * Abre um modal específico.
 * @param {string} idModal - O ID do modal a ser aberto.
 */
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'block';
    }
}

/**
 * Fecha um modal específico e reseta suas opções.
 * @param {string} idModal - O ID do modal a ser fechado.
 */
function fecharModal(idModal) {
    const modal = document.getElementById(idModal);
    if (modal) {
        modal.style.display = 'none';
        resetarOpcoesModal(idModal);
    }
}

/**
 * Reseta as opções de formulário dentro de um modal (inputs radio, textarea, quantidade).
 * @param {string} idModal - O ID do modal cujas opções serão resetadas.
 */
function resetarOpcoesModal(idModal) {
    const modalContent = document.getElementById(idModal);
    if (modalContent) {
        const radioButtons = modalContent.querySelectorAll('input[type="radio"]');
        radioButtons.forEach(radio => radio.checked = false);

        const textarea = modalContent.querySelector('textarea');
        if (textarea) {
            textarea.value = '';
        }

        const quantidadeInput = modalContent.querySelector('input[type="number"]#quantidade');
        if (quantidadeInput) {
            quantidadeInput.value = quantidadeInput.min || 1;
        }
    }
}

/**
 * Preenche os campos de nome e telefone no modal do carrinho com os dados do cliente logado, se houver.
 */
function preencherDadosClienteNoModal() {
    const nomeInput = document.getElementById('nomeCliente');
    const telefoneInput = document.getElementById('telefoneCliente');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');

    if (nomeInput && telefoneInput) {
        if (userId) {
            if (userName) {
                nomeInput.value = userName;
                nomeInput.readOnly = true;
            }
            if (userPhone) {
                telefoneInput.value = userPhone;
                telefoneInput.readOnly = true;
            }
        } else {
            nomeInput.value = '';
            nomeInput.readOnly = false;
            telefoneInput.value = '';
            telefoneInput.readOnly = false;
        }
    }
}

/**
 * Abre o modal do carrinho, atualiza seus itens e preenche os dados do cliente.
 */
function abrirCarrinho() {
    atualizarCarrinhoModal();
    preencherDadosClienteNoModal();
    abrirModal('modal-carrinho');
}

/**
 * Adiciona um item ao carrinho, salva e atualiza a exibição do carrinho.
 * @param {object} item - O objeto do item a ser adicionado.
 */
function adicionarAoCarrinho(item) {
    carrinho.push(item);
    salvarCarrinho();
    atualizarCarrinhoModal();
    exibirMensagem(`"${item.nome}" adicionado ao carrinho!`, 'sucesso');
}

/**
 * Remove um item do carrinho pelo seu índice, salva e atualiza a exibição.
 * @param {number} index - O índice do item a ser removido no array do carrinho.
 */
function removerItem(index) {
    if (index >= 0 && index < carrinho.length) {
        const itemRemovido = carrinho.splice(index, 1);
        salvarCarrinho();
        atualizarCarrinhoModal();
        exibirMensagem(`"${itemRemovido[0].nome}" removido do carrinho.`, 'info');
    }
}

/**
 * Atualiza a exibição dos itens e do total no modal do carrinho.
 */
function atualizarCarrinhoModal() {
    const itensContainer = document.getElementById('itens-carrinho');
    const totalCarrinhoP = document.getElementById('total-carrinho');
    let total = 0;

    if (!itensContainer || !totalCarrinhoP) {
        console.error("Elementos 'itens-carrinho' ou 'total-carrinho' não encontrados no HTML do modal.");
        return;
    }

    itensContainer.innerHTML = ''; // Limpa o conteúdo atual

    if (carrinho.length === 0) {
        itensContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    } else {
        carrinho.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.classList.add('item-carrinho');

            let itemDescription = `${item.nome}`;
            if (item.massa) itemDescription += `, Massa: ${item.massa}`;
            if (item.recheio) itemDescription += `, Recheio: ${item.recheio}`;
            if (item.cobertura) itemDescription += `, Cobertura: ${item.cobertura}`;
            if (item.tamanho) itemDescription += `, Tamanho: ${item.tamanho}`;
            if (item.decoracao) itemDescription += `, Decoração: "${item.decoracao}"`;
            if (item.saborDocinho) itemDescription += `, Sabor: ${item.saborDocinho}`;
            if (item.quantidadeDocinhos) itemDescription += `, Qtd: ${item.quantidadeDocinhos} und.`;

            const itemSpan = document.createElement('span');
            itemSpan.textContent = `${itemDescription} - R$ ${item.preco.toFixed(2)}`;

            const removerButton = document.createElement('button');
            removerButton.classList.add('btn-remover');
            removerButton.textContent = 'Remover';
            
            removerButton.addEventListener('click', () => removerItem(index));

            itemDiv.appendChild(itemSpan);
            itemDiv.appendChild(removerButton);
            
            itensContainer.appendChild(itemDiv);
            total += item.preco;
        });
    }
    totalCarrinhoP.textContent = `Total: R$ ${total.toFixed(2)}`;
}

/**
 * Exibe uma mensagem flutuante na tela (sucesso, erro, info).
 * @param {string} texto - O texto da mensagem.
 * @param {string} tipo - O tipo da mensagem ('sucesso', 'erro', 'info').
 */
function exibirMensagem(texto, tipo = 'info') {
    const mensagemDiv = document.getElementById('mensagem');
    if (!mensagemDiv) {
        console.error('Elemento #mensagem não encontrado no HTML.');
        return;
    }
    mensagemDiv.textContent = texto;
    mensagemDiv.className = `mensagem ${tipo}`;
    mensagemDiv.classList.remove('mensagem-esconder');

    setTimeout(() => {
        mensagemDiv.classList.add('mensagem-esconder');
    }, 3000);
}

/**
 * Finaliza o pedido, enviando os dados para a API e limpando o carrinho.
 */
async function finalizarpedido() {
    if (carrinho.length === 0) {
        exibirMensagem('Seu carrinho está vazio. Adicione itens antes de finalizar a compra.', 'erro');
        return;
    }

    const total = parseFloat(document.getElementById('total-carrinho').textContent.replace('Total: R$ ', '').replace(',', '.'));

    const formaPagamentoSelect = document.getElementById('pagamento');
    const formaPagamento = formaPagamentoSelect ? formaPagamentoSelect.value : null;

    if (!formaPagamento) {
        exibirMensagem('Por favor, selecione uma forma de pagamento.', 'erro');
        return;
    }

    let nomeCliente;
    let telefoneCliente;
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userPhone = localStorage.getItem('userPhone');

    let idClienteParaBackend = null;

    if (userId) {
        const parsedUserId = parseInt(userId);
        if (!isNaN(parsedUserId)) {
            idClienteParaBackend = parsedUserId;
            nomeCliente = userName;
            telefoneCliente = userPhone;
        } else {
            console.warn("userId do localStorage não é um número válido. Prosseguindo como não logado.");
        }
    }

    if (idClienteParaBackend === null) {
        const nomeInput = document.getElementById('nomeCliente');
        const telefoneInput = document.getElementById('telefoneCliente');

        if (!nomeInput || !telefoneInput) {
            exibirMensagem('Erro: Campos de nome/telefone não encontrados no modal. Verifique o HTML.', 'erro');
            return;
        }

        nomeCliente = nomeInput.value.trim();
        telefoneCliente = telefoneInput.value.trim();

        if (!nomeCliente || !telefoneCliente) {
            exibirMensagem('Por favor, preencha seu nome e telefone para finalizar o pedido.', 'erro');
            return;
        }
    }

    const dadosPedido = {
        id_cliente: idClienteParaBackend,
        total: total,
        forma_pagamento: formaPagamento,
        nome_cliente: nomeCliente,
        telefone_cliente: telefoneCliente,
        itens_pedido: carrinho,
        descricao: 'Pedido online',
    };

    try {
        exibirMensagem('Processando seu pedido...', 'info');

        const response = await fetch('http://localhost:3000/api/pedidos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dadosPedido),
        });

        if (!response.ok) {
            const errorData = await response.json();
            let errorMessage = errorData.error || `Erro desconhecido ao finalizar pedido: ${response.statusText}`;
            if (errorData.details && Array.isArray(errorData.details)) {
                errorMessage += "\nDetalhes: " + errorData.details.join(", ");
            }
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('Pedido finalizado com sucesso!', data);

        const pedidosJson = localStorage.getItem('pedidosFinalizados');
        let pedidos = pedidosJson ? JSON.parse(pedidosJson) : [];

        const pedidoLocal = {
            id: data.id_pedido,
            data: new Date().toISOString(),
            itens_pedido: [...carrinho],
            total: total,
            forma_pagamento: formaPagamento,
            status: 'andamento',
            avaliacao: null,
            nome_cliente: nomeCliente,
            telefone_cliente: telefoneCliente,
        };
        pedidos.push(pedidoLocal);
        localStorage.setItem('pedidosFinalizados', JSON.stringify(pedidos));

        // ✅ Enviar o pedido via WhatsApp
        const numeroLoja = ''; 
        const itensFormatados = carrinho.map(item => {
            let descricao = `• ${item.nome}`;
            if (item.massa) descricao += ` | Massa: ${item.massa}`;
            if (item.recheio) descricao += ` | Recheio: ${item.recheio}`;
            if (item.cobertura) descricao += ` | Cobertura: ${item.cobertura}`;
            if (item.tamanho) descricao += ` | Tamanho: ${item.tamanho}`;
            if (item.decoracao) descricao += ` | Decoração: ${item.decoracao}`;
            if (item.saborDocinho) descricao += ` | Sabor: ${item.saborDocinho}`;
            if (item.quantidadeDocinhos) descricao += ` | Qtd: ${item.quantidadeDocinhos}`;
            descricao += ` | R$ ${item.preco.toFixed(2)}`;
            return descricao;
        }).join('\n');

        const dataPedido = new Date().toLocaleDateString();
        const horaPedido = new Date().toLocaleTimeString();

        const mensagem = `
          🎉 *Novo Pedido Recebido na Santos Bolos e Doces!* 🎉

           👤 *Cliente:* ${nomeCliente}
           📞 *Telefone:* ${telefoneCliente}
           💳 *Pagamento:* ${formaPagamento}
           🗓️ *Data:* ${dataPedido} às ${horaPedido}

           🍰 *Itens do Pedido:*
            ${itensFormatados}

           💰 *Valor Total:* R$ ${total.toFixed(2)}

           Agradecemos pela preferência! Em breve entraremos em contato para confirmar os detalhes do seu pedido. 🧁✨
`.trim();

        const linkWhatsapp = `https://wa.me/${numeroLoja}?text=${encodeURIComponent(mensagem)}`;
        window.open(linkWhatsapp, '_blank');

        // Limpa o carrinho e atualiza a UI após sucesso
        carrinho = [];
        salvarCarrinho();
        atualizarCarrinhoModal();
        fecharModal('modal-carrinho');

        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) {
            const nomeInput = document.getElementById('nomeCliente');
            const telefoneInput = document.getElementById('telefoneCliente');
            if (nomeInput) nomeInput.value = '';
            if (telefoneInput) telefoneInput.value = '';
        }

        exibirMensagem('Pedido finalizado com sucesso! Em breve entraremos em contato.', 'sucesso');
        window.location.href = '../pedidos/pedidos.html';
    } catch (error) {
        console.error('Erro ao finalizar pedido (frontend catch):', error);
        exibirMensagem(`Erro ao finalizar pedido: ${error.message}`, 'erro');
    }
}

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
                modalSair.style.display = "block";
            };
        } else {
            // Usuário não logado: Altera o link para redirecionar para a página de login
            linkSair.classList.remove('login-info');
            linkSair.innerHTML = `<span class="icon">👤</span>Entrar/Cadastrar`;
            linkSair.href = '../../paginas/login/login.html';
            linkSair.onclick = null; // Remove qualquer onclick anterior para evitar conflito
            linkSair.addEventListener('click', (event) => {
                // Verifica novamente, caso o estado mude
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

/**
 * Lida com a abertura do modal de alteração de dados do cliente.
 */
async function handleAlterarConta() {
    const userId = localStorage.getItem('userId');
    if (userId) {
        exibirMensagem('Carregando seus dados para alteração...', 'info');
        modalSair.style.display = "none"; // Fecha o modalSair (modal de perfil)
        
        try {
            const cliente = await getClienteById(parseInt(userId)); 
            if (cliente) {
                alterarNomeInput.value = cliente.nome;
                alterarTelefoneInput.value = cliente.telefone;
                modalAlterarDados.style.display = 'block';
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

/**
 * Lida com o salvamento das alterações nos dados do cliente.
 * @param {Event} e - O evento de submit do formulário.
 */
async function handleSalvarAlteracoes(e) {
    e.preventDefault(); 
    
    const userId = localStorage.getItem('userId');
    if (!userId) {
        exibirMensagem('Sessão expirada. Por favor, faça login novamente.', 'erro');
        return;
    }

    const novoNome = alterarNomeInput.value.trim();
    const novoTelefone = alterarTelefoneInput.value.trim();

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
            // Atualiza o localStorage com os novos dados
            localStorage.setItem('userName', updatedClient.nome);
            localStorage.setItem('userPhone', updatedClient.telefone);
            
            exibirMensagem('Dados atualizados com sucesso!', 'sucesso');
            modalAlterarDados.style.display = 'none'; 
            checkLoginStatusAndConfigureLink(); // Atualiza o nome exibido na navbar
        } else {
            exibirMensagem('Falha ao salvar alterações.', 'erro');
        }
    } catch (error) {
        console.error('Erro ao salvar alterações:', error);
        exibirMensagem(`Erro ao salvar: ${error.message}`, 'erro');
    }
}

/**
 * Lida com o logout do usuário. Limpa os dados de login e o carrinho do localStorage.
 * Atualiza a UI para o estado de "não logado".
 */
async function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone'); 
    localStorage.removeItem('carrinhoSantosBolos'); // Limpa o carrinho ao deslogar

    exibirMensagem('Você saiu da sua conta.', 'info');
    modalSair.style.display = "none";
    
    checkLoginStatusAndConfigureLink(); // Atualiza a UI para o estado de "não logado"
}

/**
 * Lida com a exclusão da conta do usuário. Pede confirmação, chama a API de exclusão,
 * e limpa todos os dados de login e carrinho do localStorage.
 */
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
                
                localStorage.removeItem('carrinhoSantosBolos'); // Limpa o carrinho antes de fazer logout
                handleLogout(); // Limpa os dados de login e atualiza a UI
                
                exibirMensagem('Sua conta foi excluída com sucesso.', 'sucesso');
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                exibirMensagem(`Erro ao excluir conta: ${error.message}`, 'erro');
            }
        } else {
            exibirMensagem('Nenhum usuário logado para excluir.', 'erro');
        }
    }
    modalSair.style.display = "none"; 
}


// --- DOMContentLoaded: Garante que o DOM esteja completamente carregado antes de manipular elementos ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Perfil/Login ---
    checkLoginStatusAndConfigureLink(); // Verifica o status do login ao carregar a página

    // Event listeners para o modal de perfil (modalSair)
    linkSair.addEventListener("click", function (e) {
        e.preventDefault(); 
        checkLoginStatusAndConfigureLink(e);
    });
    fecharModalSair.addEventListener("click", function () {
        modalSair.style.display = "none";
    });

    // Event listeners para os botões dentro do modal de perfil
    if (alterarContaButton) {
        alterarContaButton.addEventListener('click', handleAlterarConta);
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
    if (deleteAccountButton) {
        deleteAccountButton.addEventListener('click', handleDeleteAccount);
    }

    // Event listeners para o modal de Alterar Dados
    if (closeAlterarDadosModalBtn) {
        closeAlterarDadosModalBtn.addEventListener('click', () => {
            modalAlterarDados.style.display = 'none';
        });
    }
    if (formAlterarDados) {
        formAlterarDados.addEventListener('submit', handleSalvarAlteracoes);
    }
    // --- Fim da Lógica de Perfil/Login ---

    // --- Lógica do Carrinho e Modais de Produto ---
    carregarCarrinho(); // Carrega o carrinho do localStorage ao iniciar

    // Event listener para o BOTÃO PRINCIPAL DO CARRINHO (na navbar/cabeçalho)
    const carrinhoBotaoPrincipal = document.getElementById('carrinho-botao-principal');
    if (carrinhoBotaoPrincipal) {
        carrinhoBotaoPrincipal.addEventListener('click', (event) => {
            event.preventDefault(); 
            abrirCarrinho(); 
        });
    } else {
        console.error("Elemento 'carrinho-botao-principal' não encontrado. Verifique o HTML.");
    }
    
    // Event listener para o botão 'Finalizar Pedido' dentro do modal do carrinho
    const finalizarPedidoBtn = document.getElementById('finalizar-pedido-btn'); 
    if (finalizarPedidoBtn) {
        finalizarPedidoBtn.addEventListener('click', finalizarpedido);
    } else {
        console.warn("Elemento 'finalizar-pedido-btn' (Finalizar Pedido) dentro de '#modal-carrinho' não encontrado. Verifique o HTML do modal do carrinho.");
    }

    // Event listeners para os botões "Adicionar" nos cards de produtos (bolos/doces)
    const addButtons = document.querySelectorAll('.card .add');
    addButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const modalId = button.getAttribute('href').substring(1); 
            abrirModal(modalId);
        });
    });

    // Event listeners para os botões "Fechar" (close) dentro de todos os modais de produtos
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modalId = e.target.closest('.modal').id; 
            fecharModal(modalId);
        });
    });

    // Event listeners para os botões "Adicionar ao Carrinho" dentro dos modais de PRODUTO
    // Bolo Sem Decoração
    const btnBolo1 = document.querySelector('#modal-bolo1 .btn');
    if (btnBolo1) {
        btnBolo1.addEventListener('click', function (e) {
            e.preventDefault();
            const massaEl = document.querySelector('input[name="massa-sem"]:checked');
            const coberturaEl = document.querySelector('input[name="cobertura-sem"]:checked');
            const tamanhoEl = document.querySelector('input[name="tamanho-sem"]:checked');
            if (!massaEl || !coberturaEl || !tamanhoEl) {
                exibirMensagem('Por favor, selecione todas as opções para o bolo sem decoração.', 'erro');
                return;
            }
            const massa = massaEl.nextElementSibling.textContent.trim();
            const cobertura = coberturaEl.nextElementSibling.textContent.trim();
            const tamanhoTexto = tamanhoEl.parentElement.textContent.trim();
            const tamanho = tamanhoTexto.split(' - ')[0].trim();
            const precoMatch = tamanhoTexto.match(/R\$ ([\d.,]+)/);
            const preco = precoMatch ? parseFloat(precoMatch[1].replace(',', '.')) : 0;
            adicionarAoCarrinho({
                id_produto: 1, 
                nome: 'Bolo Sem Decoração',
                massa: massa,
                cobertura: cobertura,
                tamanho: tamanho,
                preco: preco,
                tipo: 'Bolo'
            });
            fecharModal('modal-bolo1');
        });
    } else {
        console.warn("Botão 'Adicionar ao Carrinho' do #modal-bolo1 não encontrado.");
    }

    // Bolo Com Decoração
    const btnBolo2 = document.querySelector('#modal-bolo2 .btn');
    if (btnBolo2) {
        btnBolo2.addEventListener('click', function (e) {
            e.preventDefault();
            const massaEl = document.querySelector('input[name="massa-com"]:checked');
            const recheioEl = document.querySelector('input[name="recheio-com"]:checked');
            const tamanhoEl = document.querySelector('input[name="tamanho-com"]:checked');
            const decoracao = document.querySelector('#modal-bolo2 textarea').value.trim();
            if (!massaEl || !recheioEl || !tamanhoEl || !decoracao) {
                exibirMensagem('Por favor, selecione todas as opções e descreva a decoração para o bolo com decoração.', 'erro');
                return;
            }
            const massa = massaEl.nextElementSibling.textContent.trim();
            const recheio = recheioEl.nextElementSibling.textContent.trim();
            const tamanhoTexto = tamanhoEl.parentElement.textContent.trim();
            const tamanho = tamanhoTexto.split(' - ')[0].trim();
            const precoMatch = tamanhoTexto.match(/R\$ ([\d.,]+)/);
            const preco = precoMatch ? parseFloat(precoMatch[1].replace(',', '.')) : 0;
            adicionarAoCarrinho({
                id_produto: 2, 
                nome: 'Bolo Com Decoração',
                massa: massa,
                recheio: recheio,
                tamanho: tamanho,
                decoracao: decoracao,
                preco: preco,
                tipo: 'Bolo Personalizado'
            });
            fecharModal('modal-bolo2');
        });
    } else {
        console.warn("Botão 'Adicionar ao Carrinho' do #modal-bolo2 não encontrado.");
    }

    // Docinhos
    const btnDocinhos = document.querySelector('#modal-docinhos .btn');
    if (btnDocinhos) {
        btnDocinhos.addEventListener('click', function (e) {
            e.preventDefault();
            const saborEl = document.querySelector('#modal-docinhos input[type="radio"]:checked');
            const quantidadeInput = document.getElementById('quantidade');
            const quantidade = parseInt(quantidadeInput.value);
            if (!saborEl) {
                exibirMensagem('Por favor, selecione um sabor para os docinhos.', 'erro');
                return;
            }
            if (isNaN(quantidade) || quantidade < 25) {
                exibirMensagem('A quantidade mínima para docinhos é 25 unidades.', 'erro');
                return;
            }
            const precoUnitario = 1.50; 
            const precoTotal = precoUnitario * quantidade;
            const saborDocinho = saborEl.parentElement.textContent.trim();
            adicionarAoCarrinho({
                id_produto: 3, 
                nome: 'Docinhos',
                saborDocinho: saborDocinho,
                quantidadeDocinhos: quantidade,
                preco: precoTotal,
                tipo: 'Docinho'
            });
            fecharModal('modal-docinhos');
        });
    } else {
        console.warn("Botão 'Adicionar ao Carrinho' do #modal-docinhos não encontrado.");
    }
    // --- Fim da Lógica do Carrinho e Modais de Produto ---

    // --- Lógica de Fechamento de Modais Clicando Fora ---
    window.onclick = function (event) {
        // Modais de Perfil/Login específicos
        if (modalSair && event.target === modalSair) {
            modalSair.style.display = "none";
        }
        if (modalAlterarDados && event.target === modalAlterarDados) {
            modalAlterarDados.style.display = 'none';
        }
        
        document.querySelectorAll('.modal').forEach(otherModal => {
            if (event.target === otherModal && otherModal.id !== 'modalSair' && otherModal.id !== 'modalAlterarDados') {
                fecharModal(otherModal.id);
            }
        });
    };
});