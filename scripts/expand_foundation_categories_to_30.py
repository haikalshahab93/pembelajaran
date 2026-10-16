import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "clothing.json": [
        {"en": "Pajamas", "ar": "ملابس نوم", "tr": "Malabis nawm", "id": "Piyama"},
        {"en": "Raincoat", "ar": "معطف مطر", "tr": "Mi'taf matar", "id": "Jas hujan"},
        {"en": "Slippers", "ar": "شبشب", "tr": "Shibshib", "id": "Sandal rumah"},
        {"en": "Handbag", "ar": "حقيبة يد", "tr": "Haqibat yad", "id": "Tas tangan"},
        {"en": "Watch", "ar": "ساعة يد", "tr": "Sa'at yad", "id": "Jam tangan"},
        {"en": "Earrings", "ar": "أقراط", "tr": "Aqrat", "id": "Anting"},
        {"en": "Necklace", "ar": "قلادة", "tr": "Qiladah", "id": "Kalung"},
        {"en": "Bracelet", "ar": "سوار", "tr": "Siwar", "id": "Gelang"},
        {"en": "Cap", "ar": "طاقية", "tr": "Taqiyyah", "id": "Topi kecil"},
        {"en": "Sleeve", "ar": "كم", "tr": "Kumm", "id": "Lengan baju"},
    ],
    "colors.json": [
        {"en": "Navy", "ar": "كحلي", "tr": "Kuhli", "id": "Biru navy"},
        {"en": "Olive", "ar": "زيتي", "tr": "Zayti", "id": "Hijau zaitun"},
        {"en": "Cream", "ar": "كريمي", "tr": "Karimi", "id": "Krem muda"},
        {"en": "Peach", "ar": "خوخي", "tr": "Khawkhi", "id": "Warna persik"},
        {"en": "Violet", "ar": "بنفسجي غامق", "tr": "Banafsaji ghamiq", "id": "Ungu tua"},
        {"en": "Sky blue", "ar": "أزرق سماوي", "tr": "Azraq samawi", "id": "Biru langit"},
        {"en": "Lime green", "ar": "أخضر ليموني", "tr": "Akhdar laymuni", "id": "Hijau limau"},
        {"en": "Coral", "ar": "مرجاني", "tr": "Marjani", "id": "Korall"},
        {"en": "Amber", "ar": "كهرماني", "tr": "Kahramani", "id": "Amber"},
        {"en": "Transparent", "ar": "شفاف", "tr": "Shafaf", "id": "Transparan"},
    ],
    "emotions.json": [
        {"en": "Grateful", "ar": "ممتن", "tr": "Mumtann", "id": "Bersyukur"},
        {"en": "Anxious", "ar": "قلق", "tr": "Qaliq", "id": "Cemas"},
        {"en": "Disappointed", "ar": "محبط", "tr": "Muhbat", "id": "Kecewa"},
        {"en": "Satisfied", "ar": "راض", "tr": "Radin", "id": "Puas"},
        {"en": "Motivated", "ar": "متحفز", "tr": "Mutahaffiz", "id": "Termotivasi"},
        {"en": "Shocked", "ar": "مصدوم", "tr": "Masdum", "id": "Terkaget"},
        {"en": "Peaceful", "ar": "مطمئن", "tr": "Mutma'inn", "id": "Damai"},
        {"en": "Frustrated", "ar": "محبط", "tr": "Muhbat", "id": "Frustrasi"},
        {"en": "Optimistic", "ar": "متفائل", "tr": "Mutafa'il", "id": "Optimis"},
        {"en": "Hopeful", "ar": "راج", "tr": "Rajin", "id": "Berharap"},
    ],
    "food_drinks.json": [
        {"en": "Noodles", "ar": "نودلز", "tr": "Nudlz", "id": "Mi"},
        {"en": "Porridge", "ar": "عصيدة", "tr": "Asidah", "id": "Bubur"},
        {"en": "Sandwich", "ar": "شطيرة", "tr": "Shatirah", "id": "Roti lapis"},
        {"en": "Honey", "ar": "عسل", "tr": "Asal", "id": "Madu"},
        {"en": "Yogurt", "ar": "زبادي", "tr": "Zabadi", "id": "Yogurt"},
        {"en": "Mineral water", "ar": "ماء معدني", "tr": "Ma' ma'dani", "id": "Air mineral"},
        {"en": "Soft drink", "ar": "مشروب غازي", "tr": "Mashrub ghazi", "id": "Minuman bersoda"},
        {"en": "Snack", "ar": "وجبة خفيفة", "tr": "Wajbah khafifah", "id": "Camilan"},
        {"en": "Sauce", "ar": "صلصة", "tr": "Salsah", "id": "Saus"},
        {"en": "Jam", "ar": "مربى", "tr": "Murabba", "id": "Selai"},
    ],
    "places.json": [
        {"en": "Harbor", "ar": "ميناء", "tr": "Mina'", "id": "Pelabuhan"},
        {"en": "Bus stop", "ar": "موقف الحافلات", "tr": "Mawqif al-hafilat", "id": "Halte bus"},
        {"en": "Playground", "ar": "ملعب", "tr": "Mal'ab", "id": "Taman bermain"},
        {"en": "Apartment", "ar": "شقة", "tr": "Shaqqah", "id": "Apartemen"},
        {"en": "Hotel lobby", "ar": "ردهة الفندق", "tr": "Radhat al-funduq", "id": "Lobi hotel"},
        {"en": "Bakery", "ar": "مخبز", "tr": "Makhbaz", "id": "Toko roti"},
        {"en": "Butcher shop", "ar": "محل جزارة", "tr": "Mahall jazarah", "id": "Toko daging"},
        {"en": "Gas station", "ar": "محطة وقود", "tr": "Mahattat wuqud", "id": "SPBU"},
        {"en": "Hotel room", "ar": "غرفة فندق", "tr": "Ghurfat funduq", "id": "Kamar hotel"},
        {"en": "Stadium", "ar": "ملعب كبير", "tr": "Mal'ab kabir", "id": "Stadion"},
    ],
    "professions.json": [
        {"en": "Accountant", "ar": "محاسب", "tr": "Muhasib", "id": "Akuntan"},
        {"en": "Cashier", "ar": "أمين صندوق", "tr": "Amin sunduq", "id": "Kasir"},
        {"en": "Receptionist", "ar": "موظف استقبال", "tr": "Muwazzaf istiqbal", "id": "Resepsionis"},
        {"en": "Translator", "ar": "مترجم", "tr": "Mutarjim", "id": "Penerjemah"},
        {"en": "Designer", "ar": "مصمم", "tr": "Musammim", "id": "Desainer"},
        {"en": "Cleaner", "ar": "عامل نظافة", "tr": "Amil nazafah", "id": "Petugas kebersihan"},
        {"en": "Security guard", "ar": "حارس أمن", "tr": "Haris amn", "id": "Satpam"},
        {"en": "Librarian", "ar": "أمين مكتبة", "tr": "Amin maktabah", "id": "Pustakawan"},
        {"en": "Researcher", "ar": "باحث", "tr": "Bahith", "id": "Peneliti"},
        {"en": "Entrepreneur", "ar": "رائد أعمال", "tr": "Ra'id a'mal", "id": "Wirausaha"},
    ],
    "question_words.json": [
        {"en": "How far", "ar": "كم يبعد", "tr": "Kam yab'ud", "id": "Seberapa jauh"},
        {"en": "How old", "ar": "كم عمرك", "tr": "Kam 'umruka", "id": "Berapa umur"},
        {"en": "How high", "ar": "كم الارتفاع", "tr": "Kam al-irtifa'", "id": "Seberapa tinggi"},
        {"en": "How wide", "ar": "كم العرض", "tr": "Kam al-'ard", "id": "Seberapa lebar"},
        {"en": "What kind", "ar": "أي نوع", "tr": "Ayy naw'", "id": "Jenis apa"},
        {"en": "For what", "ar": "لأي شيء", "tr": "Li-ayy shay'", "id": "Untuk apa"},
        {"en": "By whom", "ar": "بواسطة من", "tr": "Biwasitat man", "id": "Oleh siapa"},
        {"en": "Under what", "ar": "تحت ماذا", "tr": "Taht madha", "id": "Di bawah apa"},
        {"en": "After what", "ar": "بعد ماذا", "tr": "Ba'da madha", "id": "Setelah apa"},
        {"en": "Before what", "ar": "قبل ماذا", "tr": "Qabla madha", "id": "Sebelum apa"},
    ],
    "transportation.json": [
        {"en": "Seat belt", "ar": "حزام الأمان", "tr": "Hizam al-aman", "id": "Sabuk pengaman"},
        {"en": "Helmet", "ar": "خوذة", "tr": "Khudhah", "id": "Helm"},
        {"en": "Pedal", "ar": "دواسة", "tr": "Dawwasah", "id": "Pedal"},
        {"en": "Steering wheel", "ar": "عجلة القيادة", "tr": "Ajlat al-qiyadah", "id": "Setir"},
        {"en": "Engine", "ar": "محرك", "tr": "Muharrik", "id": "Mesin"},
        {"en": "Brake", "ar": "فرامل", "tr": "Faramil", "id": "Rem"},
        {"en": "License plate", "ar": "لوحة الأرقام", "tr": "Lawhat al-arqam", "id": "Plat nomor"},
        {"en": "Toll road", "ar": "طريق برسوم", "tr": "Tariq birusum", "id": "Jalan tol"},
        {"en": "Crosswalk", "ar": "ممر المشاة", "tr": "Mamarr al-mushah", "id": "Zebra cross"},
        {"en": "Public transport", "ar": "وسائل النقل العام", "tr": "Wasa'il an-naql al-'amm", "id": "Transportasi umum"},
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
