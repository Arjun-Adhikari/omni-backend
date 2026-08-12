import { Router } from 'express';
import channelRoute from './channel.route.js';
import conversationRoute from './conversation.route.js';
import messageRoute from './message.route.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

router.use('/channels', channelRoute);
router.use('/conversations', conversationRoute);
router.use('/conversations', messageRoute);

export default router;
