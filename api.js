const API_BASE_URL = 'http://localhost:3000/api';

export async function createCliente(clienteData) {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(clienteData),
    });

    if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.error || `Erro HTTP! Status: ${response.status}`);
    }

    return response.json();
}

export async function loginCliente(email, senha) {
    const response = await fetch(`${API_BASE_URL}/clientes/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
    });
    if (!response.ok) {
        let errorDetails = {};
        try {
            errorDetails = await response.json();
        } catch (e) {
            const text = await response.text();
            throw new Error(`Erro HTTP! Status: ${response.status}. Resposta do servidor: ${text.substring(0, 100)}...`);
        }
        throw new Error(errorDetails.error || `Erro HTTP! Status: ${response.status}`);
    }

    return response.json();
}

export async function getClienteById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`); 
        if (!response.ok) {
            throw new Error(`Erro ao buscar cliente: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na API getClienteById:', error);
        throw error;
    }
}

export async function updateCliente(id, dados) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dados),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ao atualizar cliente: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erro na API updateCliente:', error);
        throw error;
    }
}

export async function deleteCliente(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ao deletar cliente: ${response.statusText}`);
        }
        return true;
    } catch (error) {
        console.error('Erro na API deleteCliente:', error);
        throw error;
    }
}
export async function criarAvaliacao(dadosAvaliacao) {
  try {
    const response = await fetch(`${API_BASE_URL}/avaliacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dadosAvaliacao),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Erro HTTP! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro na API criarAvaliacao:', error);
    throw error;
  }
}
export async function getPedidosPorCliente(idCliente) {
  const response = await fetch(`${API_BASE_URL}/pedidos?clienteId=${idCliente}`); 
  if (!response.ok) throw new Error('Falha ao buscar pedidos');
  return await response.json();
}