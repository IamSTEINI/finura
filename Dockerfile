FROM node:20-bullseye

RUN apt-get update && apt-get install -y wget && rm -rf /var/lib/apt/lists/*
RUN wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
RUN tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
RUN rm go1.21.0.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin

RUN npm install -g typescript
WORKDIR /app
COPY . .

RUN cd apps/frontend && npm install
RUN cd api && npm install
RUN cd services/notification-service && npm install

RUN cd services/redis-service && go mod tidy && go mod download

RUN chmod +x start.sh

EXPOSE 3000
EXPOSE 10000
EXPOSE 8001
EXPOSE 8500
EXPOSE 6379

CMD ["./start.sh"]
