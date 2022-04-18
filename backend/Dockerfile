FROM node:14 as build-deps

RUN apt-get update && apt-get install -y wget

RUN apt-get update \
  && apt-get install -y wget gnupg \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

ENV _APP=/usr/src/app
RUN mkdir -p $_APP
WORKDIR $_APP

COPY package*.json $_APP/
RUN npm install

COPY . $_APP/
# RUN rm -Rf dist/

# RUN npm run build

ENV PORT=3000
ENV CHROME_BIN=google-chrome-stable

EXPOSE 3000

WORKDIR $_APP

CMD npm run build && npx sequelize db:migrate

ENTRYPOINT ["node", "dist/server.js"]

