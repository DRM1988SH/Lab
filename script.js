// بيانات التطبيق
let users = [
  { 
    empId: "70062", 
    name: "Musab Ali", 
    type: "مسؤول", 
    site: "المختبر المركزي",
    permissions: {
      manageUsers: true,
      manageSettings: true,
      viewReports: true,
      addEntries: true
    }
  },
  {
    empId: "10001",
    name: "فني المختبر",
    type: "فني",
    site: "فرع المختبر 1",
    permissions: {
      manageUsers: false,
      manageSettings: false,
      viewReports: true,
      addEntries: true
    }
  }
];

let currentUser = null;
let entries = [];

// أنواع الحيوانات الثابتة
const animalTypes = [
  {en: "Sheep", ar: "خروف"},
  {en: "Goat", ar: "ماعز"},
  {en: "Cow", ar: "بقر"},
  {en: "Camel", ar: "جمال"}
];

let settings = {
  samples: ["دم", "بول", "خزعة"],
  tests: ["فحص دم", "فحص بول", "فحص أنسجة"],
  results: ["سليم", "مريض", "غير محدد"]
};

// تهيئة التطبيق عند التحميل
function startApp() {
  showScreen("welcomeScreen");
  setTimeout(() => showScreen("loginScreen"), 2000);

  // تحميل البيانات من localStorage إن وجدت
  loadFromLocalStorage();

  // تهيئة حقول الإدخال
  populateAnimalTypes();
  populateSelect("sampleType", settings.samples);
  populateSelect("testType", settings.tests);
  populateSelect("resultType", settings.results);

  // تعيين تاريخ اليوم كافتراضي
  const today = new Date().toISOString().slice(0, 10);
  document.getElementById("dateInput").value = today;
  document.getElementById("fromDate").value = today;
  document.getElementById("toDate").value = today;

  // إعداد معالج النماذج
  document.getElementById("dataForm").addEventListener("submit", function(e) {
    e.preventDefault();
    saveEntry();
  });

  // إخفاء أزرار المسؤول حتى تسجيل الدخول
  document.getElementById("settingsBtn").style.display = "none";
  document.getElementById("usersBtn").style.display = "none";
}

// تعبئة أنواع الحيوانات
function populateAnimalTypes() {
  const select = document.getElementById("animalType");
  select.innerHTML = "";
  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "اختر نوع الحيوان";
  select.appendChild(defaultOption);

  animalTypes.forEach(animal => {
    const opt = document.createElement("option");
    opt.value = animal.en;
    opt.textContent = animal.ar;
    select.appendChild(opt);
  });
}

// تحميل البيانات من localStorage
function loadFromLocalStorage() {
  const savedEntries = localStorage.getItem("vetLabEntries");
  const savedSettings = localStorage.getItem("vetLabSettings");
  const savedUsers = localStorage.getItem("vetLabUsers");

  if (savedEntries) entries = JSON.parse(savedEntries);
  if (savedSettings) settings = JSON.parse(savedSettings);
  if (savedUsers) users = JSON.parse(savedUsers);
}

// حفظ البيانات في localStorage
function saveToLocalStorage() {
  localStorage.setItem("vetLabEntries", JSON.stringify(entries));
  localStorage.setItem("vetLabSettings", JSON.stringify(settings));
  localStorage.setItem("vetLabUsers", JSON.stringify(users));
}

// عرض شاشة معينة
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.style.display = "none";
  });
  document.getElementById(screenId).style.display = "block";
}

// فتح شاشة مع التهيئة اللازمة
function openScreen(screenId) {
  showScreen(screenId);
  
  if (screenId === "dashboardScreen") {
    updateUserWelcome();
  } 
  else if (screenId === "entryScreen") {
    clearEntryForm();
  }
  else if (screenId === "settingsScreen") {
    loadSettings();
  }
  else if (screenId === "usersScreen") {
    loadUsersList();
  }
}

// تسجيل الدخول (باستخدام الرقم الوظيفي فقط)
function login() {
  const empId = document.getElementById("empId").value.trim();
  const errorElement = document.getElementById("loginErrors");

  errorElement.textContent = "";

  if (!empId) {
    errorElement.textContent = "الرجاء إدخال الرقم الوظيفي";
    return;
  }

  const user = users.find(u => u.empId === empId);

  if (user) {
    currentUser = user;
    updateUserWelcome();
    showScreen("dashboardScreen");
    
    // إظهار/إخفاء أزرار المسؤول
    const isAdmin = user.type === "مسؤول";
    document.getElementById("settingsBtn").style.display = isAdmin ? "block" : "none";
    document.getElementById("usersBtn").style.display = isAdmin ? "block" : "none";
  } else {
    errorElement.textContent = "الرقم الوظيفي غير مسجل في النظام";
  }
}

// تحديث رسالة الترحيب
function updateUserWelcome() {
  if (currentUser) {
    document.getElementById("userWelcome").textContent = `مرحباً ${currentUser.name}`;
    document.getElementById("siteName").value = currentUser.site || "";
  }
}

// تسجيل الخروج
function logout() {
  if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
    currentUser = null;
    showScreen("loginScreen");
  }
}

// تعبئة قائمة select
function populateSelect(id, options) {
  const select = document.getElementById(id);
  select.innerHTML = "";
  
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = `اختر ${id === 'sampleType' ? 'نوع العينة' : id === 'testType' ? 'نوع الاختبار' : 'نتيجة الفحص'}`;
  select.appendChild(defaultOption);

  options.forEach(option => {
    const opt = document.createElement("option");
    opt.value = option;
    opt.textContent = option;
    select.appendChild(opt);
  });
}

// مسح نموذج الإدخال
function clearEntryForm() {
  document.getElementById("dataForm").reset();
  document.getElementById("siteName").value = currentUser?.site || "";
  document.getElementById("dateInput").value = new Date().toISOString().slice(0, 10);
  document.getElementById("entryErrors").textContent = "";
}

// حفظ بيانات الإدخال
function saveEntry() {
  const errorElement = document.getElementById("entryErrors");
  errorElement.textContent = "";

  const animalType = document.getElementById("animalType");
  const animalTypeText = animalType.options[animalType.selectedIndex].text;

  const entry = {
    date: document.getElementById("dateInput").value,
    site: document.getElementById("siteName").value,
    barnName: document.getElementById("barnName").value.trim(),
    licenseNo: document.getElementById("licenseNo").value.trim(),
    animalType: animalTypeText,
    animalTypeEn: animalType.value,
    gender: document.getElementById("gender").value,
    sampleType: document.getElementById("sampleType").value,
    testType: document.getElementById("testType").value,
    resultType: document.getElementById("resultType").value,
    notes: document.getElementById("notes").value.trim(),
    enteredBy: currentUser.name,
    entryDate: new Date().toISOString()
  };

  // التحقق من الحقول المطلوبة
  const errors = [];
  if (!entry.date) errors.push("تاريخ الفحص مطلوب");
  if (!entry.site) errors.push("الموقع مطلوب");
  if (!entry.barnName) errors.push("اسم الحظيرة مطلوب");
  if (!entry.animalType) errors.push("نوع الحيوان مطلوب");
  if (!entry.gender) errors.push("جنس الحيوان مطلوب");
  if (!entry.sampleType) errors.push("نوع العينة مطلوب");
  if (!entry.testType) errors.push("نوع الاختبار مطلوب");
  if (!entry.resultType) errors.push("نتيجة الفحص مطلوبة");

  if (errors.length > 0) {
    errorElement.textContent = errors.join("، ");
    return;
  }

  entries.push(entry);
  saveToLocalStorage();
  alert("تم حفظ البيانات بنجاح");
  clearEntryForm();
  goBack();
}

// توليد التقرير
function generateReport() {
  const fromDate = document.getElementById("fromDate").value;
  const toDate = document.getElementById("toDate").value;
  const reportContent = document.getElementById("reportContent");

  if (!fromDate || !toDate) {
    alert("الرجاء تحديد تاريخ البداية والنهاية");
    return;
  }

  const filteredEntries = entries.filter(entry => {
    return entry.date >= fromDate && entry.date <= toDate;
  });

  if (filteredEntries.length === 0) {
    reportContent.innerHTML = "<p>لا توجد بيانات متاحة للفترة المحددة</p>";
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>الموقع</th>
          <th>الحظيرة</th>
          <th>نوع الحيوان</th>
          <th>الجنس</th>
          <th>نوع العينة</th>
          <th>نوع الاختبار</th>
          <th>النتيجة</th>
          <th>ملاحظات</th>
          <th>مدخل البيانات</th>
        </tr>
      </thead>
      <tbody>
  `;

  filteredEntries.forEach(entry => {
    html += `
      <tr>
        <td>${entry.date}</td>
        <td>${entry.site}</td>
        <td>${entry.barnName}</td>
        <td>${entry.animalType}</td>
        <td>${entry.gender}</td>
        <td>${entry.sampleType}</td>
        <td>${entry.testType}</td>
        <td>${entry.resultType}</td>
        <td>${entry.notes || '-'}</td>
        <td>${entry.enteredBy}</td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  reportContent.innerHTML = html;
}

// تحميل الإعدادات
function loadSettings() {
  document.getElementById("sampleList").value = settings.samples.join(", ");
  document.getElementById("testList").value = settings.tests.join(", ");
  document.getElementById("resultList").value = settings.results.join(", ");
  document.getElementById("settingsErrors").textContent = "";
}

// حفظ الإعدادات
function saveSettings() {
  const errorElement = document.getElementById("settingsErrors");
  errorElement.textContent = "";

  try {
    settings.samples = document.getElementById("sampleList").value.split(",").map(item => item.trim()).filter(item => item);
    settings.tests = document.getElementById("testList").value.split(",").map(item => item.trim()).filter(item => item);
    settings.results = document.getElementById("resultList").value.split(",").map(item => item.trim()).filter(item => item);

    saveToLocalStorage();
    
    // تحديث القوائم المنسدلة
    populateSelect("sampleType", settings.samples);
    populateSelect("testType", settings.tests);
    populateSelect("resultType", settings.results);

    alert("تم حفظ الإعدادات بنجاح");
  } catch (error) {
    errorElement.textContent = "حدث خطأ أثناء حفظ الإعدادات";
  }
}

// تحميل قائمة المستخدمين
function loadUsersList() {
  const usersList = document.getElementById("usersList");
  usersList.innerHTML = "";

  if (users.length === 0) {
    usersList.innerHTML = "<p>لا يوجد مستخدمين</p>";
    return;
  }

  let html = `
    <table>
      <thead>
        <tr>
          <th>الرقم الوظيفي</th>
          <th>الاسم</th>
          <th>النوع</th>
          <th>الموقع</th>
          <th>إجراءات</th>
        </tr>
      </thead>
      <tbody>
  `;

  users.forEach((user, index) => {
    html += `
      <tr>
        <td>${user.empId}</td>
        <td>${user.name}</td>
        <td>${user.type}</td>
        <td>${user.site}</td>
        <td>
          <button onclick="editUser(${index})" class="btn-edit">✏️</button>
          <button onclick="deleteUser(${index})" class="btn-delete">🗑️</button>
        </td>
      </tr>
    `;
  });

  html += `</tbody></table>`;
  usersList.innerHTML = html;
}

// إضافة مستخدم جديد
function addUser() {
  const errorElement = document.getElementById("userErrors");
  errorElement.textContent = "";

  const empId = document.getElementById("newEmpId").value.trim();
  const name = document.getElementById("newName").value.trim();
  const type = document.getElementById("newType").value;
  const site = document.getElementById("newSite").value.trim();

  // التحقق من الحقول المطلوبة
  const errors = [];
  if (!empId) errors.push("الرقم الوظيفي مطلوب");
  if (!name) errors.push("اسم المستخدم مطلوب");
  if (!type) errors.push("نوع المستخدم مطلوب");
  if (!site) errors.push("الموقع مطلوب");

  if (errors.length > 0) {
    errorElement.textContent = errors.join("، ");
    return;
  }

  // التحقق من عدم تكرار الرقم الوظيفي
  if (users.some(u => u.empId === empId)) {
    errorElement.textContent = "الرقم الوظيفي مسجل مسبقاً";
    return;
  }

  // تحديد الصلاحيات حسب نوع المستخدم
  const permissions = {
    manageUsers: type === "مسؤول",
    manageSettings: type === "مسؤول",
    viewReports: true,
    addEntries: true
  };

  // إضافة المستخدم الجديد
  users.push({ empId, name, type, site, permissions });
  saveToLocalStorage();
  loadUsersList();

  // مسح الحقول
  document.getElementById("newEmpId").value = "";
  document.getElementById("newName").value = "";
  document.getElementById("newType").value = "";
  document.getElementById("newSite").value = "";

  alert("تم إضافة المستخدم بنجاح");
}

// تعديل مستخدم
function editUser(index) {
  const user = users[index];
  if (!user) return;

  if (!confirm(`هل تريد تعديل بيانات المستخدم ${user.name}؟`)) return;

  document.getElementById("newEmpId").value = user.empId;
  document.getElementById("newName").value = user.name;
  document.getElementById("newType").value = user.type;
  document.getElementById("newSite").value = user.site;

  // حذف المستخدم القديم
  users.splice(index, 1);
}

// حذف مستخدم
function deleteUser(index) {
  const user = users[index];
  if (!user) return;

  if (user.empId === "70062") {
    alert("لا يمكن حذف المسؤول الرئيسي");
    return;
  }

  if (confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
    users.splice(index, 1);
    saveToLocalStorage();
    loadUsersList();
    alert("تم حذف المستخدم بنجاح");
  }
}

// العودة للشاشة السابقة
function goBack() {
  if (currentUser) {
    showScreen("dashboardScreen");
  } else {
    showScreen("loginScreen");
  }
}

// بدء التطبيق عند تحميل الصفحة
window.onload = startApp;
