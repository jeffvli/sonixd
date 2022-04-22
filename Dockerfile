# Based off of https://typeofnan.dev/how-to-serve-a-react-app-with-nginx-in-docker/

# Stage 1 - Build frontend assets
FROM node:18-alpine as builder

WORKDIR /app

COPY . .

RUN npm install

# Stage 2 - Serve assets using nginx
FROM nginx:alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/release/app/dist/renderer .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]
