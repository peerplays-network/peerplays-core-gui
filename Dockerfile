# base image
FROM node:8.9.4

# Install dependencies
RUN npm install -g webpack
# RUN npm install -g appdmg
RUN apt-get update && apt-get install -y fakeroot

# copy the application files
COPY . /usr/src/app

######## NPM ########
# take care of the npm packages within the root directory
WORKDIR /root-npm
COPY package.json /root-npm/
RUN npm install --quiet

# take care of the npm packages within the electron directory
WORKDIR /electron-npm
COPY electron/package.json /electron-npm/
RUN npm install --quiet

# take care of the npm packages within the electron/build directory
WORKDIR /electron-build-npm
COPY electron/build/package.json /electron-build-npm/
RUN npm install --quiet

######## WORKING DIRECTORY ########
# set working directory
WORKDIR /usr/src/app

# copy the previously cached node modules
RUN cp -a /root-npm/node_modules /usr/src/app/ \
  && cp -a /electron-npm/node_modules /usr/src/app/electron/ \
  && cp -a /electron-build-npm/node_modules /usr/src/app/electron/build/

# build
RUN npm run release-mwl

VOLUME ["/releases", "/releases"]
# start app
CMD ["npm", "start"]