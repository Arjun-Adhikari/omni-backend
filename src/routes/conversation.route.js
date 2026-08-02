import { Router } from 'express';
import * as conversationController from '../controllers/conversation.controller.js';

const router = Router();

router.get('/', conversationController.listConversations);
router.get('/:id', conversationController.getConversation);
router.patch('/:id/status', conversationController.updateConversationStatus);

export default router;
