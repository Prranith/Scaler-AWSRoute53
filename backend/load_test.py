import urllib.request
import concurrent.futures
import time
import sys

URL = "http://localhost:8000/health"
TOTAL_REQUESTS = 2000
CONCURRENCY = 15

print(f"Starting load test on {URL}", flush=True)
print(f"Total requests: {TOTAL_REQUESTS}", flush=True)
print(f"Concurrency level: {CONCURRENCY}", flush=True)
print("Please wait...", flush=True)

success_count = 0
fail_count = 0
latencies = []

def send_request():
    global success_count, fail_count
    start = time.perf_counter()
    try:
        # Use urllib to request the endpoint
        with urllib.request.urlopen(URL, timeout=5) as response:
            if response.status == 200:
                success_count += 1
            else:
                fail_count += 1
    except Exception as e:
        fail_count += 1
    end = time.perf_counter()
    latencies.append(end - start)

start_time = time.perf_counter()

with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
    futures = [executor.submit(send_request) for _ in range(TOTAL_REQUESTS)]
    
    # Track progress
    completed = 0
    for future in concurrent.futures.as_completed(futures):
        completed += 1
        if completed % 200 == 0:
            print(f"Completed {completed}/{TOTAL_REQUESTS} requests...", flush=True)

end_time = time.perf_counter()
total_duration = end_time - start_time
rps = TOTAL_REQUESTS / total_duration
avg_latency = (sum(latencies) / len(latencies)) * 1000 if latencies else 0

print("\n" + "="*40, flush=True)
print("              LOAD TEST RESULTS", flush=True)
print("="*40, flush=True)
print(f"Target URL:             {URL}", flush=True)
print(f"Total Requests:         {TOTAL_REQUESTS}", flush=True)
print(f"Concurrency Level:      {CONCURRENCY}", flush=True)
print(f"Successful Requests:    {success_count}", flush=True)
print(f"Failed Requests:        {fail_count}", flush=True)
print(f"Total Test Duration:    {total_duration:.2f} seconds", flush=True)
print(f"Requests per Second:    {rps:.2f} RPS", flush=True)
print(f"Average Latency:        {avg_latency:.2f} ms", flush=True)
print("="*40, flush=True)
