#!/bin/bash
set -e

echo "Starting Finura application..."
echo "Building TypeScript projects..."
echo "Building API..."
cd /app/api
npm run build
echo "API build completed"
echo "Building notification service..."
cd /app/services/notification-service
npm run build
echo "Notification service build completed"
echo "Building frontend..."
cd /app/apps/frontend
npm run build
echo "Frontend build completed"
echo "Starting services..."
echo "Starting Redis service..."
cd /app/services/redis-service
go run main.go &
REDIS_SERVICE_PID=$!
echo "Redis service started with PID $REDIS_SERVICE_PID"
sleep 5
echo "Starting API..."
cd /app/api
npm start &
API_PID=$!
echo "API started with PID $API_PID"
sleep 5
echo "Starting notification service..."
cd /app/services/notification-service
npm start &
NOTIFICATION_PID=$!
echo "Notification service started with PID $NOTIFICATION_PID"
sleep 5
echo "Starting frontend..."
cd /app/apps/frontend
cleanup() {
    echo "Cleaning up background processes..."
    kill $REDIS_SERVICE_PID $API_PID $NOTIFICATION_PID 2>/dev/null || true
    exit
}
trap cleanup SIGTERM SIGINT
npm start &
FRONTEND_PID=$!
wait $FRONTEND_PID