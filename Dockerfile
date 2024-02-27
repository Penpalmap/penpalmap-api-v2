#= Dependencies step =========================================================
# This step installs only production dependencies
FROM node:20.10.0-bookworm-slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
ENV NODE_ENV=production
RUN npm ci

#= Build step ================================================================
# This step builds the application
FROM node:20.10.0-bookworm-slim AS build

WORKDIR /app
# Copy only package files to avoid rebuilding deps on source code changes
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

#= Runner step ===============================================================
# This final step copy the build and the production dependencies to the final
# image and set the command to run the application
FROM node:20.10.0-bookworm-slim AS runner

USER node
WORKDIR /app
COPY --from=deps --chown=node:node /app/package*.json ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules/
COPY --from=build --chown=node:node /app/dist ./dist/
ENV NODE_ENV=production
CMD ["npm", "run", "prod"]
