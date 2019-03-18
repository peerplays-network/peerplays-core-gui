# base image
FROM node:8.9.4

RUN npm install webpack -g

######## NPM ########
# take care of the npm packages within the root directory
WORKDIR /root-npm
COPY package.json /root-npm/
RUN npm install

# take care of the npm packages within the electron directory
WORKDIR /electron-npm
COPY electron/package.json /electron-npm/
RUN npm install

# take care of the npm packages within the electron/build directory
WORKDIR /electron-build-npm
COPY electron/build/package.json /electron-build-npm/
RUN npm install

######## WORKING DIRECTORY ########
# set working directory
WORKDIR /usr/src/app

# copy the application files
COPY . /usr/src/app
# copy the previously cached node modules
RUN cp -a /root-npm/node_modules /usr/src/app/ \
  && cp -a /electron-npm/node_modules /usr/src/app/electron/ \
  && cp -a /electron-build-npm/node_modules /usr/src/app/electron/build/

# build
RUN npm run release-lin

# start app
# CMD ["npm", "start"]