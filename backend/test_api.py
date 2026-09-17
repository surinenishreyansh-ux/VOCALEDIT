import json, urllib.request, time

print("=== VocalEditor API Integration Test ===")

# Test 1: Health check
resp = urllib.request.urlopen('http://127.0.0.1:8000/')
health = json.loads(resp.read())
print(f"1. Backend health: {health['status']} - {health['app']}")

# Test 2: Create project
req = urllib.request.Request(
    'http://127.0.0.1:8000/api/projects',
    data=json.dumps({"name": "E2E Test", "bpm": 120, "key": "A Minor"}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
proj = json.loads(urllib.request.urlopen(req).read())
pid = proj['id']
print(f"2. Project created: {pid} (name: {proj['name']})")

# Test 3: Load demo takes
req3 = urllib.request.Request(f'http://127.0.0.1:8000/api/projects/{pid}/load-demo', method='POST')
res3 = json.loads(urllib.request.urlopen(req3).read())
print(f"3. Loaded {res3['takes_count']} demo takes")
assert res3['takes_count'] == 10, "Expected 10 takes"

# Test 4: Start analysis
req4 = urllib.request.Request(f'http://127.0.0.1:8000/api/projects/{pid}/analyze', method='POST')
res4 = json.loads(urllib.request.urlopen(req4).read())
print(f"4. Analysis started: {res4['status']}")

# Test 5: Poll status until complete
print("5. Polling analysis status...")
for attempt in range(60):  # max 60 polls = ~24s
    time.sleep(0.4)
    req5 = urllib.request.Request(f'http://127.0.0.1:8000/api/projects/{pid}/status')
    status = json.loads(urllib.request.urlopen(req5).read())
    print(f"   [{attempt+1}] {status['stage']} - {status['progress']}% - {status['status']}")
    if status['status'] in ('completed', 'error'):
        break

assert status['status'] == 'completed', f"Analysis failed: {status.get('error')}"
print(f"   Analysis COMPLETE at 100%")

# Test 6: Get comp studio data
req6 = urllib.request.Request(f'http://127.0.0.1:8000/api/projects/{pid}/comp')
comp_data = json.loads(urllib.request.urlopen(req6).read())
print(f"6. Comp Studio data: {len(comp_data['takes'])} takes, {len(comp_data['segments'])} segments")
print("   Segment selections:")
for seg in comp_data['segments']:
    take = next(t for t in comp_data['takes'] if t['id'] == seg['selected_take_id'])
    print(f"     {seg['start']}s - {seg['end']}s -> {take['filename']} (Score: {seg['score']}) - {seg['reason']}")

assert comp_data['comp'] is not None, "Comp is null"
print(f"   Comp duration: {comp_data['comp']['duration']}s")

# Test 7: Manual segment override
first_seg = comp_data['segments'][0]
current_take_id = first_seg['selected_take_id']
new_take_id = next(t['id'] for t in comp_data['takes'] if t['id'] != current_take_id)
print(f"7. Overriding segment '{first_seg['id']}' from {current_take_id} to {new_take_id}...")
req7 = urllib.request.Request(
    f"http://127.0.0.1:8000/api/projects/{pid}/segments/{first_seg['id']}/replace",
    data=json.dumps({"take_id": new_take_id}).encode(),
    headers={'Content-Type': 'application/json'},
    method='POST'
)
res7 = json.loads(urllib.request.urlopen(req7).read())
assert res7['segment']['selected_take_id'] == new_take_id
print(f"   Override SUCCESS: segment now uses {new_take_id} (Score: {res7['segment']['score']})")

# Test 8: Export URL (just check status code)
export_url = f'http://127.0.0.1:8000/api/projects/{pid}/export?format=wav&bit_depth=24'
req8 = urllib.request.Request(export_url)
resp8 = urllib.request.urlopen(req8)
print(f"8. Export endpoint status: {resp8.status} (Content-Type: {resp8.headers.get('content-type', 'N/A')})")

print("\n=== ALL API INTEGRATION TESTS PASSED ===")
