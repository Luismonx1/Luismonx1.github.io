const app = require('./src/app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor Node.js (MySQL) para Santos Bolos e Doces rodando na porta ${PORT}`);
  console.log(`Acesse a API de clientes em: http://localhost:${PORT}/api/clientes`);
});