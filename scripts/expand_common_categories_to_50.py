import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "basics.json": [
        {"en": "Ask", "ar": "اسأل", "tr": "Is'al", "id": "Tanya"},
        {"en": "Answer", "ar": "أجب", "tr": "Ajib", "id": "Jawab"},
        {"en": "Show me", "ar": "أرني", "tr": "Arini", "id": "Tunjukkan saya"},
        {"en": "Tell me", "ar": "أخبرني", "tr": "Akhbirni", "id": "Beritahu saya"},
        {"en": "Read", "ar": "اقرأ", "tr": "Iqra'", "id": "Baca"},
        {"en": "Write", "ar": "اكتب", "tr": "Uktub", "id": "Tulis"},
        {"en": "Practice", "ar": "تدرب", "tr": "Tadarab", "id": "Berlatih"},
        {"en": "Check", "ar": "تحقق", "tr": "Tahqqaq", "id": "Periksa"},
        {"en": "Fix", "ar": "أصلح", "tr": "Aslih", "id": "Perbaiki"},
        {"en": "Finish", "ar": "أنهِ", "tr": "Anhi", "id": "Selesaikan"},
    ],
    "family.json": [
        {"en": "Family tree", "ar": "شجرة العائلة", "tr": "Shajarat al-'ailah", "id": "Silsilah keluarga"},
        {"en": "Home visit", "ar": "زيارة عائلية", "tr": "Ziyarah 'ailiyyah", "id": "Kunjungan keluarga"},
        {"en": "Marriage", "ar": "زواج", "tr": "Zawaj", "id": "Pernikahan"},
        {"en": "Relatives", "ar": "أقارب", "tr": "Aqarib", "id": "Kerabat"},
        {"en": "Only child", "ar": "الابن الوحيد", "tr": "Al-ibn al-wahid", "id": "Anak tunggal"},
        {"en": "Adopted child", "ar": "طفل متبنى", "tr": "Tifl mutabanna", "id": "Anak angkat"},
        {"en": "Family name", "ar": "اسم الأسرة", "tr": "Ism al-usrah", "id": "Nama marga"},
        {"en": "Engagement", "ar": "خطوبة", "tr": "Khitubah", "id": "Pertunangan"},
        {"en": "Wedding", "ar": "حفل زفاف", "tr": "Hafl zafaf", "id": "Pesta pernikahan"},
        {"en": "Household chores", "ar": "أعمال المنزل", "tr": "A'mal al-manzil", "id": "Pekerjaan rumah"},
    ],
    "weather.json": [
        {"en": "Forecast", "ar": "توقعات", "tr": "Tawaqqu'at", "id": "Prakiraan"},
        {"en": "Breeze", "ar": "نسيم", "tr": "Nasim", "id": "Angin sepoi"},
        {"en": "Drizzle", "ar": "رذاذ", "tr": "Radhadh", "id": "Gerimis"},
        {"en": "Hail", "ar": "بَرَد", "tr": "Barad", "id": "Hujan es"},
        {"en": "Lightning", "ar": "برق", "tr": "Barq", "id": "Petir"},
        {"en": "Thunder", "ar": "رعد", "tr": "Ra'd", "id": "Guntur"},
        {"en": "Temperature", "ar": "درجة الحرارة", "tr": "Darajat al-hararah", "id": "Suhu"},
        {"en": "Cool air", "ar": "هواء بارد", "tr": "Hawa' barid", "id": "Udara sejuk"},
        {"en": "Heavy rain", "ar": "مطر غزير", "tr": "Matar ghazir", "id": "Hujan lebat"},
        {"en": "Dry season", "ar": "موسم الجفاف", "tr": "Mawsim al-jafaf", "id": "Musim kemarau"},
    ],
    "travel.json": [
        {"en": "Boarding time", "ar": "وقت الصعود", "tr": "Waqt as-su'ud", "id": "Waktu boarding"},
        {"en": "Arrival time", "ar": "وقت الوصول", "tr": "Waqt al-wusul", "id": "Waktu tiba"},
        {"en": "Departure time", "ar": "وقت المغادرة", "tr": "Waqt al-mughadarah", "id": "Waktu berangkat"},
        {"en": "Travel document", "ar": "وثيقة سفر", "tr": "Wathiqat safar", "id": "Dokumen perjalanan"},
        {"en": "Travel agency", "ar": "وكالة سفر", "tr": "Wikalat safar", "id": "Agen perjalanan"},
        {"en": "Arrival hall", "ar": "صالة الوصول", "tr": "Salat al-wusul", "id": "Area kedatangan"},
        {"en": "Departure hall", "ar": "صالة المغادرة", "tr": "Salat al-mughadarah", "id": "Area keberangkatan"},
        {"en": "Border", "ar": "حدود", "tr": "Hudud", "id": "Perbatasan"},
        {"en": "Travel route", "ar": "مسار الرحلة", "tr": "Masar ar-rihlah", "id": "Rute perjalanan"},
        {"en": "Travel companion", "ar": "رفيق السفر", "tr": "Rafiq as-safar", "id": "Teman perjalanan"},
    ],
    "shopping.json": [
        {"en": "Shopping center", "ar": "مركز التسوق", "tr": "Markaz at-tasawwuq", "id": "Pusat belanja"},
        {"en": "Price tag", "ar": "بطاقة السعر", "tr": "Bitaqat as-si'r", "id": "Label harga"},
        {"en": "Online shop", "ar": "متجر إلكتروني", "tr": "Matjar iliktruni", "id": "Toko online"},
        {"en": "Order number", "ar": "رقم الطلب", "tr": "Raqm at-talab", "id": "Nomor pesanan"},
        {"en": "Delivery fee", "ar": "رسوم التوصيل", "tr": "Rusum at-tawsil", "id": "Biaya kirim"},
        {"en": "Coupon", "ar": "قسيمة", "tr": "Qasimah", "id": "Kupon"},
        {"en": "Member card", "ar": "بطاقة عضوية", "tr": "Bitaqat 'udwiyyah", "id": "Kartu member"},
        {"en": "Queue", "ar": "طابور", "tr": "Tabur", "id": "Antrean"},
        {"en": "Packaging", "ar": "تغليف", "tr": "Taghlif", "id": "Kemasan"},
        {"en": "Out of budget", "ar": "خارج الميزانية", "tr": "Kharij al-mizaniyyah", "id": "Di luar anggaran"},
    ],
    "restaurant.json": [
        {"en": "Table for two", "ar": "طاولة لشخصين", "tr": "Tawilah lishakhsayn", "id": "Meja untuk dua orang"},
        {"en": "Table for four", "ar": "طاولة لأربعة", "tr": "Tawilah li-arba'ah", "id": "Meja untuk empat orang"},
        {"en": "Please bring water", "ar": "من فضلك أحضر الماء", "tr": "Min fadlik ahdir al-ma'", "id": "Tolong bawakan air"},
        {"en": "No sugar", "ar": "بدون سكر", "tr": "Bidun sukkar", "id": "Tanpa gula"},
        {"en": "The soup is hot", "ar": "الحساء ساخن", "tr": "Al-hasa' sakhin", "id": "Supnya panas"},
        {"en": "I am full", "ar": "أنا شبعان", "tr": "Ana shab'an", "id": "Saya kenyang"},
        {"en": "Please clean the table", "ar": "من فضلك نظف الطاولة", "tr": "Min fadlik nazzif at-tawilah", "id": "Tolong bersihkan meja"},
        {"en": "Dessert", "ar": "حلوى", "tr": "Halwa", "id": "Makanan penutup"},
        {"en": "Mineral water bottle", "ar": "زجاجة ماء معدني", "tr": "Zujajat ma' ma'dani", "id": "Botol air mineral"},
        {"en": "Order is complete", "ar": "الطلب مكتمل", "tr": "At-talab muktamil", "id": "Pesanan lengkap"},
    ],
    "daily_conversation.json": [
        {"en": "I am ready now", "ar": "أنا جاهز الآن", "tr": "Ana jahiz al-an", "id": "Saya siap sekarang"},
        {"en": "I need more time", "ar": "أحتاج وقتا أكثر", "tr": "Ahtaj waqtan akthar", "id": "Saya butuh lebih banyak waktu"},
        {"en": "Please explain again", "ar": "من فضلك اشرح مرة أخرى", "tr": "Min fadlik ishrah marrah ukhrah", "id": "Tolong jelaskan lagi"},
        {"en": "I understand a little", "ar": "أفهم قليلا", "tr": "Afham qalilan", "id": "Saya paham sedikit"},
        {"en": "I am still learning", "ar": "ما زلت أتعلم", "tr": "Ma ziltu ata'allam", "id": "Saya masih belajar"},
        {"en": "I will send it later", "ar": "سأرسله لاحقا", "tr": "Sa'ursiluhu لاحقا", "id": "Nanti saya kirim"},
        {"en": "Please be patient", "ar": "كن صبورا من فضلك", "tr": "Kun saburan min fadlik", "id": "Tolong sabar"},
        {"en": "I am almost there", "ar": "أنا على وشك الوصول", "tr": "Ana 'ala washk al-wusul", "id": "Saya hampir sampai"},
        {"en": "That sounds good", "ar": "هذا يبدو جيدا", "tr": "Hatha yabdu jayyidan", "id": "Itu terdengar bagus"},
        {"en": "Let us start", "ar": "لنبدأ", "tr": "Linabda'", "id": "Mari mulai"},
    ],
    "personal_information.json": [
        {"en": "Date of issue", "ar": "تاريخ الإصدار", "tr": "Tarikh al-isdar", "id": "Tanggal terbit"},
        {"en": "Date of expiry", "ar": "تاريخ الانتهاء", "tr": "Tarikh al-intiha'", "id": "Tanggal kedaluwarsa"},
        {"en": "Gender", "ar": "الجنس", "tr": "Al-jins", "id": "Jenis kelamin"},
        {"en": "Place of birth", "ar": "مكان الميلاد", "tr": "Makan al-milad", "id": "Tempat lahir"},
        {"en": "Date of birth", "ar": "تاريخ الميلاد", "tr": "Tarikh al-milad", "id": "Tanggal lahir"},
        {"en": "Occupation", "ar": "المهنة", "tr": "Al-mihnah", "id": "Pekerjaan"},
        {"en": "Office address", "ar": "عنوان المكتب", "tr": "Unwan al-maktab", "id": "Alamat kantor"},
        {"en": "Home address", "ar": "عنوان المنزل", "tr": "Unwan al-manzil", "id": "Alamat rumah"},
        {"en": "Nationality", "ar": "الجنسية", "tr": "Al-jinsiyyah", "id": "Kebangsaan"},
        {"en": "Religion", "ar": "الديانة", "tr": "Ad-diyanah", "id": "Agama"},
    ],
    "home_objects.json": [
        {"en": "Cupboard", "ar": "خزانة", "tr": "Khizanah", "id": "Lemari"},
        {"en": "Mirror", "ar": "مرآة", "tr": "Mir'ah", "id": "Cermin"},
        {"en": "Bed sheet", "ar": "ملاءة سرير", "tr": "Mila'ah sarir", "id": "Seprai"},
        {"en": "Blanket", "ar": "بطانية", "tr": "Bitaniyyah", "id": "Selimut"},
        {"en": "Pillow", "ar": "وسادة", "tr": "Wisadah", "id": "Bantal"},
        {"en": "Fan", "ar": "مروحة", "tr": "Marwahah", "id": "Kipas"},
        {"en": "Air conditioner", "ar": "مكيف", "tr": "Mukayyif", "id": "AC"},
        {"en": "Remote control", "ar": "جهاز التحكم", "tr": "Jihaz at-tahakkum", "id": "Remote"},
        {"en": "Cooking pot", "ar": "قدر", "tr": "Qidr", "id": "Panci"},
        {"en": "Frying pan", "ar": "مقلاة", "tr": "Miqlah", "id": "Wajan"},
    ],
    "health.json": [
        {"en": "Pharmacy", "ar": "صيدلية", "tr": "Saydaliyyah", "id": "Apotek"},
        {"en": "Emergency room", "ar": "غرفة الطوارئ", "tr": "Ghurfat at-tawari'", "id": "UGD"},
        {"en": "Appointment", "ar": "موعد", "tr": "Maw'id", "id": "Janji temu"},
        {"en": "Medical checkup", "ar": "فحص طبي", "tr": "Fahs tibbi", "id": "Pemeriksaan kesehatan"},
        {"en": "Headache", "ar": "صداع", "tr": "Suda'", "id": "Sakit kepala"},
        {"en": "Stomachache", "ar": "ألم المعدة", "tr": "Alam al-mi'dah", "id": "Sakit perut"},
        {"en": "Injection", "ar": "حقنة", "tr": "Huqnah", "id": "Suntikan"},
        {"en": "Bandage", "ar": "ضمادة", "tr": "Dimadah", "id": "Perban"},
        {"en": "Clinic", "ar": "عيادة", "tr": "Iyadah", "id": "Klinik"},
        {"en": "Healthy food", "ar": "طعام صحي", "tr": "Ta'am sihhi", "id": "Makanan sehat"},
    ],
    "school_office.json": [
        {"en": "Exam", "ar": "امتحان", "tr": "Imtihan", "id": "Ujian"},
        {"en": "Score", "ar": "درجة", "tr": "Darajah", "id": "Nilai"},
        {"en": "Project", "ar": "مشروع", "tr": "Mashru'", "id": "Proyek"},
        {"en": "Notebook", "ar": "دفتر", "tr": "Daftar", "id": "Buku catatan"},
        {"en": "Whiteboard", "ar": "سبورة بيضاء", "tr": "Saburah bayda'", "id": "Papan tulis putih"},
        {"en": "Marker", "ar": "قلم تحديد", "tr": "Qalam tahdid", "id": "Spidol"},
        {"en": "Office desk", "ar": "مكتب العمل", "tr": "Maktab al-'amal", "id": "Meja kerja"},
        {"en": "Schedule", "ar": "جدول", "tr": "Jadwal", "id": "Jadwal"},
        {"en": "Report", "ar": "تقرير", "tr": "Taqrir", "id": "Laporan"},
        {"en": "Presentation slide", "ar": "شريحة عرض", "tr": "Sharihat 'ard", "id": "Slide presentasi"},
    ],
    "daily_activities.json": [
        {"en": "Wake up early", "ar": "يستيقظ مبكرا", "tr": "Yastayqiz mubakkiran", "id": "Bangun pagi"},
        {"en": "Prepare breakfast", "ar": "يحضر الفطور", "tr": "Yuhaddir al-futur", "id": "Menyiapkan sarapan"},
        {"en": "Go shopping", "ar": "يذهب للتسوق", "tr": "Yadhhab lit-tasawwuq", "id": "Pergi belanja"},
        {"en": "Clean the room", "ar": "ينظف الغرفة", "tr": "Yunazzif al-ghurfah", "id": "Membersihkan kamar"},
        {"en": "Wash clothes", "ar": "يغسل الملابس", "tr": "Yaghsil al-malabis", "id": "Mencuci baju"},
        {"en": "Iron clothes", "ar": "يكوي الملابس", "tr": "Yakwi al-malabis", "id": "Menyetrika baju"},
        {"en": "Prepare for work", "ar": "يستعد للعمل", "tr": "Yasta'iddu lil-'amal", "id": "Bersiap kerja"},
        {"en": "Study at night", "ar": "يدرس ليلا", "tr": "Yadrus laylan", "id": "Belajar malam"},
        {"en": "Review notes", "ar": "يراجع الملاحظات", "tr": "Yuraji' al-mulahazat", "id": "Meninjau catatan"},
        {"en": "Sleep well", "ar": "ينام جيدا", "tr": "Yanam jayyidan", "id": "Tidur nyenyak"},
    ],
}


def fingerprint(item):
    return "|".join(
        [
            str(item.get("en", "")).strip().lower(),
            str(item.get("ar", "")).strip().lower(),
            str(item.get("id", "")).strip().lower(),
        ]
    )


def main():
    for filename, additions in ADDITIONS.items():
        path = CATEGORIES_DIR / filename
        items = json.loads(path.read_text(encoding="utf-8-sig"))
        if not isinstance(items, list):
            raise ValueError(f"{filename} is not a list")
        seen = {fingerprint(item) for item in items if isinstance(item, dict)}
        before = len(items)
        for entry in additions:
            key = fingerprint(entry)
            if key in seen:
                continue
            items.append(entry)
            seen.add(key)
        path.write_text(json.dumps(items, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"{filename}: {before} -> {len(items)}")


if __name__ == "__main__":
    main()
