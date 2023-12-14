#!/bin/sh

# Certifique-se de que este script seja executável (chmod +x) antes de usá-lo no Dockerfile
# Inicie o aplicativo PM2 com as opções desejadas
# pm2-docker start pm2.config.js
pm2-docker start ./dist/server.js
