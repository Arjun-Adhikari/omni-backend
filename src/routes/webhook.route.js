import { Router, raw } from 'express';
import * as webhookController from '../controllers/webhook.controller.js';

const router = Router();

router.get('/', webhookController.verifyWebhook);
router.post('/', raw({ type: 'application/json' }), webhookController.handleWebhookEvent);

export default router;
