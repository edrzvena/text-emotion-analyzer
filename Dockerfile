# ---- Stage 1: Build the React app ----
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the source and build
COPY . .
RUN npm run build

# ---- Stage 2: Serve the static build with Nginx ----
FROM nginx:1.27-alpine AS production

# SPA-friendly Nginx config (fallback to index.html)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the production build from the build stage
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
