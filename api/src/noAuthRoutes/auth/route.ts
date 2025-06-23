import { Router } from 'express'

import loginRouter from './login/route'

const authRouter = Router()

authRouter.use('/login', loginRouter)

export default authRouter
