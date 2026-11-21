FROM node:22-alpine
WORKDIR /app
COPY package.json server.mjs common.js ./
COPY snowbelly ./snowbelly
COPY bluedose ./bluedose
ARG APP=snowbelly
ENV APP=$APP PORT=8080
EXPOSE 8080
USER node
CMD ["node", "server.mjs"]
