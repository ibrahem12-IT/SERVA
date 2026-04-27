document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('i');
    const currentTheme = localStorage.getItem('theme');

      // كود تحديد الصفحة النشطة في القائمة
      const currentLocation = location.href; 
      const menuItems = document.querySelectorAll('.nav-links li a');
      const menuLength = menuItems.length;


for (let i = 0; i < menuLength; i++) {
    if (menuItems[i].href === currentLocation) {
        menuItems[i].className = "active-link";
    }
}

    // التحقق من وجود خيار محفظ مسبقاً
    if (currentTheme) {
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateIcon(currentTheme);
    } else {
        // افتراضياً، إذا لم يكن هناك خيار، نتحقق من تفضيلات النظام
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            updateIcon('dark');
        }
    }

    // حدث النقر على الزر
    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        
        if (theme === 'dark') {
            theme = 'light';
            document.documentElement.removeAttribute('data-theme');
        } else {
            theme = 'dark';
            document.documentElement.setAttribute('data-theme', 'dark');
        }
        
        // حفظ الخيار وتحديث الأيقونة
        localStorage.setItem('theme', theme);
        updateIcon(theme);
    });

    // دالة لتحديث أيقونة الزر (شمس/قمر)
    function updateIcon(theme) {
        if (theme === 'dark') {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
    }
});



// كود إخفاء شاشة التحميل عند انتهاء جلب كافة الملفات
window.addEventListener('load', () => {
    const loader = document.getElementById('loader-wrapper');
    
    // إضافة تأخير بسيط (مثلاً نصف ثانية) ليعطي شعوراً بالانسيابية
    setTimeout(() => {
        loader.classList.add('loader-hidden');
    }, 500);
});


/*Header*/
document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    let currentSlide = 0;
    const slideInterval = 5000; // وقت العرض (5 ثوانٍ)

    function nextSlide() {
        // إزالة الكلاس النشط من الشريحة الحالية
        slides[currentSlide].classList.remove('active');
        
        // الانتقال للشريحة التالية (والعودة للصفر إذا وصلنا للنهاية)
        currentSlide = (currentSlide + 1) % slides.length;
        
        // إضافة الكلاس النشط للشريحة الجديدة
        slides[currentSlide].classList.add('active');
    }

    // بدء التبديل التلقائي
    setInterval(nextSlide, slideInterval);
});