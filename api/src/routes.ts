import { Router } from 'express'



const router = Router()



export default router


//? ALL ROUTES FORMAT [REQ] api/PATH (Data if needed) ALWAYS USES JWT TOKENS

//      [POST]      api/logout           session_id
//      [GET]       api/teams            session_id

//      [GET]       api/invoices         session_id
//      [POST]      api/invoices         session_id, invoiceObj
//      [DELETE]    api/invoices         session_id

//      [GET]       api/customers        session_id
//      [POST]      api/customers        session_id, customerObj
//      [DELETE]    api/customers        session_id

//      [GET]       api/receipts         session_id
//      [POST]      api/receipts         session_id, receiptObj
//      [DELETE]    api/receipts         session_id

//      [GET / WS]  api/chats/:CHAT_ID   session_id
//      [POST]      api/chats/:CHAT_ID   session_id, messageObj
//      [DELETE]    api/chats/:CHAT_ID   session_id

//      [GET]       api/appointments     session_id
//      [POST]      api/appointments     session_id, appointmentObj
//      [DELETE]    api/appointments     session_id



//! ALL ROUTES FOR ADMINSTRATOR ONLY

//      [POST]  api/teams/create    session_id
//      [POST]  api/teams/delete    session_id
//      [POST]  api/teams/add       session_id, user_id

//      [POST]  api/user/create     session_id
//      [POST]  api/user/delete     session_id, user_id