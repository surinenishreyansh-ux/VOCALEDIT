import os
import sys

# Ensure backend root in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import (
    create_project,
    load_demo_takes,
    run_project_analysis_sync,
    replace_segment_take,
    export_comp,
    ProjectCreate,
    ReplaceSegmentRequest,
    PROJECTS
)

def test_full_pipeline():
    print("1. Creating Project...")
    p = create_project(ProjectCreate(name="Studio Demo Session", bpm=124, key="G Minor"))
    pid = p["id"]
    print(f"   Project created: {pid}, Name: {p['name']}")

    print("2. Loading 10 Demo Vocal Takes...")
    res = load_demo_takes(pid)
    print(f"   Loaded {res['takes_count']} takes successfully.")
    assert res["takes_count"] == 10, "Expected 10 takes"

    print("3. Running Full AI Analysis & Initial Comp Generation...")
    run_project_analysis_sync(pid)
    proj = PROJECTS[pid]
    assert proj["status"] == "completed", f"Status should be completed, got {proj['status']}: {proj.get('error')}"
    print(f"   Analysis complete! Progress: {proj['progress']}%")
    print(f"   Number of segmented vocal phrases: {len(proj['segments'])}")
    for s in proj["segments"]:
        print(f"     Segment {s['index']} ({s['start']}s - {s['end']}s): Winner = {s['selected_take_id']} (Score: {s['score']}) -> {s['reason']}")

    assert proj["comp"] is not None, "Comp object missing"
    assert os.path.exists(proj["comp"]["file_path"]), f"Comp file not found: {proj['comp']['file_path']}"
    print(f"   Comp audio generated: {proj['comp']['file_path']} ({proj['comp']['duration']}s, {len(proj['comp']['waveform'])} waveform points)")

    print("4. Testing Manual Segment Override (Change Take)...")
    first_seg = proj["segments"][0]
    seg_id = first_seg["id"]
    orig_take = first_seg["selected_take_id"]
    new_take = "take_02" if orig_take != "take_02" else "take_03"
    rep_res = replace_segment_take(pid, seg_id, ReplaceSegmentRequest(take_id=new_take))
    print(f"   Replaced {seg_id} take from {orig_take} to {new_take}. New score: {rep_res['segment']['score']}")
    assert rep_res["segment"]["selected_take_id"] == new_take, "Take replacement failed"

    print("5. Testing Comp Export...")
    exp_res = export_comp(pid, format="wav", bit_depth=24)
    print(f"   Export 24-bit WAV file generated at: {exp_res.path}")
    assert os.path.exists(exp_res.path), "Export file missing"

    print("\n>>> ALL PIPELINE TESTS PASSED! FULL AUDIO ENGINE IS OPERATIONAL! <<<\n")

if __name__ == "__main__":
    test_full_pipeline()
