# develop stage
FROM node:14 as buildenv
WORKDIR /app

RUN npm install -g @quasar/cli

COPY ./frontend/package*.json .
COPY ./frontend/quasar.conf.js .
RUN npm install
COPY ./frontend/ .

RUN quasar build -m pwa

FROM nginx:stable as production-stage
RUN mkdir /app
COPY --from=buildenv /app/dist/pwa /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx.conf /etc/nginx/conf.d
