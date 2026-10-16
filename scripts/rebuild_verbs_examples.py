from __future__ import annotations

import json
import math
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "assets" / "data" / "categories" / "verbs_2000_examples.json"
SOURCE_FILES = [
    ROOT / "assets" / "data" / "categories" / "verbs_common.json",
    ROOT / "assets" / "data" / "categories" / "verbs_regular.json",
    ROOT / "assets" / "data" / "categories" / "verbs_irregular.json",
    ROOT / "assets" / "data" / "categories" / "verbs_irregular_full.json",
]
TARGET_COUNT = 10_000

# Context sets keep the generated examples varied while remaining simple enough
# to work with most verbs in the source lists.
PRESENT_TIMES = [
    ("every day", "setiap hari", "كل يوم"),
    ("every morning", "setiap pagi", "كل صباح"),
    ("often", "sering", "غالبا"),
    ("carefully", "dengan hati-hati", "بعناية"),
    ("quickly", "dengan cepat", "بسرعة"),
    ("well", "dengan baik", "جيدا"),
    ("when needed", "saat diperlukan", "عند الحاجة"),
    ("with confidence", "dengan percaya diri", "بثقة"),
    ("again", "lagi", "مرة أخرى"),
    ("with his friends", "bersama teman-temannya", "مع أصدقائه"),
]

PAST_TIMES = [
    ("yesterday", "kemarin", "أمس"),
    ("last night", "tadi malam", "الليلة الماضية"),
    ("this morning", "tadi pagi", "هذا الصباح"),
    ("last week", "minggu lalu", "الأسبوع الماضي"),
    ("earlier", "tadi", "قبل قليل"),
]

PERFECT_TIMES = [
    ("already", "sudah", "بالفعل"),
    ("this week", "minggu ini", "هذا الأسبوع"),
    ("today", "hari ini", "اليوم"),
    ("many times", "berkali-kali", "مرات كثيرة"),
    ("recently", "baru-baru ini", "مؤخرا"),
]

SPECIAL_EXAMPLES = {
    "be": {
        "ex_en": "He is at home every day.",
        "ex_en2": "He was at home yesterday.",
        "ex_en3": "He has been at home many times.",
        "ex_id": "Dia berada di rumah setiap hari.",
        "ex_ar": "هو في البيت كل يوم.",
    },
    "become": {
        "ex_en": "He becomes calm very quickly.",
        "ex_en2": "He became calm yesterday.",
        "ex_en3": "He has become calmer recently.",
        "ex_id": "Dia menjadi tenang dengan cepat.",
        "ex_ar": "هو يصبح هادئا بسرعة.",
    },
    "begin": {
        "ex_en": "He begins the lesson every morning.",
        "ex_en2": "He began the lesson yesterday.",
        "ex_en3": "He has begun the lesson already.",
        "ex_id": "Dia memulai pelajaran setiap pagi.",
        "ex_ar": "هو يبدأ الدرس كل صباح.",
    },
    "have": {
        "ex_en": "He has a book at school every day.",
        "ex_en2": "He had a book at school yesterday.",
        "ex_en3": "He has had a book many times.",
        "ex_id": "Dia memiliki sebuah buku di sekolah setiap hari.",
        "ex_ar": "هو يملك كتابا في المدرسة كل يوم.",
    },
    "do": {
        "ex_en": "He does his work at home every day.",
        "ex_en2": "He did his work at home yesterday.",
        "ex_en3": "He has done his work many times.",
        "ex_id": "Dia mengerjakan pekerjaannya di rumah setiap hari.",
        "ex_ar": "هو يفعل عمله في البيت كل يوم.",
    },
    "say": {
        "ex_en": "He says that clearly every day.",
        "ex_en2": "He said that clearly yesterday.",
        "ex_en3": "He has said that many times.",
        "ex_id": "Dia mengatakan itu dengan jelas setiap hari.",
        "ex_ar": "هو يقول ذلك بوضوح كل يوم.",
    },
    "go": {
        "ex_en": "He goes to school every morning.",
        "ex_en2": "He went to school yesterday.",
        "ex_en3": "He has gone to school many times.",
        "ex_id": "Dia pergi ke sekolah setiap pagi.",
        "ex_ar": "هو يذهب إلى المدرسة كل صباح.",
    },
    "get": {
        "ex_en": "He gets good results at school every week.",
        "ex_en2": "He got good results yesterday.",
        "ex_en3": "He has gotten good results many times.",
        "ex_id": "Dia mendapatkan hasil yang baik di sekolah setiap minggu.",
        "ex_ar": "هو يحصل على نتائج جيدة في المدرسة كل أسبوع.",
    },
    "make": {
        "ex_en": "He makes food at home every evening.",
        "ex_en2": "He made food at home yesterday.",
        "ex_en3": "He has made food many times.",
        "ex_id": "Dia membuat makanan di rumah setiap sore.",
        "ex_ar": "هو يصنع الطعام في البيت كل مساء.",
    },
    "know": {
        "ex_en": "He knows the answer in class today.",
        "ex_en2": "He knew the answer yesterday.",
        "ex_en3": "He has known the answer for a long time.",
        "ex_id": "Dia mengetahui jawabannya di kelas hari ini.",
        "ex_ar": "هو يعرف الجواب في الفصل اليوم.",
    },
    "think": {
        "ex_en": "He thinks carefully before class every day.",
        "ex_en2": "He thought carefully yesterday.",
        "ex_en3": "He has thought about it many times.",
        "ex_id": "Dia berpikir dengan hati-hati sebelum kelas setiap hari.",
        "ex_ar": "هو يفكر بعناية قبل الدرس كل يوم.",
    },
    "take": {
        "ex_en": "He takes the book to class every day.",
        "ex_en2": "He took the book yesterday.",
        "ex_en3": "He has taken the book many times.",
        "ex_id": "Dia membawa buku itu ke kelas setiap hari.",
        "ex_ar": "هو يأخذ الكتاب إلى الفصل كل يوم.",
    },
    "see": {
        "ex_en": "He sees his teacher at school every day.",
        "ex_en2": "He saw his teacher yesterday.",
        "ex_en3": "He has seen his teacher today.",
        "ex_id": "Dia melihat gurunya di sekolah setiap hari.",
        "ex_ar": "هو يرى معلمه في المدرسة كل يوم.",
    },
    "come": {
        "ex_en": "He comes to class every morning.",
        "ex_en2": "He came to class yesterday.",
        "ex_en3": "He has come to class many times.",
        "ex_id": "Dia datang ke kelas setiap pagi.",
        "ex_ar": "هو يأتي إلى الفصل كل صباح.",
    },
    "choose": {
        "ex_en": "He chooses carefully every time.",
        "ex_en2": "He chose quickly yesterday.",
        "ex_en3": "He has chosen well many times.",
        "ex_id": "Dia memilih dengan hati-hati setiap kali.",
        "ex_ar": "هو يختار بعناية في كل مرة.",
    },
    "cost": {
        "ex_en": "This book costs a lot today.",
        "ex_en2": "This book cost a lot yesterday.",
        "ex_en3": "This book has cost a lot this week.",
        "ex_id": "Buku ini berharga mahal hari ini.",
        "ex_ar": "هذا الكتاب يكلف كثيرا اليوم.",
    },
    "deal": {
        "ex_en": "He deals with customers every day.",
        "ex_en2": "He dealt with that problem yesterday.",
        "ex_en3": "He has dealt with similar problems before.",
        "ex_id": "Dia berurusan dengan pelanggan setiap hari.",
        "ex_ar": "هو يتعامل مع الزبائن كل يوم.",
    },
    "dream": {
        "ex_en": "He dreams about his future every night.",
        "ex_en2": "He dreamed about it last night.",
        "ex_en3": "He has dreamed about it many times.",
        "ex_id": "Dia bermimpi tentang masa depannya setiap malam.",
        "ex_ar": "هو يحلم بمستقبله كل ليلة.",
    },
    "feel": {
        "ex_en": "He feels better today.",
        "ex_en2": "He felt tired yesterday.",
        "ex_en3": "He has felt this before.",
        "ex_id": "Dia merasa lebih baik hari ini.",
        "ex_ar": "هو يشعر بتحسن اليوم.",
    },
    "find": {
        "ex_en": "He finds useful books at the library.",
        "ex_en2": "He found his key yesterday.",
        "ex_en3": "He has found the answer already.",
        "ex_id": "Dia menemukan buku-buku bermanfaat di perpustakaan.",
        "ex_ar": "هو يجد كتبا مفيدة في المكتبة.",
    },
    "forget": {
        "ex_en": "He forgets small things sometimes.",
        "ex_en2": "He forgot my name yesterday.",
        "ex_en3": "He has forgotten that lesson already.",
        "ex_id": "Dia kadang melupakan hal-hal kecil.",
        "ex_ar": "هو ينسى الأشياء الصغيرة أحيانا.",
    },
    "forgive": {
        "ex_en": "He forgives his friend sincerely.",
        "ex_en2": "He forgave his friend yesterday.",
        "ex_en3": "He has forgiven him already.",
        "ex_id": "Dia memaafkan temannya dengan tulus.",
        "ex_ar": "هو يغفر لصديقه بإخلاص.",
    },
    "lay": {
        "ex_en": "He lays the book on the table.",
        "ex_en2": "He laid the book there yesterday.",
        "ex_en3": "He has laid the book there already.",
        "ex_id": "Dia meletakkan buku itu di atas meja.",
        "ex_ar": "هو يضع الكتاب على الطاولة.",
    },
    "want": {
        "ex_en": "He wants water at the restaurant.",
        "ex_en2": "He wanted water yesterday.",
        "ex_en3": "He has wanted water since morning.",
        "ex_id": "Dia ingin air di restoran.",
        "ex_ar": "هو يريد الماء في المطعم.",
    },
    "ride": {
        "ex_en": "He rides a bike to school every day.",
        "ex_en2": "He rode a bike yesterday.",
        "ex_en3": "He has ridden that bike many times.",
        "ex_id": "Dia mengendarai sepeda ke sekolah setiap hari.",
        "ex_ar": "هو يركب دراجة إلى المدرسة كل يوم.",
    },
    "spend": {
        "ex_en": "He spends time with his family every evening.",
        "ex_en2": "He spent time with them yesterday.",
        "ex_en3": "He has spent a lot of time there.",
        "ex_id": "Dia menghabiskan waktu bersama keluarganya setiap sore.",
        "ex_ar": "هو ينفق وقته مع أسرته كل مساء.",
    },
}


def load_json(path: Path) -> list[dict]:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def display_en(value: str) -> str:
    return " ".join(part[:1].upper() + part[1:] for part in value.strip().split())


def primary_id_gloss(value: str) -> str:
    return str(value).split("/")[0].strip().lower()


def first_variant(value: str) -> str:
    return str(value).split("/")[0].strip()


def present_third_person(verb: str) -> str:
    if verb == "be":
        return "is"
    if verb == "have":
        return "has"
    if verb == "do":
        return "does"
    if verb == "go":
        return "goes"
    if verb.endswith("y") and len(verb) > 1 and verb[-2] not in "aeiou":
        return f"{verb[:-1]}ies"
    if verb.endswith(("s", "sh", "ch", "x", "z", "o")):
        return f"{verb}es"
    return f"{verb}s"


def merge_verbs() -> list[dict]:
    merged: dict[str, dict] = {}
    for source in SOURCE_FILES:
        for item in load_json(source):
            v1 = str(item.get("v1") or item.get("en") or "").strip().lower()
            if not v1:
                continue
            if v1 not in merged:
                merged[v1] = {
                    "en": display_en(str(item.get("en") or v1)),
                    "ar": str(item.get("ar") or "").strip(),
                    "tr": str(item.get("tr") or "").strip(),
                    "id": str(item.get("id") or "").strip(),
                    "v1": str(item.get("v1") or v1).strip().lower(),
                    "v2": str(item.get("v2") or "").strip(),
                    "v3": str(item.get("v3") or "").strip(),
                }
            else:
                current = merged[v1]
                for key in ("en", "ar", "tr", "id", "v2", "v3"):
                    if not current.get(key) and item.get(key):
                        current[key] = str(item.get(key)).strip()
    return sorted(
        [item for item in merged.values() if item["ar"] and item["id"] and item["tr"]],
        key=lambda item: item["v1"],
    )


def build_examples(verb: dict, example_index: int) -> dict[str, str]:
    special = SPECIAL_EXAMPLES.get(verb["v1"])
    if special:
        return dict(special)

    present_en, present_id, present_ar = PRESENT_TIMES[example_index % len(PRESENT_TIMES)]
    past_en, past_id, _ = PAST_TIMES[example_index % len(PAST_TIMES)]
    perfect_en, perfect_id, _ = PERFECT_TIMES[example_index % len(PERFECT_TIMES)]

    v1 = verb["v1"]
    v2 = first_variant(verb["v2"] or v1)
    v3 = first_variant(verb["v3"] or v1)
    id_gloss = primary_id_gloss(verb["id"])

    ex_en = f"He {present_third_person(v1)} {present_en}."
    ex_en2 = f"He {v2} {past_en}."
    ex_en3 = f"He has {v3} {perfect_en}."
    ex_id = f"Dia {id_gloss} {present_id}."
    ex_ar = f"هو {verb['ar']} {present_ar}."

    return {
        "ex_en": ex_en,
        "ex_en2": ex_en2,
        "ex_en3": ex_en3,
        "ex_id": ex_id,
        "ex_ar": ex_ar,
    }


def build_entries() -> list[dict]:
    verbs = merge_verbs()
    if not verbs:
        raise RuntimeError("Tidak ada verba valid yang bisa dipakai.")

    packs_needed = math.ceil(TARGET_COUNT / len(verbs))
    results: list[dict] = []

    for pack_index in range(packs_needed):
        for verb_index, verb in enumerate(verbs):
            example_index = pack_index * len(verbs) + verb_index
            item = dict(verb)
            item.update(build_examples(verb, example_index))
            results.append(item)
            if len(results) >= TARGET_COUNT:
                return results
    return results


def main() -> None:
    entries = build_entries()
    TARGET.write_text(json.dumps(entries, ensure_ascii=False, indent=4) + "\n", encoding="utf-8")
    print(f"generated={len(entries)}")


if __name__ == "__main__":
    main()
