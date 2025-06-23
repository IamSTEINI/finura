import { Router } from 'express'

import authRouter from './auth/route'

const narouter = Router()

narouter.use('/auth', authRouter)

export default narouter
