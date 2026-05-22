from __future__ import annotations

from pixelaid_shared.gameplay import (
    CaseGameplayConfig,
    ExaminationConfig,
    MedicalRecord,
    PatientFact,
    QuizOption,
    QuizQuestion,
)


CASE_CONFIGS: dict[str, CaseGameplayConfig] = {
    "demo": CaseGameplayConfig(
        id="demo",
        patient_name="Maya",
        timer_seconds=8 * 60,
        medical_record=MedicalRecord(
            summary="Maya, 54 tahun, datang dengan nyeri dada kiri 2 jam sebelum masuk.",
            history=["Hipertensi 8 tahun", "Ayah meninggal karena serangan jantung"],
            medications=["Amlodipine 5 mg tidak rutin"],
            allergies=["Tidak ada alergi obat yang diketahui"],
        ),
        patient_facts=[
            PatientFact(
                keywords=["kapan", "onset", "mulai"],
                response="Mulainya sekitar dua jam lalu saat saya naik tangga.",
                rubric_key="onset",
            ),
            PatientFact(
                keywords=["rasa", "seperti apa", "kualitas"],
                response="Rasanya seperti ditekan berat di dada kiri.",
                rubric_key="quality",
            ),
            PatientFact(
                keywords=["menjalar", "radiasi", "lengan"],
                response="Nyeri menjalar ke lengan kiri dan rahang.",
                rubric_key="radiation",
            ),
            PatientFact(
                keywords=["istirahat", "membaik", "berkurang"],
                response="Sedikit membaik saat saya duduk diam, tapi belum hilang.",
                rubric_key="trigger",
            ),
            PatientFact(
                keywords=["sesak", "keringat", "mual"],
                response="Saya agak sesak dan berkeringat dingin, tidak muntah.",
                rubric_key="associated",
            ),
            PatientFact(
                keywords=["hipertensi", "darah tinggi", "riwayat"],
                response="Saya punya darah tinggi, tapi obatnya sering lupa.",
                rubric_key="risk",
            ),
        ],
        examinations=[
            ExaminationConfig(
                id="vitals",
                label="Vital signs",
                category="vitals",
                delay_seconds=0,
                result="TD 158/94, N 96, RR 20, SpO2 97%, suhu 36.8 C.",
                score_key="vitals",
            ),
            ExaminationConfig(
                id="cardiac_exam",
                label="Cardiac physical exam",
                category="physical",
                delay_seconds=5,
                result="Bunyi jantung reguler, tidak terdengar murmur jelas.",
                score_key="physical",
            ),
            ExaminationConfig(
                id="ecg",
                label="12-lead ECG",
                category="ecg",
                delay_seconds=10,
                result="ST depression ringan di V4-V6, tidak ada STEMI.",
                score_key="ecg",
            ),
            ExaminationConfig(
                id="troponin",
                label="Troponin",
                category="lab",
                delay_seconds=30,
                result="Troponin I borderline meningkat, perlu serial.",
                score_key="troponin",
            ),
        ],
        quiz=[
            QuizQuestion(
                id="diagnosis",
                prompt="Diagnosis kerja paling mungkin?",
                options=[
                    QuizOption(id="acs", label="Acute coronary syndrome tanpa STEMI"),
                    QuizOption(id="gerd", label="GERD"),
                    QuizOption(id="panic", label="Serangan panik"),
                ],
                correct_option_id="acs",
                explanation="Nyeri tipikal, faktor risiko, dan ECG mendukung ACS non-ST elevation.",
            ),
            QuizQuestion(
                id="next_step",
                prompt="Langkah awal paling aman?",
                options=[
                    QuizOption(
                        id="serial_ecg_trop",
                        label="Monitoring, ECG/troponin serial, terapi ACS sesuai protokol",
                    ),
                    QuizOption(id="discharge", label="Pulang dengan antasida"),
                    QuizOption(id="exercise", label="Tes treadmill segera"),
                ],
                correct_option_id="serial_ecg_trop",
                explanation="Kasus berisiko tidak boleh dipulangkan atau dites beban akut.",
                safety_critical=True,
            ),
        ],
        interview_rubric=[
            "onset",
            "quality",
            "radiation",
            "trigger",
            "associated",
            "risk",
        ],
        examination_rubric=["vitals", "physical", "ecg", "troponin"],
        safety_question_ids=["next_step"],
        feedback_template="Fokus utama: gali nyeri dada tipikal, faktor risiko, ECG, dan langkah aman ACS.",
    ),
    "budi-palpitasi": CaseGameplayConfig(
        id="budi-palpitasi",
        patient_name="Budi",
        timer_seconds=10 * 60,
        medical_record=MedicalRecord(
            summary="Budi, 42 tahun, mengeluh berdebar setelah begadang dan konsumsi kopi.",
            history=["Tidak ada penyakit jantung diketahui", "Sering lembur"],
            medications=["Tidak rutin minum obat"],
            allergies=["Tidak diketahui"],
        ),
        patient_facts=[
            PatientFact(
                keywords=["mulai", "kapan", "onset"],
                response="Mulai tadi pagi setelah semalam begadang.",
                rubric_key="onset",
            ),
            PatientFact(
                keywords=["kopi", "kafein", "energi"],
                response="Saya minum tiga gelas kopi dan satu minuman energi.",
                rubric_key="stimulant",
            ),
            PatientFact(
                keywords=["pingsan", "sinkop"],
                response="Tidak pernah pingsan.",
                rubric_key="red_flag",
            ),
            PatientFact(
                keywords=["nyeri dada", "sesak"],
                response="Tidak nyeri dada, hanya cemas dan dada terasa berdebar.",
                rubric_key="associated",
            ),
            PatientFact(
                keywords=["irama", "teratur"],
                response="Rasanya cepat dan kadang tidak teratur.",
                rubric_key="character",
            ),
        ],
        examinations=[
            ExaminationConfig(
                id="vitals",
                label="Vital signs",
                category="vitals",
                delay_seconds=0,
                result="TD 128/82, N 112 reguler, RR 18, SpO2 99%.",
                score_key="vitals",
            ),
            ExaminationConfig(
                id="cardiac_exam",
                label="Cardiac physical exam",
                category="physical",
                delay_seconds=5,
                result="Takikardia ringan, tidak ada murmur.",
                score_key="physical",
            ),
            ExaminationConfig(
                id="ecg",
                label="12-lead ECG",
                category="ecg",
                delay_seconds=10,
                result="Sinus tachycardia, tidak ada pre-excitation atau iskemia.",
                score_key="ecg",
            ),
            ExaminationConfig(
                id="cbc",
                label="CBC",
                category="lab",
                delay_seconds=20,
                result="Hb dan leukosit dalam batas normal.",
                score_key="cbc",
            ),
        ],
        quiz=[
            QuizQuestion(
                id="diagnosis",
                prompt="Interpretasi paling mungkin?",
                options=[
                    QuizOption(
                        id="stimulant",
                        label="Sinus takikardia terkait stimulan dan kurang tidur",
                    ),
                    QuizOption(id="vt", label="Ventricular tachycardia tidak stabil"),
                    QuizOption(id="stemi", label="STEMI inferior"),
                ],
                correct_option_id="stimulant",
                explanation="Riwayat stimulan dan ECG sinus mendukung penyebab benign.",
            ),
            QuizQuestion(
                id="safety",
                prompt="Red flag yang harus selalu ditanyakan?",
                options=[
                    QuizOption(
                        id="syncope_chest_pain",
                        label="Sinkop, nyeri dada, sesak berat, riwayat keluarga kematian mendadak",
                    ),
                    QuizOption(id="favorite_food", label="Makanan favorit"),
                    QuizOption(id="shoe_size", label="Ukuran sepatu"),
                ],
                correct_option_id="syncope_chest_pain",
                explanation="Red flag menentukan urgensi palpitasi.",
                safety_critical=True,
            ),
        ],
        interview_rubric=["onset", "stimulant", "red_flag", "associated", "character"],
        examination_rubric=["vitals", "physical", "ecg", "cbc"],
        safety_question_ids=["safety"],
        feedback_template="Pastikan palpitasi selalu disaring untuk red flag dan dikonfirmasi dengan ECG.",
    ),
    "siti-sesak": CaseGameplayConfig(
        id="siti-sesak",
        patient_name="Siti",
        timer_seconds=12 * 60,
        medical_record=MedicalRecord(
            summary="Siti, 67 tahun, sesak progresif dengan edema tungkai.",
            history=["Hipertensi lama", "Diabetes melitus tipe 2"],
            medications=["Metformin", "Amlodipine"],
            allergies=["Tidak ada"],
        ),
        patient_facts=[
            PatientFact(
                keywords=["sesak", "aktivitas", "jalan"],
                response="Saya sesak saat berjalan ke kamar mandi, membaik kalau duduk.",
                rubric_key="functional",
            ),
            PatientFact(
                keywords=["tidur", "bantal", "ortopnea"],
                response="Saya perlu tiga bantal dan sering terbangun karena sesak.",
                rubric_key="orthopnea",
            ),
            PatientFact(
                keywords=["bengkak", "kaki", "edema"],
                response="Kedua kaki bengkak sejak seminggu ini.",
                rubric_key="edema",
            ),
            PatientFact(
                keywords=["batuk", "dahak"],
                response="Ada batuk ringan, tidak berdahak banyak.",
                rubric_key="associated",
            ),
            PatientFact(
                keywords=["berat", "naik"],
                response="Berat badan naik sekitar tiga kilogram dalam dua minggu.",
                rubric_key="fluid",
            ),
        ],
        examinations=[
            ExaminationConfig(
                id="vitals",
                label="Vital signs",
                category="vitals",
                delay_seconds=0,
                result="TD 166/96, N 104, RR 24, SpO2 93%.",
                score_key="vitals",
            ),
            ExaminationConfig(
                id="lung_exam",
                label="Cardiopulmonary physical exam",
                category="physical",
                delay_seconds=5,
                result="Ronki basal bilateral, JVP meningkat, edema pretibial +2.",
                score_key="physical",
            ),
            ExaminationConfig(
                id="ecg",
                label="12-lead ECG",
                category="ecg",
                delay_seconds=10,
                result="Sinus tachycardia, LVH, tanpa elevasi ST.",
                score_key="ecg",
            ),
            ExaminationConfig(
                id="xray",
                label="Chest X-ray",
                category="imaging",
                delay_seconds=20,
                result="Kardiomegali dan kongesti pulmonal.",
                score_key="xray",
            ),
            ExaminationConfig(
                id="bnp",
                label="BNP",
                category="lab",
                delay_seconds=30,
                result="BNP meningkat signifikan.",
                score_key="bnp",
            ),
        ],
        quiz=[
            QuizQuestion(
                id="diagnosis",
                prompt="Diagnosis kerja paling mungkin?",
                options=[
                    QuizOption(id="heart_failure", label="Gagal jantung dekompensasi"),
                    QuizOption(id="asthma", label="Asma ringan"),
                    QuizOption(id="anxiety", label="Gangguan cemas"),
                ],
                correct_option_id="heart_failure",
                explanation="Ortopnea, edema, ronki, CXR, dan BNP mendukung gagal jantung.",
            ),
            QuizQuestion(
                id="safety",
                prompt="Prioritas awal yang aman?",
                options=[
                    QuizOption(
                        id="oxygen_diuretic_monitor",
                        label="Oksigen bila perlu, diuretik sesuai indikasi, monitoring ketat",
                    ),
                    QuizOption(id="oral_water", label="Anjurkan minum air banyak"),
                    QuizOption(id="ignore", label="Observasi tanpa pemeriksaan"),
                ],
                correct_option_id="oxygen_diuretic_monitor",
                explanation="Kongesti dan hipoksemia butuh tata laksana awal aman.",
                safety_critical=True,
            ),
        ],
        interview_rubric=["functional", "orthopnea", "edema", "associated", "fluid"],
        examination_rubric=["vitals", "physical", "ecg", "xray", "bnp"],
        safety_question_ids=["safety"],
        feedback_template="Untuk sesak kardiak, hubungkan derajat sesak, kongesti, dan pemeriksaan objektif.",
    ),
}


def get_case_config(case_id: str) -> CaseGameplayConfig:
    return CASE_CONFIGS[case_id]
