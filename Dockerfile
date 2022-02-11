FROM ubuntu:20.04

ARG AYU_VERSION
ARG DENO_VERSION="1.13.2"
ARG NODE_VERSION="16"
ARG IPFS_VERSION="0.8.0"
ENV TZ=Europe/Budapest

# TODO: use user accounts instead root https://aka.ms/vscode-remote/containers/non-root
# ARG USERNAME=vscode
# ARG USER_UID=1000
# ARG USER_GID=$USER_UID

WORKDIR /root

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive  \
&& apt-get install -y curl \
unzip \
git \
tzdata \
wget curl ca-certificates rsync -y

# deno
RUN wget https://deno.land/x/install/install.sh
RUN sh install.sh v${DENO_VERSION}
ENV DENO_INSTALL="/root/.deno"
ENV PATH="$DENO_INSTALL/bin:$PATH"
ENV DENO_DIR=${DENO_INSTALL}/.cache/deno

# node 16 (https://github.com/nodesource/distributions/blob/master/README.md#deb)
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn

# atreyu https://github.com/cloudless-hq/atreyu/README.md
# RUN wget https://github.com/cloudless-hq/atreyu/archive/refs/tags/v${AYU_VERSION}.zip
# RUN unzip v${AYU_VERSION}.zip
# RUN rm -f v${AYU_VERSION}.zip
# RUN mv atreyu-${AYU_VERSION} atreyu
# RUN pwd
# RUN ls .
COPY . /root/atreyu

RUN mkdir -p /root/.cache/esbuild /root/.cache/deno

#=DENO_DIR,_DIALOGFLOWCONFIG,HOME,ESBUILD_BINARY_PATH,XDG_CACHE_HOME,CODESPACE_NAME,GITHUB_USER,__CLOUDFLARETOKEN,__IPFSPINNINGJWT,_ELASTIC_AUTH,_COUCHKEY,_COUCHSECRET,__COUCHADMINKEY,__COUCHADMINSECRET,_DIALOGFLOW_SERVICEACCOUNTKEY \

RUN deno install \
--allow-hrtime \
--allow-read \
--allow-env \
--allow-net=127.0.0.1:5001,api.cloudflare.com,api.pinata.cloud,registry.npmjs.org,deno.land,c3b0b243-4f69-4cb1-9ece-1b0561a67cee-bluemix.cloudant.com \
--allow-write=/tmp,"$HOME"/.atreyu,./,"$DENO_DIR",/root/.cache/deno,/root/.cache/esbuild \
--allow-run=ipfs,npx,`command -v deno`,yarn,/root/.cache/esbuild/bin/esbuild-linux-64@0.13.3 \
--no-check \
--prompt \
--unstable \
-n ayu \
-f /root/atreyu/cli/mod.js

RUN cd /root/atreyu && yarn && yarn build

# install IPFS (https://docs.ipfs.io/install/command-line/#official-distributions)
RUN cd /root && wget https://dist.ipfs.io/go-ipfs/v${IPFS_VERSION}/go-ipfs_v${IPFS_VERSION}_linux-amd64.tar.gz
RUN tar -xvzf go-ipfs_v${IPFS_VERSION}_linux-amd64.tar.gz
RUN cd go-ipfs && bash install.sh
RUN rm -f go-ipfs_v${IPFS_VERSION}_linux-amd64.tar.gz
RUN ipfs --version

# install playwright deps

RUN PLAYWRIGHT_BROWSERS_PATH=/root/pw-browsers npx playwright install-deps && PLAYWRIGHT_BROWSERS_PATH=/root/pw-browsers npx playwright install

# initialize the atreyu ipfs repo
RUN cd /root/atreyu && ayu init
# install the atreyu runtime framework into the repo
RUN cd /root/atreyu && ayu --once
RUN cd /root/atreyu && ayu start --online & ayu publish
