# Manual de Instação do izing.io na VPS

### Observação:
- Antes de começar a instalação é necessário ter criado antecipadamente os subdomínios e já estarem apontados para o IP da VPS.
- Feito ubuntu 22
- Senha usada 123@mudar
- Dominio Frontend: bot.seusite.com.br
- Dominio backend: api.bot.seusite.com.br
================================================

1. Alterando para root

```bash
sudo su root
```

2. Setar Time Zone para São Paulo e atualizar sistema

```bash
timedatectl set-timezone America/Sao_Paulo && apt update && apt upgrade -y
```

3. Reiniciar para atualizar kernel

```bash
reboot
```

4. Apos reniciar conectar no servidor novamente - Alterando para root

```bash
sudo su root
```

5. Intalar pacotes necessários

```bash
apt install -y libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils python2-minimal build-essential postgresql redis-server libxshmfence-dev
```

6. Intalar rabbitmq

```bash
apt install -y rabbitmq-server
```

7. Habilitar rabbitmq

```bash
rabbitmq-plugins enable rabbitmq_management
```

8. Criar usuario

```bash
rabbitmqctl add_user admin 123@mudar
```

9. Configurar privilegio

```bash
rabbitmqctl set_user_tags admin administrator
```

10. Configurar permissoes

```bash
rabbitmqctl set_permissions -p / admin "." "." ".*"
```


11. baixar chave repositorio google crome

```bash
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo gpg --dearmour -o /usr/share/keyrings/chrome-keyring.gpg 
```

12. adicionar repositorio

```bash
sudo sh -c 'echo "deb [arch=amd64 signed-by=/usr/share/keyrings/chrome-keyring.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list' 
```

13. update apt

```bash
sudo apt update 
```

14. instalar google crome

```bash
sudo apt install google-chrome-stable 
```

15. Instalar nginx

```bash
apt install -y nginx
```

16. remover arquivo padrao nginx

```bash
rm /etc/nginx/sites-enabled/default
```

17. Acessar para configurar o PostgreSQL

```bash
sudo -u postgres psql
```

18. Alterar senha do PostgreSQL

```bash
ALTER USER postgres PASSWORD '123@mudar';
```

19. Criar banco de dados PostgreSQL

```bash
CREATE DATABASE izing;
```

20. Sair do PostgreSQL

```bash
\q
```

21. Editar arquivo  /etc/redis/redis.conf Descomentar e deixar a linha como abaixo:

```bash
nano /etc/redis/redis.conf
```

```bash
requirepass 123@mudar
```

22. Reniciar Redis

```bash
service redis restart
```

23. Criar o usário deploy

```bash
adduser deploy
```

24. 
```bash
usermod -aG sudo deploy
```

25. Alterar para o novo usuário

```bash
su deploy
```

26. Realizar o download do node 20.x

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
```

27. Instalar o node

```bash
sudo apt-get install -y nodejs
```

28. Acessar o diretório raiz

```bash
cd ~
```

29. baixar o repositório do izing.open.io

```bash
git clone https://github.com/ldurans/izing.io.git 
```

30. Copiar o env de exemplo para o backend
```bash 
cp izing.io/backend/.env.example izing.io/backend/.env
```

31. Rodar o comando abaixo 2x para gerar JWT_SECRET e JWT_REFRESH_SECRET

```bash
openssl rand -base64 32
```

31. Editar os dados abaixo e colar os valores gerados no item 31.

```bash
# ambiente
NODE_ENV=dev

# URL do backend para construção dos hooks
BACKEND_URL=https://api.bot.seusite.com.br

# URL do front para liberação do cors
FRONTEND_URL=https://bot.seusite.com.br

# Porta utilizada para proxy com o serviço do backend
PROXY_PORT=443

# Porta que o serviço do backend deverá ouvir
PORT=3098


# conexão com o banco de dados
DB_DIALECT=postgres
DB_TIMEZONE=-03:00
DB_PORT=5432
POSTGRES_HOST=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=123@mudar
POSTGRES_DB=izing


# Chaves para criptografia do token jwt
JWT_SECRET=gerado no passo 31
JWT_REFRESH_SECRET=gerado no passo 31

# Dados de conexão com o REDIS
IO_REDIS_SERVER=localhost
IO_REDIS_PORT='6379'
IO_REDIS_DB_SESSION='2'
IO_REDIS_PASSWORD=123@mudar

#CHROME_BIN=/usr/bin/google-chrome
CHROME_BIN=/usr/bin/google-chrome-stable
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

# Limitar Uso do Izing Usuario e Conexões
USER_LIMIT=99
CONNECTIONS_LIMIT=99
```

32. Abrir para edição o arquivo .env com o comando abaixo e prencher com os dados acima.

```bash
nano izing.io/backend/.env
```

33. Acessando o backend

```bash
cd izing.io/backend
```

34. Instalando as dependências

```bash
npm install --force
```

35. Buildando o backend

```bash
npm run build
```

36. Criando as tabelas no BD

```bash
npx sequelize db:migrate
```

37. Inserindo dados em algumas tabelas do BD

```bash
npx sequelize db:seed:all
```

38. Instalando o PM2

```bash
sudo npm install -g pm2
```

39. Iniciando o backend com PM2

```bash
pm2 start dist/server.js --name izing-backend
```

40. Gerar Startup

```bash
pm2 startup ubuntu -u deploy
```

41. Gerar status parte 2

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup ubuntu -u deploy --hp /home/deploy
```

42. Acessando o frontend

```bash
cd ../frontend
```

43. copiando .env do example

```bash
cp .env.example .env
```

44. Editando o arquivo .env com o comando abaixo e prencher com os dados do item 45.

```bash
nano .env
```

45. Dados env frontend

```bash
VUE_URL_API='https://api.bot.seusite.com.br'
VUE_FACEBOOK_APP_ID='23156312477653241'
```

46. Criar arquivo server.js com dados do item 47

```bash
nano server.js
```

47. Dados para gerar server.js
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

48. Instalando as dependências
```bash
npm install --force
```

49. Instalando Quasar

```bash
npm i @quasar/cli
```

50. Mudar configuracao SSL para compilar

```bash
export NODE_OPTIONS=--openssl-legacy-provider
```

51. Buildando o frontend

```bash
npx quasar build -P -m pwa
```

52. Iniciando o frontend com PM2
```bash
pm2 start server.js --name izing-frontend
```

53. Salvando os serviços iniciados pelo PM2

```bash
pm2 save
```

54. Listar os serviços iniciados pelo PM2

```bash
pm2 list
```

55. Editar os dados abaixo com a URL que será usada para acessar o frontend.

```bash
server {
  server_name bot.seusite.com.br;

  location / {
    proxy_pass http://127.0.0.1:4444;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }

}
```

56. Criar e editar o arquivo izing-frontend com o comando abaixo e prencher com os dados do item 55.

```bash
sudo nano /etc/nginx/sites-available/izing-frontend
```

57. Editar os dados abaixo com a URL que será usada para acessar o backend.

```bash
server {
  server_name api.bot.seusite.com.br;

  location / {
    proxy_pass http://127.0.0.1:3098;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_cache_bypass $http_upgrade;
  }

}
```

58. Criar e editar o arquivo izing-frontend com o comando abaixo e prencher com os dados do item 57.

```bash
sudo nano /etc/nginx/sites-available/izing-backend
```

59. Criar link simbólico para o arquivo izing-frontend

```bash
sudo ln -s /etc/nginx/sites-available/izing-frontend /etc/nginx/sites-enabled/
```


60. Criar link simbólico para o arquivo izing-backend

```bash
sudo ln -s /etc/nginx/sites-available/izing-backend /etc/nginx/sites-enabled/
```

61. Editar o arquivo de configuração do nginx com o comando abaixo e prencher com os dados do item 62. adicionar antes# server_tokens off;

```bash
sudo nano /etc/nginx/nginx.conf
```

62. adicionar antes# server_tokens off;

```bash
underscores_in_headers on;	
client_max_body_size 100M;
```

63. Testar as configurações do nginx

```bash
sudo nginx -t
```

64. Restartar o nginx

```bash
sudo service nginx restart
```

65. Instalar o suporte a pacotes Snap

```bash
sudo apt-get install snapd
```

66. Instalar o pacote do notes

```bash
sudo snap install notes
```

67. Instalar o pacote do certbot(SSL)

```bash
sudo snap install --classic certbot
```

68. Gerar certificado

```bash
sudo certbot --nginx
```

Pronto sistema instalado so acessar frontend

Usuário padrão para acesso

Usuário

admin@izing.io  

Senha:

123456

Problemas conexão?

1. Versão ldurans
Na pasta backend execute
```bash
npm r whatsapp-web.js
```
```bash
execute: npm install github:pedroslopez/whatsapp-web.js#webpack-exodus
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

2. Outra versão js pode se tentar
Na pasta backend execute
```bash
npm r whatsapp-web.js
```
```bash
npm i whatsapp-web.js@^1.23.1-alpha.5
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
