import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "clothing.json": [
        {"en": "Ring", "ar": "خاتم", "tr": "Khatam", "id": "Cincin"},
        {"en": "Wallet chain", "ar": "سلسلة المحفظة", "tr": "Silsilat al-mahfazah", "id": "Rantai dompet"},
        {"en": "Backpack", "ar": "حقيبة ظهر", "tr": "Haqibat zahr", "id": "Tas punggung"},
        {"en": "Sunglasses", "ar": "نظارة شمسية", "tr": "Nazzarah shamsiyyah", "id": "Kacamata hitam"},
        {"en": "Apron", "ar": "مريلة", "tr": "Mariylah", "id": "Celemek"},
        {"en": "Bathrobe", "ar": "روب حمام", "tr": "Ruwb hammam", "id": "Jubah mandi"},
        {"en": "Shawl", "ar": "شال", "tr": "Shal", "id": "Selendang"},
        {"en": "Sandals strap", "ar": "رباط الصندل", "tr": "Ribat as-sandal", "id": "Tali sandal"},
        {"en": "Collar", "ar": "ياقة", "tr": "Yaqah", "id": "Kerah"},
        {"en": "Zipper", "ar": "سحاب", "tr": "Sahhab", "id": "Resleting"},
    ],
    "colors.json": [
        {"en": "Indigo", "ar": "نيلي", "tr": "Nili", "id": "Nila"},
        {"en": "Bronze", "ar": "برونزي", "tr": "Burunzi", "id": "Perunggu"},
        {"en": "Ivory", "ar": "عاجي", "tr": "Aji", "id": "Gading"},
        {"en": "Charcoal", "ar": "فحمي", "tr": "Fahmi", "id": "Abu arang"},
        {"en": "Magenta", "ar": "أرجواني", "tr": "Urjuwani", "id": "Magenta"},
        {"en": "Mint", "ar": "نعناعي", "tr": "Na'na'i", "id": "Hijau mint"},
        {"en": "Lavender", "ar": "لافندر", "tr": "Lafandar", "id": "Lavender"},
        {"en": "Ruby", "ar": "ياقوتي", "tr": "Yaquti", "id": "Merah ruby"},
        {"en": "Emerald", "ar": "زمردي", "tr": "Zumurrudi", "id": "Hijau zamrud"},
        {"en": "Pearl white", "ar": "أبيض لؤلؤي", "tr": "Abyad lu'lu'i", "id": "Putih mutiara"},
    ],
    "emotions.json": [
        {"en": "Cheerful", "ar": "مبتهج", "tr": "Mubtahij", "id": "Ceria"},
        {"en": "Upset", "ar": "منزعج", "tr": "Munza'ij", "id": "Kesal"},
        {"en": "Determined", "ar": "مصمم", "tr": "Musammim", "id": "Bertekad"},
        {"en": "Touched", "ar": "متأثر", "tr": "Muta'aththir", "id": "Terharu"},
        {"en": "Relaxed", "ar": "مسترخ", "tr": "Mustarkh", "id": "Rileks"},
        {"en": "Insecure", "ar": "غير واثق", "tr": "Ghayr wathiq", "id": "Tidak percaya diri"},
        {"en": "Excited for tomorrow", "ar": "متحمس للغد", "tr": "Mutaḥammis lil-ghad", "id": "Antusias untuk besok"},
        {"en": "Homesick", "ar": "مشتاق إلى البيت", "tr": "Mushtaq ila al-bayt", "id": "Rindu rumah"},
        {"en": "Inspired", "ar": "ملهم", "tr": "Mulham", "id": "Terinspirasi"},
        {"en": "Discouraged", "ar": "مثبط", "tr": "Muthabbat", "id": "Patah semangat"},
    ],
    "food_drinks.json": [
        {"en": "Soup spoon", "ar": "ملعقة شوربة", "tr": "Mila'qat shurbah", "id": "Sendok sup"},
        {"en": "Fried rice", "ar": "أرز مقلي", "tr": "Aruzz maqli", "id": "Nasi goreng"},
        {"en": "Boiled egg", "ar": "بيض مسلوق", "tr": "Bayd masluq", "id": "Telur rebus"},
        {"en": "Fried egg", "ar": "بيض مقلي", "tr": "Bayd maqli", "id": "Telur goreng"},
        {"en": "Grilled fish", "ar": "سمك مشوي", "tr": "Samak mashwi", "id": "Ikan bakar"},
        {"en": "Fruit juice", "ar": "عصير فواكه", "tr": "Asir fawakih", "id": "Jus buah"},
        {"en": "Hot tea", "ar": "شاي ساخن", "tr": "Shay sakhin", "id": "Teh panas"},
        {"en": "Cold coffee", "ar": "قهوة باردة", "tr": "Qahwah baridah", "id": "Kopi dingin"},
        {"en": "Lunch box", "ar": "علبة غداء", "tr": "Ulbah ghada'", "id": "Kotak makan"},
        {"en": "Breakfast", "ar": "فطور", "tr": "Futur", "id": "Sarapan"},
    ],
    "places.json": [
        {"en": "Train station", "ar": "محطة القطار", "tr": "Mahattat al-qitar", "id": "Stasiun kereta"},
        {"en": "Police station", "ar": "مركز الشرطة", "tr": "Markaz ash-shurtah", "id": "Kantor polisi"},
        {"en": "Clinic", "ar": "عيادة", "tr": "Iyadah", "id": "Klinik"},
        {"en": "Coffee shop", "ar": "مقهى", "tr": "Maqha", "id": "Kedai kopi"},
        {"en": "Bookstore", "ar": "مكتبة كتب", "tr": "Maktabat kutub", "id": "Toko buku"},
        {"en": "Mall entrance", "ar": "مدخل المركز التجاري", "tr": "Madkhal al-markaz at-tijari", "id": "Pintu masuk mal"},
        {"en": "Parking area", "ar": "موقف السيارات", "tr": "Mawqif as-sayyarat", "id": "Area parkir"},
        {"en": "Public park", "ar": "حديقة عامة", "tr": "Hadiqah 'ammah", "id": "Taman umum"},
        {"en": "Residential area", "ar": "منطقة سكنية", "tr": "Mintaqah sakaniyyah", "id": "Area perumahan"},
        {"en": "Main road", "ar": "شارع رئيسي", "tr": "Shari' ra'isi", "id": "Jalan utama"},
    ],
    "professions.json": [
        {"en": "Lecturer", "ar": "محاضر", "tr": "Muhadir", "id": "Dosen"},
        {"en": "Manager", "ar": "مدير", "tr": "Mudir", "id": "Manajer"},
        {"en": "Operator", "ar": "مشغل", "tr": "Mushaghghil", "id": "Operator"},
        {"en": "Barber", "ar": "حلاق", "tr": "Hallaq", "id": "Tukang cukur"},
        {"en": "Electrician", "ar": "كهربائي", "tr": "Kahraba'i", "id": "Teknisi listrik"},
        {"en": "Plumber", "ar": "سباك", "tr": "Sabbak", "id": "Tukang ledeng"},
        {"en": "Carpenter", "ar": "نجار", "tr": "Najjar", "id": "Tukang kayu"},
        {"en": "Courier", "ar": "ساعي", "tr": "Sa'i", "id": "Kurir"},
        {"en": "Salesperson", "ar": "مندوب مبيعات", "tr": "Mandub mabi'at", "id": "Sales"},
        {"en": "Consultant", "ar": "مستشار", "tr": "Mustashar", "id": "Konsultan"},
    ],
    "question_words.json": [
        {"en": "Which direction", "ar": "أي اتجاه", "tr": "Ayy ittijah", "id": "Arah mana"},
        {"en": "How big", "ar": "كم الحجم", "tr": "Kam al-hajm", "id": "Seberapa besar"},
        {"en": "How small", "ar": "كم الصغر", "tr": "Kam as-sughr", "id": "Seberapa kecil"},
        {"en": "How deep", "ar": "كم العمق", "tr": "Kam al-'umq", "id": "Seberapa dalam"},
        {"en": "How fast", "ar": "كم السرعة", "tr": "Kam as-sur'ah", "id": "Seberapa cepat"},
        {"en": "How slow", "ar": "كم البطء", "tr": "Kam al-but'", "id": "Seberapa lambat"},
        {"en": "In what way", "ar": "بأي طريقة", "tr": "Bi-ayyi tariqah", "id": "Dengan cara apa"},
        {"en": "Under whose name", "ar": "باسم من", "tr": "Bismi man", "id": "Atas nama siapa"},
        {"en": "Near what", "ar": "قرب ماذا", "tr": "Qurb madha", "id": "Dekat apa"},
        {"en": "Between what", "ar": "بين ماذا", "tr": "Bayna madha", "id": "Di antara apa"},
    ],
    "transportation.json": [
        {"en": "Driver license", "ar": "رخصة القيادة", "tr": "Rukhsat al-qiyadah", "id": "SIM"},
        {"en": "Ticket gate", "ar": "بوابة التذاكر", "tr": "Bawwabat at-tadhakir", "id": "Gerbang tiket"},
        {"en": "Traffic jam", "ar": "ازدحام مروري", "tr": "Izdiham mururi", "id": "Macet"},
        {"en": "Road sign", "ar": "إشارة طريق", "tr": "Isharat tariq", "id": "Rambu jalan"},
        {"en": "Parking ticket", "ar": "تذكرة موقف", "tr": "Tadhkirat mawqif", "id": "Tiket parkir"},
        {"en": "Fuel station", "ar": "محطة الوقود", "tr": "Mahattat al-wuqud", "id": "Pom bensin"},
        {"en": "Route map", "ar": "خريطة المسار", "tr": "Kharitat al-masar", "id": "Peta rute"},
        {"en": "Travel card", "ar": "بطاقة سفر", "tr": "Bitaqat safar", "id": "Kartu perjalanan"},
        {"en": "Rear seat", "ar": "المقعد الخلفي", "tr": "Al-maq'ad al-khalfi", "id": "Kursi belakang"},
        {"en": "Front seat", "ar": "المقعد الأمامي", "tr": "Al-maq'ad al-amami", "id": "Kursi depan"},
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
