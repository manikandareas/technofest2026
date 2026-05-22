from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import validate_patient_reply


def test_validator_blocks_diagnosis_leakage() -> None:
    result = validate_patient_reply(
        get_case_config("internal-medicine-dengue-warning-signs"),
        "Sepertinya ini Suspek dengue dengan pemantauan tanda bahaya, Dok.",
        used_fact_keys=set(),
        completed_exam_keys=set(),
    )

    assert not result.ok
    assert any(reason.startswith("forbidden_term") for reason in result.reasons)


def test_validator_blocks_unperformed_exam_terms() -> None:
    result = validate_patient_reply(
        get_case_config("internal-medicine-pneumonia"),
        "Saya dengar hasil Chest X-Ray sudah ada.",
        used_fact_keys={"risk_factors"},
        completed_exam_keys=set(),
    )

    assert not result.ok
    assert any(reason.startswith("unperformed_exam_term") for reason in result.reasons)


def test_validator_accepts_allowed_patient_fact() -> None:
    result = validate_patient_reply(
        get_case_config("internal-medicine-diabetes-hyperglycemia"),
        "Saya sering minum teh manis dan jarang olahraga.",
        used_fact_keys={"diet"},
        completed_exam_keys=set(),
    )

    assert result.ok


def test_validator_allows_common_indonesian_symptom_language() -> None:
    result = validate_patient_reply(
        get_case_config("internal-medicine-dengue-warning-signs"),
        "Nyeri di dada saya sesak dan terasa panas sejak tadi pagi.",
        used_fact_keys=set(),
        completed_exam_keys=set(),
    )

    assert result.ok
    assert not any(reason.startswith("invented_clinical_fact") for reason in result.reasons)
