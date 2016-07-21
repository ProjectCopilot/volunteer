FROM node:6.3.0

ADD . /usr/src/app
WORKDIR /usr/src/app

RUN npm set progress=false && \
npm install --global --progress=false

CMD ["node", "app.js"]
