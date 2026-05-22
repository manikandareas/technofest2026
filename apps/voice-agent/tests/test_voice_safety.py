from pixelaid_shared.cases import get_case_config
from pixelaid_shared.gameplay import validate_patient_reply


def test_validator_blocks_maya_diagnosis_leakage() -> None:
    result = validate_patient_reply(
        get_case_config("demo"),
        "Sepertinya ini ACS, Dok.",
        used_fact_keys=set(),
        completed_exam_keys=set(),
    )

    assert not result.ok
    assert any(reason.startswith("forbidden_term") for reason in result.reasons)


def test_validator_blocks_unperformed_exam_terms() -> None:
    result = validate_patient_reply(
        get_case_config("siti-sesak"),
        "Saya dengar ada kardiomegali dan BNP saya meningkat.",
        used_fact_keys={"functional"},
        completed_exam_keys=set(),
    )

    assert not result.ok
    assert any(reason.startswith("unperformed_exam_term") for reason in result.reasons)


def test_validator_accepts_allowed_patient_fact() -> None:
    result = validate_patient_reply(
        get_case_config("budi-palpitasi"),
        "Saya minum tiga gelas kopi dan satu minuman energi.",
        used_fact_keys={"stimulant"},
        completed_exam_keys=set(),
    )

    assert result.ok
