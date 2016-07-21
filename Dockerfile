FROM node:6.3.0

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm install .

CMD ["node", "app.js"]
