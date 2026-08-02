import crypto from 'crypto';
import axios from 'axios';

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

export function verifySignature(rawBody, signatureHeader, appSecret) {
  if (!signatureHeader || !appSecret) {
    return false;
  }

  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const provided = signatureHeader.replace(/^sha256=/, '');

  if (provided.length !== expected.length) {
    return false;
  }

  return crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function getProfile(psid, accessToken) {
  const { data } = await axios.get(`${GRAPH_API_BASE}/${psid}`, {
    params: {
      fields: 'first_name,last_name,profile_pic',
      access_token: accessToken,
    },
  });

  return data;
}

export async function sendTextMessage(psid, text, accessToken) {
  const { data } = await axios.post(
    `${GRAPH_API_BASE}/me/messages`,
    {
      recipient: { id: psid },
      message: { text },
    },
    {
      params: { access_token: accessToken },
    }
  );

  return data;
}
