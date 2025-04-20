const { Document, Paragraph, TextRun, HeadingLevel, Packer } = require('docx');

// إضافة متغيرات التقديرات في بداية الملف
const grades = {
  EXCELLENT: { min: 90, label: 'ممتاز' },
  VERY_GOOD: { min: 80, label: 'جيد جدا' },
  GOOD: { min: 65, label: 'جيد' },
  PASS: { min: 50, label: 'مقبول' },
  WEAK: { min: 35, label: 'ضعيف' },
  VERY_WEAK: { min: 0, label: 'ضعيف جدا' }
};

// إضافة دالة حساب التقدير
function calculateGrade(score) {
  if (score >= grades.EXCELLENT.min) return grades.EXCELLENT.label;
  if (score >= grades.VERY_GOOD.min) return grades.VERY_GOOD.label;
  if (score >= grades.GOOD.min) return grades.GOOD.label;
  if (score >= grades.PASS.min) return grades.PASS.label;
  if (score >= grades.WEAK.min) return grades.WEAK.label;
  return grades.VERY_WEAK.label;
}

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const data = JSON.parse(event.body);
    const { metadata, questionsList } = data;
    const { studentName, totalScores, setScores, customizedQuestions } = metadata;

    // إنشاء مستند جديد
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // إنشاء عنوان الاختبار مع معلومات الدرجات إذا كانت مفعلة
          new Paragraph({
            text: `اختبار الطالب: ${studentName ? `(${studentName})` : '(غير معين الاسم)'} - ${questionsList.length} من الأسئلة${setScores ? ` - إجمالي الدرجات: ${totalScores}` : ''}`,
            heading: HeadingLevel.HEADING_1
          }),

          // إضافة الأسئلة مع درجاتها
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
            // إظهار درجة السؤال فقط إذا كان تعيين الدرجات مفعلاً
            ...(setScores ? [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `درجة السؤال: ${question.score}`,
                    bold: true
                  })
                ]
              })
            ] : []),
            new Paragraph("") // سطر فارغ بين الأسئلة
          ]),

          // إضافة ملخص الدرجات في نهاية المستند إذا كان تعيين الدرجات مفعلاً
          ...(setScores ? [
            new Paragraph(""),
            new Paragraph({
              children: [
                new TextRun({
                  text: "ملخص الدرجات",
                  bold: true,
                  underline: true
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `المجموع الكلي: ${questionsList.reduce((sum, q) => sum + (parseFloat(q.score) || 0), 0)} من ${totalScores}`
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `النسبة المئوية: ${((questionsList.reduce((sum, q) => sum + (parseFloat(q.score) || 0), 0) / totalScores) * 100).toFixed(1)}%`
                })
              ]
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `التقدير: ${calculateGrade((questionsList.reduce((sum, q) => sum + (parseFloat(q.score) || 0), 0) / totalScores) * 100)}`
                })
              ]
            })
          ] : [])
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
        'Content-Disposition': `attachment; filename=${safeFileName}`,
      },
      isBase64Encoded: true
    };
  } catch (error) {
    return { statusCode: 500, body: `Internal Server Error: ${error}` };
  }
};