import pandas as pd
from app.services.verification import verification_engine

def test_numerical_claim_verification():
    df = pd.DataFrame({
        "study_hours": [10.0, 20.0, 30.0],
        "exam_score": [70.0, 80.0, 90.0]
    })
    
    # Accurate claim: mean study_hours is 20.0
    res = verification_engine.verify_claim(
        df=df,
        claim_text="Average study hours is 20.0.",
        claimed_metric="mean",
        claimed_value=20.0,
        target_column="study_hours"
    )
    assert res["status"] == "Verified"
    assert res["computed_value"] == 20.0

    # Inaccurate claim: claimed 35.0
    res_false = verification_engine.verify_claim(
        df=df,
        claim_text="Average study hours is 35.0.",
        claimed_metric="mean",
        claimed_value=35.0,
        target_column="study_hours"
    )
    assert res_false["status"] == "Not Verified"
    assert res_false["difference"] == 15.0

def test_qualitative_causality_claim():
    df = pd.DataFrame({"x": [1, 2, 3], "y": [2, 4, 6]})
    res = verification_engine.verify_claim(
        df=df,
        claim_text="Feature X causes an increase in Feature Y.",
        claimed_metric="causality",
        claimed_value=None,
        target_column="x"
    )
    assert res["status"] == "Needs Review"
    assert "Qualitative Epistemic Check" in res["verification_method"]
