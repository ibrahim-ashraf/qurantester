// تعريف الأحداث المستخدمة؛ لإطلاقها برمجيا بعد ذلك
const changeEvent = new Event('change');
const clickEvent = new Event('click');
const inputEvent = new Event('input');

// تعريف النصوص الثابتة
const testDeleteConfirmMessage = 'سيتم حذف الاختبار الحالي إذا أنشأت واحدا جديدا. هل تريد المتابعة؟';
const testCreatedMessage = 'تم إنشاء الاختبار بنجاح!';
const questionsAddedMessage = 'تم إضافة الأسئلة بنجاح!';
const questionChangeButtonText = 'تغيير';
const questionDeleteButtonText = 'حذف';
const questionChangedMessage = 'تم تغيير السؤال بنجاح!';
const questionDeleteConfirmMessage = 'هل تريد حذف السؤال رقم #؟';
const questionDeletedMessage = 'تم حذف السؤال بنجاح!';
const testSettingsRestoredMessage = 'تم استعادة إعدادات الاختبار بنجاح!';
const noTestSettingsSavedMessage = 'لم يتم اختيار ملف إعدادات!';

// تعريف متغيرات بيانات القرآن الكريم وبيانات السور ودرجات الأسئلة
let quranData;
let surahsData;

// تعريف متغيرات مصفوفات أسماء السور وعدد آياتها ومتغير مصفوفة الأسئلة
let surahsFullNames = [];
let surahsNames = [];
let surahsAyahsNumbers = [];
let questionsList = [];

// الحصول على حقول تحديد السور ونطاقات الآيات واسم الطالب وعدد الأسئلة وإجمالي الدرجات وحاويات تخصيص الأسئلة
const fromSurahSelect = document.getElementById('from-surah-select');
const fromAyahStartInput = document.getElementById('from-ayah-start-input');
const toAyahStartInput = document.getElementById('to-ayah-start-input');
const switchSurahsButton = document.getElementById('switch-surahs-button');
const toSurahSelect = document.getElementById('to-surah-select');
const fromAyahEndInput = document.getElementById('from-ayah-end-input');
const toAyahEndInput = document.getElementById('to-ayah-end-input');
const studentNameInput = document.getElementById('student-name-input');
const questionsCountInput = document.getElementById('questions-count-input');
const setScoresContainer = document.getElementById('set-scores-container');
const totalScoresInput = document.getElementById('total-scores-input');
const scoresDivisionInfo = document.getElementById('scores-division-info');
const appendRemainingScoresToQuestion = document.getElementById('append-remaining-scores-to-question');
const remainingScoresInfo = document.getElementById('remaining-scores-info');
const questionNumberToAppend = document.getElementById('question-number-to-append');
const createTestButton = document.getElementById('create-test-button');
const saveTestAsWordButton = document.getElementById('save-test-as-word-button');
const addQuestionsButton = document.getElementById('add-questions-button');
const questionsTableBody = document.getElementById('questions-table-body');
const customizeQuestionsCheckbox = document.getElementById('customize-questions-checkbox');
const customizeQuestionsContainer = document.getElementById('customize-questions-container');
const customizeQuestionsFields = document.getElementById('customize-questions-fields');
const saveTestSettingsButton = document.getElementById('save-test-settings-button');
const restoreTestSettingsInput = document.getElementById('restore-test-settings-input');

// إضافة المتغيرات العامة في بداية الملف
let totalScoresIntDivision;
let remainingDivision;
const remainingScoresInfoText = 'من إجمالي # درجة على # أسئلة، سيتم تقسيم # درجة بالتساوي على جميع الأسئلة، وتبقى # درجة.';
const scoresDivisionInfoText = 'سيتم تقسيم # درجة على # أسئلة بالتساوي، بمعدل # درجة لكل سؤال.';

// إضافة متغيرات التقديرات
const grades = {
  EXCELLENT: { min: 90, label: 'ممتاز' },
  VERY_GOOD: { min: 80, label: 'جيد جدا' },
  GOOD: { min: 65, label: 'جيد' },
  PASS: { min: 50, label: 'مقبول' },
  WEAK: { min: 35, label: 'ضعيف' },
  VERY_WEAK: { min: 0, label: 'ضعيف جدا' }
};

// دالة لتحديث ظهور حاوية تخصيص الأسئلة بناءً على تحديد checkbox
function toggleCustomizeQuestionsContainer() {
  if (customizeQuestionsCheckbox.checked) {
    // إذا تم تحديد مربع الاختيار، نقوم بإنشاء حقول التخصيص
    createCustomizationFields();
    customizeQuestionsContainer.style.display = 'block';
  } else {
    // إذا لم يتم تحديده، نقوم بإخفاء الحاوية
    customizeQuestionsFields.innerHTML = '';
    customizeQuestionsContainer.style.display = 'none';
  }
}

function createCustomizationFields() {
  const questionsCount = parseInt(questionsCountInput.value);

  customizeQuestionsFields.innerHTML = '';

  for (let i = 0; i < questionsCount; i++) {
    const questionDiv = document.createElement('div');

    questionDiv.innerHTML = `
      <h4>السؤال ${i + 1}</h4>
      <label for="custom-from-surah-select-${i}">من سورة: </label>
      <select id="custom-from-surah-select-${i}"></select><br>
      <input type="number" id="custom-from-ayah-start-input-${i}" min="1" placeholder="من آية: "><br>
      <input type="number" id="custom-to-ayah-start-input-${i}" min="1" placeholder="إلى آية: "><br>
      <label for="custom-to-surah-select-${i}">إلى سورة: </label>
      <select id="custom-to-surah-select-${i}"></select><br>
      <input type="number" id="custom-from-ayah-end-input-${i}" min="1" placeholder="من آية: "><br>
      <input type="number" id="custom-to-ayah-end-input-${i}" min="1" placeholder="إلى آية: "><br>
    `;

    customizeQuestionsFields.appendChild(questionDiv);

    // الحصول على حقول تخصيص الأسئلة لسهولة التعامل معها
    const customFromSurahSelect = document.getElementById(`custom-from-surah-select-${i}`);
    const customFromAyahStartInput = document.getElementById(`custom-from-ayah-start-input-${i}`);
    const customToAyahStartInput = document.getElementById(`custom-to-ayah-start-input-${i}`);
    const customToSurahSelect = document.getElementById(`custom-to-surah-select-${i}`);
    const customFromAyahEndInput = document.getElementById(`custom-from-ayah-end-input-${i}`);
    const customToAyahEndInput = document.getElementById(`custom-to-ayah-end-input-${i}`);

    // إضافة خيارات السور لكل حقل جديد
    populateSurahOptions(customFromSurahSelect, customToSurahSelect);

    // تعيين سور البداية والنهاية مثل الحقول العامة
    customFromSurahSelect.value = fromSurahSelect.value;
    customToSurahSelect.value = toSurahSelect.value;

    // استدعاء دالة تعيين النطاق الافتراضي للآيات مرتين؛ لتعيين نطاق سورة البداية ونطاق سورة النهاية
    setAyahRange(customFromSurahSelect, customFromAyahStartInput, customToAyahStartInput);
    setAyahRange(customToSurahSelect, customFromAyahEndInput, customToAyahEndInput);

    // إضافة مستمعات الأحداث لكل حقول جديدة
    customFromSurahSelect.addEventListener('change', event => {
      validateSurahSelection(event);
      setSelectedSurahRange(event);
    });
    customFromAyahStartInput.addEventListener('input', validateNumericInput);
    customToAyahStartInput.addEventListener('input', validateNumericInput);
    customToSurahSelect.addEventListener('change', event => {
      validateSurahSelection(event);
      setSelectedSurahRange(event);
    });
    customFromAyahEndInput.addEventListener('input', validateNumericInput);
    customToAyahEndInput.addEventListener('input', validateNumericInput);
  }
}

// قراءة بيانات القرآن الكريم من ملف JSON
fetch('quran.json')
  .then(response => response.json())
  .then(data => {
    quranData = data;
  })
  .catch(error => console.error('Error loading Quran data:', error));

// قراءة بيانات السور من ملف JSON
fetch('surahs_data.json')
  .then(response => response.json())
  .then(data => {
    surahsData = data;

    initializeSurahData();
    populateSurahOptions(fromSurahSelect, toSurahSelect);
    setSurahsDefaultRanges();
  })
  .catch(error => console.error('Error loading surahs data:', error));

// دالة لتهيئة بيانات السور
function initializeSurahData() {
  surahsFullNames = Object.keys(surahsData);
  surahsNames = surahsFullNames.map(surahFullName => surahFullName.split(' ').slice(2).join(' '));
  surahsAyahsNumbers = Object.values(surahsData);
}

// دالة لإضافة خيارات السور إلى قوائم الاختيار
function populateSurahOptions(fromSurahSelect, toSurahSelect) {
  surahsFullNames.forEach((surahFullName, index) => {
    const option = new Option(surahFullName, index + 1);
    fromSurahSelect.add(option);
    toSurahSelect.add(option.cloneNode(true));
  });

  // تعيين القيم الافتراضية لنطاق السور
  fromSurahSelect.value = '1';
  toSurahSelect.value = '114';
}

// دالة لتعيين النطاقات الافتراضية للسور
function setSurahsDefaultRanges() {
  setAyahRange(fromSurahSelect, fromAyahStartInput, toAyahStartInput);
  setAyahRange(toSurahSelect, fromAyahEndInput, toAyahEndInput);
}

// دالة لتعيين نطاق الآيات الافتراضي بناءً على السورة المحددة
function setAyahRange(surahSelect, fromAyah, toAyah) {
  const surahIndex = surahSelect.value - 1;
  const ayahsCount = surahsAyahsNumbers[surahIndex];

  fromAyah.value = 1;
  toAyah.value = ayahsCount;
  toAyah.max = ayahsCount;
}

// دالة لتحديث نطاق الآيات بناءً على تغيير السورة
function setSelectedSurahRange(event) {
  const surahSelect = event.target;

  // تقسيم معرف حقل تحديد السورة إلى أجزاء
  const surahSelectIdParts = surahSelect.id.split('-');

  // التحقق إذا كان الحقل ديناميكيا
  const questionIndex = surahSelectIdParts.length === 5 ? surahSelectIdParts[4] : null;

  // إذا كان الحقل ديناميكيا، قم بالحصول على الحقول المرتبطة به وتعيينها حسب نوع حقل تحديد السورة
  if (questionIndex) {
    const fromAyahStartInput = document.getElementById(`custom-from-ayah-start-input-${questionIndex}`);
    const toAyahStartInput = document.getElementById(`custom-to-ayah-start-input-${questionIndex}`);
    const fromAyahEndInput = document.getElementById(`custom-from-ayah-end-input-${questionIndex}`);
    const toAyahEndInput = document.getElementById(`custom-to-ayah-end-input-${questionIndex}`);

    if (surahSelect.id === `custom-from-surah-select-${questionIndex}`) {
      setAyahRange(surahSelect, fromAyahStartInput, toAyahStartInput);
    } else if (surahSelect.id === `custom-to-surah-select-${questionIndex}`) {
      setAyahRange(surahSelect, fromAyahEndInput, toAyahEndInput);
    }
  } else {
    // إذا لم يكن الحقل ديناميكيا، تعامل معه كحقل عام
    if (surahSelect.id === 'from-surah-select') {
      setAyahRange(surahSelect, fromAyahStartInput, toAyahStartInput);
    } else if (surahSelect.id === 'to-surah-select') {
      setAyahRange(surahSelect, fromAyahEndInput, toAyahEndInput);
    }
  }
}

// دالة للتحقق من صحة اختيار السور
function validateSurahSelection(event) {
  // الحصول على القائمة الحالية لتحديد السورة
  const surahSelect = event.target;

  // تعريف متغير الحقل الآخر لتحديد السورة
  let otherSurahSelect;

  // تقسيم معرف حقل تحديد السورة إلى أجزاء
  const surahSelectIdParts = surahSelect.id.split('-');

  // التحقق إذا كان الحقل ديناميكيا
  const questionIndex = surahSelectIdParts.length === 5 ? surahSelectIdParts[4] : null;

  // إذا كان الحقل الحالي لتحديد السورة ديناميكيا، قم بالحصول على الحقل الآخر
  if (questionIndex) {
    if (surahSelect.id === `custom-from-surah-select-${questionIndex}`) {
      otherSurahSelect = document.getElementById(`custom-to-surah-select-${questionIndex}`);
      surahSelect.value = parseInt(surahSelect.value) < parseInt(fromSurahSelect.value) ? surahSelect.value = fromSurahSelect.value : surahSelect.value = surahSelect.value;
    } else {
      otherSurahSelect = document.getElementById(`custom-from-surah-select-${questionIndex}`);
      surahSelect.value = parseInt(surahSelect.value) > parseInt(toSurahSelect.value) ? surahSelect.value = toSurahSelect.value : surahSelect.value = surahSelect.value;
    }
  } else {
    otherSurahSelect = (surahSelect.id === fromSurahSelect.id) ? toSurahSelect : fromSurahSelect;
  }

  // الحصول على قيمة الخيار المحدد من القائمة الحالية والقائمة الأخرى لتحديد السورة
  const surahSelectValue = parseInt(surahSelect.value);
  const otherSurahSelectValue = parseInt(otherSurahSelect.value);

  // التحقق من القيم وتعيين القيمة الصالحة
  if ((surahSelect.id.includes('from-surah-select') && surahSelectValue > otherSurahSelectValue) ||
    (surahSelect.id.includes('to-surah-select') && surahSelectValue < otherSurahSelectValue)) {
    surahSelect.value = otherSurahSelectValue;
  }
}

// دالة للتحقق من إدخال القيم الرقمية
function validateNumericInput(event) {
  event.target.value = event.target.value.replace(/[^0-9]/g, '').replace(/^0+/, '');
}

// دالة لتبديل حاوية تعيين الدرجات بناءً على حالة مربع التحديد
function toggleSetScoresContainer(event) {
  const showScores = event.target.checked;
  setScoresContainer.style.display = showScores ? 'block' : 'none';

  // تحديث خاصية الجدول
  const table = document.querySelector('table');
  table.setAttribute('data-scores', showScores);

  // إظهار/إخفاء عمود الدرجة وملخص الدرجات
  const scoreColumns = document.querySelectorAll('.score-column');
  scoreColumns.forEach(col => col.style.display = showScores ? '' : 'none');

  // إعادة عرض الجدول لتحديث الصفوف
  if (questionsList.length > 0) {
    displayQuestions();
  }
}

function calculateScores() {
  remainingScoresInfo.textContent = '';
  appendRemainingScoresToQuestion.style.display = 'none';
  scoresDivisionInfo.textContent = '';
  scoresDivisionInfo.style.display = 'none';

  const questionsCount = parseInt(questionsCountInput.value, 10);
  const totalScores = parseFloat(totalScoresInput.value);

  if (!questionsCount || !totalScores || totalScores < 0) {
    return;
  }

  const scorePerQuestion = totalScores / questionsCount;

  // إذا كان الناتج رقماً صحيحاً
  if (Number.isInteger(scorePerQuestion)) {
    // تعيين نفس الدرجة لكل الأسئلة
    questionsList.forEach(question => {
      question.score = scorePerQuestion;
    });

    scoresDivisionInfo.textContent = scoresDivisionInfoText
      .replace('#', totalScores)
      .replace('#', questionsCount)
      .replace('#', scorePerQuestion);
    scoresDivisionInfo.style.display = 'block';
  } else {
    // توزيع الدرجات بشكل متساوٍ مع التقريب
    const baseScore = Math.floor(scorePerQuestion);
    const remaining = totalScores - (baseScore * questionsCount);
    const extraScore = Math.round((remaining / questionsCount) * 10) / 10;

    questionsList.forEach(question => {
      question.score = baseScore + extraScore;
    });

    remainingScoresInfo.textContent = remainingScoresInfoText
      .replace('#', totalScores)
      .replace('#', questionsCount)
      .replace('#', baseScore * questionsCount)
      .replace('#', remaining.toFixed(1));

    appendRemainingScoresToQuestion.style.display = 'block';
  }

  displayQuestions();
}

function distributeScoresEqually(totalScores, questionsCount) {
  const baseScore = Math.floor(totalScores / questionsCount);
  const remaining = totalScores - (baseScore * questionsCount);

  // توزيع الدرجة الأساسية على جميع الأسئلة
  questionsList.forEach(question => {
    question.score = baseScore;
  });

  // توزيع الدرجات المتبقية على الأسئلة الأولى
  for (let i = 0; i < remaining && i < questionsList.length; i++) {
    questionsList[i].score++;
  }

  displayQuestions();
}

// دالة لتفعيل أو تعطيل زر إنشاء الاختبار بناءً على إدخال عدد الأسئلة
function toggleCreateTestButton() {
  createTestButton.disabled = questionsCountInput.value === '';
}

// تعديل دالة validateTestInputs
function validateTestInputs() {
  if (!questionsCountInput.value) {
    alert('يجب إدخال عدد الأسئلة');
    questionsCountInput.focus();
    return false;
  }

  if (!studentNameInput.value.trim()) {
    alert('يجب إدخال اسم الطالب');
    studentNameInput.focus();
    return false;
  }

  return true;
}

function createTest(event) {
  event.preventDefault();

  if (!validateTestInputs()) {
    return;
  }

  const mode = event.target.id === addQuestionsButton.id ? 'add' : 'create';

  if (mode === 'create' && questionsList.length > 0) {
    if (!confirm(testDeleteConfirmMessage)) {
      return;
    }
    questionsList = [];
    questionsTableBody.innerHTML = '';
  }

  const questionsCountValue = parseInt(questionsCountInput.value);

  // إنشاء الأسئلة
  const newQuestions = [];
  for (let i = 0; i < questionsCountValue; i++) {
    const question = customizeQuestionsCheckbox.checked ?
      createCustomQuestion(i) :
      createDefaultQuestion(i);

    // تعيين درجة السؤال على 0 مبدئياً
    question.score = 0;
    newQuestions.push(question);
  }

  if (mode === 'add') {
    questionsList.push(...newQuestions);
  } else {
    questionsList = newQuestions;
  }

  displayQuestions();
  alert(mode === 'create' ? testCreatedMessage : questionsAddedMessage);
  saveTestAsWordButton.disabled = false;
}

function createDefaultQuestion(index) {
  const fromSurahValue = parseInt(fromSurahSelect.value);
  const fromAyahStartValue = parseInt(fromAyahStartInput.value);
  const toAyahStartValue = parseInt(toAyahStartInput.value);
  const toSurahValue = parseInt(toSurahSelect.value);
  const fromAyahEndValue = parseInt(fromAyahEndInput.value);
  const toAyahEndValue = parseInt(toAyahEndInput.value);

  return createQuestion(
    fromSurahValue,
    fromAyahStartValue,
    toAyahStartValue,
    toSurahValue,
    fromAyahEndValue,
    toAyahEndValue,
    index
  );
}

function createCustomQuestion(index) {
  const fromSurahValue = parseInt(document.getElementById(`custom-from-surah-select-${index}`).value);
  const fromAyahStartValue = parseInt(document.getElementById(`custom-from-ayah-start-input-${index}`).value);
  const toAyahStartValue = parseInt(document.getElementById(`custom-to-ayah-start-input-${index}`).value);
  const toSurahValue = parseInt(document.getElementById(`custom-to-surah-select-${index}`).value);
  const fromAyahEndValue = parseInt(document.getElementById(`custom-from-ayah-end-input-${index}`).value);
  const toAyahEndValue = parseInt(document.getElementById(`custom-to-ayah-end-input-${index}`).value);

  return createQuestion(
    fromSurahValue,
    fromAyahStartValue,
    toAyahStartValue,
    toSurahValue,
    fromAyahEndValue,
    toAyahEndValue,
    index
  );
}

function setEmptyAyahsRangesFields(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue) {
  // الحصول على عدد آيات السور المحددة
  const fromSurahAyahsCount = surahsAyahsNumbers[fromSurahValue - 1];
  const toSurahAyahsCount = surahsAyahsNumbers[toSurahValue - 1];

  // التحقق من القيم وتعيين القيم الافتراضية إذا كانت غير صالحة
  const finalFromAyahStart = isNaN(fromAyahStartValue) ? 1 : Math.min(Math.max(1, fromAyahStartValue), fromSurahAyahsCount);
  const finalToAyahStart = isNaN(toAyahStartValue) ? fromSurahAyahsCount : Math.min(Math.max(finalFromAyahStart, toAyahStartValue), fromSurahAyahsCount);
  const finalFromAyahEnd = isNaN(fromAyahEndValue) ? 1 : Math.min(Math.max(1, fromAyahEndValue), toSurahAyahsCount);
  const finalToAyahEnd = isNaN(toAyahEndValue) ? toSurahAyahsCount : Math.min(Math.max(finalFromAyahEnd, toAyahEndValue), toSurahAyahsCount);

  return [finalFromAyahStart, finalToAyahStart, finalFromAyahEnd, finalToAyahEnd];
}

function createQuestion(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue, index = null) {
  // تعيين النطاقات الصحيحة للآيات
  const [validFromAyahStart, validToAyahStart, validFromAyahEnd, validToAyahEnd] =
    setEmptyAyahsRangesFields(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue);

  const randomSurahNumber = getRandomNumber(fromSurahValue, toSurahValue);
  const randomAyahNumber = getRandomAyahNumber(
    randomSurahNumber,
    fromSurahValue,
    validFromAyahStart,
    validToAyahStart,
    toSurahValue,
    validFromAyahEnd,
    validToAyahEnd
  );

  const ayahText = getAyahText(randomSurahNumber, randomAyahNumber);

  return {
    questionNumber: (index !== null ? index : questionsList.length) + 1,
    surahNumber: randomSurahNumber,
    surahName: surahsNames[randomSurahNumber - 1],
    ayahNumber: randomAyahNumber,
    ayahText: ayahText,
    score: 0
  };
}

// دالة للحصول على رقم سورة عشوائي
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// دالة للحصول على رقم آية عشوائي ضمن نطاق محدد
function getRandomAyahNumber(randomSurahNumber, fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue) {
  let start, end;
  if (randomSurahNumber === fromSurahValue) {
    start = fromAyahStartValue;
    end = toAyahStartValue;
  } else if (randomSurahNumber === toSurahValue) {
    start = fromAyahEndValue;
    end = toAyahEndValue;
  } else {
    start = 1;
    end = surahsAyahsNumbers[randomSurahNumber - 1];
  }
  return getRandomNumber(start, end);
}

// دالة للحصول على نص آية محددة
function getAyahText(surahNumber, ayahNumber) {
  const ayah = quranData.find(aya => aya.sura_no === surahNumber && aya.aya_no === ayahNumber);
  return ayah ? ayah.aya_text_emlaey : '';
}

// إضافة دالة حساب التقدير
function calculateGrade(score) {
  if (score >= grades.EXCELLENT.min) return grades.EXCELLENT.label;
  if (score >= grades.VERY_GOOD.min) return grades.VERY_GOOD.label;
  if (score >= grades.GOOD.min) return grades.GOOD.label;
  if (score >= grades.PASS.min) return grades.PASS.label;
  if (score >= grades.WEAK.min) return grades.WEAK.label;
  return grades.VERY_WEAK.label;
}

// تعديل دالة displayQuestions
function displayQuestions() {
  const questionsSection = document.getElementById('questions-section');
  const showScores = document.getElementById('set-scores-checkbox').checked;
  questionsTableBody.innerHTML = '';
  document.getElementById('scores-summary')?.remove();

  if (questionsList.length === 0) {
    questionsSection.style.display = 'none';
    addQuestionsButton.style.display = 'none';
    return;
  }

  questionsSection.style.display = 'block';

  if (showScores) {
    const scoresSummary = document.createElement('div');
    scoresSummary.id = 'scores-summary';
    let totalScore = 0;
    const totalPossibleScore = parseFloat(totalScoresInput.value);

    if (!totalPossibleScore) {
      scoresSummary.innerHTML = `
        <div class="scores-info">
          <p>يجب تعيين إجمالي الدرجات أولاً</p>
        </div>
      `;
    } else {
      // حساب مجموع الدرجات من القيم المدخلة
      questionsList.forEach(question => {
        totalScore += parseFloat(question.score || 0);
      });

      const percentage = ((totalScore / totalPossibleScore) * 100).toFixed(1);
      const grade = calculateGrade(percentage);

      scoresSummary.innerHTML = `
        <div class="scores-info">
          <p>مجموع الدرجات: ${totalScore} من ${totalPossibleScore}</p>
          <p>النسبة المئوية: ${percentage}%</p>
          <p>التقدير: ${grade}</p>
        </div>
      `;
    }

    const tableContainer = document.querySelector('table').parentElement;
    tableContainer.insertBefore(scoresSummary, tableContainer.firstChild);
  }

  questionsList.forEach((question, index) => {
    const maxScore = parseFloat(totalScoresInput.value) / questionsList.length;
    const scoreInput = showScores ? `
      <td>
        <input type="number" 
               value="${question.score || ''}"
               min="0" 
               max="${maxScore}"
               step="0.25"
               style="width: 60px;"
               onchange="updateQuestionScore(${index}, this.value)"
               placeholder="0"
               >/${maxScore}
      </td>
    ` : '';

    const HTMLTableRow = `
    <tr>
      <td>${index + 1}</td>
      <td>${question.surahName}</td>
      <td>${question.ayahNumber}</td>
      <td>${question.ayahText}</td>
      ${scoreInput}
      <td><button onclick="changeQuestion(${index})">${questionChangeButtonText}</button></td>
      <td><button onclick="deleteQuestion(${index})">${questionDeleteButtonText}</button></td>
    </tr>
    `;
    questionsTableBody.innerHTML += HTMLTableRow;

    // تعيين قيمة الدرجة إذا كانت موجودة
    if (showScores && question.score) {
      const input = questionsTableBody.rows[index].querySelector('input[type="number"]');
      input.value = question.score;
    }
  });

  addQuestionsButton.style.display = 'block';
}

// تعديل دالة updateQuestionScore لتأخذ في الاعتبار الدرجة القصوى للسؤال
function updateQuestionScore(questionIndex, newScore) {
  newScore = newScore === '' ? 0 : parseFloat(newScore);
  const maxScore = parseFloat(totalScoresInput.value) / questionsList.length;

  // التحقق من حدود الدرجة
  if (newScore > maxScore) {
    newScore = maxScore;
  } else if (newScore < 0) {
    newScore = 0;
  }

  // تحديث درجة السؤال
  questionsList[questionIndex].score = newScore;
  alert(`تم تحديث درجة السؤال ${questionIndex + 1} إلى ${newScore}`);

  // إعادة عرض الجدول لتحديث القيم
  displayQuestions();
}

function changeQuestion(questionIndex) {
  let question = questionsList[questionIndex];

  let fromSurahValue;
  let fromAyahStartValue;
  let toAyahStartValue;
  let toSurahValue;
  let fromAyahEndValue;
  let toAyahEndValue;

  if (customizeQuestionsCheckbox.checked) {
    fromSurahValue = parseInt(document.getElementById(`custom-from-surah-select-${questionIndex}`).value);
    fromAyahStartValue = parseInt(document.getElementById(`custom-from-ayah-start-input-${questionIndex}`).value);
    toAyahStartValue = parseInt(document.getElementById(`custom-to-ayah-start-input-${questionIndex}`).value);
    toSurahValue = parseInt(document.getElementById(`custom-to-surah-select-${questionIndex}`).value);
    fromAyahEndValue = parseInt(document.getElementById(`custom-from-ayah-end-input-${questionIndex}`).value);
    toAyahEndValue = parseInt(document.getElementById(`custom-to-ayah-end-input-${questionIndex}`).value);
  } else {
    fromSurahValue = parseInt(fromSurahSelect.value);
    fromAyahStartValue = parseInt(fromAyahStartInput.value);
    toAyahStartValue = parseInt(toAyahStartInput.value);
    toSurahValue = parseInt(toSurahSelect.value);
    fromAyahEndValue = parseInt(fromAyahEndInput.value);
    toAyahEndValue = parseInt(toAyahEndInput.value);
  }

  question = createQuestion(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue);
  question.questionNumber = questionIndex;
  questionsList[questionIndex] = question;

  displayQuestions();

  alert(questionChangedMessage);
}

function deleteQuestion(questionIndex) {
  questionDeleteConfirm = confirm(questionDeleteConfirmMessage.replace('#', questionIndex + 1));

  if (!questionDeleteConfirm) {
    return;
  }

  questionsList.splice(questionIndex, 1);
  displayQuestions();

  alert(questionDeletedMessage);
}

async function saveTestAsWord() {
  const studentName = studentNameInput.value;

  const data = {
    metadata: {
      studentName,
      totalScores: parseFloat(totalScoresInput.value) || questionsList.length,
      setScores: document.getElementById('set-scores-checkbox').checked,
      customizedQuestions: customizeQuestionsCheckbox.checked
    },
    questionsList
  };

  try {
    const response = await fetch('/.netlify/functions/createWordDocument', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;

    a.download = `${studentName || formatDateTime()}.docx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error;
  }
}

function formatDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');

  const formattedDateTime = `${year}-${month}-${day}_${hour}-${minute}-${second}`;

  return formattedDateTime;
}

function saveTestSettings(event) {
  const settings = {
    fromSurahValue: parseInt(fromSurahSelect.value),
    fromAyahStartValue: parseInt(fromAyahStartInput.value),
    toAyahStartValue: parseInt(toAyahStartInput.value),
    toSurahValue: parseInt(toSurahSelect.value),
    fromAyahEndValue: parseInt(fromAyahEndInput.value),
    toAyahEndValue: parseInt(toAyahEndInput.value),
    studentNameValue: studentNameInput.value,
    questionsCountValue: parseInt(questionsCountInput.value),
    customizeQuestions: customizeQuestionsCheckbox.checked,
    questionsRanges: [],
    setScores: document.getElementById('set-scores-checkbox').checked,
    totalScores: parseFloat(totalScoresInput.value) || 0,
    questionsList: questionsList || []
  };

  if (settings.customizeQuestions) {
    for (let i = 0; i < settings.questionsCountValue; i++) {
      const questionRange = {
        fromSurahValue: parseInt(document.getElementById(`custom-from-surah-select-${i}`).value),
        fromAyahStartValue: parseInt(document.getElementById(`custom-from-ayah-start-input-${i}`).value),
        toAyahStartValue: parseInt(document.getElementById(`custom-to-ayah-start-input-${i}`).value),
        toSurahValue: parseInt(document.getElementById(`custom-to-surah-select-${i}`).value),
        fromAyahEndValue: parseInt(document.getElementById(`custom-from-ayah-end-input-${i}`).value),
        toAyahEndValue: parseInt(document.getElementById(`custom-to-ayah-end-input-${i}`).value),
      };
      settings.questionsRanges.push(questionRange);
    }
  }

  const settingsJSON = JSON.stringify(settings, null, 2);

  const blob = new Blob([settingsJSON], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = "data.json";
  a.click();

  URL.revokeObjectURL(url);
}

function restoreTestSettings(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = loadJSONSettings;
    reader.readAsText(file);

    function loadJSONSettings(event) {
      const settings = JSON.parse(event.target.result);
      fromSurahSelect.value = settings.fromSurahValue;
      fromAyahStartInput.value = settings.fromAyahStartValue;
      toAyahStartInput.value = settings.toAyahStartValue;
      toSurahSelect.value = settings.toSurahValue;
      fromAyahEndInput.value = settings.fromAyahEndValue;
      toAyahEndInput.value = settings.toAyahEndValue;
      studentNameInput.value = settings.studentNameValue;
      questionsCountInput.value = settings.questionsCountValue;
      customizeQuestionsCheckbox.checked = settings.customizeQuestions;

      fromSurahSelect.dispatchEvent(changeEvent);
      fromAyahStartInput.dispatchEvent(inputEvent);
      toAyahStartInput.dispatchEvent(inputEvent);
      toSurahSelect.dispatchEvent(changeEvent);
      fromAyahEndInput.dispatchEvent(inputEvent);
      toAyahEndInput.dispatchEvent(inputEvent);
      questionsCountInput.dispatchEvent(inputEvent);

      document.getElementById('set-scores-checkbox').checked = settings.setScores;
      document.getElementById('set-scores-checkbox').dispatchEvent(changeEvent);

      if (settings.setScores) {
        totalScoresInput.value = settings.totalScores;
        calculateScores();
      }

      if (settings.questionsList && settings.questionsList.length > 0) {
        questionsList = settings.questionsList;
        displayQuestions();
        saveTestAsWordButton.disabled = false;
      }

      if (settings.customizeQuestions) {
        customizeQuestionsCheckbox.dispatchEvent(changeEvent);

        for (let i = 0; i < settings.questionsCountValue; i++) {
          document.getElementById(`custom-from-surah-select-${i}`).value = settings.questionsRanges[i].fromSurahValue;
          document.getElementById(`custom-from-ayah-start-input-${i}`).value = settings.questionsRanges[i].fromAyahStartValue;
          document.getElementById(`custom-to-ayah-start-input-${i}`).value = settings.questionsRanges[i].toAyahStartValue;
          document.getElementById(`custom-to-surah-select-${i}`).value = settings.questionsRanges[i].toSurahValue;
          document.getElementById(`custom-from-ayah-end-input-${i}`).value = settings.questionsRanges[i].fromAyahEndValue;
          document.getElementById(`custom-to-ayah-end-input-${i}`).value = settings.questionsRanges[i].toAyahEndValue;
        }
      }
    }
    alert(testSettingsRestoredMessage);
  } else {
    alert(noTestSettingsSavedMessage);
  }
}

function submitForm(data, databaseCollectionName, adminEmail, userEmail) {
  const metadata = {
    databaseCollectionName,
    'g-recaptcha-response': data['g-recaptcha-response']
  };

  delete data['g-recaptcha-response'];

  const userData = {
    timestamp: new Date().toISOString(),
    ...data
  };

  const allData = {
    metadata,
    userData,
    adminEmail
  };

  if (data.email) {
    allData.userEmail = userEmail;
  }

  return fetch('/.netlify/functions/submit', {
    method: 'POST',
    body: JSON.stringify(allData),
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('server');
      }
      return response.json();
    })
    .then(result => {
      return { success: true, message: result.message };
    })
    .catch(error => {
      throw error;
    });
}

// إضافة مستمعات الأحداث
fromSurahSelect.addEventListener('change', event => {
  validateSurahSelection(event);
  setSelectedSurahRange(event);
});

fromAyahStartInput.addEventListener('input', validateNumericInput);
toAyahStartInput.addEventListener('input', validateNumericInput);
toSurahSelect.addEventListener('change', event => {
  validateSurahSelection(event);
  setSelectedSurahRange(event);
});

fromAyahEndInput.addEventListener('input', validateNumericInput);
toAyahEndInput.addEventListener('input', validateNumericInput);
questionsCountInput.addEventListener('input', event => {
  validateNumericInput(event);
  toggleCreateTestButton();

  if (document.getElementById('set-scores-checkbox').checked) {
    calculateScores();
  }
});
document.getElementById('set-scores-checkbox').addEventListener('change', toggleSetScoresContainer);
totalScoresInput.addEventListener('input', event => {
  calculateScores();
  toggleCreateTestButton();
});
customizeQuestionsCheckbox.addEventListener('change', toggleCustomizeQuestionsContainer);
createTestButton.addEventListener('click', createTest);
addQuestionsButton.addEventListener('click', createTest);
saveTestSettingsButton.addEventListener('click', saveTestSettings);
restoreTestSettingsInput.addEventListener('change', restoreTestSettings);
document.getElementById('apply-scores').addEventListener('click', () => {
  const questionNumber = parseInt(questionNumberToAppend.value);
  if (questionNumber && questionNumber <= questionsList.length) {
    distributeScoresEqually(parseFloat(totalScoresInput.value), questionsList.length);
    const remaining = parseFloat(totalScoresInput.value) % questionsList.length;
    questionsList[questionNumber - 1].score += remaining;
    displayQuestions();
  }
});