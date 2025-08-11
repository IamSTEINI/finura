FROM node:20-bullseye
RUN apt-get update && apt-get install -y golang && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

RUN cd apps/frontend && npm install

RUN cd api && npm install

RUN cd services/notification-service && npm install

RUN chmod +x start.sh

EXPOSE 3000   # frontend Next.js
EXPOSE 8000   # api
EXPOSE 8500   # notification-service
EXPOSE 6379   # redis

CMD ["./start.sh"]
