import { Router } from "express";
import authRouter from "./auth/route";
import redisProxyMiddleware from "./middleware/proxyHandler";
import websocketRouter from "./websocket-status/route";
import companyRouter from "./company/route";
import invoicesRouter from "./invoices/route";

const router = Router();

router.use(redisProxyMiddleware);

router.use('/auth', authRouter);
router.use('/company', companyRouter);
router.use('/websocket-status', websocketRouter);
router.use('/invoices', invoicesRouter);

export default router;

//? ALL ROUTES FORMAT [REQ] api/PATH (Data if needed) ALWAYS USES JWT TOKENS

//      [POST]       api/refresh-session  session_id

//      [POST]      api/logout                  session_id
//      [GET]       api/teams                   session_id

//      [GET]       api/invoices                session_id
//      [POST]      api/invoices                session_id, invoiceObj
//      [DELETE]    api/invoices                session_id
//      [PATCH]     api/invoices/:ID/archive    session_id
//      [PATCH]     api/invoices/:ID/restore    session_id
//      [GET]       api/invoices/:ID/pdf        session_id
//      [GET]       api/invoices/:ID/           session_id

//      [GET]       api/customers               session_id
//      [GET]       api/customers/:ID           session_id
//      [POST]      api/customers               session_id, customerObj
//      [DELETE]    api/customers/:ID           session_id
//      [PATCH]     api/customers/:ID           session_id
//      [GET]       api/customers/:ID/history   session_id

//      [GET]       api/receipts                session_id
//      [GET]       api/receipts/:ID            session_id
//      [GET]       api/receipts/:ID/pdf        session_id
//      [POST]      api/receipts                session_id, receiptObj
//      [DELETE]    api/receipts/:ID            session_id
//      [PATCH]     api/receipts/:ID            session_id

//      [GET / WS]  api/chats/:CHAT_ID          session_id
//      [POST]      api/chats/:CHAT_ID          session_id, messageObj
//      [DELETE]    api/chats/:CHAT_ID          session_id
//      [POST]      api/chats/:CHAT_ID/image    session_id
//      [POST]      api/chats/:CHAT_ID/typing   session_id

//      [GET]       api/appointments            session_id
//      [GET]       api/appointments/:ID        session_id
//      [POST]      api/appointments            session_id, appointmentObj
//      [DELETE]    api/appointments/:ID        session_id
//      [POST]      api/appointments/:ID/assign session_id

//      [GET]       api/products                session_id
//      [POST]      api/products/               session_id
//      [PATCH]     api/products/:ID            session_id
//      [DELETE]    api/products/:ID            session_id
//      [PATCH]     api/products/:ID/stock      session_id

//      [GET]       api/analytics
//      [GET]       api/analytics/custom

//      [GET]       api/profile/:profile        session_id
//      [PATCH]     api/profile/                session_id, profileObj

//! ALL ROUTES FOR ADMINSTRATOR ONLY

//      [POST]      api/teams/create    session_id
//      [POST]      api/teams/delete    session_id
//      [POST]      api/teams/add       session_id, user_id

//      [POST]      api/user/create     session_id
//      [POST]      api/user/delete     session_id, user_id

//      [PATCH]     api/user/:ID/suspend
//      [PATCH]     api/user/:ID/permissions
//      [PATCH]     api/user/:ID/profile

//      [GET]       api/system/status
//      [GET]       api/system/logs
//      [GET]       api/system/integrations
//      [POST]      api/system/restart
//      [POST]      api/system/backup
//      [POST]      api/system/integrations

//      [GET]       api/roles/
//      [POST]      api/roles/
//      [PATCH]     api/roles/:ID
//      [DELETE]    api/roles/:ID
//      [POST]      api/roles/:ID/assign

//      [GET]       api/audit/user
//      [GET]       api/audit/system
//      [GET]       api/audit/download