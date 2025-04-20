/*
curl -X POST "http://localhost:2004/.netlify/functions/correct-name" \ -H "Content-Type: application/json" \ -d '{"name": "ايه احمد ابراهيم على", "gender": "ذكر"}'
*/

// const OpenAI = require('openai');

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async (event, context) => {
  try {
    // const b = await event.json();
    // console.log(b);
    // return new Response('Done.');
    const { name, gender } = await event.json();

    if (!name || !gender) {
      return new Response(
        JSON.stringify({ error: 'Name/Gender not found.', }),
        { status: 400 }
      );
    }

    const prompt = `تحقق من صحة ودقة الاسم العربي ال${gender} التالي: "${name}". تأكد من أنه يتألف من أربعة أجزاء (الاسم الأول، اسم الأب، اسم الجد، اسم العائلة)، وأنه خالٍ من جميع الأخطاء الإملائية الشائعة وغير الشائعة، كأخطاء الهمزات، والتاء المربوطة مكان الهاء والعكس، والألف المكسورة مكان الياء والعكس، وغير ذلك. إذا كان الاسم صحيحًا، أعد {"is_valid":true,"is_full":true,"corrected_name":null}. إذا كان هناك خطأ، أعد {"is_valid":false,"is_full":<true|false>,"corrected_name":"<الاسم الصحيح>"}.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: "system", content: "You are a great Arabic proofreader for all linguistic errors." },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0,
    });

    const result = response.choices[0].message.content;
    console.log(result);

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(result);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'فشل في تحويل استجابة النموذج إلى JSON.',
          model_response: result
        }),
        { status: 500 }
      );

    }

    return new Response(
      jsonResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'حدث خطأ أثناء معالجة الطلب.' }),
      { status: 500 }
    );
  }
};