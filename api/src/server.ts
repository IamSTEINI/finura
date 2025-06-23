import app from './app'
import dotenv from 'dotenv'
import { testConnection } from './utils/db/db'

dotenv.config()

const PORT = process.env.PORT || 10000

app.listen(PORT, async () => {
  console.log(`[+] Server is running on http://localhost:${PORT}`)
  const { success: TC, error: err, port } = await testConnection();
  if(TC) {
    console.log(`[+] PostgreSQL is connected on localhost:${port}`)
  }else {
    console.error(err)
  }
})
