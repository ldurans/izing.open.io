FROM node:18-bookworm-slim as global-deps-stage

WORKDIR /app

RUN apt-get update \
  && apt-get install -y wget gnupg nano ffmpeg=7:5.1.4-0+deb12u1 \
  && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
  --no-install-recommends \
  && rm -rf /var/lib/apt/lists/* && npm install pm2@latest -g

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV NODE_ENV=dev
ENV CHROME_BIN=google-chrome-stable

FROM global-deps-stage as develop-stage
COPY package*.json ./
RUN npm install

FROM develop-stage as build-stage
COPY . .
RUN npm run build

FROM build-stage as development-stage
ENV NODE_ENV=development
ENTRYPOINT ["npm", "run", "dev:server"]

FROM build-stage as production-stage
ENV NODE_ENV=production
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh
ENTRYPOINT ["./docker-entrypoint.sh"]
