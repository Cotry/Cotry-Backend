FROM node:alpine

# /app is where my node application source code will reside,
# this means "." will always point to "/app" from now on.
WORKDIR '/app'

# copy package.json to my "/app" directory
COPY --chown=node:node package.json .

# download all dependencies
RUN npm install

# copy all files from local environment to docker
# the first "." is for local file system, the second "." is for docker file system
COPY --chown=node:node . .

# set the user
USER node

# on the "/app" run "npm run start"
CMD ["npm", "run", "start" ]