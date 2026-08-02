import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';

const router = Router();

router.post('/:id/messages', messageController.sendMessage);

export default router;
