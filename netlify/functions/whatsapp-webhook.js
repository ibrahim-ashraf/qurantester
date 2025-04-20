const VERIFY_TOKEN = 'MySecureVerifyToken123!';
const token = 'EAAjBpZCGTj3oBO2ampgSvjws04vcnYqaDjjRXFEZBW2MnyCaYiuMrdLmSBJU9vRlbYaVZA9DpiXXjPonBrnBy9gzel7MyaX5koT6AebQ3Ueh1nQwG0CR2w0X4dZBlQwFnCo0dxTTrcsMkjVWBXtlBRIPNYJnqmcIu38kZAbJnJgcQf3TXLI6YwZBPsZBNtZANHFfDAZDZD';
const phoneNumberId = '546948021838639';

exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    const params = event.queryStringParameters;
    const mode = params['hub.mode'];
    const token = params['hub.verify_token'];
    const challenge = params['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return {
        statusCode: 200,
        body: challenge,
      };
    } else {
      return {
        statusCode: 403,
        body: 'Forbidden',
      };
    }
  } else if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      console.log("📩 Webhook Received:", JSON.stringify(body, null, 2));

      // التأكد من وجود `entry` و `changes`
      if (!body.entry || !body.entry[0] || !body.entry[0].changes || !body.entry[0].changes[0].value) {
        console.warn("⚠️ لم يتم العثور على بيانات مناسبة في الطلب");
        return { statusCode: 400, body: 'Bad Request: Missing data' };
      }

      const value = body.entry[0].changes[0].value;

      // التحقق مما إذا كان الطلب يحتوي على بيانات رسالة من المستخدم
      if (value.messages && value.messages[0] && value.contacts && value.contacts[0]) {
        const recipientName = value.contacts[0].profile ? value.contacts[0].profile.name : 'ضيف';
        const recipientPhoneNumber = value.contacts[0].wa_id;
        const messageText = `مرحبا ${recipientName}!،\nهذه رسالة تجريبية من WhatsApp Cloud API!`;

        const url = `https://graph.facebook.com/v22.0/${phoneNumberId}/messages`;
        const payload = {
          messaging_product: 'whatsapp',
          to: recipientPhoneNumber,
          type: 'text',
          text: {
            body: messageText
          }
        };

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log('✅ تم إرسال الرسالة بنجاح:', data);
      } else if (value.statuses) {
        console.log("ℹ️ تم استلام تحديث لحالة الرسالة:", JSON.stringify(value.statuses, null, 2));
      } else {
        console.warn("⚠️ تم استلام نوع غير متوقع من الطلبات:", JSON.stringify(value, null, 2));
      }

      return { statusCode: 200, body: 'EVENT_RECEIVED' };

    } catch (error) {
      console.error('❌ حدث خطأ أثناء معالجة الطلب:', error);
      return { statusCode: 500, body: 'Internal Server Error' };
    }
  } else {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
};
