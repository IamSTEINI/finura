import { Router } from 'express'

import authmeRouter from './me/route'

const authRouter = Router()

authRouter.use('/me', authmeRouter)

export default authRouter
