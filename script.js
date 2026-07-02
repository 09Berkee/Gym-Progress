// HAPTIC FEEDBACK MOTORU
function haptic() { if (navigator.vibrate) navigator.vibrate(15); }

function closeWelcomeScreen() {
    haptic();
    document.getElementById('welcome-overlay').style.display = 'none';
}

const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');
const profileForm = document.getElementById('profile-form');
        
let selectedDayIndex = 0;
let activeWorkoutData = [];
let myChart = null;

let metricsHistory = JSON.parse(localStorage.getItem('gymprogress_metrics_history')) || [];
let exerciseHistory = JSON.parse(localStorage.getItem('gymprogress_ex_history')) || {};

// HAFTALIK ARŞİV VERİTABANI
let archivedWeeks = JSON.parse(localStorage.getItem('gymprogress_archived_weeks')) || [];
let copiedExercises = null;
        
// DİL MOTORU (i18n)
let currentLang = localStorage.getItem('gymprogress_lang') || 'en';

const i18n = {
    en: {
        nav_dash: "🏠 Dashboard", nav_ana: "📈 Analytics", nav_prof: "👤 Profile", nav_hist_weeks: "📂 History",
        user_tag: "Local Offline Tracker", welcome_prefix: "Hi, ",
        dash_sub: "Build your program, Track your progress and Never give up.",
        w_weight: "Weight", w_height: "Height", w_muscle: "Muscle Mass", w_fat: "Body Fat",
        pending: "Pending", updated: "Updated", formula: "Formula",
        alert_msg: "To better track your progress, please update this information weekly!",
        weekly_plan: "WEEKLY PLAN", rest_day: "REST DAY",
        ex_name: "Exercise Name", ex_weight: "Weight", ex_sets: "Sets", ex_reps: "Reps", btn_add: "ADD",
        prof_title: "Profile & Body Metrics 👤", prof_sub: "Enter your measurements to calculate body composition formulas.",
        l_name: "Name", l_gender: "Gender", l_male: "Male", l_female: "Female", l_age: "Age",
        l_height: "Height (cm)", l_weight: "Weight (kg)", l_waist: "Waist (cm)", l_neck: "Neck (cm)", l_hip: "Hip (cm)",
        l_lang: "Language / Dil", btn_save: "Calculate & Save Record",
        ana_title: "Progress Analytics 📈", ana_sub: "Track your body metrics history over time.",
        f_all: "View All", f_w: "Weight Only", f_m: "Muscle Mass Only", f_f: "Body Fat Only",
        hist_title: "History Log",
        disc_footer: "<strong>Disclaimer:</strong> Gym Progress is a local tracking tool, not a medical or certified training application. All generated body metrics are structural estimations. Always consult a physician before initiating any workout program. By continuing, you assume full responsibility for your health, physical safety, and training risks. All user metrics are stored securely and exclusively on your local device.",
        btn_start: "START WORKOUT",
        no_ex: "No exercises added for today. You can add them below! 🏋️‍♂️",
        no_hist: "No historical data found. Calculate and save your profile to start tracking!",
        status_comp: "Completed", status_not: "Not Completed",
        chart_w: "Weight (kg)", chart_m: "Muscle Mass (kg)", chart_f: "Body Fat (%)", mass_kg: "Mass (kg)", fat_perc: "Fat (%)",
        update_text: "Update:", ph_name: "e.g. Alex", ph_ex: "Type... (e.g. RDL, Lat, OHP)",
        workout_suf: "Workout", btn_copy: "COPY", btn_paste: "PASTE", prev_lbl: "Prev",
        btn_archive_week: "📦 FINISH AND SAVE WEEK", arch_title: "Archived Weeks Log 📂",
        arch_sub: "Review your past completed weekly workouts and lifted weights.",
        select_week_prompt: "Select an archived week from the left list to view details.",
        no_archived_weeks: "No archived weeks found. Finish workouts and click 'Finish and Save Week'!",
        archive_week_prefix: "Week Entry", archive_empty_day_warn: "No completed data for this day.",
        archive_success_toast: "Week data successfully archived!", archive_error_toast: "No completed workouts found to save!"
    },
    tr: {
        nav_dash: "🏠 Anasayfa", nav_ana: "📈 Grafikler", nav_prof: "👤 Profil", nav_hist_weeks: "📂 Geçmiş",
        user_tag: "Yerel Takipçi", welcome_prefix: "Merhaba, ",
        dash_sub: "Programını oluştur, gelişimini takip et ve asla pes etme.",
        w_weight: "Kilo", w_height: "Boy", w_muscle: "Kas Kütlesi", w_fat: "Yağ Oranı",
        pending: "Bekliyor", updated: "Güncellendi", formula: "Formül",
        alert_msg: "Gelişiminizi daha iyi takip etmek için lütfen bu bilgileri haftalık güncelleyin!",
        weekly_plan: "HAFTALIK PLAN", rest_day: "DİNLENME",
        ex_name: "Hareket Adı", ex_weight: "Ağırlık", ex_sets: "Set", ex_reps: "Tekrar", btn_add: "EKLE",
        prof_title: "Profil ve Vücut Ölçüleri 👤", prof_sub: "Vücut kompozisyon formüllerini hesaplamak için ölçülerinizi girin.",
        l_name: "İsim", l_gender: "Cinsiyet", l_male: "Erkek", l_female: "Kadın", l_age: "Yaş",
        l_height: "Boy (cm)", l_weight: "Kilo (kg)", l_waist: "Bel (cm)", l_neck: "Boyun (cm)", l_hip: "Kalça (cm)",
        l_lang: "Dil / Language", btn_save: "Hesapla ve Kaydet",
        ana_title: "Gelişim Grafikleri 📈", ana_sub: "Zaman içindeki vücut ölçülerinizi takip edin.",
        f_all: "Tümünü Gör", f_w: "Sadece Kilo", f_m: "Sadece Kas", f_f: "Sadece Yağ",
        hist_title: "Geçmiş Kayıtları",
        disc_footer: "<strong>Sorumluluk Reddi:</strong> Gym Progress bir veri takip aracıdır; tıbbi veya sertifikalı bir antrenman uygulaması değildir. Hesaplanan tüm vücut metrikleri tahmini değerlerdir. Herhangi bir antrenman programına başlamadan önce mutlaka bir hekime danışın. Devam ederek sağlığınızın, fiziksel güvenliğinizin ve sakatlık risklerinin tüm sorumlunu üstlenmiş sayılırsınız. Tüm verileriniz güvenli bir şekilde sadece kendi cihazınızda saklanır.",
        btn_start: "DEVAM ET",
        no_ex: "Bugün için hareket eklenmedi. Aşağıdan ekleyebilirsiniz! 🏋️‍♂️",
        no_hist: "Geçmiş kayıt bulunamadı. Takip etmek için profilinizi kaydedin!",
        status_comp: "Tamamlandı", status_not: "Tamamlanmadı",
        chart_w: "Kilo (kg)", chart_m: "Kas Kütlesi (kg)", chart_f: "Yağ Oranı (%)", mass_kg: "Kütle (kg)", fat_perc: "Yağ (%)",
        update_text: "Kayıt:", ph_name: "örn. Alex", ph_ex: "Yazın... (örn. RDL, Lat)",
        workout_suf: "Antrenmanı", btn_copy: "KOPYALA", btn_paste: "YAPIŞTIR", prev_lbl: "Önceki",
        btn_archive_week: "📦 HAFTAYI BİTİR VE KAYDET", arch_title: "Geçmiş Haftalar Arşivi 📂",
        arch_sub: "Geçmişte tamamladığın haftalık antrenmanları ve kaldırdığın kiloları incele.",
        select_week_prompt: "Detayları görmek için soldaki listeden bir hafta seçin.",
        no_archived_weeks: "Geçmiş kayıt bulunamadı. Haftayı tamamlayıp 'Haftayı Bitir ve Kaydet' butonuna basın!",
        archive_week_prefix: "Hafta Kaydı", archive_empty_day_warn: "Bu gün için tamamlanmış veri yok.",
        archive_success_toast: "Hafta verileri başarıyla arşivlendi!", archive_error_toast: "Arşivlenecek tamamlanmış antrenman bulunamadı!"
    }
};

const daysEn = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const daysTr = ["PZT", "SAL", "ÇAR", "PER", "CUM", "CMT", "PAZ"];
const fullDaysEn = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const fullDaysTr = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

const catMap = {
    en: { "Chest": "Chest", "Back": "Back", "Shoulder": "Shoulder", "Arm": "Arm", "Leg": "Leg", "Core": "Core" },
    tr: { "Chest": "Göğüs", "Back": "Sırt", "Shoulder": "Omuz", "Arm": "Kol", "Leg": "Bacak", "Core": "Karın" }
};

function applyLanguage(lang) {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (i18n[lang][key]) {
            if (el.tagName === 'OPTION') el.text = i18n[lang][key];
            else el.innerHTML = i18n[lang][key];
        }
    });

    document.getElementById('user-name').placeholder = i18n[lang].ph_name;
    document.getElementById('new-ex-name').placeholder = i18n[lang].ph_ex;
    document.getElementById('user-language').value = lang;
    document.getElementById('dynamic-global-footer').innerHTML = i18n[lang].disc_footer;

    const profile = JSON.parse(localStorage.getItem('gymprogress_data'));
    document.getElementById('kilo-sub').textContent = profile ? i18n[lang].updated : i18n[lang].pending;
    document.getElementById('boy-sub').textContent = profile ? i18n[lang].updated : i18n[lang].pending;
    document.getElementById('kas-sub').textContent = profile ? i18n[lang].formula : i18n[lang].pending;
    document.getElementById('yag-sub').textContent = profile ? i18n[lang].formula : i18n[lang].pending;

    renderWeeklyGrid();
    renderActiveWorkout(selectedDayIndex);
    renderHistoryList();
    renderArchiveWeeksList();

    if(myChart) {
        myChart.data.datasets[0].label = i18n[lang].chart_w;
        myChart.data.datasets[1].label = i18n[lang].chart_m;
        myChart.data.datasets[2].label = i18n[lang].chart_f;
        myChart.options.scales.y.title.text = i18n[lang].mass_kg;
        myChart.options.scales.y1.title.text = i18n[lang].fat_perc;
        myChart.update();
    }
}

window.changeLanguage = function(lang) {
    haptic();
    localStorage.setItem('gymprogress_lang', lang);
    currentLang = lang;
    applyLanguage(lang);
};

const defaultProgram = [
    { label: "MON", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "TUE", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "WED", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "THU", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "FRI", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "SAT", status: "not_completed", sub: "Not Completed", exercises: [] },
    { label: "SUN", status: "not_completed", sub: "Not Completed", exercises: [] }
];

const exerciseDictionary = {
    "Bench Press (Flat)": { cat: "Chest", desc_en: "Overall pectoralis major hypertrophy and pressing power.", desc_tr: "Genel göğüs (pectoralis major) hipertrofisi ve temel itiş gücü." },
    "Bench Press": { cat: "Chest", desc_en: "Overall pectoralis major hypertrophy and pressing power.", desc_tr: "Genel göğüs (pectoralis major) hipertrofisi ve temel itiş gücü." },
    "Dumbell Bench Press": { cat: "Chest", desc_en: "Pectoralis major hypertrophy with extended ROM.", desc_tr: "Artırılmış hareket mesafesiyle (ROM) göğüs hipertrofisi." },
    "Incline Bench Press": { cat: "Chest", desc_en: "Upper chest (clavicular head) hypertrophy.", desc_tr: "Üst göğüs (klavikular baş) hipertrofisi." },
    "Incline Dumbell Press": { cat: "Chest", desc_en: "Upper chest isolation with unilateral balance.", desc_tr: "Tek taraflı denge ile üst göğüs izolasyonu." },
    "Decline Bench Press": { cat: "Chest", desc_en: "Lower chest (sternal head) focus.", desc_tr: "Alt göğüs (sternal baş) hipertrofisi." },
    "Decline Dumbell Press": { cat: "Chest", desc_en: "Lower chest focus with extended ROM.", desc_tr: "Geniş açıyla alt göğüs hipertrofisi." },
    "Incline Smith Machine Press": { cat: "Chest", desc_en: "Stable upper chest overloading.", desc_tr: "Stabilize edilmiş üst göğüs kütle yüklemesi." },
    "Smith Machine Bench Press": { cat: "Chest", desc_en: "Stable overall chest overloading.", desc_tr: "Sabit açıda kontrollü göğüs yüklemesi." },
    "Machine Chest Press": { cat: "Chest", desc_en: "Isolated mid-chest stimulation.", desc_tr: "İzole orta göğüs kasılması." },
    "Incline Machine Press": { cat: "Chest", desc_en: "Isolated upper chest stimulation.", desc_tr: "Makinede izole üst göğüs kasılması." },
    "Dumbell Fly (Flat Fly)": { cat: "Chest", desc_en: "Pectoralis major stretching and isolation.", desc_tr: "Göğüs kaslarında esneme ve izolasyon odaklı açış." },
    "Incline Dumbell Fly": { cat: "Chest", desc_en: "Upper chest stretching and isolation.", desc_tr: "Üst göğüs esneme ve izolasyonu." },
    "Cable Fly (Cable Crossover)": { cat: "Chest", desc_en: "Constant tension on pectoralis major.", desc_tr: "Kesintisiz gerilim ile genel göğüs hipertrofisi." },
    "Low to High Cable Fly": { cat: "Chest", desc_en: "Upper chest (clavicular) focus via constant tension.", desc_tr: "Aşağıdan yukarı çekişle üst göğüs aktivasyonu." },
    "High to Low Cable Fly": { cat: "Chest", desc_en: "Lower chest (sternal) focus via constant tension.", desc_tr: "Yukarıdan aşağı çekişle alt göğüs sıkıştırması." },
    "Pec Deck Fly (Butterfly Machine)": { cat: "Chest", desc_en: "Pure chest isolation with minimal triceps involvement.", desc_tr: "Triceps katılımı olmadan saf göğüs izolasyonu." },
    "Chest Dips": { cat: "Chest", desc_en: "Lower chest and anterior deltoid engagement.", desc_tr: "Alt göğüs ve ön omuz katılımıyla kütle inşası." },
    "Push-Up": { cat: "Chest", desc_en: "Bodyweight chest and anterior core endurance.", desc_tr: "Vücut ağırlığıyla göğüs ve merkez bölge aktivasyonu." },

    "Pull-Up": { cat: "Back", desc_en: "Latissimus dorsi width and upper back development.", desc_tr: "Latissimus dorsi (kanat) genişliği ve üst sırt gelişimi." },
    "Chin-Up": { cat: "Back", desc_en: "Latissimus dorsi and biceps brachii focus.", desc_tr: "Kanat og biceps (pazı) odaklı dikey çekiş." },
    "Lat Pulldown (Front)": { cat: "Back", desc_en: "Controlled latissimus dorsi hypertrophy.", desc_tr: "Kontrollü kanat (latissimus dorsi) hipertrofisi." },
    "Close Grip Lat Pulldown": { cat: "Back", desc_en: "Lower lat fibers and mid-back focus.", desc_tr: "Alt kanat lifleri ve orta sırt kalınlığı." },
    "Straight Arm Pulldown": { cat: "Back", desc_en: "Isolated lat tension through shoulder extension.", desc_tr: "Omuz ekstansiyonu ile izole kanat gerilimi." },
    "Barbell Row (Bent Over Row)": { cat: "Back", desc_en: "Overall back thickness, engaging lats and rhomboids.", desc_tr: "Lats ve rhomboid odaklı genel sırt kalınlığı." },
    "Dumbell Row (One Arm)": { cat: "Back", desc_en: "Unilateral lat and mid-back hypertrophy.", desc_tr: "Tek taraflı kanat ve orta sırt hipertrofisi." },
    "T-Bar Row": { cat: "Back", desc_en: "Mid-back thickness and core stabilization.", desc_tr: "Orta sırt kalınlığı ve merkez bölge stabilizasyonu." },
    "Seated Cable Row": { cat: "Back", desc_en: "Mid-back and trapezius continuous tension.", desc_tr: "Orta sırt ve trapezler için kesintisiz gerilim." },
    "Chest Supported Row": { cat: "Back", desc_en: "Pure back thickness without lower back fatigue.", desc_tr: "Bel omurgasını yormadan saf sırt kalınlığı inşası." },
    "Pendlay Row": { cat: "Back", desc_en: "Explosive pulling power from a dead stop.", desc_tr: "Yerden kalkışlı, patlayıcı sırt çekiş gücü." },
    "Face Pull": { cat: "Back", desc_en: "Rear deltoid and rotator cuff health.", desc_tr: "Arka omuz hipertrofisi ve rotator manşet sağlığı." },
    "Shrug (Barbell/Dumbell)": { cat: "Back", desc_en: "Upper trapezius hypertrophy.", desc_tr: "Üst trapez (boyun bölgesi) hipertrofisi." },
    "Deadlift": { cat: "Back", desc_en: "Posterior chain (back, glutes, hamstrings) mass.", desc_tr: "Tüm arka zincir (sırt, kalça, arka bacak) kütlesi." },
    "Back Extension (Hyperextension)": { cat: "Back", desc_en: "Erector spinae isolation and strength.", desc_tr: "Bel omurgası (erector spinae) gücü ve izolasyonu." },

    "Overhead Press (OHP)": { cat: "Shoulder", desc_en: "Anterior deltoid and overall shoulder hypertrophy.", desc_tr: "Ön omuz (anterior deltoid) ve genel omuz kütlesi." },
    "Seated Dumbell Press": { cat: "Shoulder", desc_en: "Stable anterior and medial deltoid pressing.", desc_tr: "Oturarak stabil ön ve yan omuz itişi." },
    "Arnold Press": { cat: "Shoulder", desc_en: "Rotational press targeting all three deltoid heads.", desc_tr: "Rotasyonlu açışla tüm omuz başlarını uyaran itiş." },
    "Smith Shoulder Press": { cat: "Shoulder", desc_en: "Stable anterior deltoid overload.", desc_tr: "Makinede kontrollü ön omuz kütle yüklemesi." },
    "Machine Shoulder Press": { cat: "Shoulder", desc_en: "Isolated deltoid pushing power.", desc_tr: "İzole edilmiş omuz itiş makinesi." },
    "Lateral Raise (Side Raise)": { cat: "Shoulder", desc_en: "Medial deltoid isolation for lateral width.", desc_tr: "Omuz genişliği için yan omuz (medial deltoid) izolasyonu." },
    "Dumbell Lateral Raise": { cat: "Shoulder", desc_en: "Medial deltoid isolation.", desc_tr: "Yan omuz (medial deltoid) izolasyonu." },
    "Cable Lateral Raise": { cat: "Shoulder", desc_en: "Constant tension on the medial deltoid.", desc_tr: "Yan omuz üzerinde kesintisiz kablo gerilimi." },
    "Machine Lateral Raise": { cat: "Shoulder", desc_en: "Strict medial deltoid isolation.", desc_tr: "Momentumsuz, tam kontrollü yan omuz izolasyonu." },
    "Front Raise": { cat: "Shoulder", desc_en: "Anterior deltoid isolation.", desc_tr: "Ön omuz (anterior deltoid) izolasyonu." },
    "Cable Front Raise": { cat: "Shoulder", desc_en: "Constant tension on the anterior deltoid.", desc_tr: "Ön omuz üzerinde kesintisiz kablo gerilimi." },
    "Rear Delt Fly": { cat: "Shoulder", desc_en: "Posterior deltoid isolation for shoulder balance.", desc_tr: "Omuz dengesi için arka omuz (posterior deltoid) izolasyonu." },
    "Reverse Pec Deck": { cat: "Shoulder", desc_en: "Strict posterior deltoid isolation.", desc_tr: "Makinede tam izole arka omuz hipertrofisi." },
    "Upright Row": { cat: "Shoulder", desc_en: "Medial deltoid and upper trapezius focus.", desc_tr: "Yan omuz ve üst trapez aktivasyonu." },

    "Barbell Curl": { cat: "Arm", desc_en: "Biceps brachii overall mass and strength.", desc_tr: "Biceps brachii (pazı) genel kütlesi ve gücü." },
    "EZ Bar Curl": { cat: "Arm", desc_en: "Biceps brachii mass with reduced wrist strain.", desc_tr: "Bilek stresini azaltan genel biceps hipertrofisi." },
    "Dumbell Curl": { cat: "Arm", desc_en: "Unilateral biceps brachii hypertrophy.", desc_tr: "Tek taraflı biceps brachii hipertrofisi devasa hacim." },
    "Hammer Curl": { cat: "Arm", desc_en: "Brachialis and brachioradialis thickness.", desc_tr: "Kolu kalın gösteren brachialis ve ön kol kasları." },
    "Incline Dumbell Curl": { cat: "Arm", desc_en: "Biceps long head stretch and activation.", desc_tr: "Biceps uzun başını esneterek izole eden hipertrofi." },
    "Concentration Curl": { cat: "Arm", desc_en: "Isolated biceps peak contraction.", desc_tr: "Biceps tepe (peak) noktası için tam izolasyon." },
    "Preacher Curl (Scott Curl)": { cat: "Arm", desc_en: "Strict biceps isolation minimizing momentum.", desc_tr: "Momentumu sıfırlayan katı biceps izolasyonu." },
    "Cable Curl": { cat: "Arm", desc_en: "Constant tension for biceps hypertrophy.", desc_tr: "Kablo ile biceps üzerinde kesintisiz gerilim." },
    "Close Grip Bench Press": { cat: "Arm", desc_en: "Triceps brachii pushing power and mass.", desc_tr: "Triceps (arka kol) itiş gücü ve genel kütlesi." },
    "Triceps Pushdown": { cat: "Arm", desc_en: "Triceps isolation, emphasizing the lateral head.", desc_tr: "Triceps izolasyonu, dış (lateral) başa odaklanma." },
    "Rope Pushdown": { cat: "Arm", desc_en: "Triceps isolation with enhanced contraction.", desc_tr: "Halat ile artırılmış triceps kasılması." },
    "Overhead Cable Extension": { cat: "Arm", desc_en: "Triceps long head stretch and hypertrophy.", desc_tr: "Triceps uzun başını esneterek büyütme." },
    "Skull Crusher": { cat: "Arm", desc_en: "Overall triceps brachii mass building.", desc_tr: "Genel triceps kütlesi ve dirsek ekstansiyonu." },
    "Dumbell Kickback": { cat: "Arm", desc_en: "Maximum triceps contraction at the top.", desc_tr: "Tepe noktasında maksimum triceps sıkıştırması." },
    "Bench Dip": { cat: "Arm", desc_en: "Bodyweight triceps overloading.", desc_tr: "Vücut ağırlığı ile triceps kütle yüklemesi." },
    "Wrist Curl": { cat: "Arm", desc_en: "Forearm flexor hypertrophy.", desc_tr: "Ön kol iç (fleksör) kasları hipertrofisi." },
    "Reverse Wrist Curl": { cat: "Arm", desc_en: "Forearm extensor hypertrophy.", desc_tr: "Ön kol dış (ekstansör) kasları hipertrofisi." },
    "Reverse Curl": { cat: "Arm", desc_en: "Brachioradialis emphasis.", desc_tr: "Ön kolun üst kısmını (brachioradialis) hedefleme." },

    "Back Squat (Barbell Squat)": { cat: "Leg", desc_en: "Quadriceps, glutes, and overall lower body mass.", desc_tr: "Quadriceps, kalça ve genel alt vücut kütlesi." },
    "Front Squat": { cat: "Leg", desc_en: "Anterior chain and quadriceps dominance.", desc_tr: "Ön zincir og quadriceps (ön bacak) odaklı squat." },
    "Bulgarian Split Squat": { cat: "Leg", desc_en: "Unilateral quadriceps and glute hypertrophy.", desc_tr: "Tek bacakta quadriceps ve kalça hipertrofisi." },
    "Leg Press": { cat: "Leg", desc_en: "Lower body mass overloading with spinal support.", desc_tr: "Omurga destekli ağır alt vücut hipertrofisi." },
    "Hack Squat": { cat: "Leg", desc_en: "Pure quadriceps isolation and overload.", desc_tr: "Saf quadriceps (ön bacak) izolasyonu ve yüklemesi." },
    "Leg Extension": { cat: "Leg", desc_en: "Rectus femoris and quadriceps isolation.", desc_tr: "Quadriceps ve rectus femoris izolasyonu." },
    "Walking Lunge": { cat: "Leg", desc_en: "Dynamic unilateral leg conditioning.", desc_tr: "Dinamik tek bacak ve kalça koordinasyonu." },
    "Romanian Deadlift (RDL)": { cat: "Leg", desc_en: "Hamstrings and glutes hypertrophy via hip hinge.", desc_tr: "Kalça menteşesi (hip hinge) ile arka bacak hipertrofisi." },
    "Stiff Leg Deadlift": { cat: "Leg", desc_en: "Deep hamstring stretch and hypertrophy.", desc_tr: "Maksimum arka bacak esnemesi ve hipertrofisi." },
    "Lying Leg Curl": { cat: "Leg", desc_en: "Isolated knee flexion for hamstrings.", desc_tr: "Arka bacak (hamstring) izolasyonu için diz bükme." },
    "Seated Leg Curl": { cat: "Leg", desc_en: "Isolated knee flexion for hamstrings.", desc_tr: "Oturarak arka bacak (hamstring) izolasyonu." },
    "Hip Thrust": { cat: "Leg", desc_en: "Direct gluteus maximus hypertrophy.", desc_tr: "Doğrudan kalça (gluteus maximus) hipertrofisi." },
    "Standing Calf Raise": { cat: "Leg", desc_en: "Gastrocnemius (upper calf) focus.", desc_tr: "Üst kalf (gastrocnemius) hipertrofisi." },
    "Seated Calf Raise": { cat: "Leg", desc_en: "Soleus (lower calf) focus.", desc_tr: "Alt kalf (soleus) hipertrofisi." },
    "Adductor Machine": { cat: "Leg", desc_en: "Inner thigh (adductor) strengthening.", desc_tr: "İç bacak (adduktör) kaslarını güçlendirme." },
    "Abductor Machine": { cat: "Leg", desc_en: "Outer glute and abductor activation.", desc_tr: "Dış kalça ve abduktör aktivasyonu." },

    "Crunch": { cat: "Core", desc_en: "Rectus abdominis (six-pack) isolation.", desc_tr: "Karın kası (rectus abdominis) izolasyonu." },
    "Cable Crunch": { cat: "Core", desc_en: "Weighted spinal flexion for ab thickness.", desc_tr: "Karın kaslarını kalınlaştırmak için ağırlıklı bükülme." },
    "Leg Raise": { cat: "Core", desc_en: "Lower rectus abdominis focus.", desc_tr: "Alt karın kası odaklı bacak kaldırma." },
    "Hanging Leg Raise": { cat: "Core", desc_en: "Advanced lower core and hip flexor strength.", desc_tr: "İleri seviye alt karın ve kalça fleksör gücü." },
    "Russian Twist": { cat: "Core", desc_en: "Rotational movement for obliques.", desc_tr: "Yan karın (oblik) duvarı için rotasyon hareketi." },
    "Plank": { cat: "Core", desc_en: "Isometric core and transversus abdominis stability.", desc_tr: "İzometrik merkez bölge ve derin karın stabilizasyonu." },
    "Ab Wheel Rollout": { cat: "Core", desc_en: "Advanced anti-extension core power.", desc_tr: "İleri seviye karın gerilimi ve merkez gücü." }
};

const exerciseDatabase = Object.keys(exerciseDictionary);

function getExerciseInfo(name) {
    let baseCat = "Shoulder";
    let descEn = "Muscle stimulation.";
    let descTr = "Kas uyarımı.";
            
    if (exerciseDictionary[name]) {
        baseCat = exerciseDictionary[name].cat;
        descEn = exerciseDictionary[name].desc_en;
        descTr = exerciseDictionary[name].desc_tr;
    } else {
        const lname = name.toLowerCase();
        if (lname.includes("squat") || lname.includes("leg") || lname.includes("calf") || lname.includes("lunge")) { baseCat = "Leg"; descEn = "Lower body hypertrophy."; descTr = "Alt vücut hipertrofisi."; }
        else if (lname.includes("pull") || lname.includes("row") || lname.includes("lat") || lname.includes("back")) { baseCat = "Back"; descEn = "Back and lats hypertrophy."; descTr = "Sırt ve kanat hipertrofisi."; }
        else if (lname.includes("press") || lname.includes("bench") || lname.includes("fly") || lname.includes("chest") || lname.includes("crossover") || lname.includes("pec")) { baseCat = "Chest"; descEn = "Pectoral muscle hypertrophy."; descTr = "Göğüs kası hipertrofisi."; }
        else if (lname.includes("crunch") || lname.includes("plank") || lname.includes("core") || lname.includes("abs")) { baseCat = "Core"; descEn = "Core stability and strength."; descTr = "Merkez bölge (core) gücü."; }
        else if (lname.includes("curl") || lname.includes("tricep") || lname.includes("extension") || lname.includes("arm")) { baseCat = "Arm"; descEn = "Arm hypertrophy."; descTr = "Kol (biceps/triceps) hipertrofisi."; }
    }
            
    return { baseCat: baseCat, cat: catMap[currentLang][baseCat] || baseCat, desc: currentLang === 'tr' ? descTr : descEn };
}

function calculateRoutineLabel(exercises) {
    if (!exercises || exercises.length === 0) return i18n[currentLang].rest_day;
    let rawCategories = exercises.map(ex => getExerciseInfo(ex.name).baseCat);
    let uniqueCategories = [...new Set(rawCategories)];
    if (uniqueCategories.length >= 4) return currentLang === 'tr' ? "TÜM VÜCUT (FULL BODY)" : "FULL BODY";
    let translatedCats = uniqueCategories.map(c => catMap[currentLang][c] || c);
    return translatedCats.join(" + ");
}

window.archiveCurrentWeek = function() {
    haptic();
    let completedDays = [];
    let fullDaysName = currentLang === 'tr' ? fullDaysTr : fullDaysEn;

    activeWorkoutData.forEach((day, index) => {
        if (day.status === "completed" && day.exercises && day.exercises.length > 0) {
            completedDays.push({
                dayName: fullDaysName[index],
                routineLabel: calculateRoutineLabel(day.exercises),
                exercises: JSON.parse(JSON.stringify(day.exercises))
            });
        }
    });

    if (completedDays.length === 0) {
        alert(i18n[currentLang].archive_error_toast);
        return;
    }

    let archiveEntry = {
        id: Date.now(),
        date: new Date().toLocaleDateString('en-GB'),
        days: completedDays
    };

    archivedWeeks.push(archiveEntry);
    localStorage.setItem('gymprogress_archived_weeks', JSON.stringify(archivedWeeks));
    
    alert(i18n[currentLang].archive_success_toast);
    renderArchiveWeeksList();
};

function renderArchiveWeeksList() {
    const listContainer = document.getElementById('archive-weeks-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    if (archivedWeeks.length === 0) {
        listContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem; padding: 10px;">${i18n[currentLang].no_archived_weeks}</p>`;
        return;
    }

    [...archivedWeeks].reverse().forEach((week, i) => {
        const item = document.createElement('div');
        item.className = 'archive-week-item';
        item.innerHTML = `
            <div class="archive-week-info">
                <h4>${i18n[currentLang].archive_week_prefix} #${archivedWeeks.length - i}</h4>
                <span>📅 ${week.date}</span>
            </div>
            <button class="btn-delete-ex" onclick="deleteArchivedWeek(${week.id}, event)">✕</button>
        `;
        item.addEventListener('click', () => {
            haptic();
            document.querySelectorAll('.archive-week-item').forEach(el => el.classList.remove('selected'));
            item.classList.add('selected');
            displayArchiveWeekDetails(week);
        });
        listContainer.appendChild(item);
    });
}

window.deleteArchivedWeek = function(id, event) {
    haptic();
    event.stopPropagation();
    archivedWeeks = archivedWeeks.filter(w => w.id !== id);
    localStorage.setItem('gymprogress_archived_weeks', JSON.stringify(archivedWeeks));
    renderArchiveWeeksList();
    document.getElementById('archive-week-details').innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 40px;">${i18n[currentLang].select_week_prompt}</p>`;
};

function displayArchiveWeekDetails(week) {
    const detailDisplay = document.getElementById('archive-week-details');
    if (!detailDisplay) return;
    detailDisplay.innerHTML = '';

    let html = `<h2 style="color: #fff; margin-bottom: 20px; font-size: 1.3rem; border-bottom: 1px solid var(--border-orange); padding-bottom: 10px;">Log Detayları (Kayıt Tarihi: ${week.date})</h2>`;

    week.days.forEach(day => {
        html += `
            <div class="archived-day-block">
                <div class="archived-day-header">
                    <span class="archived-day-title">💪 ${day.dayName}</span>
                    <span class="archived-day-routine">${day.routineLabel}</span>
                </div>
        `;
        day.exercises.forEach(ex => {
            html += `
                <div class="archived-exercise-row">
                    <span class="archived-ex-name">${ex.name}</span>
                    <span class="archived-ex-stats">${ex.weight} KG  ×  ${ex.sets} Set  ×  ${ex.reps} Reps</span>
                </div>
            `;
        });
        html += `</div>`;
    });

    detailDisplay.innerHTML = html;
}

window.copyDayData = function() {
    haptic();
    copiedExercises = JSON.parse(JSON.stringify(activeWorkoutData[selectedDayIndex].exercises));
    document.getElementById('btn-paste-day').style.display = 'inline-block';
};

window.pasteDayData = function() {
    haptic();
    if (!copiedExercises || copiedExercises.length === 0) return;
    activeWorkoutData[selectedDayIndex].exercises = activeWorkoutData[selectedDayIndex].exercises.concat(JSON.parse(JSON.stringify(copiedExercises)));
    activeWorkoutData[selectedDayIndex].status = "not_completed";
    localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
    renderWeeklyGrid();
    renderActiveWorkout(selectedDayIndex);
};

window.toggleDayStatus = function(index, event) {
    haptic();
    event.stopPropagation();
    const day = activeWorkoutData[index];
    if (day.exercises && day.exercises.length > 0) {
        if (day.status === "not_completed") {
            day.status = "completed";
            day.exercises.forEach(ex => {
                exerciseHistory[ex.name] = { weight: ex.weight, reps: ex.reps };
            });
            localStorage.setItem('gymprogress_ex_history', JSON.stringify(exerciseHistory));
        } else {
            day.status = "not_completed";
        }
    }
    localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
    renderWeeklyGrid();
    if(index === selectedDayIndex) renderActiveWorkout(index);
}

function renderWeeklyGrid() {
    const container = document.getElementById('days-container');
    container.innerHTML = '';
            
    const activeDays = currentLang === 'tr' ? daysTr : daysEn;

    activeWorkoutData.forEach((day, index) => {
        day.label = activeDays[index];
        const computedRoutine = calculateRoutineLabel(day.exercises);
        let currentStatusClass = day.status;
        let displaySub = "";
                
        if (day.exercises.length === 0) { 
            currentStatusClass = "rest"; 
            displaySub = i18n[currentLang].rest_day; 
        } else if (day.status === "completed") {
            displaySub = i18n[currentLang].status_comp;
        } else {
            currentStatusClass = "not_completed";
            displaySub = i18n[currentLang].status_not;
        }

        const card = document.createElement('div');
        card.className = `day-card status-${currentStatusClass}`;
        if(index === selectedDayIndex) card.classList.add('active-day');

        let statusIconHTML = '';
        if(currentStatusClass === 'completed') {
            statusIconHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#10b981"/><path d="M8.5 12.5L11 15L16 9" stroke="#040817" stroke-width="2" stroke-linecap="round"/></svg>`;
        } else if(currentStatusClass === 'rest') {
            statusIconHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 6h5l-5 6h6M12 11h4l-4 4h4M17 16h3l-3 3h3" stroke="#f97316" stroke-width="2" stroke-linecap="round"/></svg>`;
        } else {
            statusIconHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#4b5563" stroke-width="2"/><path d="M12 7V12L15 14" stroke="#4b5563" stroke-width="2"/></svg>`;
        }

        card.innerHTML = `<div class="day-title">${day.label}</div><div class="day-routine">${computedRoutine}</div><div class="day-status-icon">${statusIconHTML}</div><button class="status-badge-btn" onclick="toggleDayStatus(${index}, event)">${displaySub}</button>`;
        card.addEventListener('click', () => { haptic(); selectedDayIndex = index; renderWeeklyGrid(); renderActiveWorkout(index); });
        container.appendChild(card);
    });
}

let draggedExIndex = null;

function renderActiveWorkout(dayIndex) {
    const dayData = activeWorkoutData[dayIndex];
    const fullDaysName = currentLang === 'tr' ? fullDaysTr : fullDaysEn;
    const suffix = i18n[currentLang].workout_suf;
            
    document.getElementById('workout-day-name').textContent = `${fullDaysName[dayIndex]} ${suffix}`;
    document.getElementById('workout-routine-tag').textContent = calculateRoutineLabel(dayData.exercises);
    document.getElementById('btn-paste-day').style.display = (copiedExercises && copiedExercises.length > 0) ? 'inline-block' : 'none';

    const listContainer = document.getElementById('exercise-list-container');
    listContainer.innerHTML = '';

    if(dayData.exercises.length === 0) {
        listContainer.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-muted); font-size: 0.95rem;">${i18n[currentLang].no_ex}</p>`;
        return;
    }

    dayData.exercises.forEach((ex, idx) => {
        const item = document.createElement('div');
        item.className = 'exercise-item';
        item.draggable = true;
        item.dataset.index = idx;
        
        item.addEventListener('dragstart', (e) => {
            draggedExIndex = idx;
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => item.classList.remove('dragging'));
        item.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
        item.addEventListener('drop', (e) => {
            e.preventDefault();
            const targetIdx = parseInt(item.dataset.index);
            if (draggedExIndex === null || draggedExIndex === targetIdx) return;
            const exercises = activeWorkoutData[selectedDayIndex].exercises;
            const [removed] = exercises.splice(draggedExIndex, 1);
            exercises.splice(targetIdx, 0, removed);
            localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
            renderWeeklyGrid();
            renderActiveWorkout(selectedDayIndex);
        });

        const info = getExerciseInfo(ex.name);
        
        const prev = exerciseHistory[ex.name];
        const prevStr = prev ? `${i18n[currentLang].prev_lbl}: ${prev.weight}kg x ${prev.reps}` : ``;
        const prevHtml = prev ? `<div class="prev-stat">${prevStr}</div>` : '';
                
        item.innerHTML = `
            <div class="exercise-info">
                <button class="btn-delete-ex" onclick="deleteExercise(${idx})">✕</button>
                <div class="exercise-info-text">
                    <h4>${ex.name}</h4>
                    <div class="exercise-meta-row"><span class="type-badge">${info.cat}</span><span class="desc-text">${info.desc}</span></div>
                    ${prevHtml}
                </div>
            </div>
            <div class="exercise-stats-inputs">
                <input type="number" class="workout-inline-input kg-input" value="${ex.weight || ''}" onchange="updateInlineStats(${idx}, 'weight', this.value)"><span class="stats-divider">KG</span>
                <input type="number" class="workout-inline-input" value="${ex.sets}" onchange="updateInlineStats(${idx}, 'sets', this.value)"><span class="stats-divider">${i18n[currentLang].ex_sets}</span><span class="stats-divider" style="color:var(--accent-orange); font-size:1.1rem; padding:0 4px;">×</span>
                <input type="number" class="workout-inline-input" value="${ex.reps}" onchange="updateInlineStats(${idx}, 'reps', this.value)"><span class="stats-divider">${i18n[currentLang].ex_reps}</span>
            </div>
        `;
        listContainer.appendChild(item);
    });
}

window.updateInlineStats = function(exIdx, field, value) {
    const numVal = parseInt(value);
    if (field === 'weight') activeWorkoutData[selectedDayIndex].exercises[exIdx][field] = isNaN(numVal) ? 0 : numVal;
    else if(!isNaN(numVal) && numVal > 0) activeWorkoutData[selectedDayIndex].exercises[exIdx][field] = numVal;
    
    if(activeWorkoutData[selectedDayIndex].status === "completed") {
        activeWorkoutData[selectedDayIndex].status = "not_completed";
    }

    localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
    renderWeeklyGrid();
    document.getElementById('workout-routine-tag').textContent = calculateRoutineLabel(activeWorkoutData[selectedDayIndex].exercises);
}

const nameInput = document.getElementById('new-ex-name');
const suggestionsBox = document.getElementById('suggestions-box');

if (nameInput) {
    nameInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        suggestionsBox.innerHTML = '';
        if(!query) { suggestionsBox.style.display = 'none'; return; }
        const filtered = exerciseDatabase.filter(ex => ex.toLowerCase().includes(query));
        if(filtered.length > 0) {
            suggestionsBox.style.display = 'block';
            filtered.forEach(exName => {
                const div = document.createElement('div');
                div.className = 'suggestion-item'; div.textContent = exName;
                div.addEventListener('click', function() { haptic(); nameInput.value = exName; suggestionsBox.style.display = 'none'; });
                suggestionsBox.appendChild(div);
            });
        } else { suggestionsBox.style.display = 'none'; }
    });
}

document.addEventListener('click', function(e) { if(e.target !== nameInput && suggestionsBox) suggestionsBox.style.display = 'none'; });

const btnAddExercise = document.getElementById('btn-add-exercise');
if (btnAddExercise) {
    btnAddExercise.addEventListener('click', () => {
        haptic();
        const weightInput = document.getElementById('new-ex-weight');
        const setsInput = document.getElementById('new-ex-sets');
        const repsInput = document.getElementById('new-ex-reps');
        const name = nameInput.value.trim();
        const weight = parseInt(weightInput.value) || 0;
        const sets = parseInt(setsInput.value);
        const reps = parseInt(repsInput.value);

        if(!name || isNaN(sets) || isNaN(reps)) return;

        activeWorkoutData[selectedDayIndex].exercises.push({ name, weight, sets, reps });
        if(activeWorkoutData[selectedDayIndex].status === "rest") activeWorkoutData[selectedDayIndex].status = "not_completed";
                
        localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
        nameInput.value = ''; weightInput.value = ''; setsInput.value = ''; repsInput.value = '';
        renderWeeklyGrid(); renderActiveWorkout(selectedDayIndex);
    });
}

window.deleteExercise = function(idx) {
    haptic();
    activeWorkoutData[selectedDayIndex].exercises.splice(idx, 1);
    if(activeWorkoutData[selectedDayIndex].exercises.length === 0) activeWorkoutData[selectedDayIndex].status = "rest";
    localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
    renderWeeklyGrid(); renderActiveWorkout(selectedDayIndex);
}

function switchToTab(tabId) {
    tabContents.forEach(content => { content.classList.remove('active'); });
    navItems.forEach(item => { item.classList.remove('active'); });
    document.getElementById(tabId).classList.add('active');
    
    const targetNavLinks = document.querySelectorAll(`[data-target="${tabId}"]`);
    targetNavLinks.forEach(link => link.classList.add('active'));
    
    if (tabId === 'analytics' && myChart) myChart.resize();
}

window.openAnalytics = function(metricType) {
    haptic(); switchToTab('analytics');
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(metricType === 'all') document.querySelector('.filter-btn[onclick*="all"]').classList.add('active');
    else document.getElementById('filter-' + metricType).classList.add('active');
            
    if(myChart) {
        myChart.data.datasets.forEach((dataset, index) => {
            if (metricType === 'all') myChart.setDatasetVisibility(index, true);
            else {
                if (metricType === 'weight' && index === 0) myChart.setDatasetVisibility(index, true);
                else if (metricType === 'muscle' && index === 1) myChart.setDatasetVisibility(index, true);
                else if (metricType === 'fat' && index === 2) myChart.setDatasetVisibility(index, true);
                else myChart.setDatasetVisibility(index, false);
            }
        });
        myChart.update();
    }
};

window.filterChart = function(metricType, element) {
    haptic(); document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
            
    if(myChart) {
        myChart.data.datasets.forEach((dataset, index) => {
            if (metricType === 'all') myChart.setDatasetVisibility(index, true);
            else {
                if (metricType === 'weight' && index === 0) myChart.setDatasetVisibility(index, true);
                else if (metricType === 'muscle' && index === 1) myChart.setDatasetVisibility(index, true);
                else if (metricType === 'fat' && index === 2) myChart.setDatasetVisibility(index, true);
                else myChart.setDatasetVisibility(index, false);
            }
        });
        myChart.update();
    }
};

navItems.forEach(item => {
    item.addEventListener('click', function(e) {
        haptic(); e.preventDefault();
        const targetId = this.getAttribute('data-target');
        switchToTab(targetId);
        if(targetId === 'analytics') openAnalytics('all');
    });
});

function initChart() {
    const chartEl = document.getElementById('progressChart');
    if (chartEl) {
        const ctx = chartEl.getContext('2d');
        Chart.defaults.color = '#9ca3af';
        Chart.defaults.font.family = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: metricsHistory.map(m => m.date),
                datasets: [
                    { label: i18n[currentLang].chart_w, data: metricsHistory.map(m => m.weight), borderColor: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)', borderWidth: 3, pointBackgroundColor: '#0a122c', pointBorderColor: '#f97316', tension: 0.3, yAxisID: 'y' },
                    { label: i18n[currentLang].chart_m, data: metricsHistory.map(m => m.muscle), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderWidth: 3, pointBackgroundColor: '#0a122c', pointBorderColor: '#10b981', tension: 0.3, yAxisID: 'y' },
                    { label: i18n[currentLang].chart_f, data: metricsHistory.map(m => m.fat), borderColor: '#00b4d8', backgroundColor: 'rgba(0, 180, 216, 0.1)', borderWidth: 2, borderDash: [5, 5], pointBackgroundColor: '#0a122c', pointBorderColor: '#00b4d8', tension: 0.3, yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false, },
                plugins: { tooltip: { backgroundColor: '#0a122c', titleColor: '#f97316', bodyColor: '#fff', borderColor: '#1f2937', borderWidth: 1 } },
                scales: { x: { grid: { color: '#1f2937', drawBorder: false } }, y: { type: 'linear', position: 'left', grid: { color: '#1f2937', drawBorder: false }, title: { display: true, text: i18n[currentLang].mass_kg, color: '#9ca3af' } }, y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: i18n[currentLang].fat_perc, color: '#9ca3af' } } }
            }
        });
    }
}

function updateChartData() {
    if(myChart) {
        myChart.data.labels = metricsHistory.map(m => m.date);
        myChart.data.datasets[0].data = metricsHistory.map(m => m.weight);
        myChart.data.datasets[1].data = metricsHistory.map(m => m.muscle);
        myChart.data.datasets[2].data = metricsHistory.map(m => m.fat);
        myChart.update();
    }
}

function renderHistoryList() {
    const container = document.getElementById('history-list-container');
    if (!container) return;
    container.innerHTML = '';
    if(metricsHistory.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding: 20px; color: var(--text-muted);">${i18n[currentLang].no_hist}</p>`;
        return;
    }
    [...metricsHistory].reverse().forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 15px;">
                <button class="btn-delete-ex" onclick="deleteHistoryEntry(${entry.id})">✕</button>
                <div>
                    <div class="history-info-text"><h4>${i18n[currentLang].update_text} ${entry.date}</h4></div>
                    <div class="history-meta-row">
                        <span>${i18n[currentLang].w_weight}: <span style="color:var(--accent-orange); font-weight:700;">${entry.weight} kg</span></span> | 
                        <span>${i18n[currentLang].w_muscle}: <span style="color:#10b981; font-weight:700;">${entry.muscle} kg</span></span> | 
                        <span>${i18n[currentLang].w_fat}: <span style="color:#00b4d8; font-weight:700;">${entry.fat}%</span></span>
                    </div>
                </div>
            </div>`;
        container.appendChild(item);
    });
}

window.deleteHistoryEntry = function(id) {
    haptic();
    metricsHistory = metricsHistory.filter(entry => entry.id !== id);
    localStorage.setItem('gymprogress_metrics_history', JSON.stringify(metricsHistory));
    updateChartData(); renderHistoryList();
}

if(profileForm) {
    profileForm.addEventListener('submit', function(e) {
        haptic(); e.preventDefault();
        const name = document.getElementById('user-name').value.trim();
        const gender = document.getElementById('user-gender').value;
        const age = parseInt(document.getElementById('user-age').value);
        const height = parseFloat(document.getElementById('user-height').value);
        const weight = parseFloat(document.getElementById('user-weight').value);
        const waist = parseFloat(document.getElementById('user-waist').value);
        const neck = parseFloat(document.getElementById('user-neck').value);
        const hip = parseFloat(document.getElementById('user-hip').value);

        let bodyFat = 0;
        if (gender === 'erkek') {
            if (waist <= neck) return;
            bodyFat = (86.01 * Math.log10(waist - neck)) - (70.041 * Math.log10(height)) + 36.76;
        } else {
            if ((waist + hip) <= neck) return;
            bodyFat = (163.205 * Math.log10(waist + hip - neck)) - (97.684 * Math.log10(height)) - 78.387;
        }
        bodyFat = Math.max(2, Math.min(bodyFat, 55));
        const ffm = weight * (1 - (bodyFat / 100));
        const muscleMass = ffm * 0.60;

        const profileData = { name, gender, age, height, weight, waist, neck, hip, bodyFat: bodyFat.toFixed(1), muscleMass: muscleMass.toFixed(1) };
                
        localStorage.setItem('gymprogress_data', JSON.stringify(profileData));
        updateDashboard(profileData);

        const newHistoryEntry = { id: Date.now(), date: new Date().toLocaleDateString('en-GB'), weight: weight, muscle: parseFloat(muscleMass.toFixed(1)), fat: parseFloat(bodyFat.toFixed(1)) };
        metricsHistory.push(newHistoryEntry);
        localStorage.setItem('gymprogress_metrics_history', JSON.stringify(metricsHistory));
                
        updateChartData(); renderHistoryList(); openAnalytics('all');
    });
}

function updateDashboard(profile) {
    if(!profile) return;
    
    const welcomeNameEl = document.getElementById('welcome-name');
    const userDisplayNameEl = document.getElementById('user-display-name');
    const statKiloEl = document.getElementById('stat-kilo');
    const statBoyEl = document.getElementById('stat-boy');
    const statKasEl = document.getElementById('stat-kas');
    const statYagEl = document.getElementById('stat-yag');

    if(welcomeNameEl) welcomeNameEl.textContent = profile.name;
    if(userDisplayNameEl) userDisplayNameEl.textContent = profile.name;
    if(statKiloEl) statKiloEl.innerHTML = `${profile.weight} <small>kg</small>`;
    if(statBoyEl) statBoyEl.innerHTML = `${profile.height} <small>cm</small>`;
    if(statKasEl) statKasEl.innerHTML = `${profile.muscleMass} <small>kg</small>`;
    if(statYagEl) statYagEl.innerHTML = `${profile.bodyFat} <small>%</small>`;
            
    if(document.getElementById('user-name')) {
        document.getElementById('user-name').value = profile.name || '';
        document.getElementById('user-gender').value = profile.gender || 'erkek';
        document.getElementById('user-age').value = profile.age || '';
        document.getElementById('user-height').value = profile.height || '';
        document.getElementById('user-weight').value = profile.weight || '';
        document.getElementById('user-waist').value = profile.waist || '';
        document.getElementById('user-neck').value = profile.neck || '';
        document.getElementById('user-hip').value = profile.hip || '';
    }
}

function initSystem() {
    try { const savedData = localStorage.getItem('gymprogress_data'); if (savedData) updateDashboard(JSON.parse(savedData)); } catch (e) {}
    try {
        const savedWorkout = localStorage.getItem('gymprogress_workout_data');
        if (savedWorkout) { 
            activeWorkoutData = JSON.parse(savedWorkout);
            activeWorkoutData.forEach((day, idx) => {
                if (day.exercises.length === 0) {
                    day.status = "rest";
                } else if (day.status !== "completed") {
                    day.status = "not_completed";
                }
            });
        } else {
            activeWorkoutData = defaultProgram;
            localStorage.setItem('gymprogress_workout_data', JSON.stringify(activeWorkoutData));
        }
    } catch (e) { activeWorkoutData = defaultProgram; }
            
    initChart();
    applyLanguage(currentLang);
}
        
initSystem();