# Manual de Instação do izing.io localhost no windows

### Observação:
Site baixar docker para windows
https://docs.docker.com/desktop/install/windows-install/

Site baixar Node 18 para windows
https://nodejs.org/en/download

Link para baixar codigo izing
https://github.com/ldurans/izing.open.io/archive/refs/heads/master.zip

Link baixar Google Chrome:
https://www.google.com/intl/pt-BR/chrome/

Nesse exemplo estaremos colocando izing na pasta c:\izing
Instale programas, Docker, Node20 e google chrome
Descompactar conteudo do arquivo do codigo izing deixando dentro da pasta c:\izing
================================================

1. Abra o "Node.js command prompt"

2. Acessar pasta backend

```bash
cd c:\izing\backend
```

3. Instalando as dependências

```bash
npm install --force
```

4. renomear arquivo .env.example para .env na pasta c:\izing\backend e preencher conforme conteudo abaixo

```bash
#NODE_ENV=prod

# ambiente
NODE_ENV=dev

# URL do backend para construção dos hooks
BACKEND_URL=http://localhost:3000

# URL do front para liberação do cors
FRONTEND_URL=http://localhost:4444

# Porta utilizada para proxy com o serviço do backend
PROXY_PORT=3100

# Porta que o serviço do backend deverá ouvir
PORT=3000


# conexão com o banco de dados
DB_DIALECT=postgres
DB_TIMEZONE=-03:00
DB_PORT=5432
POSTGRES_HOST=localhost
POSTGRES_USER=izing
POSTGRES_PASSWORD=123@mudar
POSTGRES_DB=postgres


# Chaves para criptografia do token jwt
JWT_SECRET=DPHmNRZWZ4isLF9vXkMv1QabvpcA80Rc
JWT_REFRESH_SECRET=EMPehEbrAdi7s8fGSeYzqGQbV5wrjH4i

# Dados de conexão com o REDIS
IO_REDIS_SERVER=localhost
IO_REDIS_PORT='6379'
IO_REDIS_DB_SESSION='2'
IO_REDIS_PASSWORD=123@mudar

CHROME_BIN=c:\Program Files\Google\Chrome\Application\chrome.exe
#CHROME_BIN=/usr/bin/google-chrome-stable
#CHROME_BIN=null

# tempo para randomização da mensagem de horário de funcionamento
MIN_SLEEP_BUSINESS_HOURS=10000
MAX_SLEEP_BUSINESS_HOURS=20000

# tempo para randomização das mensagens do bot
MIN_SLEEP_AUTO_REPLY=4000
MAX_SLEEP_AUTO_REPLY=6000

# tempo para randomização das mensagens gerais
MIN_SLEEP_INTERVAL=2000
MAX_SLEEP_INTERVAL=5000


# dados do RabbitMQ / Para não utilizar, basta comentar a var AMQP_URL
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=123@mudar
AMQP_URL='amqp://admin:123@mudar@localhost:5672?connection_attempts=5&retry_delay=5'

# api oficial (integração em desenvolvimento)
API_URL_360=https://waba-sandbox.360dialog.io

# usado para mosrar opções não disponíveis normalmente.
ADMIN_DOMAIN=izing.io

# Dados para utilização do canal do facebook
VUE_FACEBOOK_APP_ID=3237415623048660
FACEBOOK_APP_SECRET_KEY=3266214132b8c98ac59f3e957a5efeaaa13500
```

5. Buildando o backend

```bash
npm run build
```

6. Acessar pasta frontend

```bash
cd c:\izing\frontend
```

7. renomear arquivo .env.example para .env na pasta c:\izing\frontend e preencher conforme conteudo abaixo

```bash
VUE_URL_API='http://localhost:3000'
VUE_FACEBOOK_APP_ID='23156312477653241'
```

8. Instalando as dependências

```bash
npm install --force
```

9. Instalando Quasar

```bash
npm i @quasar/cli
```

10. Mudar configuracao SSL para compilar

```bash
set NODE_OPTIONS=--openssl-legacy-provider
```

11. Buildando o frontend

```bash
npx quasar build -P -m pwa
```

12. Instalando o PM2

```bash
npm install -g pm2
```

13. criar arquivo server.js na pasta c:\izing\frontend com conteudo

```bash
// simple express server to run frontend production build;
const express = require('express')
const path = require('path')
const app = express()
app.use(express.static(path.join(__dirname, 'dist/pwa')))
app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'dist/pwa', 'index.html'))
})
app.listen(4444)
```


14. Iniciando o frontend com PM2

```bash
pm2 start server.js --name izing-frontend
```

15. Instalar POSTGRESQL no Docker

```bash
docker run --name postgresql -e POSTGRES_USER=izing -e POSTGRES_PASSWORD=123@mudar -e TZ="America/Sao_Paulo" -p 5432:5432 --restart=always -v /data:/var/lib/postgresql/data -d postgres```

16. Instalar Redis no Docker

```bash
docker run --name redis-izing -e TZ="America/Sao_Paulo" -p 6379:6379 --restart=always -d redis:latest redis-server --appendonly yes --requirepass "123@mudar"
```

17. Instalar rabbit no Docker

```bash
docker run -d --name rabbitmq -p 5672:5672 -p 15672:15672 --restart=always --hostname rabbitmq -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=123@mudar -v /data:/var/lib/rabbitmq rabbitmq:3-management-alpine
```

18. Criando as tabelas no BD

```bash
npx sequelize db:migrate
```

19. Inserindo dados em algumas tabelas do BD

```bash
npx sequelize db:seed:all
```

20. Iniciando o backend com PM2

```bash
pm2 start dist/server.js --name izing-backend
```

21. Salvando os serviços iniciados pelo PM2

```bash
pm2 save
```

Pronto sistema instalado so acessar frontend

Acessar pela url:

http://localhost:4444/

Usuário padrão para acesso

Usuário

admin@izing.io  

Senha:

123456


Iniciar depois reniciar computador:

Abra o Docker Desktop espera carregar os serviços, exemplo docker serviços ativos

[<img src="dockerdesktop.png">](dockerdesktop.png)



Abra o "Node.js command prompt"

```bash
pm2 resurrect
```



Problemas conexão?

Abra o "Node.js command prompt"

Acessar pasta backend

```bash
cd c:\izing\backend
```

1. Outra versão js pode se tentar
Na pasta backend execute
```bash
npm r whatsapp-web.js
```
```bash
npm i whatsapp-web.js@^1.23.1-alpha.6
```
```bash
rm .wwebjs_auth -Rf
```
```bash
rm .wwebjs_cache -Rf
```
```bash
pm2 restart all
```

2. Versão ldurans
Na pasta backend execute
```bash
npm r whatsapp-web.js
```
```bash
npm install github:pedroslopez/whatsapp-web.js#webpack-exodus
```
```bash
rm .wwebjs_auth -Rf
```
```bash
rm .wwebjs_cache -Rf
```
```bash
pm2 restart all
```



Para reinstalar o whatsapp.js.. verifique no repositorio oficial se não tem alguma mais atual
