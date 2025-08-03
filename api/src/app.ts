import express from 'express'
import cors from 'cors'
import routes from './routes'
import naroutes from './noAuthRoutes/route'
import { errorHandler } from './middleware/errorHandler'
import { loggingHandler } from './middleware/loggingHandler'
import { createOrUpdateAdminUser } from './utils/admin/createAdminUser'
import { monitorUserStatus } from './utils/utils/monitorUserStatus'

const app = express()

app.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:3000',
    /\.railway\.app$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin']
}))
app.use(express.json())
app.use(loggingHandler)

createOrUpdateAdminUser()

monitorUserStatus(2)

app.use('/api', routes)
app.use('/noauth', naroutes)

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
});

app.use(errorHandler)


export default app
