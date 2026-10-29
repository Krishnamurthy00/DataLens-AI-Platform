import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.resolve()
sys.path.insert(0, str(backend_dir))

def run_all_tests():
    print("==================================================")
    print("      DataLens AI - Backend Test Suite           ")
    print("==================================================")
    
    passed = 0
    failed = 0

    from tests.test_stats import test_descriptive_stats, test_iqr_outlier_detection, test_quality_score_calculation
    from tests.test_cleaning import test_remove_duplicates_and_undo, test_fill_missing_values
    from tests.test_verification import test_numerical_claim_verification, test_qualitative_causality_claim

    tests = [
        ("Descriptive Statistics Calculation", test_descriptive_stats),
        ("IQR Outlier Detection & Tukey Fences", test_iqr_outlier_detection),
        ("Data Quality Score & Breakdown", test_quality_score_calculation),
        ("Duplicate Removal & Undo Stack", test_remove_duplicates_and_undo),
        ("Missing Value Imputation (Mean/Median)", test_fill_missing_values),
        ("Dual-Engine Numerical Verification", test_numerical_claim_verification),
        ("Qualitative Epistemic Causality Check", test_qualitative_causality_claim)
    ]

    for name, test_fn in tests:
        try:
            test_fn()
            print(f"[PASS] {name}")
            passed += 1
        except Exception as e:
            print(f"[FAIL] {name}: {e}")
            failed += 1

    print("--------------------------------------------------")
    print(f"Results: {passed} passed, {failed} failed.")
    print("==================================================")
    return failed == 0

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
