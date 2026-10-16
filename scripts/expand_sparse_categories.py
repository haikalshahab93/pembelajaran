import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "citrus_fruits.json": [
        {"en": "Mandarin", "ar": "يوسفي", "id": "jeruk mandarin", "emoji": "🍊"},
        {"en": "Grapefruit", "ar": "جريب فروت", "id": "grapefruit", "emoji": "🍊"},
        {"en": "Pomelo", "ar": "بوملي", "id": "jeruk bali", "emoji": "🍊"},
        {"en": "Clementine", "ar": "كلمنتينا", "id": "jeruk clementine", "emoji": "🍊"},
        {"en": "Kumquat", "ar": "كمكوات", "id": "kumquat", "emoji": "🍊"},
        {"en": "Citron", "ar": "أترج", "id": "sitrun", "emoji": "🍋"},
        {"en": "Calamansi", "ar": "كالامانسي", "id": "jeruk kalamansi", "emoji": "🍋"},
    ],
    "domestic_birds.json": [
        {"en": "Duck", "ar": "بطة", "id": "bebek", "emoji": "🦆"},
        {"en": "Goose", "ar": "إوزة", "id": "angsa", "emoji": "🪿"},
        {"en": "Quail", "ar": "سمان", "id": "burung puyuh", "emoji": "🐦"},
        {"en": "Guinea Fowl", "ar": "دجاج غينيا", "id": "ayam mutiara", "emoji": "🐦"},
        {"en": "Pigeon", "ar": "حمامة", "id": "merpati", "emoji": "🕊️"},
        {"en": "Muscovy Duck", "ar": "بط مسكوفي", "id": "entok", "emoji": "🦆"},
        {"en": "Hen", "ar": "دجاجة بياضة", "id": "ayam betina", "emoji": "🐔"},
    ],
    "turtles_tortoises.json": [
        {"en": "Snapping Turtle", "ar": "سلحفاة نهّاشة", "id": "kura-kura penggigit", "emoji": "🐢"},
        {"en": "Softshell Turtle", "ar": "سلحفاة رخوة", "id": "labi-labi", "emoji": "🐢"},
        {"en": "Box Turtle", "ar": "سلحفاة صندوقية", "id": "kura-kura kotak", "emoji": "🐢"},
        {"en": "Green Sea Turtle", "ar": "سلحفاة بحرية خضراء", "id": "penyu hijau", "emoji": "🐢"},
        {"en": "Hawksbill Turtle", "ar": "سلحفاة منقار الصقر", "id": "penyu sisik", "emoji": "🐢"},
        {"en": "Leatherback Turtle", "ar": "سلحفاة جلدية الظهر", "id": "penyu belimbing", "emoji": "🐢"},
        {"en": "Red-eared Slider", "ar": "سلحفاة حمراء الأذن", "id": "kura-kura telinga merah", "emoji": "🐢"},
    ],
    "unique_birds.json": [
        {"en": "Flamingo", "ar": "نحام", "id": "flamingo", "emoji": "🦩"},
        {"en": "Toucan", "ar": "طوقان", "id": "tukan", "emoji": "🐦"},
        {"en": "Hornbill", "ar": "أبو قرن", "id": "rangkong", "emoji": "🐦"},
        {"en": "Ostrich", "ar": "نعامة", "id": "burung unta", "emoji": "🪶"},
        {"en": "Penguin", "ar": "بطريق", "id": "pinguin", "emoji": "🐧"},
        {"en": "Hoopoe", "ar": "هدهد", "id": "burung hudhud", "emoji": "🐦"},
        {"en": "Cassowary", "ar": "كاسواري", "id": "kasuari", "emoji": "🐦"},
    ],
    "cephalopods_jellyfish.json": [
        {"en": "Cuttlefish", "ar": "حبار", "id": "sotong", "emoji": "🦑"},
        {"en": "Nautilus", "ar": "نوتيلوس", "id": "nautilus", "emoji": "🐚"},
        {"en": "Moon Jellyfish", "ar": "قنديل القمر", "id": "ubur-ubur bulan", "emoji": "🎐"},
        {"en": "Box Jellyfish", "ar": "قنديل صندوقي", "id": "ubur-ubur kotak", "emoji": "🎐"},
        {"en": "Blue Jellyfish", "ar": "قنديل أزرق", "id": "ubur-ubur biru", "emoji": "🎐"},
        {"en": "Vampire Squid", "ar": "حبار مصاص الدماء", "id": "cumi vampir", "emoji": "🦑"},
    ],
    "crocodilians.json": [
        {"en": "American Alligator", "ar": "التمساح الأمريكي", "id": "aligato amerika", "emoji": "🐊"},
        {"en": "Nile Crocodile", "ar": "تمساح النيل", "id": "buaya nil", "emoji": "🐊"},
        {"en": "Saltwater Crocodile", "ar": "تمساح المياه المالحة", "id": "buaya muara", "emoji": "🐊"},
        {"en": "Black Caiman", "ar": "كايمان أسود", "id": "kaiman hitam", "emoji": "🐊"},
        {"en": "False Gharial", "ar": "غريال كاذب", "id": "buaya senyulong", "emoji": "🐊"},
        {"en": "Dwarf Crocodile", "ar": "تمساح قزم", "id": "buaya kerdil", "emoji": "🐊"},
    ],
    "wetland_birds.json": [
        {"en": "Heron", "ar": "مالك الحزين", "id": "burung kuntul besar", "emoji": "🐦"},
        {"en": "Egret", "ar": "بلشون", "id": "kuntul", "emoji": "🐦"},
        {"en": "Stork", "ar": "لقلق", "id": "bangau", "emoji": "🐦"},
        {"en": "Ibis", "ar": "أبو منجل", "id": "ibis", "emoji": "🐦"},
        {"en": "Spoonbill", "ar": "أبو ملعقة", "id": "burung paruh sendok", "emoji": "🐦"},
        {"en": "Moorhen", "ar": "دجاجة الماء", "id": "mandar rawa", "emoji": "🐦"},
        {"en": "Bittern", "ar": "واق", "id": "burung blongkeng", "emoji": "🐦"},
    ],
    "amphibians.json": [
        {"en": "Tree Frog", "ar": "ضفدع الشجر", "id": "katak pohon", "emoji": "🐸"},
        {"en": "Bullfrog", "ar": "ضفدع ثور", "id": "katak banteng", "emoji": "🐸"},
        {"en": "Poison Dart Frog", "ar": "ضفدع السهم السام", "id": "katak panah beracun", "emoji": "🐸"},
        {"en": "Tadpole", "ar": "شرغوف", "id": "kecebong", "emoji": "🐸"},
        {"en": "Giant Salamander", "ar": "سمندر عملاق", "id": "salamander raksasa", "emoji": "🦎"},
    ],
    "berries_grapes.json": [
        {"en": "Blackberry", "ar": "توت أسود", "id": "blackberry", "emoji": "🫐"},
        {"en": "Cranberry", "ar": "توت بري", "id": "cranberry", "emoji": "🫐"},
        {"en": "Mulberry", "ar": "توت", "id": "murbei", "emoji": "🫐"},
        {"en": "Gooseberry", "ar": "عنب الثعلب", "id": "gooseberry", "emoji": "🫐"},
        {"en": "Red Currant", "ar": "كشمش أحمر", "id": "kismis merah", "emoji": "🫐"},
        {"en": "Black Currant", "ar": "كشمش أسود", "id": "kismis hitam", "emoji": "🫐"},
    ],
    "birds_of_prey.json": [
        {"en": "Kite", "ar": "حدأة", "id": "elang alap", "emoji": "🦅"},
        {"en": "Condor", "ar": "كندور", "id": "kondor", "emoji": "🦅"},
        {"en": "Harrier", "ar": "مرزة", "id": "elang rawa", "emoji": "🦅"},
        {"en": "Osprey", "ar": "عقاب السمك", "id": "elang ikan", "emoji": "🦅"},
        {"en": "Buzzard", "ar": "حوام", "id": "elang tikus", "emoji": "🦅"},
    ],
    "lizards.json": [
        {"en": "Monitor Lizard", "ar": "ورل", "id": "biawak", "emoji": "🦎"},
        {"en": "Skink", "ar": "سقنقور", "id": "skink", "emoji": "🦎"},
        {"en": "Agama", "ar": "أغاما", "id": "agama", "emoji": "🦎"},
        {"en": "Basilisk", "ar": "باسيليسك", "id": "basilisk", "emoji": "🦎"},
        {"en": "Frilled Lizard", "ar": "سحلية مطوقة", "id": "kadal berjumbai", "emoji": "🦎"},
    ],
    "marsupials.json": [
        {"en": "Opossum", "ar": "أبوسوم", "id": "oposum", "emoji": "🐾"},
        {"en": "Bandicoot", "ar": "بانديكوت", "id": "bandikut", "emoji": "🐾"},
        {"en": "Quokka", "ar": "كوكا", "id": "quokka", "emoji": "🐾"},
        {"en": "Tree Kangaroo", "ar": "كنغر الشجر", "id": "kanguru pohon", "emoji": "🦘"},
        {"en": "Bilby", "ar": "بيلبي", "id": "bilby", "emoji": "🐾"},
    ],
    "primates.json": [
        {"en": "Baboon", "ar": "بابون", "id": "babun", "emoji": "🐒"},
        {"en": "Macaque", "ar": "مكاك", "id": "macaque", "emoji": "🐒"},
        {"en": "Gibbon", "ar": "جيبون", "id": "siamang", "emoji": "🐒"},
        {"en": "Tarsier", "ar": "ترسير", "id": "tarsius", "emoji": "🐒"},
        {"en": "Capuchin", "ar": "قرد الكبوشي", "id": "monyet kapusin", "emoji": "🐒"},
    ],
    "sharks_rays.json": [
        {"en": "Whale Shark", "ar": "قرش الحوت", "id": "hiu paus", "emoji": "🦈"},
        {"en": "Tiger Shark", "ar": "قرش النمر", "id": "hiu macan", "emoji": "🦈"},
        {"en": "Bull Shark", "ar": "قرش الثور", "id": "hiu banteng", "emoji": "🦈"},
        {"en": "Eagle Ray", "ar": "شيطان البحر النسري", "id": "pari elang", "emoji": "🐟"},
        {"en": "Sawfish", "ar": "سمك المنشار", "id": "ikan gergaji", "emoji": "🐟"},
    ],
    "snakes.json": [
        {"en": "Anaconda", "ar": "أناكوندا", "id": "anakonda", "emoji": "🐍"},
        {"en": "Boa", "ar": "بوا", "id": "boa", "emoji": "🐍"},
        {"en": "Mamba", "ar": "مامبا", "id": "mamba", "emoji": "🐍"},
        {"en": "Corn Snake", "ar": "ثعبان الذرة", "id": "ular jagung", "emoji": "🐍"},
        {"en": "Sea Snake", "ar": "ثعبان البحر", "id": "ular laut", "emoji": "🐍"},
    ],
    "giant_mammals.json": [
        {"en": "Giraffe", "ar": "زرافة", "id": "jerapah", "emoji": "🦒"},
        {"en": "Blue Whale", "ar": "حوت أزرق", "id": "paus biru", "emoji": "🐋"},
        {"en": "Walrus", "ar": "فظ", "id": "walrus", "emoji": "🦭"},
        {"en": "Mammoth", "ar": "ماموث", "id": "mamut", "emoji": "🐘"},
    ],
    "big_cats.json": [
        {"en": "Puma", "ar": "بوما", "id": "puma", "emoji": "🐆"},
        {"en": "Panther", "ar": "فهد أسود", "id": "panther hitam", "emoji": "🐆"},
        {"en": "Clouded Leopard", "ar": "فهد غائم", "id": "macan dahan", "emoji": "🐆"},
    ],
    "pet_city_birds.json": [
        {"en": "Canary", "ar": "كناري", "id": "kenari", "emoji": "🐦"},
        {"en": "Budgerigar", "ar": "ببغاء الدرة", "id": "parkit", "emoji": "🦜"},
        {"en": "Cockatiel", "ar": "كوكاتيل", "id": "kokatil", "emoji": "🦜"},
        {"en": "Lovebird", "ar": "طائر الحب", "id": "lovebird", "emoji": "🦜"},
    ],
    "orchard_fruits.json": [
        {"en": "Quince", "ar": "سفرجل", "id": "quince", "emoji": "🍏"},
        {"en": "Persimmon", "ar": "كاكي", "id": "kesemek", "emoji": "🍊"},
        {"en": "Nectarine", "ar": "نكتارين", "id": "nektarin", "emoji": "🍑"},
    ],
    "tropical_fruits.json": [
        {"en": "Guava", "ar": "جوافة", "id": "jambu biji", "emoji": "🍐"},
        {"en": "Passion Fruit", "ar": "باشن فروت", "id": "markisa", "emoji": "🍈"},
        {"en": "Dragon Fruit", "ar": "فاكهة التنين", "id": "buah naga", "emoji": "🐉"},
    ],
    "water_birds.json": [
        {"en": "Cormorant", "ar": "غاق", "id": "burung pecuk", "emoji": "🐦"},
        {"en": "Gull", "ar": "نورس", "id": "camar", "emoji": "🐦"},
        {"en": "Tern", "ar": "خرشنة", "id": "dara laut", "emoji": "🐦"},
    ],
    "weekdays.json": [
        {"en": "Weekday", "ar": "يوم عمل", "id": "hari kerja"},
        {"en": "Weekend", "ar": "عطلة نهاية الأسبوع", "id": "akhir pekan"},
        {"en": "Holiday", "ar": "عطلة", "id": "hari libur"},
    ],
    "hoofed_mammals.json": [
        {"en": "Bison", "ar": "بيسون", "id": "bison", "emoji": "🦬"},
        {"en": "Yak", "ar": "ياك", "id": "yak", "emoji": "🐂"},
    ],
    "sea_fish.json": [
        {"en": "Sardine", "ar": "سردين", "id": "sarden", "emoji": "🐟"},
        {"en": "Mackerel", "ar": "إسقمري", "id": "makarel", "emoji": "🐟"},
    ],
    "shellfish_seafloor.json": [
        {"en": "Scallop", "ar": "محار مروحي", "id": "kerang scallop", "emoji": "🐚"},
        {"en": "Sea Cucumber", "ar": "خيار البحر", "id": "teripang", "emoji": "🌊"},
    ],
    "greetings.json": [
        {"en": "See you later", "ar": "أراك لاحقا", "tr": "Araka Lahiqan", "id": "Sampai nanti"},
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
        items = json.loads(path.read_text(encoding="utf-8"))
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
        if after < 10:
            raise ValueError(f"{filename} still has fewer than 10 entries")


if __name__ == "__main__":
    main()
