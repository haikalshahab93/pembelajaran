import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "basics.json": [
        {"en": "Sit down", "ar": "اجلس", "tr": "Ijlis", "id": "Duduk"},
        {"en": "Stand up", "ar": "قف", "tr": "Qif", "id": "Berdiri"},
        {"en": "Listen", "ar": "استمع", "tr": "Istami'", "id": "Dengar"},
        {"en": "Look", "ar": "انظر", "tr": "Unzur", "id": "Lihat"},
        {"en": "Follow me", "ar": "اتبعني", "tr": "Ittabi'ni", "id": "Ikuti saya"},
        {"en": "Leave it", "ar": "اتركه", "tr": "Utrukhu", "id": "Biarkan itu"},
        {"en": "Try again", "ar": "حاول مرة أخرى", "tr": "Hawil marrah ukhrah", "id": "Coba lagi"},
        {"en": "Keep going", "ar": "استمر", "tr": "Istamirr", "id": "Lanjutkan"},
        {"en": "Choose", "ar": "اختر", "tr": "Ikhtar", "id": "Pilih"},
        {"en": "Remember", "ar": "تذكر", "tr": "Tadhakkar", "id": "Ingat"},
    ],
    "family.json": [
        {"en": "Stepfather", "ar": "زوج الأم", "tr": "Zawj al-umm", "id": "Ayah tiri"},
        {"en": "Stepmother", "ar": "زوجة الأب", "tr": "Zawjat al-ab", "id": "Ibu tiri"},
        {"en": "Stepbrother", "ar": "أخ غير شقيق", "tr": "Akh ghayr shaqiq", "id": "Saudara tiri laki-laki"},
        {"en": "Stepsister", "ar": "أخت غير شقيقة", "tr": "Ukht ghayr shaqiqah", "id": "Saudara tiri perempuan"},
        {"en": "Bride", "ar": "عروس", "tr": "Arus", "id": "Pengantin perempuan"},
        {"en": "Groom", "ar": "عريس", "tr": "Aris", "id": "Pengantin laki-laki"},
        {"en": "Orphan", "ar": "يتيم", "tr": "Yatim", "id": "Yatim"},
        {"en": "Household", "ar": "أسرة", "tr": "Usrah", "id": "Rumah tangga"},
        {"en": "Generation", "ar": "جيل", "tr": "Jil", "id": "Generasi"},
        {"en": "Surname", "ar": "اسم العائلة", "tr": "Ism al-'ailah", "id": "Nama keluarga"},
    ],
    "weather.json": [
        {"en": "Air pressure", "ar": "ضغط الهواء", "tr": "Daght al-hawa'", "id": "Tekanan udara"},
        {"en": "Raincoat", "ar": "معطف مطر", "tr": "Mi'taf matar", "id": "Jas hujan"},
        {"en": "Umbrella", "ar": "مظلة", "tr": "Mazallah", "id": "Payung"},
        {"en": "Thunderstorm", "ar": "عاصفة رعدية", "tr": "Asifah ra'diyyah", "id": "Badai petir"},
        {"en": "Flood", "ar": "فيضانات", "tr": "Faydanaat", "id": "Banjir"},
        {"en": "Drought", "ar": "جفاف", "tr": "Jafaf", "id": "Kekeringan"},
        {"en": "Dust storm", "ar": "عاصفة ترابية", "tr": "Asifah turabiyyah", "id": "Badai debu"},
        {"en": "Misty", "ar": "ضبابي", "tr": "Dubabi", "id": "Berkabut tipis"},
        {"en": "Weather station", "ar": "محطة الطقس", "tr": "Mahattat at-taqs", "id": "Stasiun cuaca"},
        {"en": "Humidity level", "ar": "مستوى الرطوبة", "tr": "Mustawa ar-rutub ah", "id": "Tingkat kelembapan"},
    ],
    "travel.json": [
        {"en": "Travel insurance", "ar": "تأمين السفر", "tr": "Ta'min as-safar", "id": "Asuransi perjalanan"},
        {"en": "Checkpoint", "ar": "نقطة تفتيش", "tr": "Nuqtat taftish", "id": "Pos pemeriksaan"},
        {"en": "Terminal", "ar": "مبنى الركاب", "tr": "Mabna ar-rukkab", "id": "Terminal"},
        {"en": "Window seat", "ar": "مقعد قرب النافذة", "tr": "Maq'ad qurb an-nafidhah", "id": "Kursi dekat jendela"},
        {"en": "Aisle seat", "ar": "مقعد قرب الممر", "tr": "Maq'ad qurb al-mamarr", "id": "Kursi dekat lorong"},
        {"en": "Travel bag", "ar": "حقيبة سفر", "tr": "Haqibat safar", "id": "Tas perjalanan"},
        {"en": "Local guide", "ar": "مرشد محلي", "tr": "Murshid mahalli", "id": "Pemandu lokal"},
        {"en": "Landmark", "ar": "معلم بارز", "tr": "Ma'lam bariz", "id": "Tempat ikonik"},
        {"en": "Excursion", "ar": "رحلة قصيرة", "tr": "Rihlah qasirah", "id": "Wisata singkat"},
        {"en": "Travel plan", "ar": "خطة سفر", "tr": "Khuttat safar", "id": "Rencana perjalanan"},
    ],
    "shopping.json": [
        {"en": "Can I try this on?", "ar": "هل يمكنني قياس هذا؟", "tr": "Hal yumkinuni qiyas hatha?", "id": "Boleh saya coba ini?"},
        {"en": "Do you have a larger size?", "ar": "هل لديك مقاس أكبر؟", "tr": "Hal ladayka miqas akbar?", "id": "Ada ukuran yang lebih besar?"},
        {"en": "Do you have a smaller size?", "ar": "هل لديك مقاس أصغر؟", "tr": "Hal ladayka miqas asghar?", "id": "Ada ukuran yang lebih kecil?"},
        {"en": "Too expensive", "ar": "غالي جدا", "tr": "Ghali jiddan", "id": "Terlalu mahal"},
        {"en": "Can I pay by card?", "ar": "هل يمكنني الدفع بالبطاقة؟", "tr": "Hal yumkinuni ad-daf' bil-bitaqah?", "id": "Bisa bayar pakai kartu?"},
        {"en": "I am just looking", "ar": "أنا فقط أنظر", "tr": "Ana faqat anzur", "id": "Saya hanya lihat-lihat"},
        {"en": "Cashier counter", "ar": "منضدة الدفع", "tr": "Mindadat ad-daf'", "id": "Meja kasir"},
        {"en": "Shopping list", "ar": "قائمة التسوق", "tr": "Qa'imat at-tasawwuq", "id": "Daftar belanja"},
        {"en": "Brand", "ar": "علامة تجارية", "tr": "Allamah tijariyyah", "id": "Merek"},
        {"en": "Warranty", "ar": "ضمان", "tr": "Daman", "id": "Garansi"},
    ],
    "restaurant.json": [
        {"en": "Can I see the menu?", "ar": "هل يمكنني رؤية القائمة؟", "tr": "Hal yumkinuni ru'yat al-qa'imah?", "id": "Boleh saya lihat menu?"},
        {"en": "I would like water", "ar": "أود ماء", "tr": "Uwiddu ma'an", "id": "Saya ingin air"},
        {"en": "No ice", "ar": "بدون ثلج", "tr": "Bidun thalj", "id": "Tanpa es"},
        {"en": "Less spicy", "ar": "أقل حارة", "tr": "Aqall hararah", "id": "Kurang pedas"},
        {"en": "Very tasty", "ar": "لذيذ جدا", "tr": "Ladhidh jiddan", "id": "Sangat enak"},
        {"en": "Please pack this", "ar": "من فضلك غلف هذا", "tr": "Min fadlik ghallif hatha", "id": "Tolong bungkus ini"},
        {"en": "Takeaway", "ar": "سفري", "tr": "Safri", "id": "Bawa pulang"},
        {"en": "Refill", "ar": "إعادة تعبئة", "tr": "I'adat ta'bi'ah", "id": "Isi ulang"},
        {"en": "Napkin", "ar": "منديل", "tr": "Mandil", "id": "Tisu makan"},
        {"en": "The food is ready", "ar": "الطعام جاهز", "tr": "At-ta'am jahiz", "id": "Makanannya siap"},
    ],
    "daily_conversation.json": [
        {"en": "Where are you now?", "ar": "أين أنت الآن؟", "tr": "Ayna anta al-an?", "id": "Kamu sekarang di mana?"},
        {"en": "I am on my way", "ar": "أنا في الطريق", "tr": "Ana fi at-tariq", "id": "Saya sedang di jalan"},
        {"en": "Please wait for me", "ar": "انتظرني من فضلك", "tr": "Intazirni min fadlik", "id": "Tolong tunggu saya"},
        {"en": "I forgot", "ar": "نسيت", "tr": "Nasitu", "id": "Saya lupa"},
        {"en": "I remember now", "ar": "تذكرت الآن", "tr": "Tadhakkartu al-an", "id": "Sekarang saya ingat"},
        {"en": "That is true", "ar": "هذا صحيح", "tr": "Hatha sahih", "id": "Itu benar"},
        {"en": "That is wrong", "ar": "هذا خطأ", "tr": "Hatha khata'", "id": "Itu salah"},
        {"en": "I will think about it", "ar": "سأفكر في ذلك", "tr": "Sa'ufakkir fi dhalik", "id": "Saya akan pikirkan itu"},
        {"en": "Maybe later", "ar": "ربما لاحقا", "tr": "Rubbama لاحقا", "id": "Mungkin nanti"},
        {"en": "Talk to you soon", "ar": "سأتحدث معك قريبا", "tr": "Sa'atahaddath ma'aka qariban", "id": "Nanti saya hubungi lagi"},
    ],
    "personal_information.json": [
        {"en": "Blood type", "ar": "فصيلة الدم", "tr": "Fasilat ad-dam", "id": "Golongan darah"},
        {"en": "Emergency contact", "ar": "جهة اتصال للطوارئ", "tr": "Jihat ittisal lit-tawari'", "id": "Kontak darurat"},
        {"en": "ID number", "ar": "رقم الهوية", "tr": "Raqm al-huwiyyah", "id": "Nomor identitas"},
        {"en": "Passport number", "ar": "رقم جواز السفر", "tr": "Raqm jawaz as-safar", "id": "Nomor paspor"},
        {"en": "Marital status", "ar": "الحالة الاجتماعية", "tr": "Al-halah al-ijtima'iyyah", "id": "Status pernikahan"},
        {"en": "Education", "ar": "التعليم", "tr": "At-ta'lim", "id": "Pendidikan"},
        {"en": "Workplace", "ar": "مكان العمل", "tr": "Makan al-'amal", "id": "Tempat kerja"},
        {"en": "Residence", "ar": "محل الإقامة", "tr": "Mahall al-iqamah", "id": "Tempat tinggal"},
        {"en": "Citizenship", "ar": "المواطنة", "tr": "Al-muwatanah", "id": "Kewarganegaraan"},
        {"en": "Signature", "ar": "توقيع", "tr": "Tawqi'", "id": "Tanda tangan"},
    ],
    "home_objects.json": [
        {"en": "Mop", "ar": "ممسحة", "tr": "Mimsahah", "id": "Pel lantai"},
        {"en": "Detergent", "ar": "منظف", "tr": "Munazzif", "id": "Deterjen"},
        {"en": "Pillowcase", "ar": "غطاء الوسادة", "tr": "Ghita' al-wisadah", "id": "Sarung bantal"},
        {"en": "Mattress", "ar": "مرتبة", "tr": "Martabah", "id": "Kasur"},
        {"en": "Dining table", "ar": "طاولة الطعام", "tr": "Tawilat at-ta'am", "id": "Meja makan"},
        {"en": "Water dispenser", "ar": "موزع المياه", "tr": "Muwazzi' al-miyah", "id": "Dispenser"},
        {"en": "Washing machine", "ar": "غسالة", "tr": "Ghassalah", "id": "Mesin cuci"},
        {"en": "Laundry basket", "ar": "سلة الغسيل", "tr": "Sallat al-ghasil", "id": "Keranjang cucian"},
        {"en": "Doormat", "ar": "ممسحة الباب", "tr": "Mimsahat al-bab", "id": "Keset"},
        {"en": "Charger", "ar": "شاحن", "tr": "Shahin", "id": "Pengisi daya"},
    ],
    "health.json": [
        {"en": "Sore throat", "ar": "التهاب الحلق", "tr": "Iltihab al-halq", "id": "Sakit tenggorokan"},
        {"en": "Flu", "ar": "إنفلونزا", "tr": "Influenza", "id": "Flu"},
        {"en": "Cold medicine", "ar": "دواء البرد", "tr": "Dawa' al-bard", "id": "Obat flu"},
        {"en": "Painkiller", "ar": "مسكن ألم", "tr": "Musakkin alam", "id": "Obat pereda nyeri"},
        {"en": "Recovery room", "ar": "غرفة التعافي", "tr": "Ghurfat at-ta'afi", "id": "Ruang pemulihan"},
        {"en": "Vaccination", "ar": "تطعيم", "tr": "Tat'im", "id": "Vaksinasi"},
        {"en": "Medical record", "ar": "سجل طبي", "tr": "Sijill tibbi", "id": "Rekam medis"},
        {"en": "Blood test", "ar": "تحليل دم", "tr": "Tahlil dam", "id": "Tes darah"},
        {"en": "Health insurance", "ar": "تأمين صحي", "tr": "Ta'min sihhi", "id": "Asuransi kesehatan"},
        {"en": "Patient", "ar": "مريض", "tr": "Marid", "id": "Pasien"},
    ],
    "school_office.json": [
        {"en": "Curriculum", "ar": "منهج", "tr": "Manhaj", "id": "Kurikulum"},
        {"en": "Certificate", "ar": "شهادة", "tr": "Shahadah", "id": "Sertifikat"},
        {"en": "File folder", "ar": "ملف", "tr": "Malaf", "id": "Map berkas"},
        {"en": "Spreadsheet", "ar": "جدول بيانات", "tr": "Jadwal bayanat", "id": "Spreadsheet"},
        {"en": "Keyboard", "ar": "لوحة مفاتيح", "tr": "Lawhat mafatih", "id": "Keyboard"},
        {"en": "Mouse", "ar": "فأرة", "tr": "Fa'rah", "id": "Mouse"},
        {"en": "Chalk", "ar": "طباشير", "tr": "Tabashir", "id": "Kapur tulis"},
        {"en": "Correction", "ar": "تصحيح", "tr": "Tashih", "id": "Koreksi"},
        {"en": "Office hours", "ar": "ساعات العمل", "tr": "Sa'at al-'amal", "id": "Jam kerja"},
        {"en": "Break time", "ar": "وقت الاستراحة", "tr": "Waqt al-istirahah", "id": "Waktu istirahat"},
    ],
    "daily_activities.json": [
        {"en": "Stretch", "ar": "يتمدد", "tr": "Yatamaddad", "id": "Peregangan"},
        {"en": "Make the bed", "ar": "يرتب السرير", "tr": "Yurattib as-sarir", "id": "Merapikan tempat tidur"},
        {"en": "Open the window", "ar": "يفتح النافذة", "tr": "Yaftah an-nafidhah", "id": "Membuka jendela"},
        {"en": "Check the phone", "ar": "يفحص الهاتف", "tr": "Yafhas al-hatif", "id": "Mengecek ponsel"},
        {"en": "Reply to messages", "ar": "يرد على الرسائل", "tr": "Yaruddu 'ala ar-rasa'il", "id": "Membalas pesan"},
        {"en": "Take medicine", "ar": "يتناول الدواء", "tr": "Yatanawal ad-dawa'", "id": "Minum obat"},
        {"en": "Pay the bill", "ar": "يدفع الفاتورة", "tr": "Yadfa' al-faturah", "id": "Membayar tagihan"},
        {"en": "Charge the phone", "ar": "يشحن الهاتف", "tr": "Yashhan al-hatif", "id": "Mengisi daya ponsel"},
        {"en": "Lock the door", "ar": "يقفل الباب", "tr": "Yuqfil al-bab", "id": "Mengunci pintu"},
        {"en": "Turn off the light", "ar": "يطفئ الضوء", "tr": "Yutfi' ad-daw'", "id": "Mematikan lampu"},
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
