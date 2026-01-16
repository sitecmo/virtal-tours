# CMO Virtual Tours

Servidor Node.js para gerenciar tours virtuais com mapeamento automático.

## 🚀 Funcionalidades

- **Mapeamento Automático**: Ao iniciar, o servidor mapeia todas as pastas e subpastas do `src/` automaticamente
- **Verificação de Integridade**: Compara o mapeamento atual com o arquivo `tours-data.js`
- **Atualização Automática**: Se detectar diferenças, reconstrói o objeto `toursData` automaticamente
- **Servidor Web**: Serve todos os arquivos estáticos para acesso aos tours

## 📦 Instalação

```bash
npm install
```

## 🎮 Comandos Disponíveis

### Iniciar o servidor

```bash
npm start
```

O servidor inicia na porta **3030** e faz o mapeamento automático ao iniciar.

### Modo desenvolvimento (com auto-reload)

```bash
npm run dev
```


### Mapear tours manualmente

```bash
npm run map
```

Executa o mapeamento e gera os arquivos `tours-data.js` e `tours-map.json`.

## 🌐 Endpoints da API

### `GET /api/status`

Retorna informações sobre os tours mapeados:

```json
{
  "success": true,
  "totalProjects": 16,
  "totalTours": 84,
  "projects": ["Alameda Leste", "Alto Areiao", ...]
}
```

### `GET /api/remap`

Força um novo mapeamento dos tours:

```json
{
  "success": true,
  "updated": true,
  "message": "Tours remapeados com sucesso!"
}
```

## 📂 Estrutura de Arquivos

```
virtual-tours/
├── src/                    # Pasta com todos os projetos
│   ├── alameda-leste/
│   ├── alto-areiao/
│   └── ...
├── server.js               # Servidor principal
├── map-tours.js           # Script de mapeamento manual
├── unzip-script.js        # Script para descompactar ZIPs
├── tours-data.js          # Objeto com todos os tours (gerado)
├── tours-map.json         # JSON com todos os tours (gerado)
└── index.html             # Página principal
```

## 🔄 Funcionamento

1. **Ao iniciar o servidor**:

   - Mapeia todas as pastas em `src/`
   - Para cada pasta de projeto, busca subpastas com `index.html`
   - Compara com o `tours-data.js` existente
   - Se houver diferenças, atualiza automaticamente

2. **A cada requisição em `/api/remap`**:

   - Força um novo mapeamento
   - Atualiza os arquivos se necessário

3. **O `index.html`**:
   - Carrega o `tours-data.js`
   - Gera dinamicamente as listas de tours
   - Mantém o formato de exibição organizado

## 🎯 Acesso

Após iniciar o servidor:

- **Página principal**: http://localhost:3030/index.html
- **Status**: http://localhost:3030/api/status
- **Forçar remapeamento**: http://localhost:3030/api/remap

## 📝 Logs

O servidor exibe logs informativos:

- ✅ Sucesso
- ⚠️ Avisos
- ❌ Erros
- 🔍 Mapeamento em andamento
- 📊 Estatísticas
