FROM ubuntu:latest

RUN apt-get update

RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_16.x  | bash -

RUN apt-get -y install nodejs
RUN npm install -g yarn

RUN  apt-get update  -y
RUN  apt-get install -y software-properties-common
RUN  add-apt-repository ppa:openjdk-r/ppa
RUN  apt-get install -y openjdk-8-jdk
RUN  rm -rf /var/lib/apt/lists/*

WORKDIR /yumemi-mock-main

COPY package.json ./
COPY yarn.lock ./
RUN yarn install

COPY . .

CMD ["yarn", "mock:seed"]
