import { Router } from 'express'

import authRouter from './auth/route'
import sessionRefreshRouter from './refresh-session/route'
import companyRouter from '../company/route'

const narouter = Router()

narouter.use('/auth', authRouter)
narouter.use('/refresh-session', sessionRefreshRouter)

export default narouter
