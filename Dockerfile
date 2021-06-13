FROM node:14-alpine as build

WORKDIR /usr/local/app

COPY dist package.json yarn.lock ./

RUN yarn install --production

FROM node:14-alpine

WORKDIR /usr/local/app

COPY --from=build /usr/local/app .

CMD ["node", "main.js"]
