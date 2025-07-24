import { Router, RequestHandler } from "express";
import { setUserWebSocketStatus } from "../utils/utils/monitorUserStatus";

const websocketRouter = Router();

const websocketStatusHandler: RequestHandler = async (req, res): Promise<void> => {
    try {
        const { user_id, connected } = req.body;
        
        if (!user_id || typeof connected !== 'boolean') {
            res.status(400).json({
                success: false,
                error: "Missing user_id or connected status"
            });
            return;
        }
        
        setUserWebSocketStatus(user_id, connected);
        
        res.status(200).json({
            success: true,
            message: `WebSocket status updated for user ${user_id}: ${connected ? 'connected' : 'disconnected'}`
        });
        
    } catch (error) {
        console.error("Error updating WebSocket status:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

websocketRouter.post("/", websocketStatusHandler);

export default websocketRouter;
