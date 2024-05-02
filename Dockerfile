FROM node:16-alpine As development
WORKDIR /usr/src/app
ADD package*.json ./
ARG GITLAB_DIGINEX_TOKEN
ADD .npmrc ./
RUN npm install
ADD . .
RUN npm run build
RUN npm run copy:assets

FROM node:16-alpine as production
WORKDIR /usr/src/app
ARG GITLAB_DIGINEX_TOKEN
ADD package*.json ./
COPY --from=development /usr/src/app/node_modules/ ./node_modules/
RUN npm install
COPY --from=development /usr/src/app/dist ./dist
EXPOSE 3000
CMD ["node", "/usr/src/app/dist/main.js"]
