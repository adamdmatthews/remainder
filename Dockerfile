# syntax = docker/dockerfile:1

FROM node:21.5.0-slim as base
LABEL fly_launch_runtime="Node.js"
WORKDIR /app
ENV NODE_ENV="production"

FROM base as build
COPY --link .npmrc package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false
COPY --link . .
RUN yarn run build
RUN yarn install --production=true

FROM base
COPY --from=build /app /app
EXPOSE 3000
CMD [ "node", "build" ]
