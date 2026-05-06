import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATEGORIES_DIR = ROOT / "assets" / "data" / "categories"


ADDITIONS = {
    "greetings.json": [
        {"en": "Good afternoon", "ar": "مساء الخير", "tr": "Masa' al-khayr", "id": "Selamat sore"},
        {"en": "Good night", "ar": "تصبح على خير", "tr": "Tusbih 'ala khayr", "id": "Selamat tidur"},
        {"en": "Nice to meet you", "ar": "سعيد بلقائك", "tr": "Sa'id biliqa'ik", "id": "Senang bertemu denganmu"},
        {"en": "Welcome", "ar": "أهلا وسهلا", "tr": "Ahlan wa sahlan", "id": "Selamat datang"},
        {"en": "Long time no see", "ar": "من زمان", "tr": "Min zaman", "id": "Sudah lama tidak bertemu"},
        {"en": "Have a nice day", "ar": "أتمنى لك يوما سعيدا", "tr": "Atamanna laka yawman sa'idan", "id": "Semoga harimu menyenangkan"},
        {"en": "Take care", "ar": "اعتن بنفسك", "tr": "I'tan binafsik", "id": "Jaga diri"},
        {"en": "See you tomorrow", "ar": "أراك غدا", "tr": "Araka ghadan", "id": "Sampai besok"},
        {"en": "Good luck", "ar": "حظا سعيدا", "tr": "Hazzan sa'idan", "id": "Semoga beruntung"},
        {"en": "Have a safe trip", "ar": "رحلة آمنة", "tr": "Rihlah aminah", "id": "Semoga perjalananmu aman"},
    ],
    "numbers.json": [
        {"en": "Eleven", "ar": "أحد عشر", "tr": "Ahada 'ashar", "id": "Sebelas"},
        {"en": "Twelve", "ar": "اثنا عشر", "tr": "Ithna 'ashar", "id": "Dua belas"},
        {"en": "Thirteen", "ar": "ثلاثة عشر", "tr": "Thalathata 'ashar", "id": "Tiga belas"},
        {"en": "Fourteen", "ar": "أربعة عشر", "tr": "Arba'ata 'ashar", "id": "Empat belas"},
        {"en": "Fifteen", "ar": "خمسة عشر", "tr": "Khamsata 'ashar", "id": "Lima belas"},
        {"en": "Sixteen", "ar": "ستة عشر", "tr": "Sittata 'ashar", "id": "Enam belas"},
        {"en": "Seventeen", "ar": "سبعة عشر", "tr": "Sab'ata 'ashar", "id": "Tujuh belas"},
        {"en": "Eighteen", "ar": "ثمانية عشر", "tr": "Thamaniyata 'ashar", "id": "Delapan belas"},
        {"en": "Nineteen", "ar": "تسعة عشر", "tr": "Tis'ata 'ashar", "id": "Sembilan belas"},
    ],
    "pronouns.json": [
        {"en": "Me", "ar": "إياي", "tr": "Iyyaya", "id": "Saya, objek"},
        {"en": "Him", "ar": "إياه", "tr": "Iyyahu", "id": "Dia laki-laki, objek"},
        {"en": "Her", "ar": "إياها", "tr": "Iyyaha", "id": "Dia perempuan, objek"},
        {"en": "Us", "ar": "إيانا", "tr": "Iyyana", "id": "Kami, objek"},
        {"en": "Them", "ar": "إياهم", "tr": "Iyyahum", "id": "Mereka, objek"},
        {"en": "Myself", "ar": "نفسي", "tr": "Nafsi", "id": "Diri saya"},
        {"en": "Yourself", "ar": "نفسك", "tr": "Nafsuka", "id": "Dirimu"},
        {"en": "Ours", "ar": "لنا", "tr": "Lana", "id": "Milik kami"},
        {"en": "Theirs", "ar": "لهم", "tr": "Lahum", "id": "Milik mereka"},
        {"en": "Each other", "ar": "بعضنا بعضا", "tr": "Ba'duna ba'dan", "id": "Satu sama lain"},
    ],
    "prepositions.json": [
        {"en": "Above", "ar": "فوق", "tr": "Fawq", "id": "Di atas lebih tinggi"},
        {"en": "Below", "ar": "أسفل", "tr": "Asfal", "id": "Di bawah lebih rendah"},
        {"en": "Inside", "ar": "داخل", "tr": "Dakhil", "id": "Di bagian dalam"},
        {"en": "Outside", "ar": "خارج", "tr": "Kharij", "id": "Di luar"},
        {"en": "Across", "ar": "عبر", "tr": "'Abr", "id": "Melintasi"},
        {"en": "Around", "ar": "حول", "tr": "Hawl", "id": "Di sekitar"},
        {"en": "Toward", "ar": "نحو", "tr": "Nahw", "id": "Menuju"},
        {"en": "Against", "ar": "ضد", "tr": "Didd", "id": "Melawan"},
        {"en": "Among", "ar": "وسط", "tr": "Wasat", "id": "Di tengah-tengah"},
        {"en": "Through", "ar": "من خلال", "tr": "Min khilal", "id": "Melalui"},
    ],
    "time.json": [
        {"en": "This week", "ar": "هذا الأسبوع", "tr": "Hadha al-usbu'", "id": "Minggu ini"},
        {"en": "Last week", "ar": "الأسبوع الماضي", "tr": "Al-usbu' al-madi", "id": "Minggu lalu"},
        {"en": "Next week", "ar": "الأسبوع القادم", "tr": "Al-usbu' al-qadim", "id": "Minggu depan"},
        {"en": "This month", "ar": "هذا الشهر", "tr": "Hadha ash-shahr", "id": "Bulan ini"},
        {"en": "Last month", "ar": "الشهر الماضي", "tr": "Ash-shahr al-madi", "id": "Bulan lalu"},
        {"en": "Next month", "ar": "الشهر القادم", "tr": "Ash-shahr al-qadim", "id": "Bulan depan"},
        {"en": "Early", "ar": "مبكر", "tr": "Mubakkir", "id": "Lebih awal"},
        {"en": "Late", "ar": "متأخر", "tr": "Muta'akhkhir", "id": "Terlambat"},
        {"en": "Soon", "ar": "قريبا", "tr": "Qariban", "id": "Segera"},
        {"en": "Now", "ar": "الآن", "tr": "Al-an", "id": "Sekarang"},
    ],
    "weekdays.json": [
        {"en": "School day", "ar": "يوم دراسي", "tr": "Yawm dirasi", "id": "Hari sekolah"},
        {"en": "Work day", "ar": "يوم عمل", "tr": "Yawm 'amal", "id": "Hari kerja"},
        {"en": "Weekend plan", "ar": "خطة عطلة نهاية الأسبوع", "tr": "Khuttat 'utlat nihayat al-usbu'", "id": "Rencana akhir pekan"},
        {"en": "Public holiday", "ar": "عطلة رسمية", "tr": "'Utlah rasmiyyah", "id": "Hari libur nasional"},
        {"en": "Every Monday", "ar": "كل يوم اثنين", "tr": "Kulla yawm ithnayn", "id": "Setiap Senin"},
        {"en": "Every Friday", "ar": "كل يوم جمعة", "tr": "Kulla yawm jum'ah", "id": "Setiap Jumat"},
        {"en": "On weekdays", "ar": "في أيام الأسبوع", "tr": "Fi ayyām al-usbu'", "id": "Pada hari kerja"},
        {"en": "On weekends", "ar": "في عطلة نهاية الأسبوع", "tr": "Fi 'utlat nihayat al-usbu'", "id": "Saat akhir pekan"},
        {"en": "Day off", "ar": "يوم إجازة", "tr": "Yawm ijazah", "id": "Hari libur"},
        {"en": "Weekly schedule", "ar": "جدول أسبوعي", "tr": "Jadwal usbu'i", "id": "Jadwal mingguan"},
    ],
    "body_parts.json": [
        {"en": "Hair", "ar": "شعر", "tr": "Sha'r", "id": "Rambut"},
        {"en": "Forehead", "ar": "جبهة", "tr": "Jabhah", "id": "Dahi"},
        {"en": "Cheek", "ar": "خد", "tr": "Khadd", "id": "Pipi"},
        {"en": "Lips", "ar": "شفاه", "tr": "Shifah", "id": "Bibir"},
        {"en": "Teeth", "ar": "أسنان", "tr": "Asnan", "id": "Gigi"},
        {"en": "Tongue", "ar": "لسان", "tr": "Lisan", "id": "Lidah"},
        {"en": "Neck", "ar": "رقبة", "tr": "Raqabah", "id": "Leher"},
        {"en": "Shoulder", "ar": "كتف", "tr": "Katif", "id": "Bahu"},
        {"en": "Finger", "ar": "إصبع", "tr": "Isba'", "id": "Jari tangan"},
        {"en": "Knee", "ar": "ركبة", "tr": "Rukbah", "id": "Lutut"},
    ],
    "directions.json": [
        {"en": "Go straight", "ar": "اذهب مستقيما", "tr": "Idhhab mustaqiman", "id": "Jalan lurus"},
        {"en": "Go back", "ar": "ارجع", "tr": "Irji'", "id": "Kembali"},
        {"en": "Across from", "ar": "مقابل", "tr": "Muqabil", "id": "Berseberangan dengan"},
        {"en": "At the corner", "ar": "عند الزاوية", "tr": "'Inda az-zawiyah", "id": "Di pojok"},
        {"en": "At the traffic light", "ar": "عند الإشارة", "tr": "'Inda al-isharah", "id": "Di lampu merah"},
        {"en": "Go upstairs", "ar": "اصعد إلى الأعلى", "tr": "Is'ad ila al-a'la", "id": "Naik ke atas"},
        {"en": "Go downstairs", "ar": "انزل إلى الأسفل", "tr": "Inzil ila al-asfal", "id": "Turun ke bawah"},
        {"en": "On your right", "ar": "على يمينك", "tr": "'Ala yaminik", "id": "Di sebelah kananmu"},
        {"en": "On your left", "ar": "على يسارك", "tr": "'Ala yasarik", "id": "Di sebelah kirimu"},
        {"en": "It is nearby", "ar": "إنه قريب", "tr": "Innahu qarib", "id": "Itu dekat"},
    ],
    "classroom.json": [
        {"en": "Chair", "ar": "كرسي", "tr": "Kursi", "id": "Kursi"},
        {"en": "Pencil", "ar": "قلم رصاص", "tr": "Qalam rasas", "id": "Pensil"},
        {"en": "Eraser", "ar": "ممحاة", "tr": "Mimhah", "id": "Penghapus"},
        {"en": "Ruler", "ar": "مسطرة", "tr": "Mistarah", "id": "Penggaris"},
        {"en": "Bag", "ar": "حقيبة", "tr": "Haqibah", "id": "Tas"},
        {"en": "Paper", "ar": "ورقة", "tr": "Waraqah", "id": "Kertas"},
        {"en": "Question", "ar": "سؤال", "tr": "Su'al", "id": "Pertanyaan"},
        {"en": "Answer", "ar": "جواب", "tr": "Jawab", "id": "Jawaban"},
        {"en": "Classmate", "ar": "زميل الدراسة", "tr": "Zamil ad-dirasah", "id": "Teman sekelas"},
        {"en": "Classroom", "ar": "فصل", "tr": "Fasl", "id": "Ruang kelas"},
    ],
    "classroom_phrases.json": [
        {"en": "Open your notebook", "ar": "افتح دفترك", "tr": "Iftah daftarak", "id": "Buka bukumu"},
        {"en": "Write your name", "ar": "اكتب اسمك", "tr": "Uktub ismaka", "id": "Tulis namamu"},
        {"en": "Look at the board", "ar": "انظر إلى السبورة", "tr": "Unzur ila as-saburah", "id": "Lihat papan tulis"},
        {"en": "Raise your hand", "ar": "ارفع يدك", "tr": "Irfa' yadak", "id": "Angkat tanganmu"},
        {"en": "Ask the teacher", "ar": "اسأل المعلم", "tr": "Is'al al-mu'allim", "id": "Tanya guru"},
        {"en": "Work in pairs", "ar": "اعملوا في أزواج", "tr": "I'malu fi azwaj", "id": "Kerja berpasangan"},
        {"en": "Please answer", "ar": "من فضلك أجب", "tr": "Min fadlik ajib", "id": "Tolong jawab"},
        {"en": "Time is up", "ar": "انتهى الوقت", "tr": "Intaha al-waqt", "id": "Waktunya habis"},
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
