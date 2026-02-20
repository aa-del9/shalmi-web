import { serverEnv } from '@/modules/core/env/server';

export async function sendOtpSms(
  phoneNumber: string,
  code: string
): Promise<void> {
  const sid = serverEnv.TWILIO_ACCOUNT_SID;
  const token = serverEnv.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = serverEnv.TWILIO_MESSAGING_SERVICE_SID;
  const fromNumber = serverEnv.TWILIO_PHONE_NUMBER;

  if (sid && token && (messagingServiceSid || fromNumber)) {
    const body = new URLSearchParams({
      To: phoneNumber,
      Body: `Your verification code is: ${code}`,
      ...(messagingServiceSid
        ? { MessagingServiceSid: messagingServiceSid }
        : { From: fromNumber! }),
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        },
        body: body.toString(),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[auth] Twilio SMS failed:', res.status, err);
      throw new Error('Failed to send SMS');
    }
    return;
  }

  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[auth] OTP for ${phoneNumber}: ${code}`);
  } else {
    console.warn(
      '[auth] SMS not configured (missing Twilio env). OTP not sent.'
    );
  }
}
