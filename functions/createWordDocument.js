const { Document, Paragraph, TextRun, HeadingLevel, Packer } = require('docx');

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { studentName, questionsList } = data;

    // إنشاء مستند جديد
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `اختبار الطالب: ${studentName ? `(${studentName})` : '(غير معين الاسم)'} - ${questionsList.length} من الأسئلة`,
            heading: HeadingLevel.HEADING_1
          }),
          ...questionsList.flatMap(question => [
            new Paragraph({
              children: [
                new TextRun({
                  text: `س${question.questionNumber} - سورة ${question.surahName} - آية ${question.ayahNumber}`,
                  bold: true
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun("قال تعالى: "),
                new TextRun({
                  text: `"${question.ayahText}"`,
                  italics: true
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `درجة س${question.questionNumber}:`,
                  bold: true
                }),
                new TextRun(" ")
              ]
            }),
            new Paragraph("") // سطر فارغ بين الأسئلة
          ])
        ],
      }],
    });

    // تحويل المستند إلى صيغة ArrayBuffer
    const buffer = await Packer.toBuffer(doc);

    // إنشاء اسم ملف آمن (فقط أحرف إنجليزية وأرقام)
    const safeFileName = 'test_' + Date.now() + '.docx';

    // إرجاع الملف كاستجابة بصيغة Base64
    return {
      statusCode: 200,
      body: buffer.toString('base64'),
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename=${safeFileName}`
      },
      isBase64Encoded: true
    };
  } catch (error) {
    return { statusCode: 500, body: `Internal Server Error: ${error}` };
  }
};