cd services/redis-service
go run main.go &
cd ../../
cd api
npm run dev &
cd ../
cd services/notification-service
npm run dev &
cd ../
cd apps/frontend
npm run dev