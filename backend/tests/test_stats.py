import io
import pandas as pd
import numpy as np
from app.services.data_engine import data_engine

def test_descriptive_stats():
    csv_data = """A,B,C
10,100,cat
20,200,dog
30,300,cat
40,400,cat
50,500,bird
"""
    session_id = data_engine.create_session_from_csv(csv_data, "test.csv")
    session = data_engine.get_session(session_id)
    df = session["current"]
    
    summaries = data_engine.get_column_summaries(df)
    summary_a = next(s for s in summaries if s["name"] == "A")
    
    assert summary_a["mean"] == 30.0
    assert summary_a["median"] == 30.0
    assert summary_a["min"] == 10.0
    assert summary_a["max"] == 50.0
    assert summary_a["count"] == 5
    assert summary_a["missing_count"] == 0

def test_iqr_outlier_detection():
    # Normal distribution with one blatant outlier (999)
    vals = [10, 11, 12, 13, 14, 15, 14, 13, 12, 11, 999]
    series = pd.Series(vals)
    cnt, low, high, outliers = data_engine.calculate_iqr_outliers(series)
    
    assert cnt == 1
    assert 999 in outliers

def test_quality_score_calculation():
    # Dataset with 1 duplicate and 1 missing cell
    csv_data = """X,Y
1,10
2,
1,10
"""
    df = pd.read_csv(io.StringIO(csv_data))
    quality = data_engine.calculate_quality_score(df)
    
    assert quality["total_duplicates"] == 1
    assert quality["total_missing_cells"] == 1
    assert quality["score"] < 100
    assert "calculation_breakdown" in quality
