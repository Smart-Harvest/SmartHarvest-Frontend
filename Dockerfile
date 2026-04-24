# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ARG VITE_USER_API
ARG VITE_CROP_API
ARG VITE_MARKET_API
ENV VITE_USER_API=$VITE_USER_API
ENV VITE_CROP_API=$VITE_CROP_API
ENV VITE_MARKET_API=$VITE_MARKET_API

RUN npm run build

# Runtime stage
FROM nginx:1.25-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
