FROM node:18-alpine

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN yarn install

COPY . .
EXPOSE 8080
CMD yarn dev