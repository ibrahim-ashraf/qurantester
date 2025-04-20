// الحصول على التاريخ والوقت الحاليين
const today = new Date();

// تعيين وقت انتهاء التقديم
const targetDate = new Date('2025-02-11T00:00:00');

// الحصول على كل الخطوات التي تمثل صفحات النموذج، والتي هي ذات التصنيف step
const steps = document.querySelectorAll('.step');

// الحصول على القوائم الثلاثة لاختيار تاريخ الميلاد (السنة، الشهر، اليوم)
const birthYearSelect = document.getElementById('birthYear');
const birthMonthSelect = document.getElementById('birthMonth');
const birthDaySelect = document.getElementById('birthDay');
// دالة لتعيين وتحديث عداد انتهاء التقديم
function updateCountdown() {
  // الحصول على التاريخ والوقت الحاليين لحظة تنفيذ الدالة
  const now = new Date();

  // الحصول على الوقت بالمللي ثانية بين الآن والوقت المستهدف
  const timeDifference = targetDate - now;

  // تعيين نص انتهاء التقديم إلى الحاوية الرئيسية في حالة كون اختلاف الوقت صفرا أو سالبا
  if (timeDifference <= 0) {
    document.getElementById('container').textContent = 'تم إغلاق باب التقديم.';
    return;
  }

  // الحصول على وقت انتهاء التقديم بالأيام والساعات والدقائق والثواني
  const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

  // تعيين نص انتهاء التقديم إلى حاوية العداد
  document.getElementById('countdown').textContent = `يتبقى على إغلاق باب التقديم ${days} يوم وـ ${hours} ساعة وـ ${minutes} دقيقة وـ ${seconds} ثانية.`;
}

setInterval(updateCountdown, 1000); // تحديث العد التنازلي كل ثانية

function validateName() {
  const nameInput = document.getElementById('fullName');
  let name = nameInput.value.trim();

  name = name.replace(/\bعبد\s+/g, 'عبد');

  let words = name.split(/\s+/);

  if (words.length < 4) {
    alert('تأكد من إدخال الاسم الرباعي.');
    return false;
  }

  name = name.replace(/\bعبد(?!\s)/g, 'عبد ');

  nameInput.value = name;

  return true;
}

for (let year = 2019; year >= 2007; year--) {
  const option = document.createElement('option');
  option.value = year;
  option.textContent = year;
  birthYearSelect.appendChild(option);
}

function setMonthDays() {
  const month = parseInt(birthMonthSelect.value);
  const year = parseInt(birthYearSelect.value);
  const daysInMonth = new Date(year, month, 0).getDate();

  birthDaySelect.innerHTML = '<option value="">اليوم</option>';
  for (let day = 1; day <= daysInMonth; day++) {
    const option = document.createElement('option');
    option.value = day;
    option.textContent = day;
    birthDaySelect.appendChild(option);
  }
}

function validatePhoneNumber() {
  if (phoneInput.value) {
    const phoneNumber = iti.isValidNumber() ? iti.getNumber().replace(/^\+2/, "") : false;
    // const phoneNumber = intlTelInput.getNumber();
    console.log(phoneNumber);
    if (!phoneNumber) {
      alert('تأكد من إدخال رقم هاتف صالح.');
      return false;
    }
    return phoneNumber;
  } else {
    alert('أدخل رقم هاتف.');
    return false;
  }

  return true;
}

function changeStep(step) {
  steps.forEach((s, index) => {
    s.classList.toggle('hidden', index !== step - 1);
  });

  if (step !== 1) {
    document.getElementById('competitionIntroContainer').style.display = 'none';
  } else {
    document.getElementById('competitionIntroContainer').style.display = 'block';
  }
}

fetch('/surahs_data.json')
  .then(response => response.json())
  .then(data => {
    const surahSelection = document.getElementById('surahSelection');
    Object.entries(data).forEach(([key, value]) => {
      const surahName = key.split('سورة ')[1];
      const label = document.createElement('label');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'surah';
      checkbox.value = surahName;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(surahName));
      const li = document.createElement('li');
      li.appendChild(label);
      surahSelection.appendChild(li);
      surahSelection.appendChild(document.createElement('br'));
    });
  })
  .catch(error => console.error('Error fetching surah data:', error));

birthYearSelect.addEventListener('change', setMonthDays);
birthMonthSelect.addEventListener('change', setMonthDays);
document.getElementById('registrationForm').addEventListener('submit', async event => {
  event.preventDefault(); // منع الإرسال الافتراضي للنموذج

  const submitButton = document.getElementById('submit');
  submitButton.disabled = true;
  submitButton.textContent = 'جاري الإرسال...';

  if (!validateName()) {
    submitButton.disabled = false;
    submitButton.textContent = 'إرسال';
    return;
  }

  const phone = validatePhoneNumber();
  if (!phone) {
    submitButton.disabled = false;
    submitButton.textContent = 'إرسال';
    return;
  }

  const formData = {
    timestamp: new Date().toLocaleString('ar-EG'),
    fullName: document.getElementById("fullName").value,
    gender: document.getElementById("gender").value,
    birthDate: `${birthYearSelect.value}-${birthMonthSelect.value}-${String(birthDaySelect.value).padStart(2, '0')}`,
    phone,
    educationSystem: document.getElementById("educationSystem").value,
    schoolYear: document.getElementById("schoolYear").value,
    juzCount: document.getElementById("juzCount").value,
    surahs: Array.from(document.querySelectorAll("input[name='surah']:checked")).map(el => el.value).join('، '),
    participatedBefore: document.getElementById("participatedBefore").value,
  };

  try {
    const response = await fetch('/.netlify/functions/submitForm', {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });
    if (!response.ok) {
      throw new Error(`فشل الاتصال بالخادم، رمز الحالة: ${response.status}`);
    }
    const result = await response.json();

    alert('🌟 مبارك! تم التسجيل! لقد وصلت بياناتكم بنجاح إلى القائمين على المسابقة. 📝✨');
    location.reload();
  } catch (error) {
    console.error('Error occurred:', error);
    let userMessage = "حدث خطأ غير متوقع، يرجى المحاولة لاحقًا.";
    if (error.message.includes('فشل الاتصال بالخادم')) {
      userMessage = "⚠️ هناك مشكلة في الاتصال بالخادم، يرجى التحقق من الإنترنت أو المحاولة لاحقًا.";
    }
    alert(`❌ ${userMessage}`);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'إرسال';
  }
});