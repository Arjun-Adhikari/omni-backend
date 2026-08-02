import { Router } from 'express';
import * as channelController from '../controllers/channel.controller.js';

const router = Router();

router.get('/', channelController.getChannels);
router.post('/', channelController.createChannel);
router.get('/:id', channelController.getChannel);
router.patch('/:id', channelController.updateChannel);
router.delete('/:id', channelController.deleteChannel);

export default router;
