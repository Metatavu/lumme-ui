FROM node:12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install -g grunt
RUN npm install -g sass
RUN npm install

COPY . .

RUN grunt

EXPOSE 3000
CMD [ "node", "app.js" ]