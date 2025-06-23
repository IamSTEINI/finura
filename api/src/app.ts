import express from 'express'
import cors from 'cors'
import routes from './routes'
import naroutes from './noAuthRoutes/route'
import { errorHandler } from './middleware/errorHandler'
import { loggingHandler } from './middleware/loggingHandler'

const app = express()

app.use(cors())
app.use(express.json())
app.use(loggingHandler)

app.use('/api', routes)
app.use('/noauth', naroutes)

app.use((req, res, next) => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  (error as any).status = 404;
  next(error);
});

app.use(errorHandler)


export default app
