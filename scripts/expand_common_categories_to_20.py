import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "basics.json": [
        {"en": "Sorry", "ar": "آسف", "tr": "Asif", "id": "Maaf"},
        {"en": "Welcome", "ar": "أهلا وسهلا", "tr": "Ahlan wa sahlan", "id": "Selamat datang"},
        {"en": "Maybe", "ar": "ربما", "tr": "Rubbama", "id": "Mungkin"},
        {"en": "Of course", "ar": "بالطبع", "tr": "Bit-tab'", "id": "Tentu saja"},
        {"en": "I agree", "ar": "أوافق", "tr": "Uwafiq", "id": "Saya setuju"},
        {"en": "I do not know", "ar": "لا أعرف", "tr": "La a'rif", "id": "Saya tidak tahu"},
        {"en": "Wait", "ar": "انتظر", "tr": "Intazir", "id": "Tunggu"},
        {"en": "Come here", "ar": "تعال إلى هنا", "tr": "Ta'al ila huna", "id": "Kemari"},
        {"en": "Go ahead", "ar": "تفضل", "tr": "Tafaddal", "id": "Silakan"},
        {"en": "Be careful", "ar": "كن حذرا", "tr": "Kun hadhiran", "id": "Hati-hati"},
    ],
    "family.json": [
        {"en": "Grandfather", "ar": "جد", "tr": "Jadd", "id": "Kakek"},
        {"en": "Grandmother", "ar": "جدة", "tr": "Jaddah", "id": "Nenek"},
        {"en": "Uncle", "ar": "عم", "tr": "'Amm", "id": "Paman"},
        {"en": "Aunt", "ar": "عمة", "tr": "'Ammah", "id": "Bibi"},
        {"en": "Cousin", "ar": "ابن العم", "tr": "Ibn al-'amm", "id": "Sepupu"},
        {"en": "Parents", "ar": "والدان", "tr": "Walidan", "id": "Orang tua"},
        {"en": "Relative", "ar": "قريب", "tr": "Qarib", "id": "Kerabat"},
        {"en": "Baby", "ar": "رضيع", "tr": "Radi'", "id": "Bayi"},
        {"en": "Nephew", "ar": "ابن الأخ", "tr": "Ibn al-akh", "id": "Keponakan laki-laki"},
        {"en": "Niece", "ar": "ابنة الأخت", "tr": "Ibnah al-ukht", "id": "Keponakan perempuan"},
    ],
    "weather.json": [
        {"en": "Humid", "ar": "رطب", "tr": "Ratib", "id": "Lembap"},
        {"en": "Dry", "ar": "جاف", "tr": "Jaff", "id": "Kering"},
        {"en": "Fog", "ar": "ضباب", "tr": "Dubab", "id": "Kabut"},
        {"en": "Lightning", "ar": "برق", "tr": "Barq", "id": "Petir"},
        {"en": "Thunder", "ar": "رعد", "tr": "Ra'd", "id": "Guruh"},
        {"en": "Rainbow", "ar": "قوس قزح", "tr": "Qaws Quzah", "id": "Pelangi"},
        {"en": "Forecast", "ar": "توقعات الطقس", "tr": "Tawaqqu'at at-taqs", "id": "Prakiraan cuaca"},
        {"en": "Drizzle", "ar": "رذاذ", "tr": "Radhadh", "id": "Gerimis"},
        {"en": "Breeze", "ar": "نسيم", "tr": "Nasim", "id": "Semilir angin"},
        {"en": "Hail", "ar": "بَرَد", "tr": "Barad", "id": "Hujan es"},
    ],
    "travel.json": [
        {"en": "Boarding pass", "ar": "بطاقة الصعود", "tr": "Bitaqat as-su'ud", "id": "Kartu naik"},
        {"en": "Departure", "ar": "مغادرة", "tr": "Mughadarah", "id": "Keberangkatan"},
        {"en": "Arrival", "ar": "وصول", "tr": "Wusul", "id": "Kedatangan"},
        {"en": "Reservation", "ar": "حجز", "tr": "Hajz", "id": "Reservasi"},
        {"en": "Journey", "ar": "رحلة", "tr": "Rihlah", "id": "Perjalanan"},
        {"en": "Tourist", "ar": "سائح", "tr": "Sa'ih", "id": "Turis"},
        {"en": "Suitcase", "ar": "حقيبة سفر", "tr": "Haqibat safar", "id": "Koper"},
        {"en": "Gate", "ar": "بوابة", "tr": "Bawwabah", "id": "Gerbang"},
        {"en": "Visa", "ar": "تأشيرة", "tr": "Ta'shirah", "id": "Visa"},
        {"en": "Tour guide", "ar": "مرشد سياحي", "tr": "Murshid siyahi", "id": "Pemandu wisata"},
    ],
    "shopping.json": [
        {"en": "Market", "ar": "سوق", "tr": "Suq", "id": "Pasar"},
        {"en": "Mall", "ar": "مركز تجاري", "tr": "Markaz tijari", "id": "Mal"},
        {"en": "Size", "ar": "مقاس", "tr": "Miqas", "id": "Ukuran"},
        {"en": "Fitting room", "ar": "غرفة القياس", "tr": "Ghurfat al-qiyas", "id": "Kamar pas"},
        {"en": "Refund", "ar": "استرداد", "tr": "Istirdad", "id": "Pengembalian dana"},
        {"en": "Exchange", "ar": "استبدال", "tr": "Istibdal", "id": "Tukar barang"},
        {"en": "Wallet", "ar": "محفظة", "tr": "Mahfazhah", "id": "Dompet"},
        {"en": "Coin", "ar": "عملة معدنية", "tr": "'Umlah ma'diniyyah", "id": "Koin"},
        {"en": "Basket", "ar": "سلة", "tr": "Sallah", "id": "Keranjang"},
        {"en": "Checkout", "ar": "صندوق الدفع", "tr": "Sunduq ad-daf'", "id": "Kasir"},
    ],
    "restaurant.json": [
        {"en": "Fork", "ar": "شوكة", "tr": "Shawkah", "id": "Garpu"},
        {"en": "Spoon", "ar": "ملعقة", "tr": "Mila'qah", "id": "Sendok"},
        {"en": "Plate", "ar": "طبق", "tr": "Tabaq", "id": "Piring"},
        {"en": "Cup", "ar": "كوب", "tr": "Kub", "id": "Cangkir"},
        {"en": "Dessert", "ar": "حلوى", "tr": "Halwa", "id": "Makanan penutup"},
        {"en": "Breakfast", "ar": "فطور", "tr": "Futur", "id": "Sarapan"},
        {"en": "Lunch", "ar": "غداء", "tr": "Ghada'", "id": "Makan siang"},
        {"en": "Dinner", "ar": "عشاء", "tr": "'Asha'", "id": "Makan malam"},
        {"en": "Salt", "ar": "ملح", "tr": "Milh", "id": "Garam"},
        {"en": "Pepper", "ar": "فلفل", "tr": "Filfil", "id": "Lada"},
    ],
    "daily_conversation.json": [
        {"en": "Nice to meet you", "ar": "سعيد بلقائك", "tr": "Sa'id biliqa'ik", "id": "Senang bertemu denganmu"},
        {"en": "What time is it?", "ar": "كم الساعة؟", "tr": "Kam as-sa'ah?", "id": "Jam berapa sekarang?"},
        {"en": "Can you help me?", "ar": "هل يمكنك مساعدتي؟", "tr": "Hal yumkinuka musa'adati?", "id": "Bisakah kamu membantu saya?"},
        {"en": "I am busy", "ar": "أنا مشغول", "tr": "Ana mashghul", "id": "Saya sibuk"},
        {"en": "No problem", "ar": "لا مشكلة", "tr": "La mushkilah", "id": "Tidak masalah"},
        {"en": "Let's go", "ar": "هيا بنا", "tr": "Hayya bina", "id": "Ayo berangkat"},
        {"en": "Wait a moment", "ar": "انتظر لحظة", "tr": "Intazir lahzah", "id": "Tunggu sebentar"},
        {"en": "I am tired", "ar": "أنا متعب", "tr": "Ana mut'ab", "id": "Saya lelah"},
        {"en": "Good luck", "ar": "حظا سعيدا", "tr": "Hazzan sa'idan", "id": "Semoga beruntung"},
        {"en": "Take care", "ar": "اعتن بنفسك", "tr": "I'tan binafsik", "id": "Jaga diri"},
    ],
    "personal_information.json": [
        {"en": "First name", "ar": "الاسم الأول", "tr": "Al-ism al-awwal", "id": "Nama depan"},
        {"en": "Last name", "ar": "اسم العائلة", "tr": "Ism al-'a'ilah", "id": "Nama belakang"},
        {"en": "Birthday", "ar": "تاريخ الميلاد", "tr": "Tarikh al-milad", "id": "Tanggal lahir"},
        {"en": "Place of birth", "ar": "مكان الميلاد", "tr": "Makan al-milad", "id": "Tempat lahir"},
        {"en": "Identity card", "ar": "بطاقة الهوية", "tr": "Bitaqat al-huwiyyah", "id": "Kartu identitas"},
        {"en": "Email address", "ar": "البريد الإلكتروني", "tr": "Al-barid al-iliktruni", "id": "Alamat email"},
        {"en": "Hobby", "ar": "هواية", "tr": "Hiwayah", "id": "Hobi"},
        {"en": "Language", "ar": "لغة", "tr": "Lughah", "id": "Bahasa"},
        {"en": "Religion", "ar": "دين", "tr": "Din", "id": "Agama"},
        {"en": "Contact person", "ar": "جهة الاتصال", "tr": "Jihat al-ittisal", "id": "Kontak darurat"},
    ],
    "home_objects.json": [
        {"en": "Sofa", "ar": "أريكة", "tr": "Arikah", "id": "Sofa"},
        {"en": "Cupboard", "ar": "خزانة", "tr": "Khizanah", "id": "Lemari"},
        {"en": "Pillow", "ar": "وسادة", "tr": "Wisadah", "id": "Bantal"},
        {"en": "Blanket", "ar": "بطانية", "tr": "Bitaniyyah", "id": "Selimut"},
        {"en": "Mirror", "ar": "مرآة", "tr": "Mir'ah", "id": "Cermin"},
        {"en": "Fan", "ar": "مروحة", "tr": "Marwahah", "id": "Kipas"},
        {"en": "Stove", "ar": "موقد", "tr": "Mawqid", "id": "Kompor"},
        {"en": "Refrigerator", "ar": "ثلاجة", "tr": "Thallajah", "id": "Kulkas"},
        {"en": "Clock", "ar": "ساعة حائط", "tr": "Sa'at ha'it", "id": "Jam dinding"},
        {"en": "Shelf", "ar": "رف", "tr": "Raff", "id": "Rak"},
    ],
    "health.json": [
        {"en": "Hospital", "ar": "مستشفى", "tr": "Mustashfa", "id": "Rumah sakit"},
        {"en": "Headache", "ar": "صداع", "tr": "Suda'", "id": "Sakit kepala"},
        {"en": "Stomachache", "ar": "ألم المعدة", "tr": "Alam al-mi'dah", "id": "Sakit perut"},
        {"en": "Allergy", "ar": "حساسية", "tr": "Hasasiyyah", "id": "Alergi"},
        {"en": "Blood pressure", "ar": "ضغط الدم", "tr": "Daght ad-dam", "id": "Tekanan darah"},
        {"en": "Thermometer", "ar": "ميزان الحرارة", "tr": "Mizan al-hararah", "id": "Termometer"},
        {"en": "Bandage", "ar": "ضمادة", "tr": "Dimadah", "id": "Perban"},
        {"en": "Injection", "ar": "حقنة", "tr": "Huqnah", "id": "Suntikan"},
        {"en": "Ambulance", "ar": "سيارة إسعاف", "tr": "Sayyarat is'af", "id": "Ambulans"},
        {"en": "Recovery", "ar": "تعاف", "tr": "Ta'afin", "id": "Pemulihan"},
    ],
    "school_office.json": [
        {"en": "Classroom", "ar": "فصل دراسي", "tr": "Fasl dirasi", "id": "Ruang kelas"},
        {"en": "Office", "ar": "مكتب", "tr": "Maktab", "id": "Kantor"},
        {"en": "Lesson", "ar": "درس", "tr": "Dars", "id": "Pelajaran"},
        {"en": "Schedule", "ar": "جدول", "tr": "Jadwal", "id": "Jadwal"},
        {"en": "Projector", "ar": "جهاز عرض", "tr": "Jihaz 'ard", "id": "Proyektor"},
        {"en": "Whiteboard", "ar": "سبورة بيضاء", "tr": "Saburah bayda'", "id": "Papan tulis putih"},
        {"en": "Marker", "ar": "قلم تحديد", "tr": "Qalam tahdid", "id": "Spidol"},
        {"en": "Desk", "ar": "مكتب", "tr": "Maktab", "id": "Meja kerja"},
        {"en": "Printer", "ar": "طابعة", "tr": "Tabi'ah", "id": "Printer"},
        {"en": "Document", "ar": "مستند", "tr": "Mustanad", "id": "Dokumen"},
    ],
    "daily_activities.json": [
        {"en": "Take a bath", "ar": "يستحم", "tr": "Yastahimm", "id": "Mandi"},
        {"en": "Brush teeth", "ar": "يفرش أسنانه", "tr": "Yafrush asnanahu", "id": "Menyikat gigi"},
        {"en": "Exercise", "ar": "يمارس الرياضة", "tr": "Yumaris ar-riyadah", "id": "Berolahraga"},
        {"en": "Drive", "ar": "يقود", "tr": "Yaqud", "id": "Mengemudi"},
        {"en": "Shop", "ar": "يتسوق", "tr": "Yatasawwaq", "id": "Berbelanja"},
        {"en": "Rest", "ar": "يرتاح", "tr": "Yartah", "id": "Beristirahat"},
        {"en": "Wash clothes", "ar": "يغسل الملابس", "tr": "Yaghsil al-malabis", "id": "Mencuci pakaian"},
        {"en": "Iron clothes", "ar": "يكوي الملابس", "tr": "Yakwi al-malabis", "id": "Menyetrika pakaian"},
        {"en": "Call", "ar": "يتصل", "tr": "Yattasil", "id": "Menelepon"},
        {"en": "Listen", "ar": "يستمع", "tr": "Yastami'", "id": "Mendengarkan"},
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
        after = len(items)
        print(f"{filename}: {before} -> {after}")


if __name__ == "__main__":
    main()
