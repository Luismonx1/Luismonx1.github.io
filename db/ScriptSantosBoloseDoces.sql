-- Tabela Produto (superclasse)
CREATE TABLE Produto (
    id_produto INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT,
    sabor VARCHAR(100),
    quantidade INT,
    valor DECIMAL(10,2)
);

-- Tabela Bolo (subclasse)
CREATE TABLE Bolo (
    id_produto INT PRIMARY KEY,
    tamanho VARCHAR(50),
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);

-- Tabela Doce (subclasse)
CREATE TABLE Doce (
    id_produto INT PRIMARY KEY,
    tipo VARCHAR(50), 
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);
-- Tabela Cliente
CREATE TABLE Cliente (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(200),
    telefone VARCHAR(20),
    email VARCHAR(100)
);
-- Tabela Pedido
CREATE TABLE Pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    descricao TEXT,
    data_pedido DATE,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);
-- Tabela associativa entre Pedido e Produto
CREATE TABLE Pedido_Produto (
    id_pedido INT,
    id_produto INT,
    quantidade INT,
    PRIMARY KEY (id_pedido, id_produto),
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_produto) REFERENCES Produto(id_produto)
);