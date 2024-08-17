// تعريف الأحداث المستخدمة؛ لإطلاقها برمجيا بعد ذلك
const changeEvent = new Event('change');
const clickEvent = new Event('click');
const inputEvent = new Event('input');

// تعريف متغيرات بيانات القرآن الكريم وبيانات السور
let quranData;
let surahsData;

// تعريف متغيرات مصفوفات أسماء السور وعدد آياتها ومتغير مصفوفة الأسئلة
let surahsFullNames = [];
let surahsNames = [];
let surahsAyahsNumbers = [];
let questionsList = [];

// الحصول على حقول تحديد السور ونطاقات الآيات وعدد الأسئلة وحاويات تخصيص الأسئلة
const fromSurahSelect = document.getElementById('from-surah-select');
const fromAyahStartInput = document.getElementById('from-ayah-start-input');
const toAyahStartInput = document.getElementById('to-ayah-start-input');
const switchSurahsButton = document.getElementById('switch-surahs-button');
const toSurahSelect = document.getElementById('to-surah-select');
const fromAyahEndInput = document.getElementById('from-ayah-end-input');
const toAyahEndInput = document.getElementById('to-ayah-end-input');
const studentNameInput = document.getElementById('student-name-input');
const questionsCountInput = document.getElementById('questions-count-input');
const createTestButton = document.getElementById('create-test-button');
const saveTestAsWordButton = document.getElementById('save-test-as-word-button');
const addQuestionsButton = document.getElementById('add-questions-button');
const questionsTableBody = document.getElementById('questions-table-body');
const customizeQuestionsCheckbox = document.getElementById('customize-questions-checkbox');
const customizeQuestionsContainer = document.getElementById('customize-questions-container');
const customizeQuestionsFields = document.getElementById('customize-questions-fields');
const saveTestSettingsButton = document.getElementById('save-test-settings-button');
const restoreTestSettingsButton = document.getElementById('restore-test-settings-button');

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

  customizeQuestionsFields.innerHTML = ''; // مسح المحتوى السابق

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

// دالة لتفعيل أو تعطيل زر إنشاء الاختبار بناءً على إدخال عدد الأسئلة
function toggleCreateTestButton() {
  createTestButton.disabled = questionsCountInput.value === '';
}

// دالة لإنشاء الاختبار
function createTest(event) {
  event.preventDefault();

  // تعريف الإنشاء/الإضافة (افتراضي على "إنشاء")
  let mode = 'create';

  if (event.target.id === addQuestionsButton.id) {
    mode = 'add';
  }

  if (mode === 'create' && questionsList.length > 0) {
    testDeleteConfirm = confirm(testDeleteConfirmMessage);

    if (testDeleteConfirm) {
      questionsList = [];
      questionsTableBody.innerHTML = '';
    } else {
      return;
    }
  }

  const questionsCountValue = parseInt(questionsCountInput.value);

  if (customizeQuestionsCheckbox.checked) {
    for (let i = 0; i < questionsCountValue; i++) {
      const customFromSurahValue = parseInt(document.getElementById(`custom-from-surah-select-${i}`).value);
      const customFromAyahStartValue = parseInt(document.getElementById(`custom-from-ayah-start-input-${i}`).value);
      const customToAyahStartValue = parseInt(document.getElementById(`custom-to-ayah-start-input-${i}`).value);
      const customToSurahValue = parseInt(document.getElementById(`custom-to-surah-select-${i}`).value);
      const customFromAyahEndValue = parseInt(document.getElementById(`custom-from-ayah-end-input-${i}`).value);
      const customToAyahEndValue = parseInt(document.getElementById(`custom-to-ayah-end-input-${i}`).value);

      const question = createQuestion(customFromSurahValue, customFromAyahStartValue, customToAyahStartValue, customToSurahValue, customFromAyahEndValue, customToAyahEndValue, i);

      questionsList.push(question);
    }
  } else {
    const fromSurahValue = parseInt(fromSurahSelect.value);
    const fromAyahStartValue = parseInt(fromAyahStartInput.value);
    const toAyahStartValue = parseInt(toAyahStartInput.value);
    const toSurahValue = parseInt(toSurahSelect.value);
    const fromAyahEndValue = parseInt(fromAyahEndInput.value);
    const toAyahEndValue = parseInt(toAyahEndInput.value);

    for (let i = 0; i < questionsCountValue; i++) {
      const question = createQuestion(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue);

      questionsList.push(question);
    }
  }

  displayQuestions();

  // عرض رسالة نجاح
  if (mode === 'create') {
    alert(testCreatedMessage);
  } else {
    alert(questionsAddedMessage);
    mode = 'create';
  }

  saveTestAsWordButton.disabled = false;
}

function createQuestion(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue, i = null) {
  if (i === 0 || i) {
    [fromAyahStartValue, toAyahStartValue, fromAyahEndValue, toAyahEndValue] = setEmptyAyahsRangesFields(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue, i);
  }

  const randomSurahNumber = getRandomNumber(fromSurahValue, toSurahValue);
  const randomAyahNumber = getRandomAyahNumber(randomSurahNumber, fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue);
  const ayahText = getAyahText(randomSurahNumber, randomAyahNumber);

  const question = {
    questionNumber: questionsList.length + 1,
    surahNumber: randomSurahNumber,
    surahName: surahsNames[randomSurahNumber - 1],
    ayahNumber: randomAyahNumber,
    ayahText: ayahText
  };

  return question;
}

function setEmptyAyahsRangesFields(fromSurahValue, fromAyahStartValue, toAyahStartValue, toSurahValue, fromAyahEndValue, toAyahEndValue, questionIndex = null) {
  // الحصول على عدد آيات السور المحددة
  const fromSurahAyahsCount = surahsAyahsNumbers[fromSurahValue - 1];
  const toSurahAyahsCount = surahsAyahsNumbers[toSurahValue - 1];

  // التحقق إذا كانت الحقول ديناميكية
  const fromAyahStartValue2 = questionIndex ? document.getElementById(`custom-from-ayah-start-input-${questionIndex}`).value : fromAyahStartValue;
  const toAyahStartValue2 = questionIndex ? document.getElementById(`custom-to-ayah-start-input-${questionIndex}`).value : toAyahStartValue;
  const fromAyahEndValue2 = questionIndex ? document.getElementById(`custom-from-ayah-end-input-${questionIndex}`).value : fromAyahEndValue;
  const toAyahEndValue2 = questionIndex ? document.getElementById(`custom-to-ayah-end-input-${questionIndex}`).value : toAyahEndValue;

  // التحقق من قيم نطاقات الآيات وتعيين قيمتها إذا لم تكن رقماً
  const fromAyahStartValue3 = isNaN(parseInt(fromAyahStartValue2)) ? 1 : parseInt(fromAyahStartValue2);
  const toAyahStartValue3 = isNaN(parseInt(toAyahStartValue2)) ? fromSurahAyahsCount : parseInt(toAyahStartValue2);
  const fromAyahEndValue3 = isNaN(parseInt(fromAyahEndValue2)) ? 1 : parseInt(fromAyahEndValue2);
  const toAyahEndValue3 = isNaN(parseInt(toAyahEndValue2)) ? toSurahAyahsCount : parseInt(toAyahEndValue2);

  return [fromAyahStartValue3, toAyahStartValue3, fromAyahEndValue3, toAyahEndValue3];
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

function displayQuestions() {
  questionsTableBody.innerHTML = '';

  if (questionsList.length === 0) {
    addQuestionsButton.style.display = 'none';
    return;
  }

  questionsList.forEach((question, index) => {
    question.questionNumber = index + 1;

    const HTMLTableRow = `
    <tr>
      <td>${question.questionNumber}</td>
      <td>${question.surahName}</td>
      <td>${question.ayahNumber}</td>
      <td>${question.ayahText}</td>
      <td><button onclick="changeQuestion(${index})">${questionChangeButtonText}</button></td>
      <td><button onclick="deleteQuestion(${index})">${questionDeleteButtonText}</button></td>
    </tr>
    `;
    questionsTableBody.innerHTML += HTMLTableRow;
  });

  addQuestionsButton.style.display = 'block';
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
    const fromAyahStartValue = parseInt(document.getElementById(`custom-from-ayah-start-input-${questionIndex}`).value);
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
    studentName,
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
  // حفظ الإعدادات في كائن
  const settings = {
    fromSurahValue: parseInt(fromSurahSelect.value),
    fromAyahStartValue: parseInt(fromAyahStartInput.value),
    toAyahStartValue: parseInt(toAyahStartInput.value),
    toSurahValue: parseInt(toSurahSelect.value),
    fromAyahEndValue: parseInt(fromAyahEndInput.value),
    toAyahEndValue: parseInt(toAyahEndInput.value),
    questionsCountValue: parseInt(questionsCountInput.value),
    customizeQuestions: customizeQuestionsCheckbox.checked,
    questionsRanges: []
  };

  // إذا تم تحديد تخصيص الأسئلة، قم بحفظ إعدادات كل سؤال على حدة
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

  // تخزين الإعدادات في التخزين المحلي للمتصفح
  localStorage.setItem('testSettings', JSON.stringify(settings));

  alert(testSettingsSavedMessage);
}

function restoreTestSettings(event) {
  // استرجاع الإعدادات من التخزين المحلي
  const settings = JSON.parse(localStorage.getItem('testSettings'));

  if (settings) {
    fromSurahSelect.value = settings.fromSurahValue;
    fromAyahStartInput.value = settings.fromAyahStartValue;
    toAyahStartInput.value = settings.toAyahStartValue;
    toSurahSelect.value = settings.toSurahValue;
    fromAyahEndInput.value = settings.fromAyahEndValue;
    toAyahEndInput.value = settings.toAyahEndValue;
    questionsCountInput.value = settings.questionsCountValue;
    customizeQuestionsCheckbox.checked = settings.customizeQuestions;

    fromSurahSelect.dispatchEvent(changeEvent);
    fromAyahStartInput.dispatchEvent(inputEvent);
    toAyahStartInput.dispatchEvent(inputEvent);
    toSurahSelect.dispatchEvent(changeEvent);
    fromAyahEndInput.dispatchEvent(inputEvent);
    toAyahEndInput.dispatchEvent(inputEvent);
    questionsCountInput.dispatchEvent(inputEvent);

    // إذا تم تخصيص الأسئلة، قم بتطبيق إعدادات كل سؤال
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
});
customizeQuestionsCheckbox.addEventListener('change', toggleCustomizeQuestionsContainer);
createTestButton.addEventListener('click', createTest);
addQuestionsButton.addEventListener('click', createTest);
saveTestAsWordButton.addEventListener('click', saveTestAsWord);
saveTestSettingsButton.addEventListener('click', saveTestSettings);
restoreTestSettingsButton.addEventListener('click', restoreTestSettings);