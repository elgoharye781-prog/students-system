// ترتيب شهور السنة الدراسية: بداية من أغسطس (index 7) لحد يوليو اللي بعده (index 6)
const ACADEMIC_MONTH_ORDER = [7,8,9,10,11,0,1,2,3,4,5,6];
function academicYearMonths(startYear){
  // بيرجع مصفوفة {calYear, monthIndex} من أغسطس startYear لحد يوليو startYear+1
  return ACADEMIC_MONTH_ORDER.map(monthIndex => ({
    calYear: monthIndex >= 7 ? startYear : startYear + 1,
    monthIndex
  }));
}
function getCurrentAcademicYear(){
  const now = new Date();
  return now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
}
const ARABIC_DAYS = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت']; // index = JS getDay()
// الإعدادات الافتراضية لعدد الحصص والمجموعات لكل صف (تُستخدم أول مرة فقط، وبعدين تتحفظ وتتعدل من صفحة الإعدادات):
// - أول/تاني/تالت إعدادي وأول ثانوي: مجموعتين (بنين/بنات)، حصتين أسبوعيًا لكل مجموعة
// - تاني ثانوي: مجموعتين (بنين/بنات)، تلات حصص أسبوعيًا لكل مجموعة
// - تالت ثانوي: مجموعة واحدة بس (بنين وبنات مع بعض)، تلات حصص أسبوعيًا
const DEFAULT_GRADE_CONFIG = {
  prep1: { sessions:2, groups:[{id:'boys',name:'بنين'},{id:'girls',name:'بنات'}] },
  prep2: { sessions:2, groups:[{id:'boys',name:'بنين'},{id:'girls',name:'بنات'}] },
  prep3: { sessions:2, groups:[{id:'boys',name:'بنين'},{id:'girls',name:'بنات'}] },
  sec1:  { sessions:2, groups:[{id:'boys',name:'بنين'},{id:'girls',name:'بنات'}] },
  sec2:  { sessions:3, groups:[{id:'boys',name:'بنين'},{id:'girls',name:'بنات'}] },
  sec3:  { sessions:3, groups:[{id:'mixed',name:'المجموعة (بنين وبنات)'}] },
};
function gradeGroups(gradeId){ return (app.state.gradeConfig[gradeId] || DEFAULT_GRADE_CONFIG[gradeId] || {groups:[]}).groups; }
function gradeSessions(gradeId){ return (app.state.gradeConfig[gradeId] || DEFAULT_GRADE_CONFIG[gradeId] || {sessions:2}).sessions; }
function gradeGroupName(gradeId, groupId){ const grp = gradeGroups(gradeId).find(x=>x.id===groupId); return grp? grp.name : groupId; }
const GRADES = [
  {id:'prep1', name:'الصف الأول الإعدادي', short:'1 إعدادي', color:'#6B8CAE'},
  {id:'prep2', name:'الصف الثاني الإعدادي', short:'2 إعدادي', color:'#5F9C8F'},
  {id:'prep3', name:'الصف الثالث الإعدادي', short:'3 إعدادي', color:'#8FA35C'},
  {id:'sec1',  name:'الصف الأول الثانوي',   short:'1 ثانوي',  color:'#C79A3F'},
  {id:'sec2',  name:'الصف الثاني الثانوي',  short:'2 ثانوي',  color:'#C77A3F'},
  {id:'sec3',  name:'الصف الثالث الثانوي',  short:'3 ثانوي',  color:'#B0402F'},
];
function gradeById(id){ return GRADES.find(g=>g.id===id); }
// خريطة ترقية السنة الدراسية: كل صف بيروح لأي صف بعد آخر العام. تالتة ثانوي مفيش صف بعدها (تخرج).
const NEXT_GRADE = { prep1:'prep2', prep2:'prep3', prep3:'sec1', sec1:'sec2', sec2:'sec3', sec3:null };
function uid(){ return 'id'+Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function fmtDate(iso){ const d=new Date(iso); return `${d.getDate()}/${d.getMonth()+1}`; }
// بيرجع اسم الامتحان لو المدرّس كتبه، وإلا تاريخ تسجيل الدرجة كبديل مناسب للعرض (بدل ما يفضل فاضي)
function gradeExamLabel(gd){ return (gd.examName && gd.examName.trim()) ? gd.examName : fmtDate(gd.date); }
// بيرجع HTML لمجموعة رموز رياضية متحركة زخرفية — مستخدمة في الهيدر وفي مودالز التأكيد/التنبيه عشان يبقى ليهم نفس الطابع
function mathDecoSpans(){
  const items = [
    {s:'π', l:6,  t:20, sz:20, d:0},
    {s:'√', l:16, t:65, sz:16, d:.6},
    {s:'×', l:28, t:15, sz:14, d:1.2},
    {s:'÷', l:40, t:70, sz:18, d:.3},
    {s:'∞', l:52, t:25, sz:16, d:1.6},
    {s:'θ', l:64, t:60, sz:15, d:.9},
    {s:'∑', l:76, t:20, sz:20, d:.2},
    {s:'%', l:88, t:65, sz:14, d:1.4},
  ];
  return items.map((it,i)=>`<span class="mdeco" style="left:${it.l}%;top:${it.t}%;font-size:${it.sz}px;animation-delay:${it.d}s;animation-duration:${5+(i%3)}s;">${it.s}</span>`).join('');
}
function fmt12h(timeStr){
  if(!timeStr) return '';
  const [hh,mm] = timeStr.split(':').map(Number);
  if(isNaN(hh)||isNaN(mm)) return '';
  const period = hh>=12 ? 'م' : 'ص';
  let h12 = hh % 12; if(h12===0) h12 = 12;
  return `${h12}:${String(mm).padStart(2,'0')} ${period}`;
}
function normalizePhone(phone){
  let digits = (phone||'').replace(/\D/g,'');
  if(!digits) return '';
  if(digits.startsWith('0')) digits = '20' + digits.slice(1);
  else if(!digits.startsWith('20')) digits = '20' + digits;
  return digits;
}
function groupPillHtml(gradeId, groupId){
  if(!groupId) return '—';
  return `<span class="group-pill group-${groupId}">${gradeGroupName(gradeId, groupId)}</span>`;
}
// هاش بسيط (مش تشفير بنكي قوي، بس كافي لقفل بسيط) — شغال في كل المتصفحات من غير أي شروط خاصة
// (بعكس Web Crypto API اللي ممكن ميشتغلش لما تفتح الملف مباشرة file:// في بعض المتصفحات)
function hashText(text){
  const str = 'srk_v1_' + text;
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for(let i=0;i<str.length;i++){
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909);
  h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909);
  return (h1>>>0).toString(36) + (h2>>>0).toString(36);
}

// ============================================================
// مولد الامتحانات بالذكاء الاصطناعي (Gemini) — إعدادات وأدوات مساعدة
// ============================================================
const EXAM_DIFFICULTIES = [
  {id:'easy',   name:'سهل'},
  {id:'medium', name:'متوسط'},
  {id:'hard',   name:'صعب'}
];
// منهج افتراضي لكل صف: كل صف فيه وحدات (units)، وكل وحدة فيها دروس (lessons).
// ده بس نقطة بداية — قابل للتعديل بالكامل من داخل "إنشاء امتحان" (تضيف/تحذف وحدة أو درس لأي صف).
// المنهج ده متجمّع من توزيعات وزارة التربية والتعليم المصرية الرسمية والمصادر التعليمية الموثوقة
// لعام 2025-2026 (شامل تحديثات "المنهج المطوَّر" للمرحلة الإعدادية)، وهو نقطة بداية دقيقة قدر الإمكان،
// وقابل للتعديل بالكامل من "✏️ عدّل وحدات ودروس هذا الصف" — لو فيه أي فرق عن مدرستك بالظبط، عدّله زي ما يناسبك.
const DEFAULT_EXAM_CURRICULUM = {
  prep1: [
    { name:'النسبة والتناسب', lessons:['النسبة والتناسب وتطبيقاته','مقياس الرسم والتقسيم التناسبي','تطبيقات النسبة المئوية'] },
    { name:'الجبر', lessons:['المقادير والحدود الجبرية','حل المعادلات البسيطة','القوى والأسس والصيغة العلمية','الجذور التربيعية والتكعيبية','المتباينات'] },
    { name:'الدوال والتمثيل البياني', lessons:['المتغيرات التابعة والمستقلة','كتابة المعادلات من العلاقات','التمثيل البياني للمتغيرات'] },
    { name:'الهندسة والقياس', lessons:['الأشكال الهندسية الأساسية والزوايا','المساحات والإنشاءات الهندسية','التحويلات الهندسية (الانسحاب والدوران)'] },
    { name:'الإحصاء', lessons:['جمع البيانات وتنظيمها','الوسط الحسابي','التمثيل بالأعمدة والقطاعات الدائرية'] }
  ],
  prep2: [
    { name:'الأعداد والعمليات عليها', lessons:['خواص التناسب','التناسب المتسلسل'] },
    { name:'الجبر', lessons:['حاصل الضرب الديكارتي','العلاقة والدالة','الدالة الخطية','معادلات ومتباينات الدرجة الأولى في متغير واحد'] },
    { name:'الهندسة', lessons:['مسلمات التباين','التباين في المثلث','المساقط العمودية ونظرية إقليدس','الدائرة','الأسطوانة الدائرية القائمة والمنشور القائم','البعد بين نقطتين في المستوى الإحداثي','ميل الخط المستقيم'] },
    { name:'الإحصاء والاحتمال', lessons:['العينات','الاحتمال وتوقع الأحداث المستقبلية'] }
  ],
  prep3: [
    { name:'العلاقات والدوال', lessons:['حاصل الضرب الديكارتي','العلاقات','الدالة','الدوال كثيرات الحدود'] },
    { name:'النسبة والتناسب', lessons:['التناسب','التغير الطردي','التغير العكسي'] },
    { name:'حساب المثلثات', lessons:['النسب المثلثية للزاوية الحادة','النسب المثلثية لبعض الزوايا الخاصة','إيجاد الزاوية إذا عُلمت نسبتها المثلثية'] },
    { name:'الهندسة التحليلية', lessons:['البعد بين نقطتين','إحداثيا منتصف قطعة مستقيمة','ميل الخط المستقيم','العلاقة بين ميلي المستقيمين المتوازيين والمتعامدين'] }
  ],
  sec1: [
    { name:'الجبر', lessons:['مقدمة في الأعداد المركبة والعمليات عليها','المعادلات والمتباينات','حل المسائل بالمعادلات'] },
    { name:'حساب المثلثات', lessons:['الزوايا الموجهة وموقعها في المستوى الإحداثي المتعامد','النسب المثلثية للزاوية','حل المثلث'] },
    { name:'الهندسة التحليلية المستوية', lessons:['الإحداثيات والمسافة بين نقطتين','ميل المستقيم ومعادلته','المستقيمات المتوازية والمتعامدة','الدائرة والمساحات'] },
    { name:'الدوال', lessons:['تعريف الدالة ومجالها ومداها','التمثيل البياني للدوال','أنواع الدوال'] }
  ],
  sec2: [
    { name:'التفاضل والنهايات', lessons:['مقدمة في النهايات','إيجاد نهاية الدالة جبريًا','نهاية الدالة عند اللانهاية','نهاية الدوال المثلثية','اتصال الدالة','الدوال الحقيقية وخواصها واطرادها'] },
    { name:'الأسس واللوغاريتمات', lessons:['الأسس الكسرية','الدالة الأسية وتطبيقاتها','المعادلات الأسية','الدالة اللوغاريتمية وتمثيلها البياني','خواص اللوغاريتمات','حل معادلات ومتباينات القيمة المطلقة'] },
    { name:'الهندسة الفراغية', lessons:['المستقيمات والمستويات في الفراغ','الهرم والمخروط ومساحتهما وحجمهما','معادلة الدائرة'] },
    { name:'حساب المثلثات', lessons:['قانون الجيب','قانون جيب التمام'] },
    { name:'الاستاتيكا', lessons:['القوى وتحليلها','محصلة عدة قوى مستوية متلاقية عند نقطة','اتزان جسم جاسئ تحت تأثير قوى متلاقية','اتزان جسم على مستوى أفقي خشن','اتزان جسم على مستوى مائل خشن'] }
  ],
  sec3: [
    { name:'التفاضل', lessons:['الاشتقاق الضمني والبارامتري','المشتقات العليا للدالة','مشتقات الدوال الأسية واللوغاريتمية','المعدلات الزمنية المرتبطة','تزايد وتناقص الدوال','القيم العظمى والصغرى','دراسة المنحنيات وتطبيقاتها'] },
    { name:'التكامل', lessons:['تكامل الدوال الأسية واللوغاريتمية','طرق التكامل (بالتعويض والتجزئة)','التكامل المحدد','تطبيقات على التكامل المحدد (المساحات)'] },
    { name:'الجبر', lessons:['نظرية ذات الحدين بأس صحيح موجب','إيجاد الحد المشتمل على س^ك من مفكوك ذات الحدين','النسبة بين حدين متتاليين من المفكوك','الصورة المثلثية للعدد المركب','نظرية ديموافر','الجذور التكعيبية للواحد الصحيح'] },
    { name:'الهندسة الفراغية', lessons:['النظام الإحداثي المتعامد في ثلاثة أبعاد','المتجهات في الفراغ وضرب المتجهات','معادلة المستقيم في الفراغ','معادلة المستوى في الفراغ'] },
    { name:'الاستاتيكا', lessons:['عزم قوة بالنسبة لنقطة في نظام إحداثي ثنائي الأبعاد','محصلة القوى المتوازية المستوية','اتزان مجموعة من القوى المستوية','الازدواجات والازدواج المحصل'] },
    { name:'الديناميكا', lessons:['الحركة في خط مستقيم (تفاضل وتكامل الدوال المتجهة)','تطبيقات على قوانين نيوتن للحركة','حركة الأجسام متغيرة الكتلة أو العجلة والأجسام المتصلة والدفع','الشغل والطاقة والقدرة'] }
  ]
};
// نماذج Gemini المقترحة — تقدر تختار "موديل تاني" وتكتب أي اسم موديل يدويًا لو عايز
const GEMINI_MODELS = [
  {id:'gemini-3.6-flash',       name:'Gemini 3.6 Flash — متوازن وسريع (موصى به)'},
  {id:'gemini-3.7-flash',       name:'Gemini 3.7 Flash — الأحدث'},
  {id:'gemini-3.1-pro-preview', name:'Gemini 3.1 Pro — الأدق في المسائل الصعبة (أبطأ وأغلى شوية)'},
  {id:'gemini-3.5-flash-lite',  name:'Gemini 3.5 Flash-Lite — الأسرع والأرخص'}
];
// ترحيل بيانات نسخة قديمة (لو المستخدم كان جرّب النسخة الأولى اللي فيها "مواضيع" مسطحة بس، من غير وحدات ودروس)
function migrateExamBankCurriculum(eb){
  if(eb.topics && typeof eb.topics === 'object' && (!eb.curriculum || Object.keys(eb.curriculum).length===0)){
    eb.curriculum = eb.curriculum || {};
    Object.keys(eb.topics).forEach(gradeId=>{
      const flat = eb.topics[gradeId];
      if(Array.isArray(flat) && flat.length && !eb.curriculum[gradeId]){
        eb.curriculum[gradeId] = flat.map(name=>({ name, lessons:[name] }));
      }
    });
  }
  delete eb.topics;
  return eb;
}
function examCurriculum(gradeId){
  const custom = app.state.examBank.curriculum[gradeId];
  return (custom && custom.length) ? custom : (DEFAULT_EXAM_CURRICULUM[gradeId] || []);
}
function examQuestionTypeName(t){ return t==='mcq' ? 'اختيار من متعدد' : (t==='conceptual' ? 'سؤال فكري' : 'مقالي'); }
function isSecondaryGrade(gradeId){ return gradeId==='sec1' || gradeId==='sec2' || gradeId==='sec3'; }

// ============================================================
// فرض عربي 100% كوديًا على أسئلة الثانوي (مش بس بالطلب من Gemini) — شبكة أمان تانية:
// حتى لو Gemini سرح وكتب رقم إنجليزي أو كلمة زي sin/log جوه المعادلة، الكود ده بيصلحها تلقائيًا
// قبل ما تتحفظ في الامتحان، عشان نضمن عربي 100% فعليًا مش بس بالطلب.
// ============================================================
const ARABIC_DIGITS_MAP = {'0':'٠','1':'١','2':'٢','3':'٣','4':'٤','5':'٥','6':'٦','7':'٧','8':'٨','9':'٩'};
// أسماء الدوال المحمية بعد التصحيح (مرتبة من الأطول للأقصر) — عشان لما نفصل الحروف المتلاصقة،
// منلمسش الحروف اللي بتكوّن اسم دالة واحد زي "جتا" أو "قتا"
const PROTECTED_ARABIC_MATH_TOKENS = ['جتا','ظتا','قتا','جا','ظا','قا','لو'];
// بيقسم أي نص لأجزاء: نص عادي، أو معادلة LaTeX بين $..$ أو $$..$$ — عشان نطبّق فصل الحروف جوه المعادلة بس
function splitMathSegments(text){
  const parts = [];
  const re = /\$\$[\s\S]*?\$\$|\$[^$]*\$/g;
  let last = 0, m;
  while((m = re.exec(text))){
    if(m.index > last) parts.push({ math:false, text: text.slice(last, m.index) });
    parts.push({ math:true, text: m[0] });
    last = m.index + m[0].length;
  }
  if(last < text.length) parts.push({ math:false, text: text.slice(last) });
  return parts;
}
// بيحط فاصلة خفيفة (\,) بين أي حروف عربية متلاصقة جوه معادلة (زي "سص" اللي المفروض تبقى "س ص")
// من غير ما يفصل اسم دالة محمي زي "جا" أو "جتا" عن بعضه
function spaceOutArabicVariablesInMath(t){
  // بنقتصر على نطاق حروف الأبجدية العربية بالظبط (٠٦٢١-٠٦٤A)، عشان نستبعد علامات الترقيم
  // (زي الفاصلة العربية ،) والأرقام الهندية من إعادة التلفيف — دول مش متغيرات محتاجة فصل.
  return t.replace(/[\u0621-\u064A]{2,}/g, run=>{
    let out = '', i = 0;
    while(i < run.length){
      let matched = null;
      for(const tok of PROTECTED_ARABIC_MATH_TOKENS){
        if(run.startsWith(tok, i)){ matched = tok; break; }
      }
      const piece = matched || run[i];
      out += (out ? '\\,' : '') + piece;
      i += piece.length;
    }
    return out;
  });
}
// بيفرض عربي 100% تام على نص سؤال/اختيار/إجابة — جوه المعادلة وبرّاها على السوا:
// بيصحح أسماء الدوال المثلثية/اللوغاريتم، بيحوّل أي متغيرات x/y/z (حتى الملزّقة زي xy) لمقابلها العربي،
// بيحوّل كل الأرقام لهندية عربية (حتى جوه المعادلة)، بيصحح كلمات إنجليزية وعلامات ترقيم شائعة برة أي معادلة
// بس (عشان منكسرش أوامر LaTeX زي \, و\; جوه المعادلة)، وبيفصل الحروف العربية المتلاصقة جوه المعادلة.
function enforceStrictArabicMath(text){
  if(!text) return text;
  let t = String(text);
  t = t.replace(/(?<![a-zA-Z])sin(?![a-zA-Z])/gi,'جا').replace(/(?<![a-zA-Z])cos(?![a-zA-Z])/gi,'جتا').replace(/(?<![a-zA-Z])tan(?![a-zA-Z])/gi,'ظا')
       .replace(/(?<![a-zA-Z])cot(?![a-zA-Z])/gi,'ظتا').replace(/(?<![a-zA-Z])sec(?![a-zA-Z])/gi,'قا').replace(/(?<![a-zA-Z])csc(?![a-zA-Z])/gi,'قتا')
       .replace(/(?<![a-zA-Z])log(?![a-zA-Z])/gi,'لو');
  // شبكة أمان أخيرة: أي متغيرات x/y/z شاردة — حتى الملزّقة زي xy أو xyz — بتتحول لمقابلها العربي حرف بحرف
  const XYZ_MAP = {x:'س',y:'ص',z:'ع'};
  t = t.replace(/(?<![a-zA-Z])[xyz]+(?![a-zA-Z])/gi, run => run.toLowerCase().split('').map(ch=>XYZ_MAP[ch]).join(''));
  t = t.replace(/[0-9]/g, d => ARABIC_DIGITS_MAP[d]);
  t = splitMathSegments(t).map(seg=>{
    if(seg.math) return spaceOutArabicVariablesInMath(seg.text);
    let s = seg.text;
    s = s.replace(/\bNote\b/g,'ملحوظة').replace(/\bExample\b/g,'مثال').replace(/\bSolution\b/g,'الحل')
         .replace(/\bFigure\b/g,'شكل').replace(/\bHint\b/g,'تلميح').replace(/\bStep\b/g,'خطوة')
         .replace(/\bQuestion\b/g,'سؤال').replace(/\bAnswer\b/g,'إجابة');
    s = s.replace(/,/g,'،').replace(/;/g,'؛').replace(/\?/g,'؟');
    return s;
  }).join('');
  return t;
}
function examDifficultyName(d){ const x = EXAM_DIFFICULTIES.find(y=>y.id===d); return x ? x.name : d; }
// ===== تعقيم رسومات SVG التوضيحية اللي Gemini بيرجعها مع بعض الأسئلة =====
// بيتأكد إن الكود فعلاً SVG سليم، وبيشيل أي سكريبتات أو أحداث خطيرة قبل ما نعرضه بالـ innerHTML
function sanitizeSvg(raw){
  if(!raw || typeof raw !== 'string') return '';
  let s = raw.trim();
  if(!/^<svg[\s>]/i.test(s)) return '';
  s = s.replace(/<script[\s\S]*?<\/script>/gi, '');
  s = s.replace(/\son\w+\s*=\s*"[^"]*"/gi, '').replace(/\son\w+\s*=\s*'[^']*'/gi, '');
  s = s.replace(/javascript:/gi, '');
  return s;
}
// بيفرض العربي الصارم بس على النص الظاهر جوه وسوم <text> داخل الـ SVG (تسميات الرسم)،
// من غير ما يلمس الأرقام والإحداثيات في خصائص XML (زي width أو viewBox) عشان الرسم مايتكسرش
function arabizeSvgLabels(svg){
  if(!svg) return svg;
  return svg.replace(/(<text[^>]*>)([\s\S]*?)(<\/text>)/gi, (m, open, inner, close) => open + enforceStrictArabicMath(inner) + close);
}
function examFormLetter(idx){
  const letters = ['أ','ب','ج','د','هـ','و','ز','ح','ط','ي'];
  return letters[idx] || String(idx+1);
}
function fileSizeLabel(bytes){
  if(!bytes) return '';
  if(bytes < 1024*1024) return Math.round(bytes/1024) + ' ك.ب';
  return (bytes/(1024*1024)).toFixed(1) + ' م.ب';
}
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); const t=arr[i]; arr[i]=arr[j]; arr[j]=t; }
  return arr;
}
// بيرتب الأسئلة للعرض/الطباعة بشكل تقليدي مرتب: الاختيار من متعدد كله الأول، وبعدين المقالي والفكري في الآخر
// (بيحافظ على الترتيب العشوائي الداخلي لكل نوع زي ما هو، بس بيجمع كل نوع مع بعضه)
function orderQuestionsForDisplay(ids, qMap){
  const mcqIds = ids.filter(id => qMap[id] && qMap[id].type === 'mcq');
  const restIds = ids.filter(id => qMap[id] && qMap[id].type !== 'mcq');
  return [...mcqIds, ...restIds];
}

// ===== تخزين ملفات الـ PDF في IndexedDB (بره localStorage عشان أحجام الملفات أكبر بكتير من حد الـ localStorage) =====
const EXAM_DB_NAME = 'examGeneratorFilesDB', EXAM_DB_STORE = 'files';
function examDbOpen(){
  return new Promise((resolve,reject)=>{
    if(!('indexedDB' in window)){ reject(new Error('NO_IDB')); return; }
    const req = indexedDB.open(EXAM_DB_NAME, 1);
    req.onupgradeneeded = ()=>{ if(!req.result.objectStoreNames.contains(EXAM_DB_STORE)) req.result.createObjectStore(EXAM_DB_STORE); };
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
async function examDbSet(id, base64Data){
  const db = await examDbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(EXAM_DB_STORE,'readwrite');
    tx.objectStore(EXAM_DB_STORE).put(base64Data, id);
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
  });
}
async function examDbGet(id){
  const db = await examDbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(EXAM_DB_STORE,'readonly');
    const req = tx.objectStore(EXAM_DB_STORE).get(id);
    req.onsuccess = ()=> resolve(req.result);
    req.onerror = ()=> reject(req.error);
  });
}
async function examDbDelete(id){
  const db = await examDbOpen();
  return new Promise((resolve,reject)=>{
    const tx = db.transaction(EXAM_DB_STORE,'readwrite');
    tx.objectStore(EXAM_DB_STORE).delete(id);
    tx.oncomplete = ()=> resolve(true);
    tx.onerror = ()=> reject(tx.error);
  });
}
// بيحوّل ملف مرفوع لنص Base64 خالص (من غير data:...;base64, في الأول)
function fileToBase64(file){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = ()=> reject(reader.error);
    reader.readAsDataURL(file);
  });
}
// بيشغّل KaTeX عشان يحوّل أي معادلة مكتوبة بين $...$ أو $$...$$ لشكل رياضي منسق، لو المكتبة اتحملت من الإنترنت بنجاح
// (لو مفيش إنترنت أو المكتبة اتعطلت، هتفضل المعادلة تتعرض كنص عادي من غير ما يبوّظ باقي الصفحة)
function renderMathIn(el){
  if(!el || typeof renderMathInElement !== 'function') return;
  try{
    renderMathInElement(el, {
      delimiters: [
        {left:'$$', right:'$$', display:true},
        {left:'$', right:'$', display:false}
      ],
      throwOnError:false
    });
  }catch(e){ /* تجاهل أي خطأ في عرض معادلة معينة */ }
}

const app = {
  state: {
    students: [], records: {}, schedules: {}, cancelledSessions: {},
    gradeConfig: {}, gradeFees: {}, telegramLinks: {}, whatsappGroupLinks: {},
    trash: { students: [] },
    uiPrefs: { darkMode: false, absenceThreshold: 4 },
    teacherProfile: { name:'', subject:'' },
    security: { enabled:false, passwordHash:null },
    examBank: { apiKey:'', model:'gemini-3.6-flash', curriculum:{}, materials:[], exams:[] },
    // تقدم عمليات الإرسال الجماعي الحالية (لكل نوع/دفعة) — بيتحفظ فعليًا عشان لو قفلت البرنامج في النص
    // ورجعت تاني، البرنامج يفتكر مين اتبعتله فعلاً ومايعيدش يبعت لنفس الشخص مرتين.
    bulkSendState: {},
    ui: { tab:'overview', selectedStudent:null, studentSubTab:'payments', paymentYear:getCurrentAcademicYear(), search:'', groupFilter:'all', activeBulkType:null,
      examSubTab:'create', examCreateGrade:null, examSelectedId:null, examSelectedFormId:null, examGenerating:false, examGenerationStatus:'', examEditExamId:null, examEditQid:null }
  },
  saveTimer: null,
  _attendanceEnsuredDate: null,
  alertedAlarms: new Set(),
  audioCtx: null,

  ensureGradeConfigDefaults(){
    GRADES.forEach(g=>{
      if(!this.state.gradeConfig[g.id]) this.state.gradeConfig[g.id] = JSON.parse(JSON.stringify(DEFAULT_GRADE_CONFIG[g.id]));
    });
  },

  // مفتاح الحفظ في localStorage الخاص بالمتصفح
  STORAGE_KEY: 'student-register-app-data',

  async init(){
    try{
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if(raw){
        const p = JSON.parse(raw);
        this.state.students = p.students || [];
        this.state.records = p.records || {};
        this.state.schedules = p.schedules || {};
        this.state.cancelledSessions = p.cancelledSessions || {};
        this.state.gradeConfig = p.gradeConfig || {};
        this.state.gradeFees = p.gradeFees || {};
        this.state.telegramLinks = p.telegramLinks || {};
        this.state.whatsappGroupLinks = p.whatsappGroupLinks || {};
        this.state.trash = p.trash || { students: [] };
        this.state.uiPrefs = Object.assign({ darkMode:false, absenceThreshold:4 }, p.uiPrefs || {});
        this.state.teacherProfile = p.teacherProfile || { name:'', subject:'' };
        this.state.security = p.security || { enabled:false, passwordHash:null };
        this.state.examBank = migrateExamBankCurriculum(Object.assign({apiKey:'', model:'gemini-3.6-flash', curriculum:{}, materials:[], exams:[]}, p.examBank || {}));
        this.state.bulkSendState = p.bulkSendState || {};
      }
    }catch(e){ console.log('لا توجد بيانات محفوظة بعد، أو تعذرت قراءتها', e); }
    this.ensureGradeConfigDefaults();
    document.documentElement.setAttribute('data-theme', this.state.uiPrefs.darkMode ? 'dark':'light');
    if(this.state.security.enabled && this.state.security.passwordHash){
      this.renderLockScreen();
    } else if(!this.state.teacherProfile.name){
      this.renderWelcomeSetup();
    } else {
      this.finishInit();
    }
  },

  finishInit(){
    this.updateHeaderProfile();
    this.render();
    this.updateThemeButtonLabel();
    this.startAlarmClock();
    this.requestWakeLock();
    const deco = document.getElementById('headerMathDeco');
    if(deco) deco.innerHTML = mathDecoSpans();
    document.addEventListener('visibilitychange', ()=>{
      if(document.visibilityState==='visible') this.requestWakeLock();
      else this.persistNow(); // الشاشة اتقفلت أو اتحول لتطبيق تاني: نضمن إن آخر تعديل اتحفظ
    });
    document.addEventListener('click', ()=>{ this.unlockAudio(); }, {once:true});
    // نضمن إن آخر تعديل (زي ميعاد حصة اتغيّر) يتكتب في localStorage فورًا قبل أي Refresh أو غلق للصفحة،
    // حتى لو لسه في انتظار الـ 250ms بتوع save() العادية
    window.addEventListener('pagehide', ()=> this.persistNow());
    window.addEventListener('beforeunload', ()=> this.persistNow());
  },

  updateHeaderProfile(){
    const el = document.getElementById('headerTeacherLine');
    if(!el) return;
    const p = this.state.teacherProfile;
    el.textContent = p.subject ? `${p.name} — ${p.subject}` : (p.name || '');
  },
  // تعديل اسم المدرّس والمادة من الإعدادات في أي وقت بعد الإعداد الأولي
  saveTeacherProfile(){
    const nameInput = document.getElementById('teacherNameInput');
    const subjectInput = document.getElementById('teacherSubjectInput');
    const name = nameInput.value.trim();
    const subject = subjectInput.value.trim();
    this.state.teacherProfile = { name: name || 'أ. مستخدم البرنامج', subject };
    this.save();
    this.updateHeaderProfile();
    const msg = document.getElementById('teacherProfileMsg');
    if(msg){
      msg.textContent = '✓ اتحفظ بنجاح';
      setTimeout(()=>{ if(document.getElementById('teacherProfileMsg')) document.getElementById('teacherProfileMsg').textContent=''; }, 2500);
    }
  },

  // ===== شاشة الإعداد الأولى (اسم المدرس والمادة) =====
  renderWelcomeSetup(){
    document.getElementById('lockRoot').innerHTML = `
    <div class="full-screen-gate">
      <div class="gate-card">
        <div class="gate-icon">📐</div>
        <h2>أهلاً بيك!</h2>
        <p>قبل ما تبدأ، عرّفنا شوية على نفسك — الاسم ده هيظهر فوق في البرنامج</p>
        <input id="setupName" placeholder="اسمك (مثال: أ. محمود الجوهري)">
        <input id="setupSubject" placeholder="المادة اللي بتدرّسها (اختياري)">
        <button class="btn brass" style="width:100%;padding:12px;" onclick="app.completeWelcomeSetup()">ابدأ استخدام البرنامج</button>
      </div>
    </div>`;
    document.getElementById('setupName').focus();
  },
  completeWelcomeSetup(){
    const name = document.getElementById('setupName').value.trim();
    const subject = document.getElementById('setupSubject').value.trim();
    this.state.teacherProfile = { name: name || 'أ. مستخدم البرنامج', subject };
    this.save();
    document.getElementById('lockRoot').innerHTML = '';
    this.finishInit();
  },

  // ===== قفل بكلمة سر بسيط =====
  renderLockScreen(){
    document.getElementById('lockRoot').innerHTML = `
    <div class="full-screen-gate">
      <div class="gate-card">
        <div class="gate-icon">🔒</div>
        <h2>البرنامج مقفول</h2>
        <p>اكتب كلمة السر عشان تدخل</p>
        <input id="unlockPass" type="password" placeholder="كلمة السر" onkeydown="if(event.key==='Enter') app.attemptUnlock()">
        <div class="gate-error" id="unlockError"></div>
        <button class="btn brass" style="width:100%;padding:12px;" onclick="app.attemptUnlock()">فتح</button>
      </div>
    </div>`;
    document.getElementById('unlockPass').focus();
  },
  async attemptUnlock(){
    const input = document.getElementById('unlockPass');
    const pass = input.value;
    const hash = await hashText(pass);
    if(hash === this.state.security.passwordHash){
      document.getElementById('lockRoot').innerHTML = '';
      if(!this.state.teacherProfile.name){ this.renderWelcomeSetup(); } else { this.finishInit(); }
    } else {
      document.getElementById('unlockError').textContent = 'كلمة السر غلط، جرّب تاني';
      input.value = '';
      input.focus();
    }
  },

  // ===== إدارة كلمة السر من الإعدادات =====
  async enablePassword(){
    const p1 = document.getElementById('newPass1').value;
    const p2 = document.getElementById('newPass2').value;
    const msgEl = document.getElementById('passSetMsg');
    if(!p1 || p1.length < 4){ msgEl.textContent = 'كلمة السر لازم تكون 4 حروف/أرقام على الأقل'; msgEl.style.color = 'var(--red)'; return; }
    if(p1 !== p2){ msgEl.textContent = 'كلمة السر مش متطابقة في الخانتين'; msgEl.style.color = 'var(--red)'; return; }
    this.state.security = { enabled:true, passwordHash: await hashText(p1) };
    this.save();
    msgEl.style.color = 'var(--green)';
    msgEl.textContent = '✓ اتفعّل القفل. المرة الجاية اللي هتفتح فيها البرنامج هيطلب منك الكلمة دي.';
    this.render();
  },
  async changePassword(){
    const current = document.getElementById('curPass').value;
    const p1 = document.getElementById('changePass1').value;
    const p2 = document.getElementById('changePass2').value;
    const msgEl = document.getElementById('passChangeMsg');
    const currentHash = await hashText(current);
    if(currentHash !== this.state.security.passwordHash){ msgEl.style.color='var(--red)'; msgEl.textContent = 'كلمة السر الحالية غلط'; return; }
    if(!p1 || p1.length < 4){ msgEl.style.color='var(--red)'; msgEl.textContent = 'كلمة السر الجديدة لازم تكون 4 حروف/أرقام على الأقل'; return; }
    if(p1 !== p2){ msgEl.style.color='var(--red)'; msgEl.textContent = 'كلمة السر الجديدة مش متطابقة في الخانتين'; return; }
    this.state.security.passwordHash = await hashText(p1);
    this.save();
    msgEl.style.color='var(--green)'; msgEl.textContent = '✓ اتغيّرت كلمة السر بنجاح';
  },
  async disablePassword(){
    if(!await this.confirmModal('متأكد تلغي القفل؟ أي حد يفتح البرنامج من غير كلمة سر بعد كده.', {danger:true})) return;
    this.state.security = { enabled:false, passwordHash:null };
    this.save();
    this.render();
  },
  lockNow(){
    if(!this.state.security.enabled || !this.state.security.passwordHash){ this.alertModal('القفل مش مفعّل. فعّله الأول من الإعدادات.'); return; }
    document.getElementById('alarmRoot').innerHTML = '';
    this.closeModal();
    this.renderLockScreen();
  },

  async requestWakeLock(){
    try{
      if('wakeLock' in navigator){ this.wakeLock = await navigator.wakeLock.request('screen'); }
    }catch(e){ console.log('تعذر تفعيل منع قفل الشاشة (مش كل المتصفحات بتدعمها)', e); }
  },

  // بيحفظ كل بيانات البرنامج في localStorage الخاص بالمتصفح على شكل JSON واحد
  // ملحوظة: الحفظ متأخر شوية (debounce) عشان منكتبش في localStorage كل ثانية،
  // فلو المستخدم عمل Refresh بسرعة قبل ما الـ 250ms تخلص، آخر تعديل (زي ميعاد الحصة) كان بيضيع.
  // عشان كده الكتابة الفعلية بقت في persistNow()، وبنستدعيها فورًا برضه قبل غلق/تحديث الصفحة (تحت في beforeunload/pagehide/visibilitychange).
  save(){
    clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(()=>{ this.persistNow(); }, 250);
  },

  // بيكتب البيانات في localStorage فورًا من غير أي تأخير
  persistNow(){
    clearTimeout(this.saveTimer);
    try{
      const payload = JSON.stringify({
        students:this.state.students, records:this.state.records,
        schedules:this.state.schedules, cancelledSessions:this.state.cancelledSessions,
        gradeConfig:this.state.gradeConfig, gradeFees:this.state.gradeFees, telegramLinks:this.state.telegramLinks,
        whatsappGroupLinks:this.state.whatsappGroupLinks, trash:this.state.trash, uiPrefs:this.state.uiPrefs,
        teacherProfile:this.state.teacherProfile, security:this.state.security, examBank:this.state.examBank,
        bulkSendState:this.state.bulkSendState
      });
      localStorage.setItem(this.STORAGE_KEY, payload);
    }catch(e){ console.error('فشل الحفظ في localStorage (ممكن يكون التخزين ممتلئ أو المتصفح رافض حفظ البيانات)', e); }
  },

  getRecord(id){
    if(!this.state.records[id]) this.state.records[id] = {attendance:{}, payments:{}, grades:[]};
    const r = this.state.records[id];
    if(!r.attendance) r.attendance = {};
    if(!r.payments) r.payments = {};
    if(!r.grades) r.grades = [];
    return r;
  },

  studentsInGrade(gradeId){ return this.state.students.filter(s=>s.grade===gradeId); },
  studentsInGradeGroup(gradeId, groupFilter){
    return this.state.students.filter(s=> s.grade===gradeId && (groupFilter==='all' || s.group===groupFilter));
  },

  getActiveMonth(){
    const now = new Date();
    let y = now.getFullYear(), m = now.getMonth();
    if(now.getDate() <= 7){ m -= 1; if(m < 0){ m = 11; y -= 1; } }
    return {year:y, month:m, key:`${y}-${m}`};
  },
  // بيرجع كل الشهور من شهر تسجيل الطالب لحد الشهر الحالي (الأحدث الأول) — تُستخدم في اختيار شهر تقرير الطالب
  monthsSinceRegistration(createdAtISO){
    let start = createdAtISO ? new Date(createdAtISO) : null;
    if(!start || isNaN(start.getTime())){ start = new Date(); start.setMonth(start.getMonth()-11); } // احتياطي: آخر 12 شهر لو تاريخ التسجيل مش متوفر
    const now = new Date();
    let y = start.getFullYear(), m = start.getMonth();
    const endY = now.getFullYear(), endM = now.getMonth();
    const months = [];
    while(y < endY || (y===endY && m<=endM)){
      months.push({year:y, month:m, key:`${y}-${m}`});
      m++; if(m>11){ m=0; y++; }
    }
    return months.reverse();
  },

  attendancePct(id){
    const rec = this.getRecord(id);
    const entries = Object.values(rec.attendance);
    if(entries.length===0) return null;
    const present = entries.filter(v=>v==='present').length;
    return Math.round(present/entries.length*100);
  },

  // بتقبل إما كائن الطالب مباشرة (أسرع، مفيش بحث) أو الـ id بتاعه (بيتم البحث عنه، للتوافق مع أي استدعاء قديم)
  monthlyAbsenceCount(student, year, month){
    const s = typeof student === 'string' ? this.state.students.find(x=>x.id===student) : student;
    if(!s) return 0;
    const rec = this.getRecord(s.id);
    let count = 0;
    Object.entries(rec.attendance).forEach(([date,status])=>{
      const d = new Date(date);
      if(d.getFullYear()===year && d.getMonth()===month && status==='absent'){
        const cancelKey = `${s.grade}-${s.group}-${date}`;
        if(!this.state.cancelledSessions[cancelKey]) count++;
      }
    });
    return count;
  },

  isPaidThisMonth(id){
    const rec = this.getRecord(id);
    const am = this.getActiveMonth();
    return !!(rec.payments[am.key] && rec.payments[am.key].paid);
  },

  // ===== navigation =====
  setTab(tab){ this.state.ui.tab = tab; this.state.ui.search=''; this.state.ui.groupFilter='all'; this.render(); },
  onSearch(v){ this.state.ui.search = v; this.renderMain(); },
  setGroupFilter(g){ this.state.ui.groupFilter = g; this.renderMain(); },
  setFilterType(v){ this.state.ui.filterType = v; this.renderMain(); },
  // بيحفظ حد الغياب المسموح في uiPrefs (المكان اللي فعلاً بيتحفظ في localStorage) عشان يفضل زي ما هو بعد أي Refresh
  setAbsenceThreshold(v){ this.state.uiPrefs.absenceThreshold = Math.max(1, parseInt(v)||4); this.save(); this.renderMain(); },
  toggleDarkMode(){
    this.state.uiPrefs.darkMode = !this.state.uiPrefs.darkMode;
    document.documentElement.setAttribute('data-theme', this.state.uiPrefs.darkMode?'dark':'light');
    this.updateThemeButtonLabel();
    this.save();
  },
  updateThemeButtonLabel(){
    const b = document.getElementById('themeToggleBtn');
    if(b) b.textContent = this.state.uiPrefs.darkMode? '☀️ الوضع النهاري':'🌙 الوضع الليلي';
  },

  openAddStudent(presetGrade){
    this.state.ui.addGradePreset = presetGrade || (GRADES[0].id);
    this.renderModal('add-student');
  },
  syncGroupOptions(gradeId){
    const sel = document.getElementById('groupSelectField');
    if(!sel) return;
    sel.innerHTML = gradeGroups(gradeId).map(gr=>`<option value="${gr.id}">${gr.name}</option>`).join('');
  },
  closeModal(){
    document.getElementById('modalRoot').innerHTML='';
  },

  // ===== تأكيد/تنبيه بشكل التطبيق بدل نوافذ المتصفح السودة الافتراضية =====
  // بيرجعوا Promise (زي confirm/alert الأصليين بالظبط)، فبيتستخدموا بـ await من أي دالة async
  _dialogResolve: null,
  _showDialog(message, {confirmText='تأكيد', cancelText='إلغاء', showCancel=true, danger=false, icon='❓'}={}){
    return new Promise(resolve=>{
      this._dialogResolve = resolve;
      document.getElementById('modalRoot').innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app._resolveDialog(false)">
        <div class="modal confirm-modal">
          <div class="cm-deco">${mathDecoSpans()}<div class="cm-icon">${icon}</div></div>
          <div class="cm-body">
            <div class="cm-message">${message}</div>
            <div class="cm-actions">
              ${showCancel? `<button type="button" class="btn outline" onclick="app._resolveDialog(false)">${cancelText}</button>` : ''}
              <button type="button" class="btn ${danger?'danger':''}" onclick="app._resolveDialog(true)">${confirmText}</button>
            </div>
          </div>
        </div>
      </div>`;
    });
  },
  _resolveDialog(result){
    document.getElementById('modalRoot').innerHTML = '';
    const resolve = this._dialogResolve;
    this._dialogResolve = null;
    if(resolve) resolve(result);
  },
  // بديل مخصص لـ window.confirm — بيرجع true/false زيه بالظبط
  confirmModal(message, opts={}){
    return this._showDialog(message, Object.assign({confirmText:'تأكيد', cancelText:'إلغاء', showCancel:true, icon:'❓'}, opts));
  },
  // بديل مخصص لـ window.alert — بيتقفل لما تدوس "تمام"
  alertModal(message, opts={}){
    return this._showDialog(message, Object.assign({confirmText:'تمام', showCancel:false, icon:'ℹ️'}, opts));
  },

  isDuplicateName(name, excludeId){
    const norm = s => s.trim().replace(/\s+/g,' ').toLowerCase();
    return this.state.students.some(s => s.id!==excludeId && norm(s.name)===norm(name));
  },
  async addStudent(e){
    e.preventDefault();
    const f = e.target;
    const name = f.studentName.value.trim();
    if(!name){ return; }
    const grade = f.grade.value, group = f.group.value;
    const phone = f.phone.value.trim(), parentPhone = f.parentPhone.value.trim();
    if(this.isDuplicateName(name, null)){
      const ok = await this.confirmModal(`فيه طالب اسمه "${name}" مسجّل عندك بالفعل. لو مش نفس الطالب، يفضل تضيف حاجة تميزه (زي اسم العيلة). عايز تكمل الإضافة بنفس الاسم برضه؟`);
      if(!ok) return;
    }
    const student = {
      id: uid(), name, grade, group,
      phone, parentPhone,
      fee: null, createdAt: todayISO()
    };
    this.state.students.push(student);
    this.getRecord(student.id);
    this._attendanceEnsuredDate = null; // طالب جديد ممكن يكون ليه حصة النهارده، فلازم نعيد فحص الحضور الافتراضي
    this.save();
    this.closeModal();
    this.state.ui.tab = student.grade;
    this.render();
  },

  openEditStudent(id){
    this.state.ui.editStudentId = id;
    this.renderModal('edit-student');
  },
  async updateStudent(e, id){
    e.preventDefault();
    const f = e.target;
    const s = this.state.students.find(x=>x.id===id);
    if(!s) return;
    const newName = f.studentName.value.trim() || s.name;
    const grade = f.grade.value, group = f.group.value;
    const phone = f.phone.value.trim(), parentPhone = f.parentPhone.value.trim();
    const feeVal = f.fee.value.trim();
    if(this.isDuplicateName(newName, id)){
      const ok = await this.confirmModal(`فيه طالب اسمه "${newName}" مسجّل عندك بالفعل. لو مش نفس الطالب، يفضل تضيف حاجة تميزه (زي اسم العيلة). عايز تكمل بنفس الاسم برضه؟`);
      if(!ok) return;
    }
    s.name = newName;
    s.grade = grade;
    s.group = group;
    s.phone = phone;
    s.parentPhone = parentPhone;
    s.fee = feeVal==='' ? null : (parseFloat(feeVal)||0);
    this._attendanceEnsuredDate = null; // ممكن يكون اتغيّر الصف/المجموعة، فلازم نعيد فحص الحضور الافتراضي
    this.save();
    this.closeModal();
    this.render();
  },

  async deleteStudent(id){
    if(!await this.confirmModal('هل تريد نقل هذا الطالب لسلة المهملات؟ تقدر تسترجعه بعدين من الإعدادات.', {danger:true, confirmText:'نقل لسلة المهملات'})) return;
    const idx = this.state.students.findIndex(s=>s.id===id);
    if(idx===-1) return;
    const [student] = this.state.students.splice(idx,1);
    const record = this.state.records[id];
    delete this.state.records[id];
    this.state.trash.students.push({ student, record, deletedAt: todayISO() });
    this.save();
    this.closeModal();
    this.render();
  },
  // نقل جميع طلاب مجموعة معينة للصف اللي بعدها في بداية سنة دراسية جديدة (بيانات الطالب القديمة - حضور ودرجات ومدفوعات - بتفضل محفوظة)
  async promoteGroupToNextGrade(gradeId, groupId){
    const students = this.state.students.filter(s=>s.grade===gradeId && s.group===groupId);
    if(students.length===0){ this.alertModal('مفيش طلاب في المجموعة دي أصلاً.'); return; }
    const g = gradeById(gradeId);
    const grName = gradeGroupName(gradeId, groupId);
    const nextGradeId = NEXT_GRADE[gradeId];

    if(!nextGradeId){
      const ok = await this.confirmModal(`${grName} - ${g.name} هي آخر سنة دراسية، فمفيش صف بعدها. عايز تنقل الـ${students.length} طالب دول لسلة المهملات باعتبار إنهم اتخرجوا؟ تقدر ترجعهم منها في أي وقت لو غلطت.`, {danger:true, confirmText:'نقل لسلة المهملات', icon:'🎓'});
      if(!ok) return;
      students.forEach(s=>{
        const idx = this.state.students.findIndex(x=>x.id===s.id);
        if(idx===-1) return;
        const [student] = this.state.students.splice(idx,1);
        const record = this.state.records[student.id];
        delete this.state.records[student.id];
        this.state.trash.students.push({ student, record, deletedAt: todayISO() });
      });
      this.save();
      this.render();
      this.alertModal(`تم نقل ${students.length} طالب من ${grName} لسلة المهملات باعتبار إنهم اتخرجوا 🎓`);
      return;
    }

    const nextG = gradeById(nextGradeId);
    const destGroups = gradeGroups(nextGradeId);
    const destGroupId = destGroups.find(x=>x.id===groupId) ? groupId : (destGroups[0] ? destGroups[0].id : null);
    if(!destGroupId){ this.alertModal('الصف الجاي مفيهوش أي مجموعة متظبطة. ظبط المجموعات الأول من "⚙️ الإعدادات".'); return; }
    const destGroupName = gradeGroupName(nextGradeId, destGroupId);

    const ok = await this.confirmModal(`هيتم نقل ${students.length} طالب من "${grName} - ${g.name}" إلى "${destGroupName} - ${nextG.name}". بياناتهم القديمة (الحضور والدرجات والمدفوعات) هتفضل محفوظة زي ما هي. متأكد؟`, {icon:'📤'});
    if(!ok) return;

    students.forEach(s=>{ s.grade = nextGradeId; s.group = destGroupId; });
    this._attendanceEnsuredDate = null;
    this.save();
    this.state.ui.tab = nextGradeId;
    this.state.ui.groupFilter = 'all';
    this.render();
    this.alertModal(`تم نقل ${students.length} طالب بنجاح لـ${destGroupName} - ${nextG.name} ✓`);
  },
  restoreStudent(trashIdx){
    const item = this.state.trash.students[trashIdx];
    if(!item) return;
    this.state.students.push(item.student);
    if(item.record) this.state.records[item.student.id] = item.record;
    this.state.trash.students.splice(trashIdx,1);
    this._attendanceEnsuredDate = null;
    this.save();
    this.render();
  },
  async permanentlyDeleteFromTrash(trashIdx){
    if(!await this.confirmModal('حذف نهائي مش هيترجع تاني. متأكد؟', {danger:true, confirmText:'حذف نهائي', icon:'🗑️'})) return;
    this.state.trash.students.splice(trashIdx,1);
    this.save();
    this.render();
  },

  openStudent(id){
    this.state.ui.selectedStudent = id;
    this.state.ui.studentSubTab = 'payments';
    this.state.ui.reportMonthKey = null; // يرجع لعرض الشهر النشط الحالي كل ما نفتح طالب جديد
    this.renderModal('student-detail');
  },
  setStudentSubTab(t){ this.state.ui.studentSubTab = t; this.renderModal('student-detail'); },
  setReportMonth(key){ this.state.ui.reportMonthKey = key; this.renderModal('student-detail'); },
  setAttendancePickedDate(v){ this.state.ui.attendancePickedDate = v; this.renderModal('student-detail'); },

  // ===== attendance (مرتبطة بميعاد الحصص - تتسجل بس يوم ما فيه حصة فعلاً) =====
  hasClassToday(gradeId, groupId){
    if(this.isCancelledToday(gradeId, groupId)) return false;
    const today = new Date().getDay();
    return this.getSessions(gradeId, groupId).some(s => s && s.day!==undefined && s.day!=='' && Number(s.day)===today);
  },

  // ===== تسجيل الحضور تلقائيًا =====
  // يوم ما تكون فيه حصة فعلاً لمجموعة معينة، كل طلابها يتسجلوا "حاضر" تلقائيًا من غير أي تدخل من حد.
  // المدرس بعد كده بس يحوّل أي طالب مش موجود لـ"غايب" بضغطة واحدة (من لوحة الصف أو من تفاصيل الطالب)،
  // وأي وقت يرجّعه "حاضر" تاني بنفس الضغطة لو غلط في الاختيار.
  // بتتأكد إن كل طالب ليه حصة النهارده اتسجله حضور افتراضي (لو لسه معندوش حالة مسجلة). كانت بتتنفذ (مسح كامل لكل الطلاب) في كل مرة الشاشة بترندر حتى مع كل حرف بتكتبه في خانة البحث، وده كان بيسبب بطء ملحوظ خصوصًا مع زيادة عدد الطلاب. دلوقتي بتتنفذ مرة واحدة بس لكل يوم.
  ensureTodayAttendance(){
    const today = todayISO();
    if(this._attendanceEnsuredDate === today) return;
    let changed = false;
    GRADES.forEach(g=>{
      gradeGroups(g.id).forEach(gr=>{
        if(!this.hasClassToday(g.id, gr.id)) return;
        this.state.students
          .filter(s=> s.grade===g.id && s.group===gr.id)
          .forEach(s=>{
            const rec = this.getRecord(s.id);
            if(rec.attendance[today] === undefined){ rec.attendance[today] = 'present'; changed = true; }
          });
      });
    });
    this._attendanceEnsuredDate = today;
    if(changed) this.save();
  },
  // يقلب حالة حضور طالب معين النهارده بين حاضر وغايب (لو لسه من غير حالة، أول ضغطة تسجله حاضر) — بيتنادى بس من جوه تفاصيل الطالب
  toggleAttendanceToday(id){
    const rec = this.getRecord(id);
    const today = todayISO();
    rec.attendance[today] = (rec.attendance[today] === 'present') ? 'absent' : 'present';
    this.save();
  },
  // بترندر مودال تفاصيل الطالب تاني بعد التعديل، عشان الزرار يتحدث فورًا
  toggleAttendanceAndRefreshModal(id){
    this.toggleAttendanceToday(id);
    this.renderModal('student-detail');
  },
  // بيرجع شكل عرض حالة حضور طالب معين النهارده (لون/أيقونة/نص) — مستخدم في أكتر من مكان في تفاصيل الطالب
  todayAttendanceDisplay(studentId){
    const status = this.getRecord(studentId).attendance[todayISO()];
    if(status==='present') return {cls:'is-present', icon:'✓', label:'حاضر'};
    if(status==='absent') return {cls:'is-absent', icon:'✕', label:'غايب'};
    return {cls:'is-unset', icon:'—', label:'لسه ماتسجلش'};
  },
  // بيرجع شهرية الطالب: لو محددة له شخصيًا تتاخد، وإلا شهرية الصف الموحدة من الإعدادات
  getStudentFee(student){
    if(student.fee !== null && student.fee !== undefined && student.fee !== '') return student.fee;
    return this.state.gradeFees[student.grade] || 0;
  },
  setGradeFee(gradeId, value){
    this.state.gradeFees[gradeId] = parseFloat(value)||0;
    this.save();
  },

  // ===== payments =====
  togglePayment(id, year, monthIdx){
    const rec = this.getRecord(id);
    const key = `${year}-${monthIdx}`;
    const student = this.state.students.find(s=>s.id===id);
    if(rec.payments[key] && rec.payments[key].paid){ rec.payments[key] = {paid:false}; }
    else { rec.payments[key] = {paid:true, amount: this.getStudentFee(student), date: todayISO()}; }
    this.save();
  },
  // نسخة للاستخدام جوه مودال تفاصيل الطالب (بترندر المودال تاني بعد التعديل)
  togglePaymentAndRefreshModal(id, year, monthIdx){
    this.togglePayment(id, year, monthIdx);
    this.renderModal('student-detail');
  },
  // تحصيل سريع لشهرية الشهر الحالي من جدول الصف أو من لستة تسجيل الحضور بالكود — من غير فتح بروفايل الطالب
  toggleActiveMonthPaymentQuick(id){
    const am = this.getActiveMonth();
    this.togglePayment(id, am.year, am.month);
    this.renderMain();
  },
  changePaymentYear(delta){ this.state.ui.paymentYear += delta; this.renderModal('student-detail'); },

  // ===== grades =====
  addGradeEntry(e, id){
    e.preventDefault();
    const f = e.target;
    const subject = f.subject.value.trim() || this.state.teacherProfile.subject || 'رياضيات';
    const examName = f.examName.value.trim();
    const score = parseFloat(f.score.value);
    const maxScore = parseFloat(f.maxScore.value);
    if(isNaN(score) || isNaN(maxScore)) return;
    const rec = this.getRecord(id);
    rec.grades.unshift({id:uid(), subject, examName, score, maxScore, date: todayISO()});
    this.save(); f.reset();
    this.renderModal('student-detail');
  },
  deleteGradeEntry(id, entryId){
    const rec = this.getRecord(id);
    rec.grades = rec.grades.filter(g=>g.id!==entryId);
    this.save();
    this.renderModal('student-detail');
  },
  // بيرسم مخطط بسيط (SVG) لتطور نسبة درجات الطالب عبر الوقت، وبيحسب هل مستواه في تحسّن ولا تراجع
  renderGradeTrendChart(grades){
    if(!grades || grades.length < 2){
      return `<div class="grade-chart-empty">📈 لسه مفيش درجات كفاية عشان نعرض رسم بياني للمستوى (محتاج درجتين على الأقل).</div>`;
    }
    // rec.grades متخزنة بالأحدث الأول (unshift)، فبنعكسها عشان الرسم يبدأ بالأقدم وينتهي بالأحدث
    const chron = [...grades].reverse();
    const pts = chron.map(g => ({ pct: Math.max(0, Math.min(100, Math.round(g.score/g.maxScore*100))), label: gradeExamLabel(g), date: fmtDate(g.date), subject: g.subject }));

    const W = 640, H = 200, padL = 34, padR = 14, padT = 14, padB = 28;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const n = pts.length;
    const xFor = (i) => padL + (n===1 ? plotW/2 : (i/(n-1))*plotW);
    const yFor = (pct) => padT + plotH - (pct/100)*plotH;

    const gridLines = [0,25,50,75,100].map(v => {
      const y = yFor(v);
      return `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="var(--paper-line)" stroke-width="1"/><text x="${padL-8}" y="${y+4}" font-size="10" fill="var(--ink-soft)" text-anchor="end">${v}%</text>`;
    }).join('');

    const linePoints = pts.map((p,i)=>`${xFor(i)},${yFor(p.pct)}`).join(' ');

    const dots = pts.map((p,i)=>{
      const x = xFor(i), y = yFor(p.pct);
      const color = p.pct>=85 ? 'var(--green)' : (p.pct>=60 ? 'var(--brass)' : 'var(--red)');
      const titleText = `${p.subject} — ${p.label} — ${p.date}: ${p.pct}%`;
      return `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="#fff" stroke-width="1.5"><title>${titleText}</title></circle>`;
    }).join('');

    // تسميات محور السين: لو النقط قليلة اعرض كل تاريخ، لو كتير اعرض الأول والأخير بس عشان الزحمة
    const labelIdxs = n<=8 ? pts.map((_,i)=>i) : [0, n-1];
    const xLabels = labelIdxs.map(i=> `<text x="${xFor(i)}" y="${H-8}" font-size="10" fill="var(--ink-soft)" text-anchor="middle">${pts[i].date}</text>`).join('');

    // اتجاه المستوى: متوسط أول نص الدرجات مقابل متوسط تاني نص
    const half = Math.max(1, Math.floor(n/2));
    const avgOf = arr => arr.reduce((a,p)=>a+p.pct,0)/arr.length;
    const diff = Math.round(avgOf(pts.slice(n-half)) - avgOf(pts.slice(0,half)));
    let trendHtml;
    if(diff > 4) trendHtml = `<span style="color:var(--green);">📈 المستوى في تحسّن (${diff>0?'+':''}${diff}%)</span>`;
    else if(diff < -4) trendHtml = `<span style="color:var(--red);">📉 المستوى في تراجع (${diff}%) — محتاج متابعة</span>`;
    else trendHtml = `<span style="color:var(--brass-dark);">➡️ المستوى مستقر تقريبًا</span>`;

    return `
    <div class="grade-chart-wrap">
      <div class="grade-chart-title">📈 تطور المستوى عبر الوقت — ${trendHtml}</div>
      <svg viewBox="0 0 ${W} ${H}" class="grade-chart-svg">
        ${gridLines}
        <polyline points="${linePoints}" fill="none" stroke="var(--brass)" stroke-width="2.5"/>
        ${dots}
        ${xLabels}
      </svg>
    </div>`;
  },

  // ===== schedules & cancellation =====
  // كل مجموعة ليها أكتر من حصة أسبوعيًا، فبنخزنهم كمصفوفة sessions: [{day,time}, ...]
  getSessions(gradeId, group){
    const raw = this.state.schedules[`${gradeId}-${group}`];
    if(!raw) return [];
    if(raw.sessions) return raw.sessions;
    if(raw.day!==undefined) return [{day:raw.day, time:raw.time}]; // توافق مع بيانات قديمة
    return [];
  },
  setSchedule(gradeId, group, sessionIdx, field, value){
    const key = `${gradeId}-${group}`;
    if(!this.state.schedules[key] || !this.state.schedules[key].sessions) this.state.schedules[key] = {sessions:[]};
    if(!this.state.schedules[key].sessions[sessionIdx]) this.state.schedules[key].sessions[sessionIdx] = {};
    this.state.schedules[key].sessions[sessionIdx][field] = value;
    this.save();
  },
  // بيرجع كل حصص النهاردة (من كل الصفوف والمجموعات) مرتبة حسب الميعاد، مستخدمة في بطاقة "حصص اليوم" بالنظرة العامة
  getTodaysSessions(){
    const todayIdx = new Date().getDay();
    const list = [];
    GRADES.forEach(g=>{
      gradeGroups(g.id).forEach(gr=>{
        const sessions = this.getSessions(g.id, gr.id);
        const matches = sessions.filter(s=> s && s.day!==undefined && s.day!=='' && Number(s.day)===todayIdx);
        if(matches.length===0) return;
        const time = matches.map(s=>s.time).filter(Boolean).sort()[0] || '';
        list.push({
          grade:g, group:gr, time,
          cancelled: this.isCancelledToday(g.id, gr.id),
          count: this.studentsInGradeGroup(g.id, gr.id).length
        });
      });
    });
    list.sort((a,b)=>{
      if(!a.time && !b.time) return 0;
      if(!a.time) return 1;
      if(!b.time) return -1;
      return a.time.localeCompare(b.time);
    });
    return list;
  },
  isCancelledToday(gradeId, group){ return !!this.state.cancelledSessions[`${gradeId}-${group}-${todayISO()}`]; },
  toggleCancelToday(gradeId, group){
    const key = `${gradeId}-${group}-${todayISO()}`;
    const wasCancelled = !!this.state.cancelledSessions[key];
    if(wasCancelled) delete this.state.cancelledSessions[key];
    else this.state.cancelledSessions[key] = true;
    this.save();
    this.renderMain();
    if(!wasCancelled) this.broadcastCancellation(gradeId, group);
  },

  // ===== إعدادات المجموعات وعدد الحصص =====
  setGradeSessionsCount(gradeId, value){
    const n = Math.max(1, parseInt(value)||1);
    if(!this.state.gradeConfig[gradeId]) this.ensureGradeConfigDefaults();
    this.state.gradeConfig[gradeId].sessions = n;
    this.save();
    this.render();
  },
  addGroupToGrade(gradeId){
    const input = document.getElementById(`newGroupName_${gradeId}`);
    const name = input && input.value.trim();
    if(!name){ return; }
    if(!this.state.gradeConfig[gradeId]) this.ensureGradeConfigDefaults();
    this.state.gradeConfig[gradeId].groups.push({id: uid(), name});
    this.save();
    this.render();
  },
  async removeGroupFromGrade(gradeId, groupId){
    const hasStudents = this.state.students.some(s=>s.grade===gradeId && s.group===groupId);
    if(hasStudents){ this.alertModal('في طلاب متسجلين في المجموعة دي، مينفعش تتحذف. انقل الطلاب لمجموعة تانية الأول.'); return; }
    if(this.state.gradeConfig[gradeId].groups.length<=1){ this.alertModal('لازم يفضل مجموعة واحدة على الأقل في كل صف.'); return; }
    if(!await this.confirmModal('حذف المجموعة دي؟', {danger:true, confirmText:'حذف', icon:'🗑️'})) return;
    this.state.gradeConfig[gradeId].groups = this.state.gradeConfig[gradeId].groups.filter(g=>g.id!==groupId);
    this.save();
    this.render();
  },
  setTelegramLink(key, value){ this.state.telegramLinks[key] = value.trim(); this.save(); },
  setWhatsappGroupLink(key, value){ this.state.whatsappGroupLinks[key] = value.trim(); this.save(); },

  // إعداد رسالة إلغاء الحصة، وعرضها في نافذة واضحة بدل ما نفتح واتساب/تليجرام لوحدهم من غير رسالة
  broadcastCancellation(gradeId, groupId){
    const g = gradeById(gradeId);
    const grName = gradeGroupName(gradeId, groupId);
    const msg = `تنبيه: حصة اليوم (${fmtDate(todayISO())}) الخاصة بـ${grName} - ${g.name} اتلغت. نعتذر عن أي إزعاج.` + this.teacherSignature();
    const key = `${gradeId}-${groupId}`;
    this.state.ui.cancellationMessage = msg;
    this.state.ui.cancellationTg = this.state.telegramLinks[key] || '';
    this.state.ui.cancellationWa = this.state.whatsappGroupLinks[key] || '';
    this.renderModal('cancellation-broadcast');
  },
  async copyCancellationMessage(){
    try{
      await navigator.clipboard.writeText(this.state.ui.cancellationMessage);
      const btn = document.getElementById('copyCancelBtn');
      if(btn){ const old = btn.textContent; btn.textContent = '✓ اتنسخت'; setTimeout(()=>{ btn.textContent = old; }, 1500); }
    }catch(e){
      const ta = document.getElementById('cancellationMsgBox');
      if(ta){ ta.select(); document.execCommand('copy'); }
    }
  },

  // ===== alarm clock =====
  unlockAudio(){
    try{ if(!this.audioCtx) this.audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){}
  },
  ALARM_LEAD_MINUTES: 40,
  playBeep(){
    try{
      if(!this.audioCtx) this.audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      const ctx = this.audioCtx;
      const freqs = [880, 660, 880, 660, 880];
      freqs.forEach((freq, i)=>{
        const delay = i * 0.45;
        const o = ctx.createOscillator(); const g = ctx.createGain();
        o.type='sine'; o.frequency.value=freq;
        o.connect(g); g.connect(ctx.destination);
        const t = ctx.currentTime + delay;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(0.6, t+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, t+0.4);
        o.start(t); o.stop(t+0.42);
      });
    }catch(e){ console.log('تعذر تشغيل الصوت', e); }
  },
  startAlarmClock(){
    setInterval(()=>this.checkAlarms(), 20000);
    this.checkAlarms();
  },
  checkAlarms(){
    const now = new Date();
    const today = todayISO();
    const lead = this.ALARM_LEAD_MINUTES;
    GRADES.forEach(g=>{
      gradeGroups(g.id).forEach(gr=>{
        const groupId = gr.id;
        const key = `${g.id}-${groupId}`;
        const sessions = this.getSessions(g.id, groupId);
        if(this.state.cancelledSessions[`${key}-${today}`]) return;
        sessions.forEach((sched, idx)=>{
          if(!sched || sched.day===undefined || sched.day===null || sched.day==='' || !sched.time) return;
          if(Number(sched.day) !== now.getDay()) return;
          const [hh,mm] = sched.time.split(':').map(Number);
          const classTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hh, mm, 0);
          const diffMin = (classTime - now) / 60000;
          const alertKey = `${key}-${today}-${idx}`;
          if(diffMin <= lead && diffMin > lead-1 && !this.alertedAlarms.has(alertKey)){
            this.alertedAlarms.add(alertKey);
            this.playBeep();
            this.showAlarmBanner(g, gr, sched.time);
          }
        });
      });
    });
  },
  showAlarmBanner(grade, group, time){
    document.getElementById('alarmRoot').innerHTML = `
      <div class="alarm-banner">
        ⏰ لسه على ميعاد مجموعة ${group.name} — ${grade.name} ${this.ALARM_LEAD_MINUTES} دقيقة (الساعة ${time})
        <button onclick="app.toggleCancelToday('${grade.id}','${group.id}'); app.dismissAlarm();">إلغاء الحصة النهارده</button>
        <button onclick="app.dismissAlarm()">تمام، شكرًا</button>
      </div>`;
  },
  dismissAlarm(){ document.getElementById('alarmRoot').innerHTML=''; },

  // ===== parent messaging =====
  // بيضيف توقيع الأستاذ (اسمه ومادته) في آخر أي رسالة واتساب
  teacherSignature(){
    const tp = this.state.teacherProfile;
    if(!tp || !tp.name) return '';
    return `\n\n— الأستاذ/ة ${tp.name}${tp.subject? ' (مادة '+tp.subject+')':''}`;
  },
  buildPaymentReminderMessage(studentId){
    const s = this.state.students.find(x=>x.id===studentId);
    const g = gradeById(s.grade);
    const am = this.getActiveMonth();
    const monthLabel = `${am.month+1}/${am.year}`;
    return `تذكير بسيط: شهرية ${monthLabel} للطالب/ة ${s.name} (${g.name}) لسه ما اتحصّلتش. برجاء السداد في أقرب وقت ممكن، وشكرًا لتعاونكم.` + this.teacherSignature();
  },
  buildFullTermMessage(studentId){
    const s = this.state.students.find(x=>x.id===studentId);
    const g = gradeById(s.grade);
    const rec = this.getRecord(studentId);
    const pct = this.attendancePct(studentId);
    const totalAbsences = Object.values(rec.attendance).filter(v=>v==='absent').length;
    const monthsPaid = Object.values(rec.payments).filter(p=>p && p.paid).length;
    const avg = rec.grades.length? Math.round(rec.grades.reduce((a,gd)=>a+(gd.score/gd.maxScore*100),0)/rec.grades.length) : null;
    let msg = `تقرير نهاية الترم للطالب/ة ${s.name} (${g.name})\n`;
    msg += `- نسبة الحضور خلال الترم: ${pct!==null? pct+'%':'لا يوجد سجل كافٍ'}\n`;
    msg += `- إجمالي أيام الغياب: ${totalAbsences}\n`;
    msg += `- عدد الشهور المدفوعة: ${monthsPaid}\n`;
    if(avg!==null) msg += `- المعدل العام في الامتحانات: ${avg}%\n`;
    if(rec.grades.length){
      msg += `- تفاصيل الدرجات:\n`;
      rec.grades.forEach(gd=> msg += `  ${gd.subject} (${gradeExamLabel(gd)}): ${gd.score}/${gd.maxScore}\n`);
    }
    msg += `شكرًا لمتابعتكم طول الترم.`;
    return msg + this.teacherSignature();
  },

  // ===== إرسال جماعي (زي القائمة اللي بتتفتح لكل ولي أمر لوحده) =====
  prepareBulkMessages(students, type){
    return students.filter(s=>s.parentPhone).map(s=>{
      let text;
      if(type==='payment-reminder') text = this.buildPaymentReminderMessage(s.id);
      else if(type==='monthly-report') text = this.buildParentMessage(s.id);
      else if(type==='term-report') text = this.buildFullTermMessage(s.id);
      else if(type.startsWith('grades-report')) text = this.buildLatestGradeMessage(s.id);
      return { id:s.id, name:s.name, link: `https://wa.me/${normalizePhone(s.parentPhone)}?text=${encodeURIComponent(text)}` };
    });
  },
  // بيفتح مودال الإرسال الجماعي. لو فيه دفعة سابقة من نفس النوع لسه ماخلصتش، بيسأل المدرّس يكمل منين وقف
  // ولا يبدأ من جديد — عشان مايبعتش لنفس ولي الأمر مرتين بالغلط لو قفل البرنامج في النص.
  async openBulkSendModal(students, type, title){
    const existing = this.state.bulkSendState[type];
    const hasUnfinished = existing && existing.items && existing.items.some(it=>!it.sent);
    if(hasUnfinished){
      const doneCount = existing.items.filter(it=>it.sent).length;
      const resume = await this.confirmModal(
        `لسه عندك دفعة "${existing.title}" ماخلصتش (بعت لـ ${doneCount} من ${existing.items.length}). عايز تكمل منين وقفت، ولا تبدأ دفعة جديدة من الأول؟`,
        { confirmText:'أكمل منين وقفت', cancelText:'ابدأ من جديد', icon:'📤' }
      );
      if(resume){
        this.state.ui.activeBulkType = type;
        this.renderModal('bulk-send');
        return;
      }
    }
    this._startFreshBulkSend(students, type, title);
  },
  _startFreshBulkSend(students, type, title){
    const links = this.prepareBulkMessages(students, type);
    this.state.bulkSendState[type] = { title, totalRequested: students.length, items: links.map(l=>Object.assign({}, l, {sent:false})) };
    this.state.ui.activeBulkType = type;
    this.save();
    this.renderModal('bulk-send');
  },
  // بتتنده كل ما يدوس على زرار "افتح واتساب" للشخص الحالي — بتعلّمه "اتبعت" وتتحفظ فورًا، عشان لو قفل
  // البرنامج فجأة أو النت وقع، التقدم يفضل محفوظ ومايرجعش يبعتله تاني من الأول.
  // (فتح واتساب نفسه بيحصل من الـ href مباشرة، مش من هنا، عشان يفضل ضغطة مستخدم حقيقية ومتصفحش المتصفح يمنعها)
  advanceBulkSendIndex(){
    const type = this.state.ui.activeBulkType;
    const batch = this.state.bulkSendState[type];
    if(!batch) return;
    const next = batch.items.find(it=>!it.sent);
    if(next) next.sent = true;
    this.save();
    this.renderModal('bulk-send');
  },
  async clearBulkSendBatch(type){
    if(!await this.confirmModal('تلغي تتبّع الدفعة دي؟ المرة الجاية هيبدأ من الأول من غير ما يفتكر مين اتبعتله.', {danger:true})) return;
    delete this.state.bulkSendState[type];
    this.save();
    this.closeModal();
  },
  remindAllUnpaid(){
    const am = this.getActiveMonth();
    const unpaid = this.state.students.filter(s=>{ const rec=this.getRecord(s.id); return !(rec.payments[am.key] && rec.payments[am.key].paid); });
    return this.openBulkSendModal(unpaid, 'payment-reminder', `تذكير بشهرية ${am.month+1}/${am.year}`);
  },
  sendAllMonthlyReports(){
    const am = this.getActiveMonth();
    return this.openBulkSendModal(this.state.students, 'monthly-report', `تقارير شهر ${am.month+1}/${am.year}`);
  },
  sendAllTermReports(){
    const students = this.state.students.filter(s=>s.grade!=='sec3');
    return this.openBulkSendModal(students, 'term-report', 'تقارير نهاية الترم/السنة (بدون تالتة ثانوي)');
  },
  // بيبعت لكل ولي أمر آخر درجة اتسجلت لابنه بس (زي لما تخلص تسجيل نتيجة امتحان لكل الطلاب وتحب تبلغهم دفعة واحدة)
  sendAllLatestGrades(){
    const withGrades = this.state.students.filter(s=>{ const rec=this.getRecord(s.id); return rec.grades && rec.grades.length>0; });
    return this.openBulkSendModal(withGrades, 'grades-report', 'إرسال آخر درجة لكل الطلاب');
  },
  // نفس فكرة sendAllLatestGrades بس لصف واحد بس (مش كل الصفوف مع بعض)
  sendGradesForGrade(gradeId){
    const g = gradeById(gradeId);
    const withGrades = this.state.students.filter(s=> s.grade===gradeId && (()=>{ const rec=this.getRecord(s.id); return rec.grades && rec.grades.length>0; })());
    return this.openBulkSendModal(withGrades, 'grades-report-'+gradeId, `إرسال آخر درجة لطلاب ${g.name}`);
  },
  buildLatestGradeMessage(studentId){
    const s = this.state.students.find(x=>x.id===studentId);
    const g = gradeById(s.grade);
    const rec = this.getRecord(studentId);
    const gd = rec.grades[0]; // آخر درجة متسجلة (unshift بيحطها في الأول دايمًا)
    if(!gd) return '';
    const pct = Math.round(gd.score/gd.maxScore*100);
    let msg = `تحية طيبة، بخصوص الطالب/ة ${s.name} (${g?g.name:''})\n`;
    msg += `نتيجة ${gd.subject} (${gradeExamLabel(gd)}) بتاريخ ${fmtDate(gd.date)}:\n`;
    msg += `الدرجة: ${gd.score} من ${gd.maxScore} (${pct}%)`;
    return msg + this.teacherSignature();
  },
  buildParentMessage(studentId, monthOverride){
    const s = this.state.students.find(x=>x.id===studentId);
    const g = gradeById(s.grade); const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
    const am = monthOverride || this.getActiveMonth();
    const monthLabel = `${am.month+1}/${am.year}`;
    const rec = this.getRecord(studentId);
    const absences = this.monthlyAbsenceCount(s, am.year, am.month);
    const paid = rec.payments[am.key] && rec.payments[am.key].paid;
    const monthGrades = rec.grades.filter(gd=>{ const d=new Date(gd.date); return d.getFullYear()===am.year && d.getMonth()===am.month; });
    let msg = `تحية طيبة، بخصوص الطالب/ة ${s.name} (${g? g.name:''} - ${gr? gr.name:''})\n`;
    msg += `شهر ${monthLabel}:\n`;
    msg += `- عدد أيام الغياب: ${absences}\n`;
    msg += `- حالة الشهرية: ${paid? 'مدفوعة':'لم تُدفع بعد'}\n`;
    if(monthGrades.length){
      msg += `- الدرجات:\n`;
      monthGrades.forEach(gd=> msg += `  ${gd.subject} (${gradeExamLabel(gd)}): ${gd.score}/${gd.maxScore}\n`);
    }
    return msg + this.teacherSignature();
  },
  waLinkForStudent(studentId, monthOverride){
    const s = this.state.students.find(x=>x.id===studentId);
    const phone = normalizePhone(s.parentPhone);
    const text = encodeURIComponent(this.buildParentMessage(studentId, monthOverride));
    if(!phone) return null;
    return `https://wa.me/${phone}?text=${text}`;
  },
  sendToParent(studentId, monthOverride){
    const link = this.waLinkForStudent(studentId, monthOverride);
    if(!link){ this.alertModal('لا يوجد رقم لولي الأمر لهذا الطالب. أضف الرقم أولاً من تعديل بيانات الطالب.'); return; }
    window.open(link, '_blank');
  },

  // ===== monthly report image =====
  async downloadReportImage(studentId){
    const node = document.getElementById('reportCardNode');
    if(!node || !window.html2canvas){ this.alertModal('تعذر إنشاء الصورة الآن.'); return; }
    const canvas = await html2canvas(node, {scale:2, backgroundColor:'#ffffff'});
    const s = this.state.students.find(x=>x.id===studentId);
    const monthEl = node.querySelector('.rc-month');
    const monthTag = monthEl ? monthEl.textContent.replace('/','-') : todayISO();
    canvas.toBlob(blob=>{
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `تقرير-${s.name}-${monthTag}.png`;
      a.click(); URL.revokeObjectURL(url);
    });
  },

  // ===== import / export =====
  exportData(){
    const blob = new Blob([JSON.stringify({
      students:this.state.students, records:this.state.records, schedules:this.state.schedules, cancelledSessions:this.state.cancelledSessions,
      gradeConfig:this.state.gradeConfig, gradeFees:this.state.gradeFees, telegramLinks:this.state.telegramLinks, whatsappGroupLinks:this.state.whatsappGroupLinks,
      trash:this.state.trash, uiPrefs:this.state.uiPrefs, teacherProfile:this.state.teacherProfile, security:this.state.security,
      examBank:this.state.examBank, bulkSendState:this.state.bulkSendState
    }, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `نسخة-احتياطية-${todayISO()}.json`; a.click();
    URL.revokeObjectURL(url);
  },
  importData(evt){
    const file = evt.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const parsed = JSON.parse(reader.result);
        if(!await this.confirmModal('سيتم استبدال كل البيانات الحالية بالبيانات المستوردة. متابعة؟', {danger:true, confirmText:'استبدال', icon:'📥'})) return;
        this.state.students = parsed.students || [];
        this._attendanceEnsuredDate = null;
        this.state.records = parsed.records || {};
        this.state.schedules = parsed.schedules || {};
        this.state.cancelledSessions = parsed.cancelledSessions || {};
        this.state.gradeConfig = parsed.gradeConfig || {};
        this.state.gradeFees = parsed.gradeFees || {};
        this.state.telegramLinks = parsed.telegramLinks || {};
        this.state.whatsappGroupLinks = parsed.whatsappGroupLinks || {};
        this.state.trash = parsed.trash || { students: [] };
        this.state.uiPrefs = Object.assign({ darkMode:false, absenceThreshold:4 }, parsed.uiPrefs || {});
        this.state.teacherProfile = parsed.teacherProfile || this.state.teacherProfile;
        this.state.security = parsed.security || { enabled:false, passwordHash:null };
        this.state.examBank = migrateExamBankCurriculum(Object.assign({apiKey:'', model:'gemini-3.6-flash', curriculum:{}, materials:[], exams:[]}, parsed.examBank || {}));
        this.state.bulkSendState = parsed.bulkSendState || {};
        this.ensureGradeConfigDefaults();
        document.documentElement.setAttribute('data-theme', this.state.uiPrefs.darkMode ? 'dark':'light');
        this.updateThemeButtonLabel();
        this.updateHeaderProfile();
        this.save(); this.render();
      }catch(e){ this.alertModal('الملف غير صالح.'); }
    };
    reader.readAsText(file);
    evt.target.value = '';
  },

  // ================= RENDER =================
  render(){ this.renderTabs(); this.renderMain(); },

  hasAlerts(){
    const am = this.getActiveMonth();
    const threshold = this.state.uiPrefs.absenceThreshold || 4;
    return this.state.students.some(s=>{
      const rec = this.getRecord(s.id);
      if(!(rec.payments[am.key] && rec.payments[am.key].paid)) return true;
      return this.monthlyAbsenceCount(s, am.year, am.month) >= threshold;
    });
  },

  renderTabs(){
    const total = this.state.students.length;
    const alerts = this.hasAlerts();
    let html = `<div class="tab-btn ${this.state.ui.tab==='overview'?'active':''}" style="border-color:var(--ink);" onclick="app.setTab('overview')">
      <span>📊 نظرة عامة ${alerts? '<span class=\"dot-alert\"></span>':''}</span><span class="count">${total}</span></div>`;
    GRADES.forEach(g=>{
      const n = this.studentsInGrade(g.id).length;
      html += `<div class="tab-btn ${this.state.ui.tab===g.id?'active':''}" style="border-color:${g.color};" onclick="app.setTab('${g.id}')">
        <span>${g.short}</span><span class="count">${n}</span></div>`;
    });
    html += `<div class="tab-btn ${this.state.ui.tab==='examgen'?'active':''}" style="border-color:#3F6B4F;" onclick="app.setTab('examgen')">
      <span>🧪 مولد الامتحانات</span></div>`;
    html += `<div class="tab-btn ${this.state.ui.tab==='stats'?'active':''}" style="border-color:#7A5FA3;" onclick="app.setTab('stats')">
      <span>📈 إحصائيات الغياب</span></div>`;
    html += `<div class="tab-btn ${this.state.ui.tab==='settings'?'active':''}" style="border-color:var(--brass);" onclick="app.setTab('settings')">
      <span>⚙️ الإعدادات</span></div>`;
    document.getElementById('tabsNav').innerHTML = html;
  },

  renderMain(){
    this.ensureTodayAttendance();
    const el = document.getElementById('mainContent');
    if(this.state.ui.search && this.state.ui.search.trim().length>0){ el.innerHTML = this.renderSearchResults(); return; }
    if(this.state.ui.tab === 'overview'){ el.innerHTML = this.renderOverview(); return; }
    if(this.state.ui.tab === 'settings'){ el.innerHTML = this.renderSettings(); return; }
    if(this.state.ui.tab === 'stats'){ el.innerHTML = this.renderStatistics(); return; }
    if(this.state.ui.tab === 'examgen'){ el.innerHTML = this.renderExamGen(); this.afterExamGenRender(); return; }
    el.innerHTML = this.renderGradePage(this.state.ui.tab);
  },

  renderSearchResults(){
    const q = this.state.ui.search.trim();
    const matches = this.state.students.filter(s => s.name.includes(q));
    let rows = matches.map(s=>{
      const g = gradeById(s.grade); const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
      return `<tr onclick="app.openStudent('${s.id}')" style="cursor:pointer;">
        <td class="student-name">${s.name}</td>
        <td><span class="grade-chip" style="background:${g.color}">${g.short}</span> ${gr? `<span class="group-pill group-${gr.id}">${gr.name}</span>`:''}</td>
        <td class="col-hide-mobile">${s.phone||'—'}</td>
      </tr>`;
    }).join('');
    if(matches.length===0) rows = `<tr><td colspan="3" style="text-align:center;color:var(--ink-soft);padding:24px;">لا توجد نتائج لـ "${q}"</td></tr>`;
    return `<h1 class="page-title">نتائج البحث</h1><p class="page-sub">${matches.length} طالب مطابق</p>
      <div class="table-scroll"><table class="students"><thead><tr><th>الاسم</th><th>الصف</th><th class="col-hide-mobile">الهاتف</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  },

  // ===== إحصائيات الغياب (صفحة مستقلة) =====
  getAbsenceStats(){
    const gradeAbsences = {}; // gradeId -> عدد مرات الغياب
    const studentAbsences = []; // كل طالب غاب مرة على الأقل
    const perfectAttendance = []; // طلاب معندهمش أي غياب، وعندهم سجل حضور كافي (3 أيام فأكتر) عشان الرقم يبقى له معنى

    this.state.students.forEach(s=>{
      const rec = this.getRecord(s.id);
      const entries = Object.values(rec.attendance);
      const absentCount = entries.filter(v=>v==='absent').length;
      const presentCount = entries.filter(v=>v==='present').length;

      gradeAbsences[s.grade] = (gradeAbsences[s.grade]||0) + absentCount;

      if(absentCount > 0) studentAbsences.push({student:s, count:absentCount});
      if(absentCount === 0 && presentCount >= 3) perfectAttendance.push({student:s, count:presentCount});
    });

    studentAbsences.sort((a,b)=> b.count - a.count);
    perfectAttendance.sort((a,b)=> b.count - a.count);
    const gradeRanking = GRADES.map(g=>({grade:g, count: gradeAbsences[g.id]||0})).sort((a,b)=> b.count - a.count);

    return { gradeRanking, studentAbsences, perfectAttendance };
  },

  renderStatistics(){
    const { gradeRanking, studentAbsences, perfectAttendance } = this.getAbsenceStats();
    const maxGradeCount = Math.max(1, ...gradeRanking.map(r=>r.count));
    const topGrade = gradeRanking[0];

    return `
    <h1 class="page-title">📈 إحصائيات الغياب</h1>
    <p class="page-sub">نظرة شاملة على الحضور والغياب في كل الصفوف، محسوبة من سجل الحضور الفعلي</p>

    <div class="stat-grid">
      <div class="stat-card"><div class="num">${topGrade && topGrade.count>0 ? topGrade.grade.short : '—'}</div><div class="lbl">أكتر صف فيه غياب${topGrade && topGrade.count>0 ? ` (${topGrade.count} مرة)`:''}</div></div>
      <div class="stat-card"><div class="num">${studentAbsences.length}</div><div class="lbl">طالب غاب مرة على الأقل</div></div>
      <div class="stat-card"><div class="num">${perfectAttendance.length}</div><div class="lbl">طالب مغابوش ولا حصة</div></div>
    </div>

    <h3 style="color:var(--ink);margin-bottom:14px;">📊 ترتيب الصفوف حسب عدد مرات الغياب</h3>
    <div class="grade-bars" style="margin-bottom:28px;">
      ${gradeRanking.map(r=>{
        const pct = Math.round(r.count/maxGradeCount*100);
        return `<div class="grade-bar-row" onclick="app.setTab('${r.grade.id}')">
          <div class="label">${r.grade.name}</div>
          <div class="grade-bar-track"><div class="grade-bar-fill" style="width:${pct}%;background:${r.grade.color};"></div></div>
          <div class="n">${r.count}</div>
        </div>`;
      }).join('')}
    </div>

    <h3 style="color:var(--red);margin-bottom:14px;">🔴 أكتر الطلاب غيابًا (كل الصفوف)</h3>
    <div class="log-list" style="margin-bottom:28px;max-height:340px;">
      ${studentAbsences.length===0? `<div class="empty-state" style="padding:20px;">الحمد لله، مفيش أي طالب غاب أي حصة لغاية دلوقتي 🎉</div>` :
        studentAbsences.map(({student,count})=>{
          const g = gradeById(student.grade);
          return `<div class="log-row" style="cursor:pointer;" onclick="app.openStudent('${student.id}')">
            <span><b>${student.name}</b> — <span class="grade-chip" style="background:${g.color};font-size:10.5px;">${g.short}</span></span>
            <span style="color:var(--red);font-weight:700;">غاب ${count} ${count===1?'مرة':'مرات'}</span>
          </div>`;
        }).join('')}
    </div>

    <h3 style="color:var(--green);margin-bottom:14px;">🟢 الطلاب اللي مغابوش ولا حصة</h3>
    <p style="font-size:12px;color:var(--ink-soft);margin-top:-10px;margin-bottom:14px;">من الطلاب اللي عندهم سجل حضور كافي (3 أيام فأكتر) عشان الرقم يبقى له معنى</p>
    <div class="log-list" style="max-height:340px;">
      ${perfectAttendance.length===0? `<div class="empty-state" style="padding:20px;">مفيش طلاب كفاية عندهم سجل حضور كافي لسه</div>` :
        perfectAttendance.map(({student,count})=>{
          const g = gradeById(student.grade);
          return `<div class="log-row" style="cursor:pointer;" onclick="app.openStudent('${student.id}')">
            <span><b>${student.name}</b> — ${g.name}</span>
            <span style="color:var(--green);font-weight:700;">${count} حصة حضور كاملة</span>
          </div>`;
        }).join('')}
    </div>
    `;
  },

  renderOverview(){
    const total = this.state.students.length;
    const now = new Date();
    const am = this.getActiveMonth();
    const monthLabel = `${am.month+1}/${am.year}`;
    const absenceThreshold = this.state.uiPrefs.absenceThreshold || 4;
    let paidCount=0, paidAmount=0;
    const unpaidByGrade = {};
    const absentAlerts = [];
    this.state.students.forEach(s=>{
      const rec = this.getRecord(s.id);
      const paid = rec.payments[am.key] && rec.payments[am.key].paid;
      if(paid){ paidCount++; paidAmount += rec.payments[am.key].amount||0; }
      else { const g = gradeById(s.grade); if(!unpaidByGrade[g.id]) unpaidByGrade[g.id]=[]; unpaidByGrade[g.id].push(s); }
      const absences = this.monthlyAbsenceCount(s, am.year, am.month);
      if(absences >= absenceThreshold) absentAlerts.push({s, absences});
    });
    const today = todayISO();
    let presentToday=0, markedToday=0;
    this.state.students.forEach(s=>{
      const rec = this.getRecord(s.id);
      if(rec.attendance[today]){ markedToday++; if(rec.attendance[today]==='present') presentToday++; }
    });
    const maxCount = Math.max(1, ...GRADES.map(g=>this.studentsInGrade(g.id).length));

    // ===== حصص اليوم =====
    const todaysSessions = this.getTodaysSessions();
    const todayDayName = ARABIC_DAYS[new Date().getDay()];
    const todayPanelHtml = `
    <div class="today-panel">
      <div class="today-panel-head">
        <h3>📅 حصص اليوم — ${todayDayName}</h3>
        <span class="date">${fmtDate(todayISO())}</span>
      </div>
      ${todaysSessions.length===0 ? `
        <div class="empty-state" style="padding:22px 10px;">لا يوجد حصص مجدولة النهاردة (${todayDayName}) 🎉</div>
      ` : `
      <div class="today-sessions-grid">
        ${todaysSessions.map(item=>`
          <div class="tsc group-${item.group.id} ${item.cancelled?'is-cancelled':''}">
            <div class="tsc-time">${item.time? fmt12h(item.time) : '—'}</div>
            <div class="tsc-grade" style="color:${item.grade.color}">${item.grade.name}</div>
            <div class="tsc-meta">
              <span class="group-pill group-${item.group.id}">${item.group.name}</span>
              <span class="tsc-count">${item.count} طالب</span>
            </div>
            ${item.cancelled
              ? `<div class="tsc-cancelled-tag">✕ اتلغت النهارده</div>`
              : `<button class="btn small outline tsc-open-btn" onclick="app.setTab('${item.grade.id}')">فتح الصف</button>`}
          </div>`).join('')}
      </div>
      `}
    </div>`;

    let alertsHtml = '';
    // خانة "تخطوا حد الغياب" — دايمًا ظاهرة وفيها حقل تعديل الحد جوه هيدرها مباشرة، مش مدسوسة جوه فلتر تاني
    alertsHtml += `<div class="alerts-section">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:10px;">
        <h3 style="color:var(--red);margin:0;">🚫 تخطوا حد الغياب — ${monthLabel} <span style="font-size:12.5px;color:var(--ink-soft);font-weight:400;">(${absentAlerts.length})</span></h3>
        <span style="font-size:13px;">الحد المسموح بالغياب: <input type="number" min="1" value="${absenceThreshold}" style="width:56px;padding:6px;border-radius:6px;border:1.5px solid var(--paper-line);" onchange="app.setAbsenceThreshold(this.value)"> حصص</span>
      </div>`;
    if(absentAlerts.length){
      absentAlerts.forEach(({s,absences})=>{
        const g = gradeById(s.grade);
        alertsHtml += `<div class="alert-card">
          <div class="info"><b>${s.name}</b> — ${g.short} — غاب <b>${absences}</b> حصص</div>
          <div style="display:flex;gap:8px;">
            <button class="link-btn" onclick="app.openStudent('${s.id}')">فتح الملف</button>
            <button class="wa-btn ${s.parentPhone? '':'grey'}" onclick="app.sendToParent('${s.id}')">إرسال لولي الأمر</button>
          </div></div>`;
      });
    } else {
      alertsHtml += `<div class="empty-state" style="padding:14px;">محدش تخطى حد الغياب ده لغاية دلوقتي 🎉</div>`;
    }
    alertsHtml += `</div>`;
    const unpaidGradeIds = Object.keys(unpaidByGrade);
    if(unpaidGradeIds.length){
      alertsHtml += `<div class="alerts-section"><h3 style="color:var(--brass-dark);margin-bottom:10px;">💰 لسه مدفعوش شهرية ${monthLabel}</h3>`;
      unpaidGradeIds.forEach(gid=>{
        const g = gradeById(gid);
        const names = unpaidByGrade[gid].map(s=>s.name).join('، ');
        alertsHtml += `<div class="alert-card warn"><div class="info"><b>${g.name}</b>: ${names}</div></div>`;
      });
      alertsHtml += `</div>`;
    }

    // ===== قائمة غير المسددين (إجرائية: فتح ملف / إرسال لولي الأمر) =====
    const unpaidResults = this.state.students.filter(s=>{ const rec=this.getRecord(s.id); return !(rec.payments[am.key] && rec.payments[am.key].paid); });
    const unpaidRowsHtml = unpaidResults.map(s=>{
      const g = gradeById(s.grade);
      return `<div class="log-row">
        <span><b>${s.name}</b> — ${g.short}</span>
        <span style="display:flex;gap:6px;">
          <button class="link-btn" onclick="app.openStudent('${s.id}')">فتح الملف</button>
          <button class="wa-btn ${s.parentPhone? '':'grey'}" onclick="app.sendToParent('${s.id}')">إرسال لولي الأمر</button>
        </span>
      </div>`;
    }).join('');

    const filterPanelHtml = `
    <div class="alerts-section">
      <h3 style="color:var(--ink);margin-bottom:10px;">🔍 غير مسددين شهر ${monthLabel} <span style="font-size:12.5px;color:var(--ink-soft);font-weight:400;">(${unpaidResults.length})</span></h3>
      <div class="log-list" style="max-height:280px;">
        ${unpaidResults.length===0? `<div class="empty-state" style="padding:16px;">الكل مسدد الشهر ده 🎉</div>` : unpaidRowsHtml}
      </div>
    </div>`;

    const bulkButtonsHtml = `
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:22px;">
      <button class="btn brass" onclick="app.remindAllUnpaid()">📢 إرسال تذكير للجميع (غير المسددين)</button>
      <button class="btn outline" onclick="app.sendAllMonthlyReports()">📷 إرسال تقارير الشهر للجميع</button>
      <button class="btn outline" onclick="app.sendAllLatestGrades()">🧮 إرسال آخر الدرجات للجميع</button>
    </div>`;

    return `
    <h1 class="page-title">نظرة عامة</h1>
    <p class="page-sub">ملخص سريع — الشهر النشط حاليًا: ${monthLabel}</p>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${total}</div><div class="lbl">إجمالي عدد الطلاب</div></div>
      <div class="stat-card" style="cursor:pointer;" onclick="app.renderModal('unpaid-list')" title="اضغط لعرض أسماء اللي لسه مدفعوش"><div class="num">${paidCount}/${total||0}</div><div class="lbl">دفعوا شهرية ${monthLabel} — اضغط لعرض الباقي</div></div>
      <div class="stat-card"><div class="num">${paidAmount.toLocaleString('ar-EG')}</div><div class="lbl">جنيه محصّل هذا الشهر</div></div>
      <div class="stat-card"><div class="num">${markedToday? Math.round(presentToday/markedToday*100)+'%':'—'}</div><div class="lbl">نسبة الحضور اليوم</div></div>
    </div>
    ${todayPanelHtml}
    ${alertsHtml}
    ${bulkButtonsHtml}
    ${filterPanelHtml}
    <h3 style="color:var(--ink);margin-bottom:14px;">توزيع الطلاب على الصفوف</h3>
    <div class="grade-bars">
      ${GRADES.map(g=>{
        const n = this.studentsInGrade(g.id).length;
        const pct = Math.round(n/maxCount*100);
        return `<div class="grade-bar-row" onclick="app.setTab('${g.id}')">
          <div class="label">${g.name}</div>
          <div class="grade-bar-track"><div class="grade-bar-fill" style="width:${pct}%;background:${g.color};"></div></div>
          <div class="n">${n}</div>
        </div>`;
      }).join('')}
    </div>
    ${total===0? `<div class="empty-state"><div class="big">📐</div>لسه مفيش طلاب مسجّلين. ابدأ بإضافة طالب من أي صف على الجنب.</div>` : ''}
    `;
  },

  renderGradePage(gradeId){
    const g = gradeById(gradeId);
    const filter = this.state.ui.groupFilter;
    const now = new Date();
    const am = this.getActiveMonth();

    const groupsHere = gradeGroups(gradeId);
    const sessionsCount = gradeSessions(gradeId);

    const students = this.studentsInGradeGroup(gradeId, filter);

    const scheduleHtml = `
    <div class="schedule-panel">
      <h4>⚙️ ميعاد الحصص الأسبوعي (${sessionsCount} حصص/أسبوع) — لتغيير عدد الحصص أو المجموعات روح "الإعدادات"</h4>
      <div class="sched-groups">
        ${groupsHere.map(gr=>{
          const groupId = gr.id;
          const sessions = this.getSessions(gradeId, groupId);
          const cancelled = this.isCancelledToday(gradeId, groupId);
          const hasClass = this.hasClassToday(gradeId, groupId);
          let rows = '';
          for(let i=0;i<sessionsCount;i++){
            const sess = sessions[i] || {};
            rows += `<div class="sess-row">
              <span class="sess-label">حصة ${i+1}</span>
              <select onchange="app.setSchedule('${gradeId}','${groupId}',${i},'day',this.value)">
                <option value="">اختر اليوم</option>
                ${ARABIC_DAYS.map((d,idx)=>`<option value="${idx}" ${String(sess.day)===String(idx)?'selected':''}>${d}</option>`).join('')}
              </select>
              <input type="time" value="${sess.time||''}" onchange="app.setSchedule('${gradeId}','${groupId}',${i},'time',this.value)">
            </div>`;
          }
          return `<div class="sched-group-card group-${groupId}">
            <div class="sched-group-head">
              <span class="group-pill group-${groupId}">${gr.name}</span>
              <span class="sched-group-status">
                ${hasClass? `<span class="ok-badge">✓ فيه حصة النهارده</span>` : `<span class="cancel-badge">مفيش حصة النهارده</span>`}
                <button class="btn small ${cancelled?'danger':'outline'}" onclick="app.toggleCancelToday('${gradeId}','${groupId}')">${cancelled? '✓ الحصة اتلغت النهارده' : 'إلغاء حصة النهارده'}</button>
              </span>
            </div>
            ${rows}
          </div>`;
        }).join('')}
      </div>
    </div>`;

    let rowsHtml = students.map(s=>{
      const pct = this.attendancePct(s.id);
      let pctHtml = '<span class="pct-pill pct-mid">لا يوجد سجل</span>';
      if(pct!==null){ const cls = pct>=85?'pct-good':(pct>=60?'pct-mid':'pct-bad'); pctHtml = `<span class="pct-pill ${cls}">${pct}%</span>`; }
      const paid = this.isPaidThisMonth(s.id);
      const stampHtml = `<button class="stamp-mini ${paid?'stamp-paid':'stamp-unpaid'}" title="${paid?'مدفوع - دوس لإلغاء':'غير مدفوع - دوس لتسجيل الدفع'}" onclick="app.toggleActiveMonthPaymentQuick('${s.id}')">${paid?'✓':'—'}</button>`;
      const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
      return `<tr>
        <td class="student-name" style="cursor:pointer;" onclick="app.openStudent('${s.id}')">${s.name}</td>
        <td>${gr? `<span class="group-pill group-${gr.id}">${gr.name}</span>`:'—'}</td>
        <td class="col-hide-mobile">${pctHtml}</td>
        <td>${stampHtml}</td>
        <td><button class="link-btn" onclick="app.openStudent('${s.id}')">التفاصيل</button></td>
      </tr>`;
    }).join('');
    if(students.length===0){
      rowsHtml = `<tr><td colspan="5"><div class="empty-state"><div class="big">🗂️</div>لا يوجد طلاب هنا بعد.<br>اضغط "طالب جديد" للبدء.</div></td></tr>`;
    }

    return `
    <div class="toolbar">
      <div><h1 class="page-title" style="color:${g.color}">${g.name}</h1><p class="page-sub">${students.length} طالب معروض</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" style="background:${g.color}" onclick="app.openAddStudent('${g.id}')">+ طالب جديد</button>
        <button class="btn outline" onclick="app.sendGradesForGrade('${gradeId}')">🧮 إرسال آخر الدرجات لطلاب ${g.name}</button>
      </div>
    </div>
    ${scheduleHtml}
    <div class="schedule-panel" style="border-color:var(--brass);border-width:1.5px;">
      <h4>🎓 نقل الطلاب للسنة الدراسية الجاية</h4>
      <p style="font-size:12px;color:var(--ink-soft);margin:-4px 0 12px 0;">${gradeId==='sec3'? 'آخر سنة، فالنقل هنا معناه تخريج الدفعة (بتتنقل لسلة المهملات، وترجعها منها في أي وقت لو حبيت).' : `بيحوّل كل طلاب المجموعة دفعة واحدة لـ${gradeById(NEXT_GRADE[gradeId]).name}، وبياناتهم القديمة (حضور، درجات، مدفوعات) بتفضل محفوظة زي ما هي.`}</p>
      ${groupsHere.map(gr=>{
        const count = this.studentsInGradeGroup(gradeId, gr.id).length;
        return `<div class="schedule-row">
          <span class="g-label">${gr.name}:</span>
          <span style="font-size:12.5px;color:var(--ink-soft);">${count} طالب</span>
          <button class="btn small brass" ${count===0?'disabled style="opacity:.5;cursor:not-allowed;"':''} onclick="app.promoteGroupToNextGrade('${gradeId}','${gr.id}')">${gradeId==='sec3'? '🎓 تخريج المجموعة دي':'⬆️ نقل الجميع للسنة الجاية'}</button>
        </div>`;
      }).join('')}
    </div>
    ${groupsHere.length>1? `
    <div class="group-toggle">
      <button class="${filter==='all'?'active':''}" onclick="app.setGroupFilter('all')">الكل</button>
      ${groupsHere.map(gr=>`<button class="${filter===gr.id?'active':''}" onclick="app.setGroupFilter('${gr.id}')">${gr.name}</button>`).join('')}
    </div>` : ''}
    <div class="table-scroll">
    <table class="students">
      <thead><tr><th>الاسم</th><th>المجموعة</th><th class="col-hide-mobile">نسبة الحضور</th><th>شهرية ${am.month+1}</th><th>التفاصيل</th></tr></thead>
      <tbody>${rowsHtml}</tbody>
    </table>
    </div>
    `;
  },

  renderSettings(){
    const trash = this.state.trash.students;
    const sec = this.state.security;
    const tp = this.state.teacherProfile;
    return `
    <h1 class="page-title">⚙️ الإعدادات</h1>
    <p class="page-sub">تحكم كامل في المجموعات، الحصص، جروبات التواصل، وسلة المهملات</p>

    <h3 style="color:var(--ink);">👤 بيانات المدرّس</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">الاسم والمادة اللي بتظهر فوق في البرنامج، وفي آخر أي رسالة بتتبعت لولي الأمر. غيّرها في أي وقت من هنا.</p>
    <div class="stat-card" style="margin-bottom:30px;max-width:420px;">
      <div class="field"><label>الاسم</label><input id="teacherNameInput" value="${tp.name}" placeholder="مثال: أ. محمود الجوهري"></div>
      <div class="field"><label>المادة (اختياري)</label><input id="teacherSubjectInput" value="${tp.subject}" placeholder="مثال: رياضيات"></div>
      <button class="btn brass" onclick="app.saveTeacherProfile()">💾 حفظ التعديل</button>
      <p id="teacherProfileMsg" style="font-size:12.5px;margin-top:8px;min-height:16px;color:var(--green);font-weight:700;"></p>
    </div>

    <h3 style="color:var(--ink);">🔒 قفل البرنامج بكلمة سر</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">قفل بسيط لمنع أي حد يفتح البرنامج ويشوف بيانات الطلاب من غير إذنك. مش تشفير قوي من الدرجة البنكية، بس بيمنع الاطلاع العرضي على البيانات.</p>
    <div class="stat-card" style="margin-bottom:30px;max-width:420px;">
      ${!sec.enabled ? `
        <p style="font-size:13px;color:var(--ink-soft);margin:0 0 10px 0;">القفل مش مفعّل دلوقتي. اختار كلمة سر عشان تفعّله:</p>
        <div class="field"><label>كلمة السر</label><input id="newPass1" type="password" placeholder="4 حروف/أرقام على الأقل"></div>
        <div class="field"><label>تأكيد كلمة السر</label><input id="newPass2" type="password" placeholder="اكتبها تاني"></div>
        <button class="btn brass" onclick="app.enablePassword()">🔒 تفعيل القفل</button>
        <p id="passSetMsg" style="font-size:12.5px;margin-top:8px;min-height:16px;"></p>
      ` : `
        <p style="font-size:13px;color:var(--green);font-weight:700;margin:0 0 14px 0;">✓ القفل مفعّل حاليًا</p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
          <button class="btn outline small" onclick="app.lockNow()">🔒 قفل البرنامج دلوقتي</button>
          <button class="btn danger small" onclick="app.disablePassword()">إلغاء القفل نهائيًا</button>
        </div>
        <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 10px 0;">تغيير كلمة السر:</p>
        <div class="field"><label>كلمة السر الحالية</label><input id="curPass" type="password"></div>
        <div class="field"><label>كلمة السر الجديدة</label><input id="changePass1" type="password"></div>
        <div class="field"><label>تأكيد كلمة السر الجديدة</label><input id="changePass2" type="password"></div>
        <button class="btn outline" onclick="app.changePassword()">تغيير كلمة السر</button>
        <p id="passChangeMsg" style="font-size:12.5px;margin-top:8px;min-height:16px;"></p>
      `}
      <p style="font-size:11.5px;color:var(--ink-soft);margin-top:14px;">⚠️ لو نسيت كلمة السر، المفروض تمسح بيانات المتصفح الخاصة بالملف ده عشان تدخل تاني — وده هيمسح كل البيانات كمان (إلا لو عندك نسخة احتياطية). احتفظ بيها في مكان مأمون.</p>
    </div>

    <h3 style="color:var(--ink);">🎓 المجموعات وعدد الحصص لكل صف</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">ممكن تزود عدد الحصص الأسبوعية أو تضيف مجموعة جديدة (زي "مجموعة تقوية" مثلًا) لأي صف.</p>
    <div class="stat-grid" style="grid-template-columns:1fr;gap:14px;margin-bottom:30px;">
      ${GRADES.map(g=>{
        const groups = gradeGroups(g.id);
        const sessions = gradeSessions(g.id);
        return `<div class="stat-card">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
            <b style="color:${g.color};">${g.name}</b>
            <span style="font-size:13px;">عدد الحصص أسبوعيًا: <input type="number" min="1" value="${sessions}" style="width:56px;padding:4px 6px;border-radius:6px;border:1.5px solid var(--paper-line);" onchange="app.setGradeSessionsCount('${g.id}', this.value)"></span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
            ${groups.map(gr=>`<span class="group-pill group-${gr.id}" style="display:flex;align-items:center;gap:6px;">${gr.name} <button onclick="app.removeGroupFromGrade('${g.id}','${gr.id}')" style="background:none;color:inherit;font-size:12px;">✕</button></span>`).join('')}
          </div>
          <div style="display:flex;gap:8px;margin-top:10px;">
            <input id="newGroupName_${g.id}" placeholder="اسم مجموعة جديدة" style="flex:1;padding:6px 10px;border-radius:6px;border:1.5px solid var(--paper-line);font-size:13px;">
            <button class="btn small outline" onclick="app.addGroupToGrade('${g.id}')">+ إضافة مجموعة</button>
          </div>
        </div>`;
      }).join('')}
    </div>

    <h3 style="color:var(--ink);">💰 الشهرية الموحدة لكل صف</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">حدد شهرية كل صف مرة واحدة هنا، وأي طالب جديد هياخدها تلقائيًا من غير ما تكتبها كل مرة. لو طالب معين شهريته مختلفة، تقدر تظبطله شهرية خاصة من "تعديل" بياناته.</p>
    <div class="stat-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin-bottom:30px;">
      ${GRADES.map(g=>`<div class="stat-card">
        <b style="color:${g.color};">${g.name}</b>
        <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
          <input type="number" min="0" value="${this.state.gradeFees[g.id]||0}" style="width:90px;padding:6px 10px;border-radius:6px;border:1.5px solid var(--paper-line);" onchange="app.setGradeFee('${g.id}', this.value)">
          <span style="font-size:13px;color:var(--ink-soft);">جنيه/شهر</span>
        </div>
      </div>`).join('')}
    </div>

    <h3 style="color:var(--ink);">📣 جروبات التليجرام والواتساب (لإعلان إلغاء الحصص)</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">حط هنا رابط جروب التليجرام ورابط جروب/دعوة الواتساب لكل مجموعة. أول ما تلغي حصة، هتظهرلك رسالة الإلغاء جاهزة وتقدر تدوس تفتح الجروب مباشرة (واتساب وتليجرام مش بيسمحوا لموقع إنه يبعت رسالة تلقائي في جروب، فلازم تلصقها وتبعتها بنفسك).</p>
    <div class="stat-grid" style="grid-template-columns:1fr;gap:14px;margin-bottom:30px;">
      ${GRADES.map(g=> gradeGroups(g.id).map(gr=>{
        const key = `${g.id}-${gr.id}`;
        return `<div class="stat-card">
          <b style="color:${g.color};">${g.name} — ${gr.name}</b>
          <div class="field" style="margin-top:8px;"><label>رابط جروب تليجرام</label><input placeholder="https://t.me/..." value="${this.state.telegramLinks[key]||''}" onchange="app.setTelegramLink('${key}', this.value)"></div>
          <div class="field" style="margin-bottom:0;"><label>رابط دعوة جروب واتساب</label><input placeholder="https://chat.whatsapp.com/..." value="${this.state.whatsappGroupLinks[key]||''}" onchange="app.setWhatsappGroupLink('${key}', this.value)"></div>
        </div>`;
      }).join('')).join('')}
    </div>

    <h3 style="color:var(--ink);">📚 تقارير نهاية الترم / السنة</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">بيجهز رسالة شاملة (حضور + غياب + درجات + مدفوعات) لكل طالب في كل الصفوف ما عدا تالتة ثانوي، ويفتحلك واتساب كل ولي أمر بضغطة واحدة.</p>
    <button class="btn brass" style="margin-bottom:30px;" onclick="app.sendAllTermReports()">📚 إرسال تقارير نهاية الترم لكل أولياء الأمور</button>

    <h3 style="color:var(--ink);">🗑️ سلة المهملات</h3>
    <p style="font-size:12.5px;color:var(--ink-soft);margin-top:-14px;">الطلاب اللي اتحذفوا بيفضلوا هنا لحد ما تحذفهم نهائيًا أو تسترجعهم.</p>
    <div class="log-list" style="margin-bottom:20px;">
      ${trash.length===0? `<div class="empty-state" style="padding:20px;">سلة المهملات فاضية</div>` :
        trash.map((item,idx)=>`
        <div class="log-row">
          <span><b>${item.student.name}</b> — اتحذف يوم ${fmtDate(item.deletedAt)}</span>
          <span style="display:flex;gap:6px;">
            <button class="link-btn" onclick="app.restoreStudent(${idx})">↩ استرجاع</button>
            <button class="link-btn" style="color:var(--red);" onclick="app.permanentlyDeleteFromTrash(${idx})">حذف نهائي</button>
          </span>
        </div>`).join('')}
    </div>
    <p style="font-size:12px;color:var(--ink-soft);">🔔 ملحوظة عن المنبه: التنبيه الصوتي بيشتغل بس والصفحة مفتوحة في المتصفح. البرنامج بيحاول يمنع قفل شاشة الجهاز تلقائيًا عشان يفضل شغال، بس ده بيعتمد على دعم المتصفح والجهاز، وبرضه لازم التاب يفضل مفتوح ومتقفلش.</p>
    `;
  },

  // ================= مولد الامتحانات (Exam Generator) — كل الدوال الخاصة به =================
  setExamSubTab(tab){
    this.state.ui.examSubTab = tab;
    if(tab !== 'detail'){ this.state.ui.examSelectedId = null; }
    this.renderMain();
    this.afterExamGenRender();
  },
  afterExamGenRender(){
    renderMathIn(document.getElementById('mainContent'));
    if(document.getElementById('examCountsStatus')) this.updateExamCountsPreview();
  },
  openExamDetail(examId){
    this.state.ui.examSubTab = 'detail';
    this.state.ui.examSelectedId = examId;
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    this.state.ui.examSelectedFormId = (exam && exam.forms.length) ? exam.forms[0].id : null;
    this.renderMain();
    this.afterExamGenRender();
  },
  selectExamForm(examId, formId){
    this.state.ui.examSelectedFormId = formId;
    this.renderMain();
    this.afterExamGenRender();
  },

  renderExamGen(){
    const eb = this.state.examBank;
    const sub = this.state.ui.examSubTab || 'create';
    return `
    <h1 class="page-title">🧪 مولد الامتحانات بالذكاء الاصطناعي</h1>
    <p class="page-sub">اختار الصف والموضوع، ارفع ملف PDF من المنهج (اختياري)، وخلّي Gemini يجهزلك امتحان كامل بضغطة زرار.</p>
    <div class="eg-subtabs">
      <button class="eg-subtab-btn ${sub==='create'?'active':''}" onclick="app.setExamSubTab('create')">➕ إنشاء امتحان</button>
      <button class="eg-subtab-btn ${sub==='list'||sub==='detail'?'active':''}" onclick="app.setExamSubTab('list')">📋 الامتحانات المحفوظة (${eb.exams.length})</button>
      <button class="eg-subtab-btn ${sub==='library'?'active':''}" onclick="app.setExamSubTab('library')">📚 مكتبة ملفات المنهج (${eb.materials.length})</button>
      <button class="eg-subtab-btn ${sub==='apikey'?'active':''}" onclick="app.setExamSubTab('apikey')">🔑 إعداد مفتاح Gemini</button>
    </div>
    ${!eb.apiKey && sub!=='apikey' ? `<div class="alert-card warn" style="margin-bottom:22px;"><span class="info">⚠️ لسه محددتش مفتاح Gemini API. <b onclick="app.setExamSubTab('apikey')" style="cursor:pointer;text-decoration:underline;">اضغط هنا عشان تضيفه الأول</b> — من غيره مش هتقدر تولّد أي امتحان.</span></div>` : ''}
    ${sub==='create' ? this.renderExamCreate() : ''}
    ${sub==='list' ? this.renderExamListView() : ''}
    ${sub==='detail' ? this.renderExamDetailView() : ''}
    ${sub==='library' ? this.renderExamLibrary() : ''}
    ${sub==='apikey' ? this.renderExamApiSettings() : ''}
    `;
  },

  // ===== إعداد مفتاح Gemini =====
  renderExamApiSettings(){
    const eb = this.state.examBank;
    const knownModel = GEMINI_MODELS.some(m=>m.id===eb.model);
    return `
    <div class="apikey-card">
      <h3 style="margin-top:0;color:var(--ink);">🔑 مفتاح Gemini API</h3>
      <p class="eg-hint" style="margin-top:0;">المفتاح بيتخزن جوه متصفحك بس (مش بيتبعت لأي حد غير جوجل مباشرة لحظة توليد الامتحان). لو معندكش مفتاح، اعمل واحد مجانًا من <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="color:var(--ink);font-weight:700;">Google AI Studio</a> في دقيقة واحدة.</p>
      <span class="apikey-status ${eb.apiKey?'set':'unset'}">${eb.apiKey? '✓ المفتاح متحفظ':'✗ لسه مفيش مفتاح'}</span>
      <div class="field" style="margin-top:16px;">
        <label>مفتاح الـ API</label>
        <input id="geminiApiKeyInput" type="password" value="${eb.apiKey||''}" placeholder="AIzaSy...">
      </div>
      <div class="field">
        <label>الموديل المستخدم في التوليد</label>
        <select id="geminiModelSelect" onchange="app.toggleCustomModelField(this.value)">
          ${GEMINI_MODELS.map(m=>`<option value="${m.id}" ${m.id===eb.model?'selected':''}>${m.name}</option>`).join('')}
          <option value="__custom__" ${!knownModel?'selected':''}>موديل تاني (اكتبه يدويًا)</option>
        </select>
      </div>
      <div class="field" id="customModelField" style="${knownModel?'display:none;':''}">
        <label>اسم الموديل يدويًا</label>
        <input id="customModelInput" value="${!knownModel?(eb.model||''):''}" placeholder="مثال: gemini-3.7-flash">
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
        <button class="btn brass" onclick="app.saveGeminiSettings()">💾 حفظ</button>
        <button class="btn outline" onclick="app.testGeminiKey()">🧪 اختبار المفتاح</button>
      </div>
      <p id="geminiTestMsg" style="font-size:12.5px;margin-top:10px;min-height:16px;"></p>
    </div>`;
  },
  toggleCustomModelField(v){
    const f = document.getElementById('customModelField');
    if(f) f.style.display = v==='__custom__' ? '' : 'none';
  },
  saveGeminiSettings(){
    const keyInput = document.getElementById('geminiApiKeyInput');
    const modelSel = document.getElementById('geminiModelSelect');
    const customInput = document.getElementById('customModelInput');
    const key = keyInput.value.trim();
    let model = modelSel.value;
    if(model === '__custom__'){ model = (customInput.value||'').trim() || 'gemini-3.6-flash'; }
    this.state.examBank.apiKey = key;
    this.state.examBank.model = model;
    this.save();
    this.setExamSubTab('apikey');
    const msg = document.getElementById('geminiTestMsg');
    if(msg){ msg.style.color='var(--green)'; msg.textContent='✓ اتحفظ بنجاح'; }
  },
  async testGeminiKey(){
    const msg = document.getElementById('geminiTestMsg');
    const key = document.getElementById('geminiApiKeyInput').value.trim();
    if(!key){ msg.style.color='var(--red)'; msg.textContent='اكتب المفتاح الأول.'; return; }
    let model = document.getElementById('geminiModelSelect').value;
    if(model==='__custom__') model = (document.getElementById('customModelInput').value||'').trim() || 'gemini-3.6-flash';
    msg.style.color='var(--ink-soft)'; msg.textContent='⏳ بنختبر المفتاح...';
    try{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':key},
        body: JSON.stringify({ contents:[{ parts:[{text:'قول "تمام" بس، من غير أي كلام تاني.'}] }] })
      });
      if(res.ok){ msg.style.color='var(--green)'; msg.textContent='✓ المفتاح شغال تمام!'; }
      else{
        const t = await res.json().catch(()=> null);
        const apiMsg = (t && t.error && t.error.message) ? t.error.message : '';
        msg.style.color='var(--red)';
        msg.textContent = apiMsg ? `✗ خطأ (${res.status}): ${apiMsg}` : `✗ في مشكلة (كود ${res.status}). تأكد إن المفتاح صح والموديل متاح.`;
        console.error('Gemini test error', t);
      }
    }catch(e){ msg.style.color='var(--red)'; msg.textContent='✗ تعذر الاتصال. اتأكد من الإنترنت.'; }
  },

  // ===== مكتبة ملفات المنهج (PDF) =====
  renderExamLibrary(){
    const eb = this.state.examBank;
    return `
    <div class="eg-drop" id="pdfDropZone" onclick="document.getElementById('pdfUploadInput').click()"
         ondragover="event.preventDefault(); this.classList.add('dragover');"
         ondragleave="this.classList.remove('dragover');"
         ondrop="event.preventDefault(); this.classList.remove('dragover'); app.handlePdfDrop(event);">
      <div class="big">📄⬆️</div>
      <b>اسحب ملف PDF هنا أو دوس عشان ترفعه</b>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:6px;">ملفات PDF بس، ويُفضّل يكون حجمها أقل من 15 م.ب لكل ملف عشان يتقبل في التوليد مباشرة. ملحوظة: الملفات الكبيرة وعدد الأسئلة الكبير بيزودوا وقت التوليد — لو عايز أسرع استجابة، ارفع ملف أصغر (كذا صفحة بس من الدرس) بدل الكتاب كله.</p>
    </div>
    <input type="file" id="pdfUploadInput" accept="application/pdf" style="display:none" onchange="app.handlePdfUpload(event)">

    <div class="field-row" style="margin-top:20px;">
      <div class="field"><label>اسم الملف (يظهر في القائمة)</label><input id="pdfNameInput" placeholder="مثال: مذكرة التفاضل - الفصل الأول"></div>
      <div class="field"><label>الصف المرتبط (اختياري)</label>
        <select id="pdfGradeSelect"><option value="">عام لكل الصفوف</option>${GRADES.map(g=>`<option value="${g.id}">${g.name}</option>`).join('')}</select>
      </div>
    </div>
    <p style="font-size:11.5px;color:var(--ink-soft);margin-top:-10px;">اكتب الاسم والصف قبل ما تختار أو تسحب الملف. لو سبت الاسم فاضي، هياخد اسم الملف الأصلي.</p>

    <div id="pdfUploadStatus" style="font-size:12.5px;font-weight:700;min-height:18px;margin-top:6px;"></div>

    <div class="material-list">
      ${eb.materials.length===0 ? `<div class="empty-state"><div class="big">📁</div>مفيش ملفات مرفوعة لسه</div>` :
        eb.materials.map(m=>`
        <div class="material-card">
          <div class="m-icon">📄</div>
          <div class="m-info">
            <div class="m-name">${m.name}</div>
            <div class="m-meta">${m.gradeId? gradeById(m.gradeId).name : 'عام لكل الصفوف'} · ${fileSizeLabel(m.size)} · ${fmtDate(m.addedAt)}</div>
          </div>
          <button class="btn danger small" onclick="app.deleteMaterial('${m.id}')">🗑 حذف</button>
        </div>`).join('')}
    </div>
    <p class="eg-hint" style="margin-top:20px;">ℹ️ ملفات الـ PDF بتتخزن جوه متصفحك بس (في IndexedDB) عشان تفضل موجودة حتى بعد ما تقفل الصفحة. ملحوظة: النسخة الاحتياطية العادية (⬇ نسخة احتياطية من الإعدادات) بتشمل بيانات الامتحانات والأسئلة، لكن مش بتشمل ملفات الـ PDF نفسها.</p>
    `;
  },
  async handlePdfUpload(evt){
    const file = evt.target.files[0];
    evt.target.value = '';
    if(!file) return;
    await this.ingestPdfFile(file);
  },
  async handlePdfDrop(evt){
    const file = evt.dataTransfer.files && evt.dataTransfer.files[0];
    if(!file) return;
    await this.ingestPdfFile(file);
  },
  async ingestPdfFile(file){
    const statusEl = document.getElementById('pdfUploadStatus');
    if(file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')){
      if(statusEl){ statusEl.style.color='var(--red)'; statusEl.textContent = '✗ لازم يكون الملف من نوع PDF.'; }
      return;
    }
    if(file.size > 18*1024*1024){
      if(!await this.confirmModal('الملف أكبر من 18 م.ب، وممكن يفشل الرفع أو التوليد بسببه. عايز تكمل برضه؟', {danger:true})) return;
    }
    const nameInput = document.getElementById('pdfNameInput');
    const gradeSelect = document.getElementById('pdfGradeSelect');
    const name = (nameInput && nameInput.value.trim()) || file.name.replace(/\.pdf$/i,'');
    const gradeId = gradeSelect ? gradeSelect.value : '';
    if(statusEl){ statusEl.style.color='var(--ink-soft)'; statusEl.textContent = '⏳ بيترفع...'; }
    try{
      const base64 = await fileToBase64(file);
      const id = uid();
      await examDbSet(id, base64);
      this.state.examBank.materials.unshift({ id, name, gradeId, size:file.size, addedAt:new Date().toISOString() });
      this.save();
      this.renderMain(); this.afterExamGenRender();
      setTimeout(()=>{ const s=document.getElementById('pdfUploadStatus'); if(s){ s.style.color='var(--green)'; s.textContent='✓ اترفع بنجاح'; } }, 50);
    }catch(e){
      console.error(e);
      const s = document.getElementById('pdfUploadStatus');
      if(s){ s.style.color='var(--red)'; s.textContent = '✗ حصلت مشكلة في الرفع، جرب تاني.'; }
    }
  },
  async deleteMaterial(id){
    if(!await this.confirmModal('تحذف الملف ده نهائيًا؟', {danger:true})) return;
    this.state.examBank.materials = this.state.examBank.materials.filter(m=>m.id!==id);
    this.save();
    await examDbDelete(id).catch(()=>{});
    this.renderMain(); this.afterExamGenRender();
  },

  // ===== إنشاء امتحان جديد =====
  renderExamCreate(){
    const eb = this.state.examBank;
    if(this.state.ui.examGenerating){
      return `<div class="eg-loading"><div class="eg-spinner"></div><p style="font-weight:700;color:var(--ink);">${this.state.ui.examGenerationStatus || '⏳ بيتولّد الامتحان دلوقتي عن طريق Gemini...'}</p><p style="font-size:12.5px;color:var(--ink-soft);">ممكن ياخد من 10 لـ 40 ثانية حسب عدد الأسئلة وحجم الملفات المرفقة. متقفلش الصفحة لحد ما يخلص.</p></div>`;
    }
    const gradeId = this.state.ui.examCreateGrade || GRADES[GRADES.length-1].id;
    this.state.ui.examCreateGrade = gradeId;
    const gradeMaterials = eb.materials.filter(m=> !m.gradeId || m.gradeId===gradeId);
    const modelInfo = GEMINI_MODELS.find(m=>m.id===eb.model);
    return `
    <div class="field"><label>اسم الامتحان</label><input id="examTitleInput" placeholder="مثال: امتحان الشهر الأول - تفاضل وتكامل"></div>
    <div class="field">
      <label>الصف الدراسي</label>
      <select id="examGradeSelect" onchange="app.onExamGradeChange(this.value)">
        ${GRADES.map(g=>`<option value="${g.id}" ${g.id===gradeId?'selected':''}>${g.name}</option>`).join('')}
      </select>
    </div>
    <div id="examLanguageNote">${this.buildLanguageNoteHtml(gradeId)}</div>

    <div class="field" id="examTopicsField">
      <label>المنهج (اختار المنهج كامل، أو وحدة/وحدات كاملة، أو دروس معينة بس)</label>
      <div class="curr-master">
        <label class="topic-check" style="width:100%;justify-content:flex-start;font-weight:800;">
          <input type="checkbox" id="examFullCurriculumCheck" onchange="app.toggleAllCurriculum(this.checked)"> 📖 المنهج الدراسي بالكامل (كل الوحدات والدروس)
        </label>
      </div>
      <div class="curr-tree" id="examCurriculumTree">
        ${this.buildCurriculumTreeHtml(gradeId)}
      </div>
      <button type="button" class="link-btn" onclick="app.toggleCurriculumEditor()" style="margin-top:8px;padding:2px;">✏️ عدّل وحدات ودروس هذا الصف</button>
      ${this.renderCurriculumEditorPanel(gradeId)}
    </div>

    <div class="field" id="examMaterialsField">
      <label>ملفات PDF من المنهج (اختياري — لو مش هترفق أي ملف، هيتولّد الامتحان من معرفة Gemini العامة بالمنهج المصري)</label>
      <div class="material-list" id="examMaterialsGrid" style="margin-top:2px;gap:6px;">
        ${gradeMaterials.length===0 ? `<p style="font-size:12.5px;color:var(--ink-soft);">مفيش ملفات مرفوعة لهذا الصف لسه. تقدر ترفع من تبويب "مكتبة ملفات المنهج".</p>` :
          gradeMaterials.map(m=>`<label class="topic-check" style="width:100%;justify-content:flex-start;"><input type="checkbox" class="examMaterialCheck" value="${m.id}" onchange="this.parentElement.classList.toggle('checked',this.checked)"> 📄 ${m.name} <span style="color:var(--ink-soft);font-size:11px;margin-right:auto;">${fileSizeLabel(m.size)}</span></label>`).join('')}
      </div>
      <label class="topic-check" style="width:100%;justify-content:flex-start;margin-top:10px;align-items:flex-start;">
        <input type="checkbox" id="examOriginalQuestionsCheck" checked style="width:auto;margin-top:2px;flex-shrink:0;">
        <span>أسئلة أصلية جديدة بنفس فكرة الدرس (مش نسخ حرفي من الملف المرفق)، ومسموح لـ Gemini يزوّد أسئلة من عنده على نفس المنهج لو محتاج يكمّل العدد</span>
      </label>
      <label class="topic-check" style="width:100%;justify-content:flex-start;margin-top:8px;align-items:flex-start;">
        <input type="checkbox" id="examAllowDiagramsCheck" style="width:auto;margin-top:2px;flex-shrink:0;">
        <span>🖼️ اسمح بأسئلة فيها رسومات توضيحية (أشكال هندسية، منحنيات دوال، أشكال قوى في الاستاتيكا/الديناميكا) لما تكون محتاجة</span>
      </label>
    </div>

    <div class="field-row">
      <div class="field" style="flex:1"><label>عدد أسئلة الاختيار من متعدد</label><input type="number" min="0" id="examMcqCount" value="5" oninput="app.updateExamCountsPreview()"></div>
      <div class="field" style="flex:1"><label>عدد الأسئلة المقالية</label><input type="number" min="0" id="examEssayCount" value="2" oninput="app.updateExamCountsPreview()"></div>
      <div class="field" style="flex:1"><label>عدد الأسئلة الفكرية</label><input type="number" min="0" id="examConceptualCount" value="0" oninput="app.updateExamCountsPreview()"></div>
    </div>
    <p style="font-size:11px;color:var(--ink-soft);margin-top:-10px;">الأسئلة الفكرية: أسئلة فهم وتحليل (زي "علّل"، "قارن بين"، "وضّح لماذا")، مش حسابية مباشرة.</p>

    <div class="field">
      <label>توزيع مستوى الصعوبة (لازم المجموع = مجموع الأسئلة فوق)</label>
      <div class="diff-grid">
        <div class="diff-box diff-easy"><label>سهل</label><input type="number" min="0" id="examEasyCount" value="3" oninput="app.updateExamCountsPreview()"></div>
        <div class="diff-box diff-medium"><label>متوسط</label><input type="number" min="0" id="examMediumCount" value="3" oninput="app.updateExamCountsPreview()"></div>
        <div class="diff-box diff-hard"><label>صعب</label><input type="number" min="0" id="examHardCount" value="1" oninput="app.updateExamCountsPreview()"></div>
      </div>
      <div class="eg-count-status" id="examCountsStatus">—</div>
    </div>

    <div class="field"><label>عدد نماذج الامتحان</label>
      <select id="examFormsCount">
        ${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===2?'selected':''}>${n} ${n===1?'نموذج':'نماذج'}</option>`).join('')}
      </select>
    </div>
    <p style="font-size:11px;color:var(--ink-soft);margin-top:-10px;">كل النماذج بتحتوي على نفس الأسئلة بترتيب مختلف للأسئلة والاختيارات (زي نموذج أ / ب في الامتحانات الحقيقية، عشان تمنع الغش) — مش أسئلة مختلفة تمامًا. تقدر تضيف نموذج إضافي في أي وقت بعد كده من صفحة الامتحان.</p>

    <div class="field"><label>ملاحظات إضافية لـ Gemini (اختياري)</label><textarea id="examNotesInput" rows="2" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:'Cairo',sans-serif;font-size:14px;" placeholder="مثال: ركّز على تطبيقات حياتية، أو تجنّب أسئلة الإثبات"></textarea></div>

    <p style="font-size:12.5px;color:var(--ink-soft);">🔧 هيتم التوليد باستخدام: <b>${modelInfo? modelInfo.name : (eb.model||'—')}</b> — لو عايز أسرع استجابة ممكن، غيّره لـ "Gemini 3.5 Flash-Lite" من تبويب "🔑 إعداد مفتاح Gemini".</p>

    <button class="btn brass eg-generate-btn" onclick="app.generateExam()">✨ ولّد الامتحان دلوقتي</button>
    `;
  },
  onExamGradeChange(gradeId){
    this.state.ui.examCreateGrade = gradeId;
    this.refreshMaterialsUI(gradeId);
    this.refreshCurriculumUI(gradeId);
    const noteEl = document.getElementById('examLanguageNote');
    if(noteEl) noteEl.innerHTML = this.buildLanguageNoteHtml(gradeId);
  },
  buildLanguageNoteHtml(gradeId){
    if(isSecondaryGrade(gradeId)){
      return `<div class="eg-hint" style="background:var(--red-bg);color:var(--red);border-radius:8px;padding:8px 12px;margin:-6px 0 16px 0;font-weight:700;">🔒 المرحلة الثانوية: هنكون صارمين جدًا مع Gemini إن الامتحان كله عربي فصيح 100% (حتى الأرقام جوه وبرة أي معادلة)، وبرموز رياضية عربية (س، ص، ع — جا، جتا، ظا — لو) بدل x وsin وlog، مع فصل واضح بين أي متغيرات متجاورة. وحتى لو حصل أي تسريب إنجليزي من الذكاء الاصطناعي، الكود بيصلحه تلقائيًا قبل ما يتحفظ.</div>`;
    }
    return `<div class="eg-hint" style="margin:-6px 0 16px 0;">🌐 المرحلة الإعدادية: الامتحان بيتولّد عربي عادي من غير قيود صارمة إضافية على اللغة أو الرموز.</div>`;
  },
  refreshMaterialsUI(gradeId){
    const eb = this.state.examBank;
    const gradeMaterials = eb.materials.filter(m=> !m.gradeId || m.gradeId===gradeId);
    const matGrid = document.getElementById('examMaterialsGrid');
    if(!matGrid) return;
    matGrid.innerHTML = gradeMaterials.length===0 ? `<p style="font-size:12.5px;color:var(--ink-soft);">مفيش ملفات مرفوعة لهذا الصف لسه.</p>` :
      gradeMaterials.map(m=>`<label class="topic-check" style="width:100%;justify-content:flex-start;"><input type="checkbox" class="examMaterialCheck" value="${m.id}" onchange="this.parentElement.classList.toggle('checked',this.checked)"> 📄 ${m.name} <span style="color:var(--ink-soft);font-size:11px;margin-right:auto;">${fileSizeLabel(m.size)}</span></label>`).join('');
  },

  // ===== شجرة اختيار المنهج: المنهج كامل ← وحدة ← درس =====
  buildCurriculumTreeHtml(gradeId){
    const curriculum = examCurriculum(gradeId);
    if(curriculum.length===0) return `<p style="font-size:12.5px;color:var(--ink-soft);">مفيش وحدات مضافة لهذا الصف لسه. دوس "عدّل وحدات ودروس هذا الصف" تحت وضيف وحدات ودروس.</p>`;
    return curriculum.map(u=>`
      <div class="curr-unit">
        <label class="topic-check curr-unit-label" style="width:100%;justify-content:flex-start;">
          <input type="checkbox" class="curr-unit-check" onchange="app.toggleUnitCurriculum(this)"> 📘 ${u.name}
        </label>
        <div class="curr-lessons">
          ${u.lessons.length===0 ? `<p style="font-size:11.5px;color:var(--ink-soft);margin:2px 0;">مفيش دروس مضافة للوحدة دي لسه.</p>` :
            u.lessons.map(l=>`<label class="topic-check curr-lesson-label" style="width:100%;justify-content:flex-start;"><input type="checkbox" class="examLessonCheck" data-unit="${u.name}" value="${l}" onchange="app.onLessonCheckChange(this)"> ${l}</label>`).join('')}
        </div>
      </div>`).join('');
  },
  refreshCurriculumUI(gradeId){
    const tree = document.getElementById('examCurriculumTree');
    if(tree) tree.innerHTML = this.buildCurriculumTreeHtml(gradeId);
    const master = document.getElementById('examFullCurriculumCheck');
    if(master){ master.checked=false; master.indeterminate=false; master.parentElement.classList.remove('checked'); }
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel){
      const wasOpen = panel.style.display !== 'none';
      panel.outerHTML = this.renderCurriculumEditorPanel(gradeId);
      const np = document.getElementById('curriculumEditorPanel');
      if(np && wasOpen) np.style.display = '';
    }
  },
  toggleAllCurriculum(checked){
    document.querySelectorAll('.curr-unit-check, .examLessonCheck').forEach(cb=>{
      cb.checked = checked; cb.indeterminate = false;
      cb.parentElement.classList.toggle('checked', checked);
    });
  },
  toggleUnitCurriculum(unitCb){
    const unitBlock = unitCb.closest('.curr-unit');
    const checked = unitCb.checked;
    unitCb.indeterminate = false;
    unitCb.parentElement.classList.toggle('checked', checked);
    unitBlock.querySelectorAll('.examLessonCheck').forEach(cb=>{
      cb.checked = checked;
      cb.parentElement.classList.toggle('checked', checked);
    });
    this.syncFullCurriculumCheck();
  },
  onLessonCheckChange(lessonCb){
    lessonCb.parentElement.classList.toggle('checked', lessonCb.checked);
    const unitBlock = lessonCb.closest('.curr-unit');
    const unitCb = unitBlock.querySelector('.curr-unit-check');
    const lessonCbs = Array.from(unitBlock.querySelectorAll('.examLessonCheck'));
    const checkedCount = lessonCbs.filter(cb=>cb.checked).length;
    unitCb.checked = lessonCbs.length>0 && checkedCount === lessonCbs.length;
    unitCb.indeterminate = checkedCount>0 && checkedCount<lessonCbs.length;
    unitCb.parentElement.classList.toggle('checked', unitCb.checked);
    this.syncFullCurriculumCheck();
  },
  syncFullCurriculumCheck(){
    const master = document.getElementById('examFullCurriculumCheck');
    if(!master) return;
    const all = Array.from(document.querySelectorAll('.examLessonCheck'));
    const checkedCount = all.filter(cb=>cb.checked).length;
    master.checked = all.length>0 && checkedCount===all.length;
    master.indeterminate = checkedCount>0 && checkedCount<all.length;
    master.parentElement.classList.toggle('checked', master.checked);
  },
  renderCurriculumEditorPanel(gradeId){
    const curriculum = examCurriculum(gradeId);
    return `<div id="curriculumEditorPanel" style="display:none;background:var(--paper);border:1px solid var(--paper-line);border-radius:10px;padding:12px 14px;margin-top:10px;">
      ${curriculum.length===0 ? `<p style="font-size:12px;color:var(--ink-soft);">مفيش وحدات لسه. ضيف وحدة من تحت.</p>` : curriculum.map((u,ui)=>`
        <div style="border-bottom:1px dashed var(--paper-line);padding-bottom:10px;margin-bottom:10px;">
          <div class="log-row" style="background:none;padding:4px 0;">
            <span style="font-weight:700;">📘 ${u.name}</span>
            <button class="x" onclick="app.removeCurriculumUnit('${gradeId}',${ui})">🗑 حذف الوحدة</button>
          </div>
          <div class="log-list" style="margin:6px 0;padding-right:14px;">
            ${u.lessons.length===0 ? '' : u.lessons.map((l,li)=>`<div class="log-row"><span>${l}</span><button class="x" onclick="app.removeCurriculumLesson('${gradeId}',${ui},${li})">✕</button></div>`).join('')}
          </div>
          <div style="display:flex;gap:8px;">
            <input id="newLessonInput_${ui}" placeholder="اسم درس جديد" style="flex:1;padding:6px 10px;border-radius:6px;border:1.5px solid var(--paper-line);font-size:12.5px;">
            <button type="button" class="btn small outline" onclick="app.addCurriculumLesson('${gradeId}',${ui})">+ درس</button>
          </div>
        </div>`).join('')}
      <div style="display:flex;gap:8px;margin-top:6px;">
        <input id="newUnitInput" placeholder="اسم وحدة جديدة" style="flex:1;padding:7px 10px;border-radius:6px;border:1.5px solid var(--paper-line);font-size:13px;">
        <button type="button" class="btn small brass" onclick="app.addCurriculumUnit('${gradeId}')">+ وحدة جديدة</button>
      </div>
    </div>`;
  },
  toggleCurriculumEditor(){
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel) panel.style.display = panel.style.display==='none' ? '' : 'none';
  },
  ensureCustomCurriculum(gradeId){
    if(!this.state.examBank.curriculum[gradeId]){
      const base = DEFAULT_EXAM_CURRICULUM[gradeId] || [];
      this.state.examBank.curriculum[gradeId] = base.map(u=>({ name:u.name, lessons:[...u.lessons] }));
    }
    return this.state.examBank.curriculum[gradeId];
  },
  addCurriculumUnit(gradeId){
    const input = document.getElementById('newUnitInput');
    const val = (input.value||'').trim();
    if(!val) return;
    const list = this.ensureCustomCurriculum(gradeId);
    list.push({ name: val, lessons: [] });
    this.save();
    this.refreshCurriculumUI(gradeId);
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel) panel.style.display = '';
  },
  removeCurriculumUnit(gradeId, unitIdx){
    const list = this.ensureCustomCurriculum(gradeId);
    list.splice(unitIdx,1);
    this.save();
    this.refreshCurriculumUI(gradeId);
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel) panel.style.display = '';
  },
  addCurriculumLesson(gradeId, unitIdx){
    const input = document.getElementById('newLessonInput_'+unitIdx);
    const val = (input.value||'').trim();
    if(!val) return;
    const list = this.ensureCustomCurriculum(gradeId);
    if(!list[unitIdx]) return;
    list[unitIdx].lessons.push(val);
    this.save();
    this.refreshCurriculumUI(gradeId);
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel) panel.style.display = '';
  },
  removeCurriculumLesson(gradeId, unitIdx, lessonIdx){
    const list = this.ensureCustomCurriculum(gradeId);
    if(!list[unitIdx]) return;
    list[unitIdx].lessons.splice(lessonIdx,1);
    this.save();
    this.refreshCurriculumUI(gradeId);
    const panel = document.getElementById('curriculumEditorPanel');
    if(panel) panel.style.display = '';
  },
  updateExamCountsPreview(){

    const mcqEl = document.getElementById('examMcqCount');
    if(!mcqEl) return;
    const mcq = parseInt(mcqEl.value)||0;
    const essay = parseInt(document.getElementById('examEssayCount').value)||0;
    const conceptual = parseInt((document.getElementById('examConceptualCount')||{}).value)||0;
    const easy = parseInt(document.getElementById('examEasyCount').value)||0;
    const medium = parseInt(document.getElementById('examMediumCount').value)||0;
    const hard = parseInt(document.getElementById('examHardCount').value)||0;
    const totalQ = mcq+essay+conceptual, totalD = easy+medium+hard;
    const el = document.getElementById('examCountsStatus');
    if(!el) return;
    if(totalQ===0){ el.className='eg-count-status'; el.textContent='حدد عدد الأسئلة الأول.'; return; }
    if(totalQ===totalD){ el.className='eg-count-status ok'; el.textContent = `✓ تمام: ${totalQ} سؤال (${mcq} اختيار من متعدد + ${essay} مقالي + ${conceptual} فكري) بتوزيع صعوبة ${easy} سهل / ${medium} متوسط / ${hard} صعب.`; }
    else{ el.className='eg-count-status bad'; el.textContent = `✗ عدد الأسئلة (${totalQ}) لازم يساوي مجموع مستويات الصعوبة (${totalD}). الفرق: ${totalQ-totalD}.`; }
  },

  // ===== توليد الامتحان عن طريق Gemini =====
  buildExamSystemPrompt(gradeId){
    let base = `أنت مدرّس رياضيات مصري خبير جدًا في المنهج المصري (الإعدادي والثانوي)، ومتخصص في تصميم امتحانات دقيقة ومتوازنة.
مهمتك: تولّد أسئلة امتحان بصيغة JSON فقط، بدون أي كلام تاني قبلها أو بعدها، وبدون علامات Markdown مثل الثلاث علامات اقتباس.
لازم تلتزم حرفيًا بعدد الأسئلة ونوعها ومستوى صعوبتها المطلوب بالظبط.
اكتب كل الأسئلة والاختيارات والإجابات باللغة العربية الفصحى البسيطة.
اكتب أي رمز أو معادلة رياضية بصيغة LaTeX بين علامتي دولار هكذا: $x^2 + 3x - 5$ للمعادلات داخل السطر، و $$...$$ للمعادلات الكبيرة في سطر منفصل، عشان تتعرض بشكل احترافي.
لو السؤال اختيار من متعدد، لازم يكون له بالظبط 4 اختيارات مختلفة ومنطقية (بينها اختيارات تشتيت واقعية من أخطاء شائعة)، واختيار واحد صحيح فقط، وحدد رقم الاختيار الصحيح (correctIndex بيبدأ من صفر)، واكتب في حقل explanation شرح تفصيلي كامل خطوة بخطوة ليه الاختيار ده هو الصح (زي حل المسألة بالكامل)، عشان نموذج إجابة المدرّس يبقى مفيد ومفصّل مش مجرد تحديد الحرف الصح بس.
لو السؤال مقالي أو فكري، اكتب حل نموذجي كامل ومفصّل خطوة بخطوة في modelAnswer يوضح كل خطوات الحل والسبب وراها، من غير حشو أو تكرار لنفس الكلام أو استطراد خارج الموضوع — التفصيل مطلوب، بس من غير كلام زيادة عن الموضوع.
اكتب نص السؤال نفسه بوضوح ومباشرة من غير إطالة غير ضرورية، لكن خلي الإجابات النموذجية والشروح دايمًا كاملة ومفصّلة زي ما اتشرح فوق.
لو السؤال فكري (conceptual)، يبقى سؤال بيقيس الفهم والتفكير مش مجرد حساب (زي "علّل"، "وضّح لماذا"، "قارن بين"، "ناقش العلاقة بين"، "متى يصح/لا يصح كذا")، واكتب إجابة نموذجية واضحة ومختصرة في modelAnswer توضح فكرة الإجابة الصحيحة وسببها.
اكتب اسم الموضوع الدقيق لكل سؤال في حقل topic (لازم يكون من ضمن المواضيع المطلوبة بالظبط).`;
    if(isSecondaryGrade(gradeId)){
      base += `

⚠️⚠️⚠️ تعليمات صارمة جدًا وغير قابلة للتفاوض إطلاقًا بخصوص اللغة والرموز الرياضية — المرحلة الثانوية ⚠️⚠️⚠️
الامتحان ده لطالب في المرحلة الثانوية المصرية (نظام الثانوية العامة)، ولازم يكون بالكامل — من غير أي استثناء نهائيًا — مكتوب باللغة العربية الفصحى فقط وبالرموز الرياضية العربية المستخدمة فعليًا في المنهج المصري، في كل حقل من حقول الرد (text و choices و modelAnswer و topic).
ممنوع منعًا باتًا كتابة أي كلمة إنجليزية واحدة في أي جزء من الرد. حتى لو الكلمة بسيطة أو شائعة زي "Note" أو "Example" أو "Solution" أو "Figure" أو "Hint"، لازم تتكتب عربي فصيح ("ملحوظة"، "مثال"، "الحل"، "شكل"، "تلميح") من غير أي استثناء.
وده بالظبط بينطبق على الرموز الرياضية نفسها كمان — زي المنهج المصري بالحرف، مش الرموز اللاتينية المعتادة:
- المتغيرات: استخدم حروف عربية زي س، ص، ع، ل، ك (مش x، y، z).
- الدوال المثلثية: اكتبها بالاختصارات العربية القياسية بالظبط: جا (بدل sin)، جتا (بدل cos)، ظا (بدل tan)، ظتا (بدل cot)، قا (بدل sec)، قتا (بدل csc).
- اللوغاريتم: اكتبه بالرمز العربي "لو" (بدل log)، مع كتابة الأساس أسفلها لو محتاج (زي لو٢ بدل log2). "e" و"ln" (اللوغاريتم الطبيعي) تفضل زي ما هي لأنه مفيش رمز عربي موحّد شائع بديل ليها في المنهج.
- الأرقام في كل حتة — جوه أي معادلة LaTeX (بين علامتي $ أو $$) وبرّاها في النص العادي على السوا — لازم تُكتب بالأرقام العربية الهندية (٠ ١ ٢ ٣ ٤ ٥ ٦ ٧ ٨ ٩) مش بالأرقام الإنجليزية (0 1 2 3...) إطلاقًا، من غير أي استثناء.
- لما تكتب أكتر من متغير جنب بعض في نفس المعادلة (زي حاصل ضرب س في ص)، ميلزقوش في بعض من غير فاصل (يعني ميطلعش "سص")، لأن الحروف العربية بتتلخبط بصريًا لو اتلزقت زي كده على عكس x وy الإنجليزي. حط بينهم علامة ضرب واضحة (× أو \\cdot) أو مسافة صغيرة (\\,)، مثلًا اكتب "س × ص" أو "س\\,ص" مش "سص".
عدا الاستثناءات المحددة دي بالظبط (المتغيرات العربية، الدوال المثلثية العربية، لو، وe/ln)، كل حرف مكتوب في الرد لازم يكون حرف عربي 100% — بما في ذلك كل الأرقام في كل حتة، اللي لازم تبقى عربية هندية (٠١٢٣...) زي ما اتشرح فوق، من غير ولا كلمة واحدة إنجليزية ومن غير رقم أو رمز لاتيني واحد زيادة عن كده.
قبل ما ترجع الرد النهائي، راجع كل سؤال وكل اختيار وكل إجابة نموذجية سطر سطر، وتأكد إنك معملتش أي كلمة إنجليزية أو رقم لاتيني زيادة عن المسموح بيه فوق بالظبط، وإنك فاصل بين أي حروف متغيرات متلاصقة. لو لقيت أي مخالفة أثناء المراجعة، استبدلها فورًا بالمقابل العربي الصحيح قبل ما ترجع الرد.
ده شرط أساسي مش اختياري — أي كلمة إنجليزية أو رقم أو رمز رياضي لاتيني زيادة (غير المسموح بيه بالظبط فوق) يعتبر رد مرفوض تمامًا.`;
    }
    return base;
  },
  buildExamUserPrompt(spec){
    let scopeText;
    if(spec.fullCurriculum){
      scopeText = `غطِّ المنهج الدراسي كامل لهذا الصف (كل الوحدات والدروس المعروفة في منهج الرياضيات المصري لـ "${spec.gradeName}")، ووزّع الأسئلة على أكبر عدد ممكن من الوحدات بشكل متوازن.`;
    } else {
      const byUnit = {};
      spec.selectedLessons.forEach(x=>{ (byUnit[x.unit]=byUnit[x.unit]||[]).push(x.lesson); });
      const unitLines = Object.keys(byUnit).map(u=>`  • وحدة "${u}": ${byUnit[u].join('، ')}`).join('\n');
      scopeText = `اقتصر بس على الدروس والوحدات دي (متجيبش أي حاجة برّه المذكور تحت):\n${unitLines}`;
    }
    let t = `جهّزلي أسئلة امتحان لمادة الرياضيات لـ "${spec.gradeName}".
${scopeText}
المطلوب بالظبط:
- عدد أسئلة الاختيار من متعدد: ${spec.mcqCount}
- عدد الأسئلة المقالية: ${spec.essayCount}
- عدد الأسئلة الفكرية (فهم وتحليل، مش حساب مباشر): ${spec.conceptualCount||0}
- توزيع الصعوبة على كل الأسئلة (${spec.totalCount} سؤال): ${spec.easy} سهل، ${spec.medium} متوسط، ${spec.hard} صعب.
`;
    if(spec.allowDiagrams){
      t += `مسموحلك تضيف رسم توضيحي بسيط (شكل هندسي، منحنى دالة، شكل قوى في الاستاتيكا أو الديناميكا...) للأسئلة اللي فعلاً محتاجة شكل عشان توضح المسألة. لو السؤال محتاج شكل، ارجع كود SVG بسيط وصحيح في حقل diagramSvg يمثل الشكل بدقة ومتماشي مع نفس الأطوال/الزوايا/القيم المذكورة في نص السؤال، بعرض حوالي 320 وارتفاع حوالي 220، وخطوط ونصوص واضحة، من غير أي روابط خارجية أو أكواد جافا سكريبت جوه الـ SVG. لو السؤال مش محتاج شكل، سيب حقل diagramSvg فاضي تمامًا.\n`;
    }
    if(spec.hasMaterials){
      if(spec.originalQuestions){
        t += `فيه ملف/ملفات PDF مرفقة، استخدمها كمرجع للدروس والمستوى وطريقة الشرح بس. اكتب أسئلة جديدة تمامًا بصياغة وأرقام مختلفة عن أي سؤال موجود حرفيًا في الملف — ممنوع تنسخ نفس صياغة أي سؤال من الملف زي ما هي، لازم تفحص نفس الفكرة والمهارة بس بسؤال جديد من عندك. ولو محتاج تكمل العدد المطلوب، مسموحلك كمان تضيف أسئلة من عندك على نفس مستوى ومنهج الصف ده حتى لو مش موجودة حرفيًا في الملف.\n`;
      } else {
        t += `استخدم بالدرجة الأولى محتوى ملف/ملفات الـ PDF المرفقة في هذه الرسالة كمصدر أساسي للدروس والأمثلة، وتأكد إن الأسئلة متماشية مع المستوى والطريقة الموجودة فيها.\n`;
      }
    } else {
      t += `مفيش ملف منهج مرفق، فاعتمد على معرفتك بالمنهج المصري الرسمي لهذا الصف.\n`;
    }
    if(spec.notes) t += `ملاحظات إضافية من المدرّس: ${spec.notes}\n`;
    if(spec.isSecondary){
      t += `\n⚠️ تذكير أخير وصارم جدًا: الرد كله لازم يكون عربي فصيح 100% بدون أي كلمة إنجليزية واحدة، وبرموز رياضية عربية (س، ص، ع للمتغيرات — جا، جتا، ظا للدوال المثلثية — لو للوغاريتم — أرقام عربية هندية ٠١٢٣ في كل حتة حتى جوه المعادلات)، مش x وsin وlog والأرقام 0123. وميلزقش حروف المتغيرات في بعض (مش "سص"، لازم "س × ص"). راجع كل كلمة ورقم ورمز قبل ما ترجع الرد وتأكد من كده.\n`;
    }
    t += `رجّع النتيجة بصيغة JSON فقط بالشكل ده بالظبط: {"questions":[{"type":"mcq او essay","difficulty":"easy او medium او hard","topic":"...","text":"...","choices":["...","...","...","..."],"correctIndex":0,"modelAnswer":"..."}]}. اكتب choices و correctIndex بس للأسئلة من نوع mcq، واكتب modelAnswer بس للأسئلة من نوع essay.`;
    return t;
  },
  normalizeGeneratedQuestion(q){
    const type = ['essay','conceptual'].includes(q.type) ? q.type : 'mcq';
    const difficulty = ['easy','medium','hard'].includes(q.difficulty) ? q.difficulty : 'medium';
    let choices = Array.isArray(q.choices) ? q.choices.filter(c=>typeof c==='string' && c.trim()) : [];
    let correctIndex = Number.isInteger(q.correctIndex) ? q.correctIndex : 0;
    if(type==='mcq'){
      while(choices.length<4) choices.push('اختيار');
      choices = choices.slice(0,4);
      if(correctIndex<0 || correctIndex>=choices.length) correctIndex = 0;
    }
    return {
      id: uid(), type, difficulty,
      topic: (q.topic||'').toString().trim() || '-',
      text: (q.text||'').toString().trim() || 'سؤال',
      choices: type==='mcq'? choices : [],
      correctIndex: type==='mcq'? correctIndex : null,
      modelAnswer: (q.modelAnswer||'').toString().trim(),
      explanation: type==='mcq' ? (q.explanation||'').toString().trim() : '',
      diagramSvg: sanitizeSvg(q.diagramSvg)
    };
  },
  buildExamForm(exam, index){
    const order = exam.questions.map(q=>q.id);
    shuffleArray(order);
    const choiceOrders = {};
    exam.questions.forEach(q=>{
      if(q.type==='mcq'){
        const idxArr = q.choices.map((_,i)=>i);
        shuffleArray(idxArr);
        choiceOrders[q.id] = idxArr;
      }
    });
    return { id: uid(), name: `نموذج (${examFormLetter(index)})`, order, choiceOrders };
  },
  async generateExam(){
    const eb = this.state.examBank;
    if(!eb.apiKey){ this.alertModal('لازم تحدد مفتاح Gemini API الأول من تبويب "إعداد مفتاح Gemini".'); this.setExamSubTab('apikey'); return; }

    const gradeId = document.getElementById('examGradeSelect').value;
    const title = document.getElementById('examTitleInput').value.trim() || `امتحان ${gradeById(gradeId).name}`;
    const fullCurriculum = !!(document.getElementById('examFullCurriculumCheck') && document.getElementById('examFullCurriculumCheck').checked);
    const selectedLessons = Array.from(document.querySelectorAll('.examLessonCheck:checked')).map(x=>({ unit:x.getAttribute('data-unit'), lesson:x.value }));
    if(!fullCurriculum && selectedLessons.length===0){ this.alertModal('اختار "المنهج كامل"، أو وحدة، أو درس واحد على الأقل.'); return; }
    const topicChecks = fullCurriculum ? ['المنهج الدراسي بالكامل'] : selectedLessons.map(x=>`${x.unit}: ${x.lesson}`);
    const mcqCount = parseInt(document.getElementById('examMcqCount').value)||0;
    const essayCount = parseInt(document.getElementById('examEssayCount').value)||0;
    const conceptualCount = parseInt(document.getElementById('examConceptualCount').value)||0;
    const easy = parseInt(document.getElementById('examEasyCount').value)||0;
    const medium = parseInt(document.getElementById('examMediumCount').value)||0;
    const hard = parseInt(document.getElementById('examHardCount').value)||0;
    const totalQ = mcqCount+essayCount+conceptualCount, totalD = easy+medium+hard;
    if(totalQ<1){ this.alertModal('لازم يكون فيه سؤال واحد على الأقل.'); return; }
    if(totalQ !== totalD){ this.alertModal(`مجموع الأسئلة (${totalQ}) مش مساوي لمجموع مستويات الصعوبة (${totalD}). ظبطهم الأول.`); return; }
    const formsCount = Math.min(6, Math.max(1, parseInt(document.getElementById('examFormsCount').value)||1));
    const notes = (document.getElementById('examNotesInput').value||'').trim();
    const materialIds = Array.from(document.querySelectorAll('.examMaterialCheck:checked')).map(x=>x.value);
    const originalQuestions = !!(document.getElementById('examOriginalQuestionsCheck') && document.getElementById('examOriginalQuestionsCheck').checked);
    const allowDiagrams = !!(document.getElementById('examAllowDiagramsCheck') && document.getElementById('examAllowDiagramsCheck').checked);

    this.state.ui.examGenerating = true;
    this.state.ui.examGenerationStatus = '⏳ جاري التجهيز...';
    this.renderMain();

    try{
      const parts = [];
      for(const mid of materialIds){
        const mat = eb.materials.find(m=>m.id===mid);
        if(!mat) continue;
        const base64 = await examDbGet(mid).catch(()=>null);
        if(base64) parts.push({ inlineData:{ mimeType:'application/pdf', data:base64 } });
      }
      const spec = {
        gradeName: gradeById(gradeId).name, topics:topicChecks, fullCurriculum, selectedLessons,
        mcqCount, essayCount, conceptualCount, easy, medium, hard, totalCount: totalQ, notes, hasMaterials: parts.length>0,
        originalQuestions, allowDiagrams, isSecondary: isSecondaryGrade(gradeId)
      };
      parts.push({ text: this.buildExamUserPrompt(spec) });

      const result = await this.callGeminiGenerateExam(parts, gradeId, totalQ);
      if(!result || !Array.isArray(result.questions) || result.questions.length===0){
        throw new Error('PARSE_ERROR');
      }
      const questions = result.questions.map(q=>this.normalizeGeneratedQuestion(q));
      if(isSecondaryGrade(gradeId)){
        // شبكة أمان: حتى لو Gemini سرح وكتب رقم أو دالة إنجليزي، بنصلحها هنا كوديًا قبل ما تتحفظ
        questions.forEach(q=>{
          q.text = enforceStrictArabicMath(q.text);
          q.topic = enforceStrictArabicMath(q.topic);
          if(q.type==='mcq'){ q.choices = q.choices.map(c=>enforceStrictArabicMath(c)); q.explanation = enforceStrictArabicMath(q.explanation); }
          if(q.type==='essay' || q.type==='conceptual') q.modelAnswer = enforceStrictArabicMath(q.modelAnswer);
          if(q.diagramSvg) q.diagramSvg = arabizeSvgLabels(q.diagramSvg);
        });
      }
      const exam = {
        id: uid(), title, gradeId, topics: topicChecks,
        createdAt: new Date().toISOString(),
        questions,
        forms: []
      };
      for(let i=0;i<formsCount;i++){ exam.forms.push(this.buildExamForm(exam, i)); }
      eb.exams.unshift(exam);
      this.state.ui.examGenerating = false;
      this.state.ui.examGenerationStatus = '';
      this.save();
      this.openExamDetail(exam.id);
      this.alertModal('✓ اتعمل الامتحان بنجاح! تقدر تعدّل أو تحذف أي سؤال من هنا.', {icon:'🎉', confirmText:'تمام'});
    }catch(e){
      console.error('Exam generation failed', e);
      this.state.ui.examGenerating = false;
      this.state.ui.examGenerationStatus = '';
      this.renderMain(); this.afterExamGenRender();
      const emsg = String((e && e.message) || '');
      let msg = 'حصلت مشكلة في التوليد. جرب تاني.';
      if(emsg.includes('NO_KEY')) msg = 'مفيش مفتاح Gemini API متحفظ. أضفه من تبويب "إعداد مفتاح Gemini".';
      else if(emsg.includes('BLOCKED')) msg = 'Gemini رفض توليد الرد ده (فلاتر أمان). جرب تعدّل الملاحظات أو قلل عدد الأسئلة.';
      else if(emsg.includes('TIMEOUT')) msg = 'الطلب ماخدش رد في الوقت المتاح وحصل تايم أوت (ده بيحصل أكتر مع الامتحانات الكبيرة 20-30 سؤال). جرب تقلل عدد الأسئلة، أو قلل حجم ملف الـ PDF المرفق، أو جرب موديل أسرع (Gemini 3.5 Flash-Lite) من تبويب الإعداد.';
      else if(emsg.startsWith('API_ERROR:401') || emsg.startsWith('API_ERROR:403')) msg = 'المفتاح غلط أو مش متفعّل. راجعه من تبويب "إعداد مفتاح Gemini".';
      else if(emsg.startsWith('API_ERROR:429')) msg = 'تجاوزت الحد المسموح من الطلبات على المفتاح ده دلوقتي. جرب تاني بعد شوية.';
      else if(emsg.startsWith('API_ERROR')){
        // بنفصل رسالة الخطأ الحقيقية اللي راجعة من Gemini نفسه (لو موجودة) ونوريها، بدل تخمين عام مش دقيق
        const parts = emsg.split(':');
        const detail = parts.slice(2).join(':').trim();
        msg = detail ? `Gemini رجّع خطأ: ${detail}` : 'مشكلة في الاتصال بـ Gemini — تأكد من صحة المفتاح واسم الموديل ومن اتصال الإنترنت.';
      }
      else if(emsg.includes('MAX_TOKENS')) msg = 'الرد اتقطع لأنه وصل لأقصى عدد كلمات مسموح بيه قبل ما يخلّص. قلل عدد الأسئلة شوية، أو جرب تاني (أحيانًا بتفرق من مرة لمرة).';
      else if(emsg.includes('PARSE_ERROR')) msg = 'الرد اللي رجع من Gemini مكنش بصيغة سليمة أو كان فاضي. جرب تاني.';
      else if(emsg) msg = `حصلت مشكلة غير متوقعة: ${emsg}`;
      this.alertModal('⚠️ ' + msg);
    }
  },
  async callGeminiGenerateExam(userParts, gradeId, totalQuestions){
    const eb = this.state.examBank;
    if(!eb.apiKey) throw new Error('NO_KEY');
    const systemText = this.buildExamSystemPrompt(gradeId);
    const tq = totalQuestions || 8;
    // سقف مخرجات سخي عشان مايحصلش قطع/بتر في الرد لو الامتحان كبير (الموديل بيدعم لحد 65536 توكن مخرجات)
    const maxOutputTokens = Math.min(64000, 3000 + tq*800);
    // مهلة انتظار أطول للامتحانات الكبيرة (20-30 سؤال)، لأن التوليد الطويل فعليًا بياخد وقت أكتر بطبيعته
    const timeoutMs = Math.min(150000, 60000 + tq*3000);
    const basePayload = { systemInstruction:{parts:[{text:systemText}]}, contents:[{role:'user', parts:userParts}] };
    // مهم جدًا: عيلة Gemini 3 بتفكّر جوّاها (thinking) قبل ما تكتب الإجابة بمستوى "عالي" افتراضيًا،
    // وتوكنز التفكير دي بتتحسب من نفس سقف maxOutputTokens بتاع الإجابة — يعني لو سابنا الإعداد الافتراضي،
    // ممكن التفكير ياكل السقف كله ويرجع الرد فاضي أو ناقص (وده السبب الحقيقي لرسائل "الرد كان فاضي" اللي كانت بتظهر).
    // بنحدد المستوى "LOW" عشان نسيب مساحة كافية للإجابة الفعلية، وده كمان بيسرّع التوليد بشكل ملحوظ.
    const thinkingConfig = { thinkingLevel:'LOW' };
    const attempts = [
      Object.assign({}, basePayload, { generationConfig:{ maxOutputTokens, responseMimeType:'application/json', thinkingConfig } }),
      Object.assign({}, basePayload, { generationConfig:{ maxOutputTokens, thinkingConfig } }) // احتياطي: من غير responseMimeType خالص، اعتمادًا على تعليمات البرومبت بس
    ];
    let lastError = null;
    for(let i=0;i<attempts.length;i++){
      this.state.ui.examGenerationStatus = attempts.length>1 ? `⏳ بيتولّد... (محاولة ${i+1} من ${attempts.length})` : '⏳ بيتولّد...';
      this.renderMain();
      try{
        const data = await this._geminiFetch(attempts[i], timeoutMs);
        const parsed = this._extractJsonFromGemini(data);
        if(parsed) return parsed;
        lastError = new Error('PARSE_ERROR');
      }catch(e){
        lastError = e;
        // لو المحاولة استغرقت المهلة كاملة وفشلت (تايم أوت)، إعادة المحاولة بنفس المهلة مش هتفيد
        // وهتضاعف وقت الانتظار من غير داعي، فبنوقف على طول ونوري رسالة واضحة بدل ما نكرر نفس الانتظار
        if(String(e.message).includes('TIMEOUT')) break;
      }
    }
    throw lastError || new Error('API_ERROR:unknown');
  },
  async _geminiFetch(payload, timeoutMs){
    const eb = this.state.examBank;
    const model = eb.model || 'gemini-3.6-flash';
    // ملحوظة: عمدًا مش بنستخدم AbortController/signal مع fetch هنا، لأن الصفحة فيها Service Worker،
    // وبعض إصدارات المتصفح (خصوصًا كروم أندرويد) بتفشل بخطأ "AbortSignal object could not be cloned"
    // لو الطلب اتقفل عن طريق Service Worker وكان فيه signal. بدالها بنعمل "مهلة ناعمة": بنسابق الطلب
    // نفسه ضد مؤقّت، ولو المؤقّت كسب بنعتبرها انتهت المهلة من غير ما نحاول نلغي الطلب فعليًا.
    const fetchPromise = (async ()=>{
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method:'POST', headers:{'Content-Type':'application/json','x-goog-api-key':eb.apiKey},
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(()=>null);
      if(!res.ok){
        // بنطلع رسالة الخطأ الحقيقية اللي راجعة من Gemini نفسه (مش تخمين من عندنا) عشان تبان المشكلة بالظبط
        const apiMsg = (json && json.error && json.error.message) ? String(json.error.message) : '';
        const err = new Error('API_ERROR:'+res.status+(apiMsg? ':'+apiMsg : ''));
        err.body = json;
        throw err;
      }
      if(json && json.promptFeedback && json.promptFeedback.blockReason){ throw new Error('BLOCKED'); }
      return json;
    })();
    fetchPromise.catch(()=>{}); // لو الطلب اتأخر ورفض بعد ما المهلة خلصت، امتصاص الرفض ده عشان منشوفش تحذير "unhandled rejection"
    let timeoutTimer;
    const timeoutPromise = new Promise((_, reject)=>{
      timeoutTimer = setTimeout(()=> reject(new Error('TIMEOUT')), timeoutMs || 75000);
    });
    try{
      return await Promise.race([fetchPromise, timeoutPromise]);
    }finally{
      clearTimeout(timeoutTimer);
    }
  },
  // بيدوّر على أول { وآخر } في النص ويحاول يفكّه كـ JSON — ده أوسع وأمتن من مجرد شيل علامات ```json
  // لأنه بيتعامل صح حتى لو الموديل حط كلام زيادة قبل أو بعد الـ JSON بالغلط
  _tryParseJson(text){
    if(!text) return null;
    let t = text.trim().replace(/^```json/i,'').replace(/^```/,'').replace(/```$/,'').trim();
    try{ return JSON.parse(t); }catch(e){}
    const start = t.indexOf('{'), end = t.lastIndexOf('}');
    if(start !== -1 && end !== -1 && end > start){
      const sliced = t.slice(start, end+1);
      try{ return JSON.parse(sliced); }catch(e){}
      // محاولة أخيرة: شيل أي فاصلة زيادة قبل } أو ] مباشرة (خطأ شائع جدًا في رد الموديلات)
      try{ return JSON.parse(sliced.replace(/,(\s*[}\]])/g, '$1')); }catch(e){}
    }
    return null;
  },
  _extractJsonFromGemini(data){
    const cand = data.candidates && data.candidates[0];
    if(!cand) return null;
    if(cand.finishReason === 'SAFETY' || cand.finishReason === 'RECITATION') throw new Error('BLOCKED');
    if(cand.finishReason === 'MAX_TOKENS'){
      // الرد اتقطع عشان وصل لسقف عدد التوكنز — نحاول نفك اللي اتولّد فعلًا (ممكن يكون كافي)، ولو مش كفاية نرجّع خطأ واضح
      const partial = ((cand.content && cand.content.parts) || []).filter(p=>!p.thought).map(p=>p.text||'').join('');
      const parsed = this._tryParseJson(partial);
      if(parsed) return parsed;
      throw new Error('MAX_TOKENS');
    }
    // بنستبعد أي "thought" parts (تفكير داخلي) ومنضمّهاش لنص الإجابة، عشان متتلخبطش مع الـ JSON الفعلي
    const text = ((cand.content && cand.content.parts) || []).filter(p=>!p.thought).map(p=>p.text||'').join('');
    return this._tryParseJson(text);
  },
  addExamForm(examId){
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    if(!exam) return;
    exam.forms.push(this.buildExamForm(exam, exam.forms.length));
    this.save();
    this.state.ui.examSelectedFormId = exam.forms[exam.forms.length-1].id;
    this.renderMain(); this.afterExamGenRender();
  },
  async deleteExamForm(examId, formId){
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    if(!exam) return;
    if(exam.forms.length<=1){ this.alertModal('لازم يفضل نموذج واحد على الأقل. احذف الامتحان كله لو عايز.'); return; }
    if(!await this.confirmModal('تحذف النموذج ده؟', {danger:true})) return;
    exam.forms = exam.forms.filter(f=>f.id!==formId);
    if(this.state.ui.examSelectedFormId===formId) this.state.ui.examSelectedFormId = exam.forms[0].id;
    this.save();
    this.renderMain(); this.afterExamGenRender();
  },

  // ===== قائمة الامتحانات المحفوظة =====
  renderExamListView(){
    const exams = this.state.examBank.exams;
    if(exams.length===0) return `<div class="empty-state"><div class="big">📝</div>لسه معملتش أي امتحان.<br><button class="btn brass" style="margin-top:14px;" onclick="app.setExamSubTab('create')">➕ ابدأ إنشاء امتحان</button></div>`;
    return `<div class="exam-list">
      ${exams.map(e=>{
        const g = gradeById(e.gradeId);
        return `<div class="exam-card" onclick="app.openExamDetail('${e.id}')">
          <div>
            <div class="e-title">${e.title}</div>
            <div class="e-meta">${g? g.name:''} · ${e.topics.join('، ')} · ${e.questions.length} سؤال · ${e.forms.length} نموذج · ${fmtDate(e.createdAt)}</div>
          </div>
          <div class="e-actions">
            <button class="btn small outline" onclick="event.stopPropagation();app.openExamDetail('${e.id}')">فتح</button>
            <button class="btn small danger" onclick="event.stopPropagation();app.deleteExam('${e.id}')">🗑 حذف</button>
          </div>
        </div>`;
      }).join('')}
    </div>`;
  },
  async deleteExam(id){
    if(!await this.confirmModal('تحذف الامتحان ده بكل أسئلته ونماذجه نهائيًا؟', {danger:true})) return;
    this.state.examBank.exams = this.state.examBank.exams.filter(e=>e.id!==id);
    this.save();
    if(this.state.ui.examSelectedId===id){ this.state.ui.examSubTab='list'; this.state.ui.examSelectedId=null; }
    this.renderMain(); this.afterExamGenRender();
  },

  // ===== تفاصيل الامتحان (الأسئلة + النماذج + الطباعة) =====
  renderExamDetailView(){
    const exam = this.state.examBank.exams.find(e=>e.id===this.state.ui.examSelectedId);
    if(!exam) return `<div class="empty-state">مفيش امتحان محدد.</div>`;
    const g = gradeById(exam.gradeId);
    let formId = this.state.ui.examSelectedFormId;
    if(!exam.forms.some(f=>f.id===formId)) formId = exam.forms[0] ? exam.forms[0].id : null;
    const form = exam.forms.find(f=>f.id===formId);
    const qMap = {}; exam.questions.forEach(q=>qMap[q.id]=q);
    const orderedIds = form ? orderQuestionsForDisplay(form.order.filter(qid=>qMap[qid]), qMap) : [];

    return `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;margin-bottom:6px;">
      <div>
        <h2 style="margin:0;color:var(--ink);">${exam.title}</h2>
        <div class="e-meta" style="margin-top:4px;">${g?g.name:''} · ${exam.topics.join('، ')} · ${exam.questions.length} سؤال · اتعمل يوم ${fmtDate(exam.createdAt)}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn outline small" onclick="app.setExamSubTab('list')">→ رجوع للقائمة</button>
        <button class="btn danger small" onclick="app.deleteExam('${exam.id}')">🗑 حذف الامتحان</button>
      </div>
    </div>

    ${exam.questions.length===0 ? `<div class="empty-state" style="padding:30px;"><div class="big">📭</div>مفيش أسئلة في الامتحان ده دلوقتي.<br><button class="btn brass small" style="margin-top:12px;" onclick="app.openAddQuestion('${exam.id}')">➕ إضافة سؤال يدويًا</button></div>` : `
    <div class="form-tabs" style="margin-top:20px;">
      ${exam.forms.map(f=>`<button class="form-tab-btn ${f.id===formId?'active':''}" onclick="app.selectExamForm('${exam.id}','${f.id}')">${f.name}</button>`).join('')}
      <button class="form-tab-btn" onclick="app.addExamForm('${exam.id}')" style="border-style:dashed !important;">+ نموذج جديد</button>
      ${exam.forms.length>1? `<button class="form-tab-btn" style="color:var(--red);" onclick="app.deleteExamForm('${exam.id}','${formId}')">🗑 احذف النموذج ده</button>` : ''}
    </div>

    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px;">
      <button class="btn brass small" onclick="app.printExamForm('${exam.id}','${formId}',false)">🖨️ طباعة الامتحان</button>
      <button class="btn outline small" onclick="app.printExamForm('${exam.id}','${formId}',true)">🖨️ طباعة نموذج الإجابة</button>
      <button class="btn outline small" onclick="app.openAddQuestion('${exam.id}')">➕ إضافة سؤال يدويًا</button>
    </div>

    <div class="qlist">
      ${orderedIds.map((qid,i)=>{
        const q = qMap[qid];
        const choiceOrder = (form.choiceOrders && form.choiceOrders[qid]) || q.choices.map((_,idx)=>idx);
        return this.renderQuestionCard(exam.id, q, i+1, choiceOrder);
      }).join('')}
    </div>
    `}
    `;
  },
  renderQuestionCard(examId, q, num, choiceOrder){
    const diffClass = 'diff-'+q.difficulty;
    let body = '';
    if(q.type==='mcq'){
      body = `<div class="q-choices">${choiceOrder.map((origIdx,i)=>{
        const letter = ['أ','ب','ج','د'][i]||(i+1);
        const isCorrect = origIdx===q.correctIndex;
        return `<div class="q-choice ${isCorrect?'correct':''}">${letter}. ${q.choices[origIdx]}</div>`;
      }).join('')}</div>`;
      if(q.explanation) body += `<div class="q-answer"><b>شرح الإجابة الصحيحة:</b><br>${q.explanation.replace(/\n/g,'<br>')}</div>`;
    } else {
      body = `<div class="q-answer"><b>الإجابة النموذجية:</b><br>${(q.modelAnswer||'—').replace(/\n/g,'<br>')}</div>`;
    }
    const diagramHtml = q.diagramSvg ? `<div class="q-diagram">${q.diagramSvg}</div>` : '';
    return `
    <div class="qcard ${diffClass}">
      <div class="q-head">
        <span class="q-num">سؤال ${num}</span>
        <span class="q-badges">
          <span class="badge type ${q.type==='conceptual'?'type-conceptual':''}">${examQuestionTypeName(q.type)}</span>
          <span class="badge ${diffClass}">${examDifficultyName(q.difficulty)}</span>
          <span class="badge topic">${q.topic}</span>
        </span>
      </div>
      <div class="q-text">${q.text}</div>
      ${diagramHtml}
      ${body}
      <div class="q-actions">
        <button class="btn small outline" onclick="app.openEditQuestion('${examId}','${q.id}')">✏️ تعديل</button>
        <button class="btn small danger" onclick="app.deleteQuestion('${examId}','${q.id}')">🗑 حذف</button>
      </div>
    </div>`;
  },
  async deleteQuestion(examId, qid){
    if(!await this.confirmModal('تحذف السؤال ده من الامتحان (ومن كل النماذج)؟', {danger:true})) return;
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    if(!exam) return;
    exam.questions = exam.questions.filter(q=>q.id!==qid);
    exam.forms.forEach(f=>{
      f.order = f.order.filter(id=>id!==qid);
      if(f.choiceOrders) delete f.choiceOrders[qid];
    });
    this.save();
    this.renderMain(); this.afterExamGenRender();
  },
  openEditQuestion(examId, qid){
    this.state.ui.examEditExamId = examId;
    this.state.ui.examEditQid = qid;
    this.renderModal('exam-question-edit');
  },
  openAddQuestion(examId){
    this.state.ui.examEditExamId = examId;
    this.state.ui.examEditQid = null;
    this.renderModal('exam-question-add');
  },
  toggleQTypeFields(v){
    const mcq = document.getElementById('qMcqFields');
    const essay = document.getElementById('qEssayFields');
    if(mcq) mcq.style.display = v==='mcq' ? '' : 'none';
    if(essay) essay.style.display = v==='mcq' ? 'none' : '';
  },
  // ===== تنسيق تلقائي بالذكاء الاصطناعي لسؤال مكتوب بصياغة عادية (مش LaTeX) =====
  async autoFormatQuestion(examId){
    const modal = document.querySelector('#modalRoot form');
    if(!modal) return;
    const eb = this.state.examBank;
    const statusEl = document.getElementById('autoFormatStatus');
    if(!eb.apiKey){
      if(statusEl){ statusEl.style.color='var(--red)'; statusEl.textContent='✗ محتاج مفتاح Gemini API الأول من تبويب "إعداد مفتاح Gemini".'; }
      return;
    }
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    const type = modal.qtype.value;
    const payload = { text: modal.qtext.value || '' };
    if(type==='mcq'){
      payload.choices = [0,1,2,3].map(i=> modal['choice'+i].value || '');
      payload.explanation = modal.qexplain ? (modal.qexplain.value||'') : '';
    } else {
      payload.answer = modal.qanswer ? (modal.qanswer.value||'') : '';
    }
    const btn = document.getElementById('autoFormatBtn');
    if(btn) btn.disabled = true;
    if(statusEl){ statusEl.style.color='var(--ink-soft)'; statusEl.textContent='⏳ بينسّق الصياغة...'; }
    try{
      const result = await this.callGeminiFormatQuestion(payload, exam ? exam.gradeId : null);
      if(!result) throw new Error('EMPTY');
      const isSec = exam ? isSecondaryGrade(exam.gradeId) : false;
      const clean = (s) => isSec ? enforceStrictArabicMath(String(s||'')) : String(s||'');
      if(typeof result.text === 'string') modal.qtext.value = clean(result.text);
      if(type==='mcq'){
        if(Array.isArray(result.choices)){
          result.choices.slice(0,4).forEach((c,i)=>{ if(modal['choice'+i]) modal['choice'+i].value = clean(c); });
        }
        if(modal.qexplain && typeof result.explanation === 'string') modal.qexplain.value = clean(result.explanation);
      } else if(modal.qanswer && typeof result.answer === 'string'){
        modal.qanswer.value = clean(result.answer);
      }
      if(statusEl){ statusEl.style.color='var(--green)'; statusEl.textContent='✓ اتنسّق! راجع الكلام كويس وبعدين احفظ.'; }
    }catch(e){
      console.error('Auto-format failed', e);
      if(statusEl){ statusEl.style.color='var(--red)'; statusEl.textContent='✗ حصلت مشكلة في التنسيق (تأكد من المفتاح والإنترنت). جرب تاني أو ظبطه يدويًا.'; }
    }finally{
      if(btn) btn.disabled = false;
    }
  },
  async callGeminiFormatQuestion(payload, gradeId){
    const systemText = `أنت أداة تنسيق نصوص أسئلة امتحانات رياضيات بس. مهمتك الوحيدة: تاخد نص مكتوب بصياغة عادية من مدرّس (ممكن يكون فيه رموز رياضية مكتوبة بشكل غير منسق زي "س^2" أو "جذر 5" أو "3/4") وتحوّله لصيغة LaTeX منسقة وصحيحة بين علامتي دولار ($...$)، من غير ما تغيّر أي معنى أو رقم أو تضيف أو تشيل أي معلومة من عندك — بس تصلح الشكل والتنسيق. لو حقل معين فاضي، رجّعه فاضي زي ما هو. رجّع النتيجة بصيغة JSON فقط بنفس مفاتيح المُدخل بالظبط (text, choices, explanation أو answer حسب الموجود)، من غير أي كلام تاني قبله أو بعده.`
      + (isSecondaryGrade(gradeId) ? '\nملحوظة مهمة: ده لطالب ثانوي، فلازم تستخدم رموز رياضية عربية: س/ص/ع للمتغيرات (مش x/y/z)، جا/جتا/ظا للدوال المثلثية (مش sin/cos/tan)، لو للوغاريتم (مش log)، وأرقام هندية عربية (٠١٢٣...) في النص العادي.' : '');
    const userText = `نسّق الحقول دي:\n${JSON.stringify(payload)}`;
    const body = { systemInstruction:{parts:[{text:systemText}]}, contents:[{role:'user', parts:[{text:userText}]}], generationConfig:{ responseMimeType:'application/json', maxOutputTokens: 2000 } };
    const data = await this._geminiFetch(body);
    return this._extractJsonFromGemini(data);
  },
  saveQuestionForm(evt, examId, qid){
    evt.preventDefault();
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    if(!exam) return;
    const f = evt.target;
    const type = f.qtype.value;
    const difficulty = f.qdifficulty.value;
    const topic = f.qtopic.value.trim() || '-';
    const text = f.qtext.value.trim();
    const diagramSvg = sanitizeSvg((f.qdiagram && f.qdiagram.value || '').trim());
    let choices = [], correctIndex = null, modelAnswer = '', explanation = '';
    if(type==='mcq'){
      choices = [0,1,2,3].map(i=> (f['choice'+i].value||'').trim() || `اختيار ${i+1}`);
      correctIndex = parseInt(f.qcorrect.value)||0;
      explanation = (f.qexplain && f.qexplain.value || '').trim();
    } else {
      modelAnswer = (f.qanswer.value||'').trim();
    }
    if(qid){
      const q = exam.questions.find(x=>x.id===qid);
      if(q) Object.assign(q, {type,difficulty,topic,text,choices,correctIndex,modelAnswer,explanation,diagramSvg});
    } else {
      const newQ = { id: uid(), type, difficulty, topic, text, choices, correctIndex, modelAnswer, explanation, diagramSvg };
      exam.questions.push(newQ);
      exam.forms.forEach(fo=>{
        fo.order.push(newQ.id);
        if(type==='mcq') fo.choiceOrders[newQ.id] = shuffleArray([0,1,2,3]);
      });
    }
    this.save();
    this.closeModal();
    this.renderMain(); this.afterExamGenRender();
  },

  // ===== طباعة الامتحان / نموذج الإجابة (في نافذة/صفحة منفصلة) =====
  printExamForm(examId, formId, showAnswers){
    const exam = this.state.examBank.exams.find(e=>e.id===examId);
    if(!exam) return;
    const form = exam.forms.find(f=>f.id===formId) || exam.forms[0];
    if(!form) return;
    const qMap = {}; exam.questions.forEach(q=>qMap[q.id]=q);
    const g = gradeById(exam.gradeId);
    const tp = this.state.teacherProfile;
    const orderedIds = orderQuestionsForDisplay(form.order.filter(qid=>qMap[qid]), qMap);

    const questionsHtml = orderedIds.map((qid,i)=>{
      const q = qMap[qid];
      const choiceOrder = (form.choiceOrders && form.choiceOrders[qid]) || q.choices.map((_,idx)=>idx);
      let inner = `<div class="p-qtext"><b>${i+1}.</b> ${q.text} <span class="p-mark">(${examQuestionTypeName(q.type)})</span></div>`;
      if(q.diagramSvg) inner += `<div class="p-diagram">${q.diagramSvg}</div>`;
      if(q.type==='mcq'){
        inner += `<div class="p-choices">${choiceOrder.map((origIdx,ci)=>{
          const letter = ['أ','ب','ج','د'][ci];
          const correct = showAnswers && origIdx===q.correctIndex;
          return `<div class="p-choice ${correct?'p-correct':''}">${letter}. ${q.choices[origIdx]}</div>`;
        }).join('')}</div>`;
        if(showAnswers && q.explanation){ inner += `<div class="p-answer">${q.explanation.replace(/\n/g,'<br>')}</div>`; }
      } else {
        if(showAnswers){ inner += `<div class="p-answer">${(q.modelAnswer||'').replace(/\n/g,'<br>')}</div>`; }
        else { inner += `<div class="p-lines">${'<div class="p-line"></div>'.repeat(4)}</div>`; }
      }
      return `<div class="p-question">${inner}</div>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl"><head><meta charset="UTF-8">
<title>${exam.title} - ${form.name}</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/katex.min.js"><\/script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.11/contrib/auto-render.min.js"><\/script>
<style>
  body{ font-family:'Segoe UI', Tahoma, Arial, sans-serif; padding:30px 40px; color:#142A44; max-width:820px; margin:0 auto; }
  .p-head{ display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #1E3A5F; padding-bottom:14px; margin-bottom:18px; }
  .p-head h1{ font-size:20px; margin:0 0 4px 0; }
  .p-head .sub{ font-size:12.5px; color:#5B6B7A; }
  .p-formtag{ background:#B8863A; color:#fff; padding:5px 14px; border-radius:8px; font-weight:700; font-size:13px; white-space:nowrap; }
  .p-side{ display:flex; flex-direction:column; align-items:flex-end; gap:6px; flex-shrink:0; }
  .p-teacher{ font-size:12px; color:#5B6B7A; font-weight:700; white-space:nowrap; }
  .p-info-row{ display:flex; justify-content:space-between; margin-bottom:22px; font-size:13px; border:1px solid #ccc; border-radius:8px; padding:10px 16px; }
  .p-question{ margin-bottom:20px; page-break-inside:avoid; }
  .p-qtext{ font-size:14.5px; line-height:1.9; margin-bottom:8px; }
  .p-mark{ font-size:11px; color:#888; }
  .p-choices{ display:flex; flex-direction:column; gap:6px; margin-right:14px; }
  .p-choice{ font-size:13.5px; padding:4px 0; }
  .p-choice.p-correct{ color:#3F6B4F; font-weight:700; }
  .p-lines{ margin-right:14px; margin-top:8px; }
  .p-line{ border-bottom:1px solid #999; height:26px; }
  .p-answer{ background:#F3EEE0; border:1px dashed #B8863A; border-radius:8px; padding:10px 14px; font-size:13.5px; margin-right:14px; }
  .p-diagram{ text-align:center; margin:10px 0; }
  .p-diagram svg{ max-width:320px; height:auto; }
  .p-print-bar{ text-align:center; margin-bottom:20px; }
  .p-print-bar button{ padding:10px 22px; border-radius:8px; border:none; background:#1E3A5F; color:#fff; font-weight:700; font-size:14px; cursor:pointer; }
  @media print{ .p-print-bar{ display:none; } body{ padding:10px 20px; } }
</style></head>
<body>
  <div class="p-print-bar"><button onclick="window.print()">🖨️ طباعة / حفظ PDF</button></div>
  <div class="p-head">
    <div>
      <h1>${exam.title}</h1>
      <div class="sub">${g?g.name:''} — ${exam.topics.join('، ')}</div>
    </div>
    <div class="p-side">
      <div class="p-formtag">${form.name}</div>
      ${tp.name ? `<div class="p-teacher">👨‍🏫 ${tp.name}</div>` : ''}
    </div>
  </div>
  ${showAnswers ? `<div style="background:#E4EEE7;color:#3F6B4F;padding:8px 16px;border-radius:8px;font-weight:700;margin-bottom:18px;">🔑 نموذج الإجابة</div>` : `<div class="p-info-row"><span>الاسم: ..............................</span><span>التاريخ: __/__/____</span></div>`}
  ${questionsHtml}
  <script>
    window.addEventListener('load', function(){
      if(typeof renderMathInElement === 'function'){
        renderMathInElement(document.body, { delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}], throwOnError:false });
      }
    });
  <\/script>
</body></html>`;

    const blob = new Blob([html], {type:'text/html'});
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if(!win){ this.alertModal('المتصفح منع فتح نافذة جديدة. اسمح بالنوافذ المنبثقة (popups) لهذا الموقع وجرب تاني.'); }
  },

  renderModal(kind){
    const root = document.getElementById('modalRoot');

    if(kind==='exam-question-edit' || kind==='exam-question-add'){
      const examId = this.state.ui.examEditExamId;
      const exam = this.state.examBank.exams.find(e=>e.id===examId);
      if(!exam){ this.closeModal(); return; }
      const isEdit = kind==='exam-question-edit';
      const q = isEdit ? exam.questions.find(x=>x.id===this.state.ui.examEditQid) : null;
      if(isEdit && !q){ this.closeModal(); return; }
      const type = q ? q.type : 'mcq';
      const choices = (q && q.choices && q.choices.length===4) ? q.choices : ['','','',''];
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>${isEdit? 'تعديل السؤال':'إضافة سؤال جديد'}</h2>
          <form onsubmit="app.saveQuestionForm(event,'${examId}','${q? q.id : ''}')">
            <div class="field-row">
              <div class="field"><label>نوع السؤال</label>
                <select name="qtype" id="qTypeSelect" onchange="app.toggleQTypeFields(this.value)">
                  <option value="mcq" ${type==='mcq'?'selected':''}>اختيار من متعدد</option>
                  <option value="essay" ${type==='essay'?'selected':''}>مقالي</option>
                  <option value="conceptual" ${type==='conceptual'?'selected':''}>فكري</option>
                </select>
              </div>
              <div class="field"><label>مستوى الصعوبة</label>
                <select name="qdifficulty">
                  ${EXAM_DIFFICULTIES.map(d=>`<option value="${d.id}" ${(q?q.difficulty:'medium')===d.id?'selected':''}>${d.name}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="field"><label>الموضوع</label><input name="qtopic" value="${q? q.topic : (exam.topics[0]||'')}" required></div>
            <div style="background:var(--paper);border:1.5px dashed var(--brass);border-radius:10px;padding:10px 14px;margin-bottom:14px;">
              <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <button type="button" class="btn outline small" id="autoFormatBtn" onclick="app.autoFormatQuestion('${examId}')">🪄 نسّق الصياغة تلقائيًا</button>
                <span style="font-size:11.5px;color:var(--ink-soft);">اكتب السؤال والاختيارات والشرح بصياغتك العادية (من غير LaTeX)، ودوس الزرار، وهيتظبطوا تلقائيًا برموز رياضية صحيحة.</span>
              </div>
              <p id="autoFormatStatus" style="font-size:12px;margin:6px 0 0 0;min-height:15px;"></p>
            </div>
            <div class="field"><label>نص السؤال</label><textarea name="qtext" rows="3" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:'Cairo',sans-serif;font-size:14px;" required>${q? q.text : ''}</textarea></div>
            <div id="qMcqFields" style="${type==='mcq'?'':'display:none;'}">
              ${[0,1,2,3].map(i=>`<div class="field"><label>${['أ','ب','ج','د'][i]}</label><input name="choice${i}" value="${choices[i]||''}"></div>`).join('')}
              <div class="field"><label>رقم الاختيار الصحيح</label>
                <select name="qcorrect">${[0,1,2,3].map(i=>`<option value="${i}" ${(q&&q.correctIndex===i)?'selected':''}>${['أ','ب','ج','د'][i]}</option>`).join('')}</select>
              </div>
              <div class="field"><label>شرح الإجابة الصحيحة (لنموذج إجابة المدرّس)</label><textarea name="qexplain" rows="3" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:'Cairo',sans-serif;font-size:14px;">${q? (q.explanation||'') : ''}</textarea></div>
            </div>
            <div id="qEssayFields" style="${type==='mcq'?'display:none;':''}">
              <div class="field"><label>الإجابة النموذجية</label><textarea name="qanswer" rows="4" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:'Cairo',sans-serif;font-size:14px;">${q? (q.modelAnswer||'') : ''}</textarea></div>
            </div>
            <div class="field"><label>كود SVG لرسم توضيحي (اختياري)</label><textarea name="qdiagram" rows="3" style="width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-family:monospace;font-size:12px;direction:ltr;text-align:left;" placeholder="&lt;svg viewBox=&quot;0 0 320 220&quot;&gt;...&lt;/svg&gt;">${q? (q.diagramSvg||'') : ''}</textarea>
              ${q&&q.diagramSvg ? `<div class="q-diagram" style="margin-top:8px;">${q.diagramSvg}</div>` : ''}
            </div>
            <p style="font-size:11.5px;color:var(--ink-soft);">تقدر تكتب معادلات رياضية بصيغة LaTeX بين علامتي دولار يدويًا (مثلًا: $x^2+3x-5$)، أو الأسهل: اكتبها بصياغتك العادية ودوس "🪄 نسّق الصياغة تلقائيًا" فوق.</p>
            <div class="modal-actions">
              <button type="submit" class="btn">💾 حفظ السؤال</button>
              <button type="button" class="btn outline" onclick="app.closeModal()">إلغاء</button>
            </div>
          </form>
        </div>
      </div>`;
      return;
    }

    if(kind==='cancellation-broadcast'){
      const msg = this.state.ui.cancellationMessage || '';
      const tg = this.state.ui.cancellationTg;
      const wa = this.state.ui.cancellationWa;
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>✅ تم إلغاء الحصة</h2>
          <p class="page-sub">دي رسالة الإلغاء — انسخها وابعتها في جروبات التليجرام والواتساب بتاعتك</p>
          <textarea id="cancellationMsgBox" readonly rows="4" style="width:100%;padding:12px;border-radius:10px;border:1.5px solid var(--paper-line);font-family:'Cairo',sans-serif;font-size:14px;resize:vertical;background:var(--paper);color:var(--ink-dark);">${msg}</textarea>
          <div class="modal-actions">
            <button id="copyCancelBtn" class="btn brass" onclick="app.copyCancellationMessage()">📋 نسخ الرسالة</button>
            ${tg? `<a class="btn outline" href="${tg}" target="_blank" rel="noopener">📣 افتح جروب التليجرام</a>` : ''}
            ${wa? `<a class="btn outline" href="${wa}" target="_blank" rel="noopener">📱 افتح جروب الواتساب</a>` : ''}
          </div>
          ${(!tg && !wa)? `<p style="font-size:12.5px;color:var(--ink-soft);margin-top:6px;">لسه مضفتش روابط جروبات لهذه المجموعة — تقدر تضيفها من "⚙️ الإعدادات" عشان تظهر هنا كأزرار جاهزة في المرة الجاية.</p>` : `<p style="font-size:12.5px;color:var(--ink-soft);margin-top:6px;">دوس نسخ الرسالة الأول، وبعدين افتح الجروب وألصقها (Paste) وابعتها بنفسك — واتساب وتليجرام مش بيسمحوا لأي موقع إنه يبعت رسالة تلقائي في جروب.</p>`}
        </div>
      </div>`;
      return;
    }

    if(kind==='bulk-send'){
      const type = this.state.ui.activeBulkType;
      const batch = this.state.bulkSendState[type];
      if(!batch){ this.closeModal(); return; }
      const title = batch.title || 'إرسال جماعي';
      const items = batch.items || [];
      const missing = (batch.totalRequested||0) - items.length;
      const sentCount = items.filter(it=>it.sent).length;
      const current = items.find(it=>!it.sent);
      const progressHtml = items.length===0 ? '' : (current ? `
        <div class="stat-card" style="text-align:center;margin-bottom:16px;">
          <div style="font-size:12.5px;color:var(--ink-soft);">جاهز للإرسال (${sentCount+1} من ${items.length})</div>
          <div style="font-size:19px;font-weight:800;color:var(--ink);margin:8px 0;">${current.name}</div>
          <a class="btn brass" href="${current.link}" target="_blank" rel="noopener" onclick="app.advanceBulkSendIndex()" style="display:inline-block;">📤 افتح واتساب وابعت له</a>
          <p style="font-size:11.5px;color:var(--ink-soft);margin-top:10px;">بعد ما تبعت الرسالة جوه واتساب، ارجع هنا — هتلاقي الزرار جاهز تلقائيًا للشخص اللي بعده. التقدم ده محفوظ حتى لو قفلت البرنامج ورجعت تاني.</p>
        </div>` : `
        <div class="stat-card" style="text-align:center;margin-bottom:16px;background:var(--green-bg);">
          <div style="font-size:16px;font-weight:800;color:var(--green);">✅ خلصت كل الرسايل! (${items.length} من ${items.length})</div>
        </div>`);
      const rows = items.map(item=>`
        <div class="log-row" style="${item.sent?'opacity:.55;':''}">
          <span>${item.sent?'✓ ':''}${item.name}</span>
          <a class="wa-btn" href="${item.link}" target="_blank" rel="noopener" onclick="${item.sent?'':'app.advanceBulkSendIndex()'}">${item.sent?'أعد الإرسال':'فتح واتساب'}</a>
        </div>`).join('');
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>${title}</h2>
          <p class="page-sub">${items.length} رسالة جاهزة${missing>0? ` — و${missing} طالب من غير رقم ولي أمر مسجّل`:''}</p>
          ${progressHtml}
          <div class="log-list" style="max-height:300px;">
            ${items.length===0? `<div class="empty-state">مفيش أي طالب في القائمة دي عنده رقم ولي أمر مسجّل.</div>` : rows}
          </div>
          ${sentCount>0? `<button class="link-btn" style="color:var(--red);margin-top:12px;" onclick="app.clearBulkSendBatch('${type}')">🗑 إلغاء الدفعة دي والبدء من جديد المرة الجاية</button>` : ''}
        </div>
      </div>`;
      return;
    }

    if(kind==='unpaid-list'){
      const am = this.getActiveMonth();
      const monthLabel = `${am.month+1}/${am.year}`;
      const unpaid = this.state.students.filter(s=>{
        const rec = this.getRecord(s.id);
        return !(rec.payments[am.key] && rec.payments[am.key].paid);
      });
      const rows = unpaid.map(s=>{
        const g = gradeById(s.grade); const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
        return `<div class="log-row" style="align-items:center;">
          <span><b>${s.name}</b> — ${g.short}${gr? ' - '+gr.name:''}</span>
          <span style="display:flex;gap:6px;">
            <button class="link-btn" onclick="app.closeModal(); app.openStudent('${s.id}')">فتح الملف</button>
            <button class="wa-btn ${s.parentPhone? '':'grey'}" onclick="app.sendToParent('${s.id}')">إرسال لولي الأمر</button>
          </span>
        </div>`;
      }).join('');
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>لسه مدفعوش شهرية ${monthLabel}</h2>
          <p class="page-sub">${unpaid.length} طالب — الأسامي والصفوف بتاعتهم</p>
          <div class="log-list" style="max-height:420px;">
            ${unpaid.length===0? `<div class="empty-state">الحمد لله، الكل دافع شهرية ${monthLabel} 🎉</div>` : rows}
          </div>
        </div>
      </div>`;
      return;
    }

    if(kind==='add-student'){
      const preset = this.state.ui.addGradePreset;
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>إضافة طالب جديد</h2>
          <p class="page-sub">هيتضاف السجل بتاعه فورًا لصفحة الصف</p>
          <form onsubmit="app.addStudent(event)">
            <div class="field"><label>اسم الطالب</label><input name="studentName" required autofocus placeholder="مثال: أحمد محمود"></div>
            <div class="field-row">
              <div class="field"><label>الصف الدراسي</label>
                <select name="grade" onchange="app.syncGroupOptions(this.value)">${GRADES.map(g=>`<option value="${g.id}" ${g.id===preset?'selected':''}>${g.name}</option>`).join('')}</select>
              </div>
              <div class="field"><label>المجموعة</label>
                <select name="group" id="groupSelectField">${gradeGroups(preset).map(gr=>`<option value="${gr.id}">${gr.name}</option>`).join('')}</select>
              </div>
            </div>
            <div class="field-row">
              <div class="field"><label>هاتف الطالب (اختياري)</label><input name="phone" placeholder="01xxxxxxxxx"></div>
              <div class="field"><label>هاتف ولي الأمر</label><input name="parentPhone" placeholder="01xxxxxxxxx"></div>
            </div>
            <p style="font-size:12px;color:var(--ink-soft);margin:-6px 0 14px 0;">💰 الشهرية هتاخد قيمة الصف الموحدة تلقائيًا (تقدر تظبطها من ⚙️ الإعدادات، أو تخصّص شهرية مختلفة لطالب معين بعدين من "تعديل").</p>
            <div class="modal-actions">
              <button type="submit" class="btn">حفظ الطالب</button>
              <button type="button" class="btn outline" onclick="app.closeModal()">إلغاء</button>
            </div>
          </form>
        </div>
      </div>`;
      return;
    }

    if(kind==='edit-student'){
      const id = this.state.ui.editStudentId;
      const s = this.state.students.find(x=>x.id===id);
      if(!s){ this.closeModal(); return; }
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <h2>تعديل بيانات الطالب</h2>
          <form onsubmit="app.updateStudent(event,'${s.id}')">
            <div class="field"><label>اسم الطالب</label><input name="studentName" required value="${s.name}"></div>
            <div class="field-row">
              <div class="field"><label>الصف الدراسي</label>
                <select name="grade" onchange="app.syncGroupOptions(this.value)">${GRADES.map(g=>`<option value="${g.id}" ${g.id===s.grade?'selected':''}>${g.name}</option>`).join('')}</select>
              </div>
              <div class="field"><label>المجموعة</label>
                <select name="group" id="groupSelectField">${gradeGroups(s.grade).map(gr=>`<option value="${gr.id}" ${gr.id===s.group?'selected':''}>${gr.name}</option>`).join('')}</select>
              </div>
            </div>
            <div class="field-row">
              <div class="field"><label>هاتف الطالب</label><input name="phone" value="${s.phone||''}"></div>
              <div class="field"><label>هاتف ولي الأمر</label><input name="parentPhone" value="${s.parentPhone||''}"></div>
            </div>
            <div class="field"><label>شهرية خاصة بهذا الطالب (اختياري)</label><input name="fee" type="number" min="0" step="1" value="${s.fee!==null && s.fee!==undefined ? s.fee : ''}" placeholder="شهرية الصف الموحدة: ${this.state.gradeFees[s.grade]||0} ج (سيبها فاضية لتستخدمها)"></div>
            <div class="modal-actions">
              <button type="submit" class="btn">حفظ التعديلات</button>
              <button type="button" class="btn outline" onclick="app.closeModal()">إلغاء</button>
            </div>
          </form>
        </div>
      </div>`;
      return;
    }

    if(kind==='student-detail'){
      const id = this.state.ui.selectedStudent;
      const s = this.state.students.find(x=>x.id===id);
      if(!s){ this.closeModal(); return; }
      const g = gradeById(s.grade); const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
      const sub = this.state.ui.studentSubTab;
      const rec = this.getRecord(s.id);
      const att = this.todayAttendanceDisplay(s.id);
      root.innerHTML = `
      <div class="overlay" onclick="if(event.target===this) app.closeModal()">
        <div class="modal">
          <button class="modal-close" onclick="app.closeModal()">✕</button>
          <div class="student-head">
            <div>
              <h2 class="student-name-lg">${s.name}</h2>
              <span class="grade-chip" style="background:${g.color}">${g.name}</span>
              ${gr? `<span class="group-pill group-${gr.id}">${gr.name}</span>`:''}
              ${s.phone? `<div style="font-size:13px;color:var(--ink-soft);margin-top:6px;">📞 الطالب: ${s.phone}</div>`:''}
              ${s.parentPhone? `<div style="font-size:13px;color:var(--ink-soft);">👪 ولي الأمر: ${s.parentPhone}</div>`:''}
              <div style="font-size:13px;color:var(--ink-soft);margin-top:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <span>📌 حضور النهارده:</span>
                <button class="attend-chip ${att.cls}" onclick="app.toggleAttendanceAndRefreshModal('${s.id}')">${att.icon} ${att.label}</button>
              </div>
            </div>
            <div class="head-actions">
              <button class="btn outline small" onclick="app.openEditStudent('${s.id}')">✏️ تعديل</button>
              <button class="btn danger small" onclick="app.deleteStudent('${s.id}')">حذف</button>
            </div>
          </div>
          <div class="subtabs">
            <button class="subtab-btn ${sub==='attendance'?'active':''}" onclick="app.setStudentSubTab('attendance')">الحضور</button>
            <button class="subtab-btn ${sub==='payments'?'active':''}" onclick="app.setStudentSubTab('payments')">المدفوعات</button>
            <button class="subtab-btn ${sub==='grades'?'active':''}" onclick="app.setStudentSubTab('grades')">الدرجات</button>
            <button class="subtab-btn ${sub==='report'?'active':''}" onclick="app.setStudentSubTab('report')">تقرير الشهر</button>
          </div>
          <div id="subtabContent">${this.renderStudentSubtab(s)}</div>
        </div>
      </div>`;
      return;
    }
  },

  renderStudentSubtab(s){
    const rec = this.getRecord(s.id);
    const sub = this.state.ui.studentSubTab;

    if(sub==='attendance'){
      const entries = Object.entries(rec.attendance).sort((a,b)=> b[0].localeCompare(a[0]));
      const presentCount = entries.filter(([,st])=>st==='present').length;
      const pct = entries.length ? Math.round(presentCount/entries.length*100) : null;
      const pickedDate = this.state.ui.attendancePickedDate || todayISO();
      const pickedStatus = rec.attendance[pickedDate];
      const pickedColor = pickedStatus==='present' ? 'var(--green)' : (pickedStatus==='absent' ? 'var(--red)' : 'var(--ink-soft)');
      const pickedBg = pickedStatus==='present' ? 'var(--green-bg)' : (pickedStatus==='absent' ? 'var(--red-bg)' : 'var(--paper)');
      const pickedLabel = pickedStatus==='present' ? '✓ حاضر' : (pickedStatus==='absent' ? '✕ غايب' : 'لا يوجد سجل لهذا اليوم');
      return `
      ${pct!==null? `<div class="summary-line"><span>نسبة الحضور الكلية</span><span>${pct}%</span></div>` : ''}
      <div class="field">
        <label>ارجع لأي يوم فات عشان تعرف كان حاضر ولا غايب</label>
        <input type="date" value="${pickedDate}" max="${todayISO()}" onchange="app.setAttendancePickedDate(this.value)">
      </div>
      <div class="summary-line" style="background:${pickedBg};margin-bottom:16px;">
        <span>${fmtDate(pickedDate)}</span>
        <span style="color:${pickedColor};font-weight:800;">${pickedLabel}</span>
      </div>
      <p style="font-size:12.5px;color:var(--ink-soft);margin:0 0 8px 0;">سجل كل الأيام:</p>
      <div class="log-list" style="max-height:240px;">
        ${entries.length===0? `<div class="empty-state" style="padding:16px;">لسه مفيش سجل حضور</div>` :
          entries.map(([date,status])=>`
          <div class="log-row">
            <span>${fmtDate(date)}</span>
            <span style="color:${status==='present'?'var(--green)':'var(--red)'};font-weight:700;">${status==='present'?'✓ حاضر':'✕ غايب'}</span>
          </div>`).join('')}
      </div>`;
    }

    if(sub==='payments'){
      const year = this.state.ui.paymentYear;
      const months = academicYearMonths(year);
      const cells = months.map(({calYear, monthIndex})=>{
        const key = `${calYear}-${monthIndex}`;
        const p = rec.payments[key];
        const paid = p && p.paid;
        return `<div class="month-cell" style="border-color:${paid?'var(--green)':'var(--paper-line)'}">
          <div class="m-name">${monthIndex+1}</div>
          <div class="stamp-mini ${paid?'stamp-paid':'stamp-unpaid'}" style="cursor:pointer;width:34px;height:34px;font-size:16px;" onclick="app.togglePaymentAndRefreshModal('${s.id}',${calYear},${monthIndex})">${paid?'✓':'—'}</div>
          <div style="font-size:11px;color:var(--ink-soft);">${paid? (p.amount||0)+' ج':'لم يُدفع'}</div>
        </div>`;
      }).join('');
      const paidThisYear = months.reduce((acc,{calYear,monthIndex})=> acc + ((rec.payments[`${calYear}-${monthIndex}`]||{}).paid?1:0), 0);
      return `
      <div class="summary-line"><span>شهور مدفوعة في السنة الدراسية ${year}/${year+1}</span><span>${paidThisYear}/12</span></div>
      <div class="year-switch"><button onclick="app.changePaymentYear(-1)">›</button><span>${year}/${year+1}</span><button onclick="app.changePaymentYear(1)">‹</button></div>
      <div class="months-grid">${cells}</div>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:14px;">الشهور بالأرقام (8 = أغسطس ... 7 = يوليو اللي بعده). اضغط على الشهر لتغيير حالة الدفع (مدفوع / غير مدفوع).</p>`;
    }

    if(sub==='grades'){
      const avg = rec.grades.length? Math.round(rec.grades.reduce((a,g)=>a+(g.score/g.maxScore*100),0)/rec.grades.length) : null;
      const rows = rec.grades.map(g=>{
        const pct = Math.round(g.score/g.maxScore*100);
        const cls = pct>=85?'pct-good':(pct>=60?'pct-mid':'pct-bad');
        return `<tr>
          <td>${g.subject}</td><td>${gradeExamLabel(g)}</td><td>${g.score}/${g.maxScore}</td>
          <td><span class="pct-pill ${cls}">${pct}%</span></td><td>${fmtDate(g.date)}</td>
          <td><button class="link-btn" onclick="app.deleteGradeEntry('${s.id}','${g.id}')">حذف</button></td>
        </tr>`;
      }).join('');
      return `
      ${avg!==null? `<div class="summary-line"><span>المعدل العام</span><span>${avg}%</span></div>`:''}
      ${this.renderGradeTrendChart(rec.grades)}
      <form class="grade-form" onsubmit="app.addGradeEntry(event,'${s.id}')">
        <input class="g-subject" name="subject" placeholder="المادة" value="${this.state.teacherProfile.subject||'رياضيات'}">
        <input class="g-exam" name="examName" placeholder="اسم الامتحان (اختياري)">
        <input class="g-score" name="score" type="number" step="0.5" placeholder="الدرجة" required>
        <input class="g-max" name="maxScore" type="number" step="0.5" placeholder="من كام" required>
        <button type="submit" class="btn brass" style="padding:8px 14px;">إضافة</button>
      </form>
      ${rec.grades.length===0? `<div class="empty-state" style="padding:20px;">لسه مفيش درجات مسجّلة</div>`: `
      <table class="grades-tbl">
        <thead><tr><th>المادة</th><th>الامتحان</th><th>الدرجة</th><th>النسبة</th><th>التاريخ</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`}`;
    }

    if(sub==='report'){
      const g = gradeById(s.grade); const gr = s.group ? {id:s.group, name:gradeGroupName(s.grade, s.group)} : null;
      const monthOptions = this.monthsSinceRegistration(s.createdAt);
      const activeKey = this.getActiveMonth().key;
      const selectedKey = (this.state.ui.reportMonthKey && monthOptions.some(m=>m.key===this.state.ui.reportMonthKey)) ? this.state.ui.reportMonthKey : activeKey;
      const am = monthOptions.find(m=>m.key===selectedKey) || this.getActiveMonth();
      const monthLabel = `${am.month+1}/${am.year}`;
      const att = this.todayAttendanceDisplay(s.id);
      let present=0, absent=0;
      Object.entries(rec.attendance).forEach(([date,status])=>{
        const d = new Date(date);
        if(d.getFullYear()===am.year && d.getMonth()===am.month){ if(status==='present') present++; else absent++; }
      });
      const paidInfo = rec.payments[am.key];
      const paid = paidInfo && paidInfo.paid;
      const monthGrades = rec.grades.filter(gd=>{ const d=new Date(gd.date); return d.getFullYear()===am.year && d.getMonth()===am.month; });

      return `
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;padding:10px 14px;background:var(--paper);border-radius:12px;border:1px solid var(--paper-line);">
        <span style="font-size:13px;color:var(--ink-soft);">📌 حضور النهارده:</span>
        <button class="attend-chip ${att.cls}" onclick="app.toggleAttendanceAndRefreshModal('${s.id}')">${att.icon} ${att.label}</button>
        <span style="font-size:11.5px;color:var(--ink-soft);">دوس عشان تحوّله ${att.cls==='is-absent'?'حاضر':'غايب'}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:14px;">
        <label style="font-size:13px;color:var(--ink-soft);">📅 تقرير شهر:</label>
        <select onchange="app.setReportMonth(this.value)" style="padding:7px 12px;border-radius:8px;border:1.5px solid var(--paper-line);font-size:13px;font-weight:600;">
          ${monthOptions.map(m=>`<option value="${m.key}" ${m.key===selectedKey?'selected':''}>${m.month+1}/${m.year}${m.key===activeKey?' (الشهر الحالي)':''}</option>`).join('')}
        </select>
      </div>
      <div class="report-card" id="reportCardNode">
        <div class="rc-head">
          <h2>${s.name}</h2>
          <span class="rc-month">${monthLabel}</span>
        </div>
        <div style="font-size:12.5px;color:var(--ink-soft);margin-bottom:10px;">${g.name} — ${gr? gr.name:''}</div>
        <div class="rc-section-title">الحضور والغياب</div>
        <div class="rc-row"><span>أيام الحضور</span><span>${present}</span></div>
        <div class="rc-row"><span>أيام الغياب</span><span>${absent}</span></div>
        <div class="rc-section-title">الشهرية</div>
        <div class="rc-row"><span>حالة الدفع</span><span>${paid? 'مدفوعة ('+(paidInfo.amount||0)+' ج)':'لم تُدفع بعد'}</span></div>
        ${monthGrades.length? `<div class="rc-section-title">الدرجات هذا الشهر</div>` + monthGrades.map(gd=>`<div class="rc-row"><span>${gd.subject} — ${gradeExamLabel(gd)}</span><span>${gd.score}/${gd.maxScore}</span></div>`).join('') : `<div class="rc-section-title">الدرجات هذا الشهر</div><div class="rc-row"><span>لا توجد امتحانات مسجّلة هذا الشهر</span><span></span></div>`}
      </div>
      <div class="report-actions">
        <button class="btn" onclick="app.downloadReportImage('${s.id}')">📷 تحميل التقرير كصورة</button>
        <button class="btn brass ${s.parentPhone?'':'outline'}" onclick="app.sendToParent('${s.id}', {year:${am.year},month:${am.month},key:'${am.key}'})">📤 إرسال رسالة لولي الأمر</button>
      </div>
      <p style="font-size:12px;color:var(--ink-soft);margin-top:10px;">اختار أي شهر من قائمة "تقرير شهر" فوق عشان تشوف تاريخ الطالب/ة من أول ما اتسجل، أو تبعت تقرير شهر قديم لولي الأمر. ممكن تحمّل الصورة وتبعتها يدويًا لو حابب.</p>
      `;
    }
  }
};

app.init();

// تسجيل الـ Service Worker عشان يشتغل كـ PWA حقيقي — بيشتغل بس لو البرنامج مستضاف على سيرفر (https:// أو localhost)
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js').catch(()=>{ /* طبيعي إنه يفشل لو الملف مفتوح مباشرة من الجهاز (file://) */ });
  });
}
