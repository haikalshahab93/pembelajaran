import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "places.json": [
        {"en": "Park", "ar": "حديقة", "tr": "Hadiqah", "id": "Taman"},
        {"en": "Bank", "ar": "بنك", "tr": "Bank", "id": "Bank"},
        {"en": "Restaurant", "ar": "مطعم", "tr": "Mat'am", "id": "Restoran"},
        {"en": "Airport", "ar": "مطار", "tr": "Matar", "id": "Bandara"},
        {"en": "Beach", "ar": "شاطئ", "tr": "Shati'", "id": "Pantai"},
        {"en": "Bridge", "ar": "جسر", "tr": "Jisr", "id": "Jembatan"},
        {"en": "Mountain", "ar": "جبل", "tr": "Jabal", "id": "Gunung"},
        {"en": "Garden", "ar": "حديقة", "tr": "Hadiqah", "id": "Kebun"},
        {"en": "Post office", "ar": "مكتب البريد", "tr": "Maktab al-barid", "id": "Kantor pos"},
        {"en": "Museum", "ar": "متحف", "tr": "Mathaf", "id": "Museum"},
    ],
    "transportation.json": [
        {"en": "Truck", "ar": "شاحنة", "tr": "Shahinah", "id": "Truk"},
        {"en": "Van", "ar": "شاحنة صغيرة", "tr": "Shahinah saghirah", "id": "Van"},
        {"en": "Boat", "ar": "قارب", "tr": "Qarib", "id": "Perahu"},
        {"en": "Helicopter", "ar": "مروحية", "tr": "Marwahiyyah", "id": "Helikopter"},
        {"en": "Subway", "ar": "مترو", "tr": "Mitru", "id": "Kereta bawah tanah"},
        {"en": "Tram", "ar": "ترام", "tr": "Tram", "id": "Trem"},
        {"en": "Traffic light", "ar": "إشارة المرور", "tr": "Isharat al-murur", "id": "Lampu lalu lintas"},
        {"en": "Fuel", "ar": "وقود", "tr": "Wuqud", "id": "Bahan bakar"},
        {"en": "Driver", "ar": "سائق", "tr": "Sa'iq", "id": "Pengemudi"},
        {"en": "Passenger", "ar": "راكب", "tr": "Rakib", "id": "Penumpang"},
    ],
    "clothing.json": [
        {"en": "T-shirt", "ar": "قميص قصير", "tr": "Qamis qasir", "id": "Kaos"},
        {"en": "Sweater", "ar": "كنزة", "tr": "Kunzah", "id": "Sweater"},
        {"en": "Gloves", "ar": "قفازات", "tr": "Qaffazat", "id": "Sarung tangan"},
        {"en": "Belt", "ar": "حزام", "tr": "Hizam", "id": "Ikat pinggang"},
        {"en": "Sandals", "ar": "صندل", "tr": "Sandal", "id": "Sandal"},
        {"en": "Boots", "ar": "جزمة", "tr": "Jazmah", "id": "Sepatu bot"},
        {"en": "Tie", "ar": "ربطة عنق", "tr": "Ribtat 'unuq", "id": "Dasi"},
        {"en": "Uniform", "ar": "زي موحد", "tr": "Ziyy muwahhad", "id": "Seragam"},
        {"en": "Pocket", "ar": "جيب", "tr": "Jayb", "id": "Saku"},
        {"en": "Button", "ar": "زر", "tr": "Zirr", "id": "Kancing"},
    ],
    "colors.json": [
        {"en": "Gray", "ar": "رمادي", "tr": "Ramadi", "id": "Abu-abu"},
        {"en": "Golden", "ar": "ذهبي", "tr": "Dhahabi", "id": "Emas"},
        {"en": "Silver", "ar": "فضي", "tr": "Fiddi", "id": "Perak"},
        {"en": "Dark blue", "ar": "أزرق داكن", "tr": "Azraq dakin", "id": "Biru tua"},
        {"en": "Light blue", "ar": "أزرق فاتح", "tr": "Azraq fatih", "id": "Biru muda"},
        {"en": "Dark green", "ar": "أخضر داكن", "tr": "Akhdar dakin", "id": "Hijau tua"},
        {"en": "Light green", "ar": "أخضر فاتح", "tr": "Akhdar fatih", "id": "Hijau muda"},
        {"en": "Beige", "ar": "بيج", "tr": "Beij", "id": "Krem"},
        {"en": "Turquoise", "ar": "فيروزي", "tr": "Fayruzi", "id": "Turkuois"},
        {"en": "Maroon", "ar": "خمري", "tr": "Khamri", "id": "Merah marun"},
    ],
    "emotions.json": [
        {"en": "Proud", "ar": "فخور", "tr": "Fakhur", "id": "Bangga"},
        {"en": "Ashamed", "ar": "خجلان", "tr": "Khajlan", "id": "Malu"},
        {"en": "Confused", "ar": "مرتبك", "tr": "Murtabik", "id": "Bingung"},
        {"en": "Lonely", "ar": "وحيد", "tr": "Wahid", "id": "Kesepian"},
        {"en": "Jealous", "ar": "غيور", "tr": "Ghayur", "id": "Cemburu"},
        {"en": "Hopeful", "ar": "متفائل", "tr": "Mutafa'il", "id": "Penuh harapan"},
        {"en": "Embarrassed", "ar": "محرج", "tr": "Muhraj", "id": "Malu tersipu"},
        {"en": "Relieved", "ar": "مرتاح", "tr": "Murtah", "id": "Lega"},
        {"en": "Curious", "ar": "فضولي", "tr": "Fuduli", "id": "Penasaran"},
        {"en": "Bored", "ar": "ضجر", "tr": "Dajar", "id": "Bosan"},
    ],
    "professions.json": [
        {"en": "Architect", "ar": "مهندس معماري", "tr": "Muhandis mi'mari", "id": "Arsitek"},
        {"en": "Programmer", "ar": "مبرمج", "tr": "Mubarmij", "id": "Programer"},
        {"en": "Journalist", "ar": "صحفي", "tr": "Sahafi", "id": "Jurnalis"},
        {"en": "Photographer", "ar": "مصور", "tr": "Musawwir", "id": "Fotografer"},
        {"en": "Lawyer", "ar": "محام", "tr": "Muhamin", "id": "Pengacara"},
        {"en": "Chef", "ar": "طاه", "tr": "Tahin", "id": "Koki"},
        {"en": "Pilot", "ar": "طيار", "tr": "Tayyar", "id": "Pilot"},
        {"en": "Dentist", "ar": "طبيب أسنان", "tr": "Tabib asnan", "id": "Dokter gigi"},
        {"en": "Tailor", "ar": "خياط", "tr": "Khayyat", "id": "Penjahit"},
        {"en": "Mechanic", "ar": "ميكانيكي", "tr": "Mikaniki", "id": "Montir"},
    ],
    "food_drinks.json": [
        {"en": "Milk", "ar": "حليب", "tr": "Halib", "id": "Susu"},
        {"en": "Cheese", "ar": "جبن", "tr": "Jubn", "id": "Keju"},
        {"en": "Egg", "ar": "بيض", "tr": "Bayd", "id": "Telur"},
        {"en": "Soup", "ar": "شوربة", "tr": "Shurbah", "id": "Sup"},
        {"en": "Salad", "ar": "سلطة", "tr": "Salatah", "id": "Salad"},
        {"en": "Sugar", "ar": "سكر", "tr": "Sukkar", "id": "Gula"},
        {"en": "Salt", "ar": "ملح", "tr": "Milh", "id": "Garam"},
        {"en": "Butter", "ar": "زبدة", "tr": "Zubdah", "id": "Mentega"},
        {"en": "Cake", "ar": "كعكة", "tr": "Ka'kah", "id": "Kue"},
        {"en": "Ice cream", "ar": "آيس كريم", "tr": "Ays كريم", "id": "Es krim"},
    ],
    "question_words.json": [
        {"en": "With whom", "ar": "مع من", "tr": "Ma'a man", "id": "Dengan siapa"},
        {"en": "About what", "ar": "عن ماذا", "tr": "'An madha", "id": "Tentang apa"},
        {"en": "Since when", "ar": "منذ متى", "tr": "Mundhu mata", "id": "Sejak kapan"},
        {"en": "Until when", "ar": "حتى متى", "tr": "Hatta mata", "id": "Sampai kapan"},
        {"en": "Which one", "ar": "أي واحد", "tr": "Ayy wahid", "id": "Yang mana satu"},
        {"en": "How long", "ar": "كم من الوقت", "tr": "Kam min al-waqt", "id": "Berapa lama"},
        {"en": "How often", "ar": "كم مرة", "tr": "Kam marrah", "id": "Seberapa sering"},
        {"en": "At what time", "ar": "في أي وقت", "tr": "Fi ayyi waqt", "id": "Jam berapa"},
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
