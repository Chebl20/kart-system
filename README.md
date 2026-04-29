# Apex Kart Management System

Sistema web completo para gerenciamento de corridas de kart com ranking automático baseado no sistema de pontuação da Fórmula 1.

## 🏎️ Características

✅ **Gerenciamento de Pilotos**
- Cadastrar, editar e deletar pilotos
- Histórico de desempenho por piloto

✅ **Gerenciamento de Corridas**
- Criar corridas com data e categoria
- Editar e deletar eventos
- Categorias: KART, ENDURANCE, STREET

✅ **Sistema de Pontuação F1**
- 1º lugar: 25 pontos
- 2º lugar: 18 pontos
- 3º lugar: 15 pontos
- 4º lugar: 12 pontos
- 5º lugar: 10 pontos
- 6º lugar: 8 pontos
- 7º lugar: 6 pontos
- 8º lugar: 4 pontos
- 9º lugar: 2 pontos
- 10º lugar: 1 ponto
- Demais: 0 pontos

✅ **Resultados de Corridas**
- Inserir resultados com validação
- Editar e deletar resultados
- Histórico completo de corridas

✅ **Ranking Automático**
- Classificação geral atualizada em tempo real
- Pódio com destaque visual
- Estatísticas por piloto (vitórias, segundo lugar, etc.)

✅ **Interface Moderna**
- Design dark theme inspirado em F1
- Responsivo (mobile, tablet, desktop)
- UI intuitiva e fácil de usar

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express
- MongoDB
- JWT Authentication
- CORS, Body Parser

**Frontend:**
- React 18
- Vite
- Axios
- Material Design Icons

**Infrastructure:**
- Docker & Docker Compose
- Nginx (reverse proxy)

## 📁 Estrutura do Projeto

```
kart-system/
├── backend/
│   ├── src/
│   │   ├── server.js              # Servidor principal
│   │   ├── database.js            # Configuração do banco
│   │   ├── controllers/
│   │   │   ├── pilotosController.js
│   │   │   ├── corridasController.js
│   │   │   └── resultadosController.js
│   │   ├── routes/
│   │   │   ├── pilotos.js
│   │   │   ├── corridas.js
│   │   │   └── resultados.js
│   │   └── utils/
│   │       └── pontuacao.js       # Cálculo de pontos F1
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── Layout.jsx          # Componentes reutilizáveis
    │   ├── pages/
    │   │   ├── PilotosPage.jsx
    │   │   ├── CorridasPage.jsx
    │   │   ├── ResultadosPage.jsx
    │   │   ├── RankingPage.jsx
    │   │   └── HistoricoPage.jsx
    │   ├── services/
    │   │   └── api.js              # Chamadas HTTP
    │   ├── styles/
    │   │   ├── App.css
    │   │   ├── components.css
    │   │   └── pages.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    │   └── index.html
    ├── package.json
    ├── vite.config.js
    └── .gitignore
```

## 🚀 Como Rodar

### Pré-requisitos
- Node.js (v16+)
- npm ou yarn

### Backend

1. Navegue para a pasta do backend:
```bash
cd kart-system/backend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```
(Para desenvolvimento com reload automático: `npm run dev`)

O backend estará rodando em `http://localhost:5000`

### Frontend

1. Em outra janela/terminal, navegue para a pasta do frontend:
```bash
cd kart-system/frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em `http://localhost:3000`

## � Deploy com Docker (Recomendado para Produção)

### Deploy Local com Docker Compose

1. Certifique-se de ter Docker e Docker Compose instalados

2. Configure as variáveis de ambiente (opcional):
```bash
cp .env.example .env
# Edite .env com suas configurações
```

3. Suba os containers:
```bash
docker-compose up -d
```

4. Acesse a aplicação:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`

5. Para parar os containers:
```bash
docker-compose down
```

### Deploy no Coolify

1. **Configure seu repositório** no Coolify (GitHub, GitLab, etc.)

2. **Crie uma nova aplicação** no Coolify:
   - Tipo: Docker Compose
   - Repositório: Seu repositório do kart-system

3. **Configure as variáveis de ambiente** no Coolify:
   ```
   MONGODB_URI=mongodb://mongodb:27017/kart
   MONGODB_DB=kart
   JWT_SECRET=sua-chave-secreta-producao
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=sua-senha-segura
   PORT=5000
   ```

4. **Deploy automático** - O Coolify irá:
   - Buildar as imagens Docker
   - Iniciar MongoDB
   - Iniciar o Backend
   - Iniciar o Frontend com Nginx
   - Configurar o proxy reverso automaticamente

5. **Acesse sua aplicação** através da URL fornecida pelo Coolify

### Estrutura Docker

O projeto usa 3 containers:
- **mongodb**: Banco de dados MongoDB 7
- **backend**: API Node.js/Express na porta 5000
- **frontend**: React build estático servido por Nginx na porta 80

O Nginx no frontend faz proxy das requisições `/api` para o backend.

## � Funcionalidades por Página

### 1️⃣ Pilotos
- Cadastrar novos pilotos
- Visualizar lista completa
- Ver pontos totais por piloto
- Deletar pilotos

### 2️⃣ Corridas
- Criar novas corridas
- Definir data e categoria
- Editar informações
- Deletar corridas

### 3️⃣ Resultados
- Selecionar corrida
- Adicionar resultado (piloto + posição)
- Validação automática de duplicidade
- Deletar resultados

### 4️⃣ Ranking
- Visualizar classificação geral
- Pódio com top 3 pilotos
- Estatísticas detalhadas
- Ordenação por pontos

### 5️⃣ Histórico
- Listar todas as corridas realizadas
- Visualizar resultados de cada corrida
- Ver detalhes da corrida
- Timeline de eventos

## 🔒 Validações

✅ Não permite nomes de pilotos duplicados
✅ Não permite dois pilotos na mesma posição em uma corrida
✅ Não permite um piloto competir duas vezes na mesma corrida
✅ Calcula pontos automaticamente baseado na posição
✅ Ranking atualiza em tempo real

## 📊 API Endpoints

### Pilotos
- `GET /api/pilotos` - Lista todos
- `GET /api/pilotos/:id` - Detalhes
- `POST /api/pilotos` - Criar
- `DELETE /api/pilotos/:id` - Deletar

### Corridas
- `GET /api/corridas` - Lista todos
- `GET /api/corridas/:id` - Detalhes
- `POST /api/corridas` - Criar
- `PUT /api/corridas/:id` - Editar
- `DELETE /api/corridas/:id` - Deletar

### Resultados
- `GET /api/resultados` - Lista todos
- `POST /api/resultados` - Adicionar
- `PUT /api/resultados/:id` - Editar
- `DELETE /api/resultados/:id` - Deletar
- `GET /api/resultados/ranking/geral` - Ranking
- `GET /api/resultados/historico/corridas` - Histórico

## 🎨 Design

O sistema utiliza um design dark theme inspirado na Formula 1, com:
- Cores principais: Preto (#000000) e Vermelho (#E10600)
- Tipografia: Space Grotesk
- Icons: Material Design Symbols
- Layout responsivo para mobile, tablet e desktop

## 💾 Banco de Dados

O sistema utiliza **MongoDB** com as seguintes coleções:

- **pilotos**: _id, nome, criado_em
- **corridas**: _id, nome, data, categoria, criada_em
- **resultados**: _id, corrida_id, piloto_id, posicao, pontos, criado_em

## 🐛 Troubleshooting

**Erro de CORS?**
- Certifique-se que o backend está rodando em http://localhost:5000

**Banco não está criando?**
- Verifique permissões de arquivo na pasta backend/

**Componentes não carregam?**
- Limpe o cache: `npm install` novamente

## 📝 Exemplo de Uso

1. Acesse http://localhost:3000
2. Vá para "Pilotos" e crie alguns pilotos (ex: Ayrton Senna, Lewis Hamilton)
3. Vá para "Corridas" e crie uma corrida (ex: Monza 2024)
4. Vá para "Resultados" e adicione os resultados
5. Veja o Ranking atualizado automaticamente
6. Consulte o Histórico de corridas

## 📄 Licença

MIT

## 👨‍💻 Autor

Apex Kart Management System - 2024

---

**Desenvolvido com ❤️ para amantes de kart! 🏎️**
