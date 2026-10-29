import pandas as pd
from app.services.data_engine import data_engine
from app.services.cleaning_engine import cleaning_engine

def test_remove_duplicates_and_undo():
    csv_data = """id,score
1,90
2,85
1,90
"""
    session_id = data_engine.create_session_from_csv(csv_data, "test.csv")
    
    # Apply duplicate removal
    res = cleaning_engine.apply_action(session_id, action="remove_duplicates")
    assert res["success"] is True
    assert res["rows_affected"] == 1
    assert res["remaining_rows"] == 2
    
    # Undo
    undo_res = cleaning_engine.undo(session_id)
    assert undo_res["success"] is True
    assert undo_res["remaining_rows"] == 3

def test_fill_missing_values():
    csv_data = """val,label
10.0,A
,B
30.0,C
"""
    session_id = data_engine.create_session_from_csv(csv_data, "test.csv")
    
    # Fill missing with mean (mean of 10 and 30 = 20)
    res = cleaning_engine.apply_action(session_id, action="fill_missing", column="val", method="mean")
    assert res["success"] is True
    assert res["rows_affected"] == 1
    
    session = data_engine.get_session(session_id)
    df = session["current"]
    assert df["val"].isna().sum() == 0
    assert float(df["val"].iloc[1]) == 20.0
