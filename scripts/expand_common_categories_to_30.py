import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "basics.json": [
        {"en": "Stop", "ar": "توقف", "tr": "Tawaqqaf", "id": "Berhenti"},
        {"en": "Open", "ar": "افتح", "tr": "Iftah", "id": "Buka"},
        {"en": "Close", "ar": "أغلق", "tr": "Aghliq", "id": "Tutup"},
        {"en": "Again", "ar": "مرة أخرى", "tr": "Marrah ukhrah", "id": "Lagi"},
        {"en": "Enough", "ar": "يكفي", "tr": "Yakfi", "id": "Cukup"},
        {"en": "Ready", "ar": "جاهز", "tr": "Jahiz", "id": "Siap"},
        {"en": "Slowly", "ar": "ببطء", "tr": "Bubt'", "id": "Pelan-pelan"},
        {"en": "Quickly", "ar": "بسرعة", "tr": "Bisur'ah", "id": "Cepat"},
        {"en": "Together", "ar": "معا", "tr": "Ma'an", "id": "Bersama"},
        {"en": "Alone", "ar": "وحدي", "tr": "Wahdi", "id": "Sendiri"},
    ],
    "family.json": [
        {"en": "Father-in-law", "ar": "حمو", "tr": "Hamu", "id": "Mertua laki-laki"},
        {"en": "Mother-in-law", "ar": "حماة", "tr": "Hamat", "id": "Mertua perempuan"},
        {"en": "Brother-in-law", "ar": "صهر", "tr": "Sihr", "id": "Ipar laki-laki"},
        {"en": "Sister-in-law", "ar": "سلفة", "tr": "Silfah", "id": "Ipar perempuan"},
        {"en": "Grandson", "ar": "حفيد", "tr": "Hafid", "id": "Cucu laki-laki"},
        {"en": "Granddaughter", "ar": "حفيدة", "tr": "Hafidah", "id": "Cucu perempuan"},
        {"en": "Twin", "ar": "توأم", "tr": "Taw'am", "id": "Anak kembar"},
        {"en": "Guardian", "ar": "ولي", "tr": "Waliyy", "id": "Wali"},
        {"en": "Ancestor", "ar": "سلف", "tr": "Salaf", "id": "Leluhur"},
        {"en": "Descendant", "ar": "نسل", "tr": "Nasl", "id": "Keturunan"},
    ],
    "weather.json": [
        {"en": "Monsoon", "ar": "موسم الأمطار", "tr": "Mawsim al-amtar", "id": "Musim hujan deras"},
        {"en": "Heatwave", "ar": "موجة حر", "tr": "Mawjat harr", "id": "Gelombang panas"},
        {"en": "Climate", "ar": "مناخ", "tr": "Manakh", "id": "Iklim"},
        {"en": "Sunrise", "ar": "شروق الشمس", "tr": "Shuruq ash-shams", "id": "Matahari terbit"},
        {"en": "Sunset", "ar": "غروب الشمس", "tr": "Ghurub ash-shams", "id": "Matahari terbenam"},
        {"en": "Shade", "ar": "ظل", "tr": "Zill", "id": "Teduh"},
        {"en": "Freezing", "ar": "متجمد", "tr": "Mutajammid", "id": "Membeku"},
        {"en": "Warm", "ar": "دافئ", "tr": "Dafi'", "id": "Hangat"},
        {"en": "Wet", "ar": "مبلل", "tr": "Muballal", "id": "Basah"},
        {"en": "Weather report", "ar": "تقرير الطقس", "tr": "Taqrir at-taqs", "id": "Laporan cuaca"},
    ],
    "travel.json": [
        {"en": "Customs", "ar": "الجمارك", "tr": "Al-jamaarik", "id": "Bea cukai"},
        {"en": "Immigration", "ar": "الهجرة", "tr": "Al-hijrah", "id": "Imigrasi"},
        {"en": "Platform", "ar": "رصيف", "tr": "Rasif", "id": "Peron"},
        {"en": "One-way ticket", "ar": "تذكرة ذهاب", "tr": "Tadhkirat dhahab", "id": "Tiket sekali jalan"},
        {"en": "Round-trip ticket", "ar": "تذكرة ذهاب وإياب", "tr": "Tadhkirat dhahab wa iyab", "id": "Tiket pulang pergi"},
        {"en": "Luggage claim", "ar": "استلام الأمتعة", "tr": "Istilam al-amti'ah", "id": "Pengambilan bagasi"},
        {"en": "Delay", "ar": "تأخير", "tr": "Ta'khir", "id": "Keterlambatan"},
        {"en": "Cancel", "ar": "إلغاء", "tr": "Ilgha'", "id": "Membatalkan"},
        {"en": "Hostel", "ar": "نزل", "tr": "Nuzul", "id": "Hostel"},
        {"en": "Destination", "ar": "وجهة", "tr": "Wijhah", "id": "Tujuan"},
    ],
    "shopping.json": [
        {"en": "Barcode", "ar": "باركود", "tr": "Barkod", "id": "Barcode"},
        {"en": "Cashier", "ar": "أمين الصندوق", "tr": "Amin as-sunduq", "id": "Kasir"},
        {"en": "Wholesale", "ar": "جملة", "tr": "Jumlah", "id": "Grosir"},
        {"en": "Retail", "ar": "تجزئة", "tr": "Tajzi'ah", "id": "Eceran"},
        {"en": "In stock", "ar": "متوفر", "tr": "Mutawaffir", "id": "Tersedia"},
        {"en": "Out of stock", "ar": "غير متوفر", "tr": "Ghayr mutawaffir", "id": "Stok habis"},
        {"en": "Shopping bag", "ar": "حقيبة تسوق", "tr": "Haqibat tasawwuq", "id": "Tas belanja"},
        {"en": "Promotion", "ar": "عرض ترويجي", "tr": "Ard tarwiji", "id": "Promosi"},
    ],
    "restaurant.json": [
        {"en": "Reservation", "ar": "حجز", "tr": "Hajz", "id": "Reservasi"},
        {"en": "Full", "ar": "ممتلئ", "tr": "Mumtali'", "id": "Penuh"},
        {"en": "Available", "ar": "متاح", "tr": "Mutah", "id": "Tersedia"},
        {"en": "Main course", "ar": "الطبق الرئيسي", "tr": "At-tabaq ar-ra'isi", "id": "Hidangan utama"},
        {"en": "Appetizer", "ar": "مقبلات", "tr": "Muqabbilat", "id": "Makanan pembuka"},
        {"en": "Vegetarian", "ar": "نباتي", "tr": "Nabati", "id": "Vegetarian"},
        {"en": "Hot drink", "ar": "مشروب ساخن", "tr": "Mashrub sakhin", "id": "Minuman panas"},
        {"en": "Cold drink", "ar": "مشروب بارد", "tr": "Mashrub barid", "id": "Minuman dingin"},
    ],
    "daily_conversation.json": [
        {"en": "I miss you", "ar": "أفتقدك", "tr": "Aftaqiduk", "id": "Aku merindukanmu"},
        {"en": "I am hungry", "ar": "أنا جائع", "tr": "Ana ja'i'", "id": "Saya lapar"},
        {"en": "I am thirsty", "ar": "أنا عطشان", "tr": "Ana 'atshan", "id": "Saya haus"},
        {"en": "Are you free today?", "ar": "هل أنت متفرغ اليوم؟", "tr": "Hal anta mutafarrigh al-yawm?", "id": "Apakah kamu senggang hari ini?"},
        {"en": "Please call me", "ar": "اتصل بي من فضلك", "tr": "Ittasil bi min fadlik", "id": "Tolong hubungi saya"},
        {"en": "I will come later", "ar": "سآتي لاحقا", "tr": "Sa'ati لاحقا", "id": "Saya akan datang nanti"},
        {"en": "I need rest", "ar": "أحتاج إلى الراحة", "tr": "Ahtaj ila ar-rahah", "id": "Saya butuh istirahat"},
        {"en": "See you tomorrow", "ar": "أراك غدا", "tr": "Araka ghadan", "id": "Sampai besok"},
    ],
    "personal_information.json": [
        {"en": "Postal code", "ar": "الرمز البريدي", "tr": "Ar-ramz al-baridi", "id": "Kode pos"},
        {"en": "Province", "ar": "محافظة", "tr": "Muhafazah", "id": "Provinsi"},
        {"en": "District", "ar": "منطقة", "tr": "Mintaqah", "id": "Kecamatan"},
        {"en": "Village name", "ar": "اسم القرية", "tr": "Ism al-qaryah", "id": "Nama desa"},
        {"en": "Full name", "ar": "الاسم الكامل", "tr": "Al-ism al-kamil", "id": "Nama lengkap"},
        {"en": "Nickname", "ar": "لقب", "tr": "Laqab", "id": "Nama panggilan"},
        {"en": "Height", "ar": "طول", "tr": "Tul", "id": "Tinggi badan"},
        {"en": "Weight", "ar": "وزن", "tr": "Wazn", "id": "Berat badan"},
    ],
    "home_objects.json": [
        {"en": "Curtain", "ar": "ستارة", "tr": "Sitarah", "id": "Gorden"},
        {"en": "Carpet", "ar": "سجادة", "tr": "Sajjadah", "id": "Karpet"},
        {"en": "Bucket", "ar": "دلو", "tr": "Dalw", "id": "Ember"},
        {"en": "Broom", "ar": "مكنسة", "tr": "Miknasah", "id": "Sapu"},
        {"en": "Soap", "ar": "صابون", "tr": "Sabun", "id": "Sabun"},
        {"en": "Towel", "ar": "منشفة", "tr": "Minshafah", "id": "Handuk"},
        {"en": "Plate rack", "ar": "رف الصحون", "tr": "Raff as-suhun", "id": "Rak piring"},
        {"en": "Trash bin", "ar": "سلة المهملات", "tr": "Sallat al-muhmalat", "id": "Tempat sampah"},
    ],
    "health.json": [
        {"en": "Pulse", "ar": "نبض", "tr": "Nabd", "id": "Nadi"},
        {"en": "Breath", "ar": "تنفس", "tr": "Tanaffus", "id": "Napas"},
        {"en": "Checkup", "ar": "فحص", "tr": "Fahs", "id": "Pemeriksaan"},
        {"en": "Prescription", "ar": "وصفة طبية", "tr": "Wasfah tibbiyah", "id": "Resep dokter"},
        {"en": "Vitamin", "ar": "فيتامين", "tr": "Fitamin", "id": "Vitamin"},
        {"en": "Healing", "ar": "شفاء", "tr": "Shifa'", "id": "Kesembuhan"},
        {"en": "Wound", "ar": "جرح", "tr": "Jarh", "id": "Luka"},
        {"en": "Dizzy", "ar": "دوخة", "tr": "Dawkhah", "id": "Pusing"},
    ],
    "school_office.json": [
        {"en": "Attendance", "ar": "حضور", "tr": "Hudur", "id": "Kehadiran"},
        {"en": "Assignment", "ar": "مهمة", "tr": "Muhimmah", "id": "Tugas"},
        {"en": "Presentation", "ar": "عرض", "tr": "Ard", "id": "Presentasi"},
        {"en": "Colleague", "ar": "زميل", "tr": "Zamil", "id": "Rekan kerja"},
        {"en": "Supervisor", "ar": "مشرف", "tr": "Mushrif", "id": "Supervisor"},
        {"en": "Intern", "ar": "متدرب", "tr": "Mutadarrib", "id": "Magang"},
        {"en": "Deadline", "ar": "موعد نهائي", "tr": "Maw'id naha'i", "id": "Batas waktu"},
        {"en": "Meeting room", "ar": "غرفة الاجتماعات", "tr": "Ghurfat al-ijtima'at", "id": "Ruang rapat"},
    ],
    "daily_activities.json": [
        {"en": "Jog", "ar": "يركض", "tr": "Yarkud", "id": "Joging"},
        {"en": "Commute", "ar": "يتنقل", "tr": "Yatanaqqal", "id": "Berangkat pulang kerja"},
        {"en": "Study online", "ar": "يدرس عبر الإنترنت", "tr": "Yadrus 'abr al-internet", "id": "Belajar online"},
        {"en": "Send message", "ar": "يرسل رسالة", "tr": "Yursil risalah", "id": "Mengirim pesan"},
        {"en": "Watch TV", "ar": "يشاهد التلفاز", "tr": "Yushahid at-tilfaz", "id": "Menonton TV"},
        {"en": "Wash dishes", "ar": "يغسل الصحون", "tr": "Yaghsil as-suhun", "id": "Mencuci piring"},
        {"en": "Water plants", "ar": "يسقي النباتات", "tr": "Yasqi an-nabatat", "id": "Menyiram tanaman"},
        {"en": "Take a nap", "ar": "يأخذ قيلولة", "tr": "Ya'khudh qaylulah", "id": "Tidur siang"},
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
