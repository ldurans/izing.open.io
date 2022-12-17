[![Doação](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://www.paypal.com/donate/?hosted_button_id=TZ26S3D3Q4PE6)
[![Discord Chat](https://img.shields.io/discord/1046597742878789663.svg?logo=discord)](https://discord.gg/vThFjJWX)

# Izing

Um sistema para gestão de atendimento multicanais centralizado.

Sistema possui o backend e canais baseado em:

- Whatsapp [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- Telegram [telegraf](github.com/telegraf/telegraf)
- Instagram [instagram-private-api](https://github.com/dilame/instagram-private-api)
- Messenger [messaging-api-messenger](https://github.com/Yoctol/messaging-apis#readme)

Como escolha para o banco de dados, optamos pelo [PostgresSql 14](https://www.postgresql.org/).

No front, todas as funcionalidades são baseadas no [vue](https://vuejs.org/) e [quasar](https://quasar.dev/), com integração via REST API e Websockets.

Esse projeto tem inspiração e também é baseado no projeto fantástico [whaticket](https://github.com/canove/whaticket-community).

**IMPORTANTE**: não garantimos que a utilização desta ferramenta não irá gerar bloqueio nas contas utilizadas. São bots que em sua maioria utilizam APIs secundarias para comunicação com os fornecedores dos serviços. Use com responsabilidade!

## Screenshots

>![Doação](screenshots/Bot.gif)
___  
>![Doação](screenshots/dashboard.gif)
___
>![Doação](screenshots/izing.gif)
___

## Principais funcionalidades

- Multíplos canais de atendimento ✅
- Multíplos usuários simultâneos por canais de atendimento ✅
- Iniciar conversa com contatos existentes (whatsapp) ✅
- Construção de Chatbot interativo ✅
- Enviar e receber mensagens ✅
- Enviar e receber mídias diversas (imagens/áudio/documentos) ✅
- Multiempresas (abordagem de base compartilhada)

## Docker compose Localhost

Execute comando na pasta raiz do projeto (izing.io)

```
docker compose -f "docker-compose.yml" up -d --build
```

Após os containers estarem rodando, faça a carga de dados iniciais (apenas na primeira vez)

```
docker compose exec -it izing-backend  bash -c 'npx sequelize db:seed:all'    
```

> Se tudo correu bem, acesse o sistema e faça login no link: [http://localhost:8080/#/login](http://localhost:8080/#/login).

```
usuário: admin@izing.io
senha: 123456
```

## Instalação (Linux Ubuntu - Desenvolvimento)

```
Instale o postgres;
Instale o rabbitmq;
Instale o redis;
Instale node 14.* via nvm
```

Install puppeteer dependencies:

```bash
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

Clone este repositório

```bash
git clone git@github.com:ldurans/izing.io.git
```

Navegue até a pasta backend e crie o arquivo .env:

```bash
cp .env.example .env
nano .env
```

Edite os valores das variáveis do arquivo `.env`:

```bash
NODE_ENV=DEVELOPMENT #it helps on debugging
BACKEND_URL=http://localhost
FRONTEND_URL=https://localhost:3000
PROXY_PORT=8080
PORT=8080

POSTGRES_HOST=
DB_PORT=
POSTGRES_DB=
POSTGRES_USER=
POSTGRES_PASSWORD=

JWT_SECRET=ainjpansaiubspiusbpsjp918921601826
JWT_REFRESH_SECRET=ain@@@@jpansai_!0ubspiusbpsjp
MIN_SLEEP_BUSINESS_HOURS=10000
MAX_SLEEP_BUSINESS_HOURS=20000
MIN_SLEEP_AUTO_REPLY=4000
MAX_SLEEP_AUTO_REPLY=6000
MIN_SLEEP_INTERVAL=2000
MAX_SLEEP_INTERVAL=5000
RABBITMQ_DEFAULT_USER=
RABBITMQ_DEFAULT_PASS=
AMQP_URL='amqp://USER:SENHAS@HOST:PORTA?connection_attempts=5&retry_delay=5'
API_URL_360=https://waba-sandbox.360dialog.io
ADMIN_DOMAIN=izing.io
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET_KEY=

```

Instale as dependências do backend e execute as migrações e carga de dados iniciais:

```bash
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
```

Inicie o backend:

```bash
npm start
```

Abra um novo terminal e navegue até a pasta do frontend.

Instale as dependências do backend e execute as migrações e carga de dados iniciais:

```bash
npm install
```

Crie o arquivo .env na pasta frontend:

```bash
cp .env.example .env
nano .env
```

```bash
URL_API='http://api.mydomain.com' # URL do backend
FACEBOOK_APP_ID='1554345554575413' # id do app criado na console do facebook
```

Inicie o frontend (suponto que já possua instalado as cli do vue e quasar):

```bash
quasar c && quasar d
```
  
## Guia básico para produção (Ubuntu >= 18.04 VPS)

```
Instale o postgres;
Instale o rabbitmq;
Instale o redis;
```

As instruções assumem que não está executando como root. Vamos iniciar criando um usuário e as permissões necessárias.

```bash
adduser deploy
usermod -aG sudo deploy
```

Faça login com o novo usuário:

```bash
su deploy
```

> Para o front, recomendamos a utilização de serviços como Vercel e Netlify.

Você vai precisar de dois subdomains encaminhados para o seu IP/VPS.
Utilizaremos `myapp.mydomain.com` para o frontend e `api.mydomain.com` para o backend para este exemplo.

Atualize o sistema (SO):

```bash
sudo apt update && sudo apt upgrade
```

Instale o node:

```bash
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

> `Assumiremos que você já possui o Postgres instalado e o banco criado.`

Clone o repositório:

```bash
cd  ~
git clone git@github.com:ldurans/izing.io.git
```

Na pasta backend, crie o arquivo .env:

```bash
cp izing/backend/.env.example izing/backend/.env
nano izing/backend/.env
```

```bash
NODE_ENV=
BACKEND_URL=https://api.mydomain.com #USE HTTPS HERE, WE WILL ADD SSL LATTER
FRONTEND_URL=https://myapp.mydomain.com #USE HTTPS HERE, WE WILL ADD SSL LATTER, CORS RELATED!
PROXY_PORT=443 #USE NGINX REVERSE PROXY PORT HERE, WE WILL CONFIGURE IT LATTER
PORT=8080

DB_DIALECT=postgres
DB_PORT=5432
POSTGRES_HOST=
POSTGRES_USER=postgres
POSTGRES_PASSWORD=
POSTGRES_DB=izing
IO_REDIS_SERVER=localhost
IO_REDIS_PORT='6379'
IO_REDIS_DB_SESSION='2'
JWT_SECRET=DPHmNRZ!!@56WZ4isLF9vXkMv1QabvpcA80Rc
JWT_REFRESH_SECRET=EMPehEbr908879Adi7s8fGSeYzqGQbV5wrjH4i
MIN_SLEEP_BUSINESS_HOURS=10000
MAX_SLEEP_BUSINESS_HOURS=20000
MIN_SLEEP_AUTO_REPLY=4000
MAX_SLEEP_AUTO_REPLY=6000
MIN_SLEEP_INTERVAL=2000
MAX_SLEEP_INTERVAL=5000RABBITMQ_DEFAULT_USER=durans
RABBITMQ_DEFAULT_PASS=marina0509
AMQP_URL='amqp://USER:SENHAS@HOST:PORTA?connection_attempts=5&retry_delay=5'
API_URL_360=https://waba-sandbox.360dialog.io

FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET_KEY=

```

Instale as dependências do puppeteer:

```bash
sudo apt-get install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils
```

Instale as dependências do backend e execute as migrações e carga de dados iniciais:

```bash
cd izing/backend
npm install
npm run build
npx sequelize db:migrate
npx sequelize db:seed:all
```

Instale o pm2 **com sudo**, e inicie o backend com ele:

```bash
sudo npm install -g pm2
pm2 start dist/server.js --name izing-backend
```

Após isso, faça o pm2 auto iniciar:

```bash
pm2 startup ubuntu -u `YOUR_USERNAME`
```

Copie a última saída do terminal e a execute. O camando deverá ser parecido com:

```bash
sudo env PATH=\$PATH:/usr/bin pm2 startup ubuntu -u YOUR_USERNAME --hp /home/YOUR_USERNAM
```

Agora vamos preparar o frontend.

```bash
cd ../frontend
npm install
```

Crie o arquivo .env na pasta frontend:

```bash
cp .env.example .env
nano .env
```

```bash
URL_API='http://api.mydomain.com' # URL do backend
FACEBOOK_APP_ID='1554345554575413' # id do app criado na console do facebook
```

Faça o build do front:

```bash
quasar build -P -m pwa
```

___
___

Instale o nginx:

```bash
sudo apt install nginx
```

Remova o site padrão do nginx:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

Crie o site para o Backend

```bash
sudo nano /etc/nginx/sites-available/izing-backend
```

```bash
server {
  server_name api.mydomain.com;

  location / {
    proxy_pass http://127.0.0.1:8080;
......
}

```

Crie o site para o Front

```bash
sudo nano /etc/nginx/sites-available/izing-frontend
```

```bash
server {
  server_name myapp.mydomain.com;
  
  root /home/user/izing/frontend/dist/pwa; # caminho da pasta dist/pwa
  
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-XSS-Protection "1; mode=block";
  add_header X-Content-Type-Options "nosniff"; 
  
  index index.html;
  charset utf-8;
  location / {
    try_files $uri $uri/ /index.html;
  }

  access_log off;

}
```

Crie os links simbólicos para habilitar os sites:

```bash
sudo ln -s /etc/nginx/sites-available/izing-backend /etc/nginx/sites-enabled
sudo ln -s /etc/nginx/sites-available/izing-frontend /etc/nginx/sites-enabled
```

Vamos alterar a configuração do nginx para aceitar 20MB de corpo nas requisições:

```bash
sudo nano /etc/nginx/nginx.conf
...

http {
  ...
  client_max_body_size 20M;  # HANDLE BIGGER UPLOADS
}

```

Teste a configuração e reinicie o nginx:

```bash
sudo nginx -t
sudo service nginx restart
```

Agora, ative o SSL (https) nos seus sites para utilizar todas as funcionalidades da aplicação como notificações e envio de mensagens áudio. Uma forma fácil de o fazer é utilizar Certbot:

Instale o certbor com snapd:

```bash
sudo snap install --classic certbot
```

Habilite SSL com nginx:

```bash
sudo certbot --nginx
```

## Atualizando

Izing é um trabalho em progresso e estamos frequentemente adicionando novas funcionalidades e correções de bugs.

**IMPORTANTE**: verifique sempre o .env.example e ajuste o seu .env antes de atualizar, uma vez que algumas novas variáveis podem ser adicionadas.

```bash
nano updateIzing
```

```bash
#!/bin/bash
echo  "Atualizando izing, aguarde..."
cd  ~
cd izing
git pull
cd backend
npm install
rm -rf dist
npm run build
npx sequelize db:migrate
npx sequelize db:seed
cd ../frontend
npm install
quasar build -P -m pwa
pm2 restart all

echo  "Atualização finalizada!"
```

Marque o arquivo como executável:

```bash
chmod +x updateIzing
./updateIzing
```

## FIQUE ATENTO

A utilização desta ferramenta é feita por sua conta e risco. O código é aberto e todos podem contribuir. Espero que não (rsrrs), mas podem existir bugs e problemas de segurança.

Este projeto não é afiliado, associado, autorizado, endossado por, ou de qualquer forma oficialmente ligado à WhatsApp, ou a qualquer uma das suas filiais ou afiliadas. O website oficial da WhatsApp pode ser encontrado em <https://whatsapp.com>. "WhatsApp", bem como nomes, marcas, emblemas e imagens relacionadas são marcas registadas dos seus respectivos proprietários.

--------------------------

### Curtiu? Pague-me um café!! Segue QR code (PIX)  

[<img src="donate.jpeg" height="150" width="200"/>](donate.jpeg)
