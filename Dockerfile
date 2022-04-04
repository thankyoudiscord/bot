FROM node:alpine
WORKDIR /usr/src/app
COPY . .
RUN yarn
CMD ["node", "build/src/index.js"]
