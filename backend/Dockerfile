FROM node:14.17-alpine3.13 as builder

ENV _APP=/opt/services/app
ENV _PUBLIC=/opt/services/public
RUN mkdir -p $_APP
RUN mkdir -p $_PUBLIC

RUN apk update

# RUN apk add 

# RUN apk add libgbm-dev wget unzip fontconfig locales gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils

# && rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man \
#   && apk clean \
#   && mkdir -p /node_modules && chown node:node -R /node_modules /app

COPY --chown=node:node package.* $_APP/
WORKDIR $_APP

RUN npm install -g pm2
RUN npm install
RUN apk add chromium


# RUN addgroup -S dev && adduser -S dev
# USER dev
# COPY --chown=dev:dev . $_APP/
# RUN chown -R dev:dev  $_APP/
# USER dev

ARG NODE_ENV="production"
# ENV NODE_ENV="${NODE_ENV}" \
#   PATH="${PATH}:/node_modules/.bin" \
#   USER="node"

# COPY --chown=dev:dev --from=builder //public $_APP/public
WORKDIR $_APP
COPY . .
# COPY --chown=node:node bin/ /app/bin

# ENTRYPOINT ["docker-entrypoint-server.ssh"]

EXPOSE 8000

# CMD ["yarn", "watch-production"]
