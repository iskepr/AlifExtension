# السلام عليكم
هذه إضافة VS Code للغة برمجة "الف"، وهي تهدف إلى تحسين تجربة البرمجة مع اللغة من خلال تلوين النصوص، الاختصارات، والتنظيم التلقائي للشفرة.

## كيفية التطوير

#### 1. **ملف `src/syntaxes/alif.tmLanguage.json`**
   هذا الملف هو المسؤول عن تلوين النصوص (Syntax Highlighting) في VS Code. يقوم بتعريف المتغيرات، الدوال، الهياكل البرمجية، وغيرها من العناصر البرمجية. يتم استخدام تنسيق `tmLanguage` لتحديد النمط الذي سيتم تطبيقه على الشفرة.
   
   - **المحتوى**: 
     يحتوي هذا الملف على تعريفات للألوان والأنماط المستخدمة لتمييز الكلمات الرئيسية، المتغيرات، الدوال، التعليقات، والمزيد.
   - **كيف يعمل**:
     يقوم VS Code باستخدام هذه التعريفات لتمييز أجزاء الشفرة أثناء الكتابة، مما يساعد المبرمج على فهم بنية الشفرة بسهولة أكبر.
   
#### 2. **ملف `src/snippets/alif.json`**
   هذا الملف يحدد **الاختصارات التلقائية** (Snippets) التي يمكن استخدامها لكتابة أجزاء من الشفرة بسرعة.
   
   - **المحتوى**: 
     يحتوي هذا الملف على اختصارات مختلفة يتم تفعيلها عند كتابة جزء من الكلمة أو الحروف الأولى.
   - **مثال**:
     عند كتابة "دا" ثم الضغط على "Enter"، سيكتمل النص إلى:
     ```alif
     دالة اسم_الدالة(المعاملات):
     ```
     يمكن إضافة اختصارات أخرى لمختلف أجزاء اللغة لتسريع الكتابة وتوفير الوقت.
   
#### 3. **ملف `src/extension.js`**
   هذا الملف مسؤول عن العديد من المهام التنظيمية مثل **تنسيق الشفرة** (Code Formatting) وضبط المسافات البيضاء (Whitespace Formatting).
   
   - **المحتوى**:
     يحتوي على منطق يحسن تنسيق الشفرة بحيث يصبح الشفرة أكثر وضوحًا وسهولة في القراءة. على سبيل المثال، يقوم بإزالة الفراغات الزائدة، وضبط المسافات بين الأسطر، وضمان التناسق في تنسيق الأوامر.
   - **كيف يعمل**:
     يعمل هذا الملف على تنفيذ الوظائف عندما يكتب المستخدم أو يضغط على اختصار، مما يحسن سرعة الكتابة والتطوير بشكل عام.
   
---

### كيفية تثبيت الإضافة محلياً

1. قم بتحميل الشفرة المصدر للمشروع من مستودع GitHub.
2. افتح المجلد في VS Code.
3. افتح الـ **Terminal** في VS Code.
4. قم بتثبيت الإضافة عن طريق تنفيذ الأمر التالي:
```
npm install
```

5. اضغط `F5` في لوحة المفاتيح ستفتح نافذة جديدة اضف التعديلات وارفع المشروع علي مستودع GitHub.
5. بعد الانتهاء من التثبيت، يمكنك فتح أي ملف `.alif` وسيتم تطبيق التلوين التلقائي والاختصارات.

## ملاحظات إضافية

- تأكد من أنك تستخدم آخر إصدار من VS Code لضمان توافق الإضافة بشكل كامل.
- يمكن تعديل إعدادات الإضافة لتناسب احتياجاتك الخاصة عبر ملف الإعدادات `settings.json`.
- إذا واجهت أي مشكلة أو كان لديك اقتراحات، لا تتردد في فتح Issue على صفحة GitHub الخاصة بالمشروع.
