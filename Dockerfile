# Build stage: Compile Vite React app
FROM node:20 AS build
WORKDIR /app
# Copy package files and install dependencies
COPY package*.json ./
RUN npm install
# Copy source code and build
COPY . .
RUN npm run build
# Debug: Check contents of the build output (optional)
RUN ls -la /app/dist

# Final stage: Serve with NGINX
FROM nginx:alpine
# Copy Vite build output (dist, not build)
COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom NGINX config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Expose port 80
EXPOSE 8080
# Start NGINX
CMD ["nginx", "-g", "daemon off;"]