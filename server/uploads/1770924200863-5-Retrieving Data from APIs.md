# Chapter 5: Retrieving Data from APIs

---

## 5.1 Introduction

### Core Idea
APIs (Application Programming Interfaces) provide clean, documented, and repeatable access to data — far more reliable than web scraping. Instead of manually downloading files or scraping HTML that wasn't built for automation, analysts use APIs to automate data collection and integrate external data directly into their workflows.

### Why APIs Over Web Scraping?
- **Stability** — APIs are intentionally designed for programmatic access; websites are not.
- **Structure** — APIs return data in clean, standardized formats (usually JSON).
- **Ethics & legality** — APIs are explicitly provided for this purpose; scraping may violate terms of service.
- **Efficiency** — APIs are optimized for data retrieval at scale.

### The Modular Approach
Think of APIs as LEGO bricks: you can combine multiple APIs to enrich datasets, update information automatically, or swap data sources with minimal code changes. This modularity is the backbone of modern distributed analytics workflows.

### Typical API Workflow
1. **Request** data from an API endpoint.
2. **Receive** a response in JSON format.
3. **Convert** JSON into a Pandas DataFrame.
4. **Apply** the same data wrangling, analysis, and modeling techniques you already know.

### Key Takeaway
APIs are the preferred method for accessing external data in professional analytics. They're designed for automation, well-documented, and integrate seamlessly into Python workflows.

---

## 5.2 Web Service APIs

### Core Idea
APIs work through a request-response cycle: a client (your Python script) sends a request to an **endpoint** (a specific URL), the server processes it, and returns structured data (usually JSON). Understanding this cycle — and the key components of requests and responses — is fundamental to working with any API.

### How APIs Work: The Three-Step Cycle

**Step 1: The Request**
A client sends a request to an API endpoint. The request includes:
- **URL** — The address of the endpoint.
- **Parameters** — Key-value pairs that filter or customize the request (e.g., `?city=Provo&units=imperial`).
- **Headers** — Metadata like authentication tokens or data format preferences.
- **Payload** (for POST/PUT) — Data sent to the API for processing.

Most analytics work uses **GET requests** to retrieve data (not modify it).

**Step 2: Processing**
The API validates inputs, checks permissions, and retrieves or computes the requested data. This step is invisible to the client — you just wait for a response.

**Step 3: The Response**
The API returns:
- **Status code** — Indicates success (200) or failure (401, 404, 500, etc.).
- **Headers** — Optional metadata.
- **Data** — Usually JSON (sometimes XML in legacy systems).

### API Methods

| Method | Purpose | Analytics Example |
|---|---|---|
| **GET** | Retrieve data | Download stock prices or weather data |
| **POST** | Submit data for processing | Send text to a sentiment analysis API |
| **PUT** | Update existing data | Update stored preferences |
| **DELETE** | Remove data | Delete a record from a system |

In this chapter, you'll primarily use **GET** (retrieving data).

### Data Formats: JSON vs. XML
Both are structured, self-describing formats for nested data. **JSON is now dominant** because it's lightweight, readable, and maps naturally to Python dicts/lists.

**JSON example:**
```json
{
  "employees": [
    {"firstName": "Suzy", "lastName": "Smith"},
    {"firstName": "Bob", "lastName": "Jones"}
  ]
}
```

**XML example:**
```xml
<employees>
  <employee>
    <firstName>Suzy</firstName>
    <lastName>Smith</lastName>
  </employee>
</employees>
```

### Authentication Methods

| Method | How It Works | Use Case |
|---|---|---|
| **No authentication** | Open access (increasingly rare) | Public datasets |
| **Basic auth** | Username + password (discouraged for security) | Legacy systems |
| **API keys** | Unique identifier in request (querystring or header) | Most common for analytics APIs |
| **OAuth** | Token-based; used for user-specific or sensitive data | Apps accessing user accounts |

### Public APIs for Analytics
The **Public APIs GitHub repository** is a curated list of free APIs across many domains: https://github.com/public-apis/public-apis

**Selected APIs for analytics projects** (from the textbook's extensive table):
- **USGS Earthquake** — Time-bounded earthquake queries; great for pagination practice.
- **NASA APIs** — Multiple datasets (APOD, NeoWs); good for key-based auth practice.
- **Open-Meteo** — Weather forecasts + historical data; no key required.
- **CoinGecko** — Crypto market prices and time series.
- **balldontlie**, **TheSportsDB**, **Ergast (F1)**, **MLB StatsAPI**, **NHL Stats** — Sports data for dashboards and analysis.
- **RAWG**, **CheapShark**, **FreeToGame** — Video game data for filtering and EDA.
- **Alpha Vantage**, **FRED (St. Louis Fed)**, **SEC EDGAR** — Financial and economic data.
- **World Bank API**, **OpenAlex**, **Crossref** — Development indicators, research metadata.
- **JSONPlaceholder**, **HTTP Cat** — Teaching tools for GET basics and error handling.

Always check each API's rate limits, usage terms, and authentication requirements.

### Key Takeaway
APIs exchange data through a simple request-response cycle. JSON is the standard format. Most analytics work uses GET requests with optional parameters and authentication.

---

## 5.3 In Python

### Core Idea
Python's `requests` package makes API calls simple. For basic (no-auth) APIs, the pattern is: (1) send a GET request, (2) check the status code, (3) parse the JSON response, (4) drill down to extract the data you need, (5) build a DataFrame.

### Basic API Call
```python
import requests

response = requests.get("https://randomuser.me/api/")
print(response.status_code)   # 200 = success
```

### Common HTTP Status Codes

| Code | Meaning | Likely Cause |
|---|---|---|
| **200** | OK | Request succeeded |
| **400** | Bad Request | Invalid parameters or syntax |
| **401** | Unauthorized | Missing/expired API key |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Incorrect endpoint or typo |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server-side bug or crash |
| **503** | Service Unavailable | Downtime or maintenance |

### Parsing JSON
```python
import json

json_data = json.loads(response.text)         # Convert JSON string to Python dict
print(json.dumps(json_data, indent=2))        # Pretty-print for inspection
```

Or use the shortcut:
```python
json_data = response.json()   # Requests package does the parsing for you
```

### Drilling Down into JSON
JSON is nested dicts and lists. Access with `[]`:
```python
# Start at top level, drill down step by step
json_data['results'][0]['location']   # Dictionary → list → dictionary → dictionary
```
**Lists** use numeric positions (`[0]`). **Dictionaries** use string keys (`['location']`).

### Building a DataFrame from API Calls
```python
import pandas as pd

df = pd.DataFrame(columns=['name', 'gender', 'age', 'city', 'state'])
df.set_index('name', inplace=True)

for i in range(5):
    response = requests.get("https://randomuser.me/api/")
    json_data = response.json()
    
    name = json_data['results'][0]['name']['first'] + " " + json_data['results'][0]['name']['last']
    df.loc[name] = [
        json_data['results'][0]['gender'],
        json_data['results'][0]['dob']['age'],
        json_data['results'][0]['location']['city'],
        json_data['results'][0]['location']['state']
    ]

df.to_csv('users.csv')
df.head()
```

### Endpoints
An **endpoint** is a specific functionality offered by a web service. Each endpoint has its own URL path. Example: `https://isro.vercel.app/api/spacecrafts` and `https://isro.vercel.app/api/launchers` are two endpoints from the same base API.

### Querystring Parameters
Customize requests by adding `?key=value&key=value` to the URL:
```python
# Predict age from name
response = requests.get("https://api.agify.io?name=homer")

# Get weather for a location
response = requests.get("https://api.open-meteo.com/v1/forecast?latitude=40.23&longitude=-111.66&current_weather=true")

# Filter game deals by price
response = requests.get("https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15")
```

### Key Takeaway
Use `requests.get()`, check `status_code`, parse with `.json()`, drill down with `[]`, and build DataFrames row-by-row in a loop.

---

## 5.4 Earthquakes Example (Pagination)

### Core Idea
Many APIs return large datasets in pages. You must loop through pages using **limit** (how many records per request) and **offset** (how many to skip) until no more results are returned. This example demonstrates end-to-end: make requests, paginate, assemble a DataFrame, save to CSV, visualize.

### USGS Earthquake API
Endpoint: `https://earthquake.usgs.gov/fdsnws/event/1/query`

Key parameters: `starttime`, `endtime`, `minmagnitude`, `limit`, `offset`

### Step-by-Step Workflow

**Step 1: Single request to inspect structure**
```python
import requests

base_url = "https://earthquake.usgs.gov/fdsnws/event/1/query"
params = {
    "format": "geojson",
    "starttime": "2024-01-01",
    "endtime": "2024-01-08",
    "minmagnitude": 2.5,
    "limit": 200,
    "offset": 1
}

response = requests.get(base_url, params=params)
json_data = response.json()
features = json_data["features"]   # List of earthquake events
```

**Step 2: Pagination loop**
```python
import time

all_rows = []
limit = 200
offset = 1

while True:
    params = {"format": "geojson", "starttime": "2024-01-01", "endtime": "2024-01-08",
              "minmagnitude": 2.5, "limit": limit, "offset": offset}
    
    response = requests.get(base_url, params=params)
    if response.status_code != 200:
        break
    
    page = response.json()
    features = page["features"]
    
    if len(features) == 0:   # No more results
        break
    
    for f in features:
        props = f.get("properties", {})
        coords = f.get("geometry", {}).get("coordinates", [None, None, None])
        
        row = {
            "event_id": f.get("id"),
            "place": props.get("place"),
            "magnitude": props.get("mag"),
            "longitude": coords[0],
            "latitude": coords[1],
            "depth_km": coords[2]
        }
        all_rows.append(row)
    
    offset += limit
    time.sleep(0.25)   # Be polite; avoid overwhelming the server
```

**Step 3: Convert to DataFrame and clean**
```python
import pandas as pd

df = pd.DataFrame(all_rows)
df["magnitude"] = pd.to_numeric(df["magnitude"], errors="coerce")
df["depth_km"] = pd.to_numeric(df["depth_km"], errors="coerce")
df.to_csv("usgs_earthquakes.csv", index=False)
```

**Step 4: Visualize**
```python
import seaborn as sns
from matplotlib import pyplot as plt

plot_df = df.dropna(subset=["magnitude", "depth_km"])
sns.scatterplot(data=plot_df, x="magnitude", y="depth_km")
plt.title("USGS Earthquakes: Depth vs. Magnitude")
plt.show()
```

### Key Takeaway
Pagination is essential for large datasets. Loop until the API returns an empty page, then assemble all results into a single DataFrame.

---

## 5.5 Key-Based Authentication

### Core Idea
Many professional APIs require an **API key** for authentication. The key is either included in the **querystring** (e.g., `?appid=YOUR_KEY`) or in the **request headers** (more secure). This allows providers to track usage, enforce rate limits, and (when applicable) bill for service.

### Example: OpenWeather API (Querystring Key)

**Step 1: Sign up and get your key**
1. Create account at the provider's site.
2. Confirm your email.
3. Navigate to API keys in your dashboard.
4. Copy your key (case-sensitive).

**Note:** New keys may take up to 2 hours to activate. If you get a 401 error immediately after signup, wait and retry.

**Step 2: Include key in request**
```python
import requests

key = "YOUR_API_KEY_HERE"
url = (
    "https://api.openweathermap.org/data/2.5/weather"
    "?q=Provo,US"
    "&units=imperial"
    "&appid=" + key
)

response = requests.get(url)
print(response.status_code)   # 200 if key is active

json_data = response.json()
city = json_data.get('name')
temp_f = json_data.get('main', {}).get('temp')
print(city, temp_f)   # Provo 44.04
```

### Security Note
Keys in querystrings are visible in URLs. **Always use HTTPS** (not HTTP) so the request is encrypted in transit. Never post keys in public code, screenshots, or GitHub repos.

### Key Takeaway
Querystring keys are common and simple. Sign up, get your key, add it as a URL parameter. Treat keys as secrets.

---

## 5.6 Header and Body Data

### Core Idea
For more secure authentication and complex inputs, use **headers** (e.g., OAuth bearer tokens) and **request body** (e.g., JSON feature data). This is the standard pattern for ML prediction APIs and professional services.

### Pattern: POST Request with Headers and Body
```python
import requests
import json

# Feature data for prediction
data = {
    "Inputs": {
        "input1": [
            {"age": 19, "sex": "female", "bmi": 27.9, "children": 0, "smoker": "yes", "region": "southwest"},
            {"age": 45, "sex": "male", "bmi": 24.3, "children": 3, "smoker": "no", "region": "southeast"}
        ]
    }
}

body = str.encode(json.dumps(data))

url = 'http://example-prediction-service.azurecontainer.io/score'
api_key = 'YOUR_API_KEY'

headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + api_key   # OAuth-style bearer token
}

response = requests.post(url=url, data=body, headers=headers).json()
print(response)   # {"Results": {"WebServiceOutput0": [...]}}
```

### Why Headers Over Querystring?
- **More secure** — Credentials aren't visible in the URL.
- **Standard for OAuth** — Token-based systems use headers, not querystrings.
- **Better for complex inputs** — Large JSON payloads go in the body, not the URL.

### Storing Keys Safely
Don't hard-code keys in scripts. Store them in a separate file:
```python
# Save key in api_key.txt (one line, just the key)
with open("api_key.txt", "r") as f:
    api_key = f.read().strip()

headers = {"Authorization": "Bearer " + api_key}
```

Later, learn environment variables or secret managers for production.

### Key Takeaway
For ML APIs and OAuth, use POST requests with headers (for auth) and body (for input data). This is the standard pattern for prediction services.

---

## 5.7 Stock Market Data Example

### Core Idea
Financial APIs like Polygon.io provide professional-grade market data. They typically use **header-based authentication** (bearer tokens) and return time-series data suitable for analytics. This example demonstrates single-day and multi-day retrieval patterns.

### Polygon.io API
Sign up for a free account at polygon.io, generate an API key, and use it as a bearer token.

**Single-day request:**
```python
import requests

key = "YOUR_POLYGON_KEY"
headers = {"Authorization": "Bearer " + key}

url = "https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/2023-08-17/2023-08-18?adjusted=true&sort=asc"

response = requests.get(url, headers=headers)
result = response.json()

# result['results'][0] contains: open, high, low, close, volume
```

**Multi-day DataFrame:**
```python
import pandas as pd

dates = ['2023-08-01', '2023-08-02', '2023-08-03', '2023-08-04', '2023-08-05']
df = pd.DataFrame(columns=['date', 'symbol', 'open', 'high', 'low', 'close', 'volume'])

for date in dates:
    url = f"https://api.polygon.io/v1/open-close/AAPL/{date}?adjusted=true"
    response = requests.get(url, headers=headers)
    result = response.json()
    
    try:
        df.loc[len(df)] = [
            result['from'], result['symbol'], result['open'],
            result['high'], result['low'], result['close'], result['volume']
        ]
    except:
        print(result)   # Error handling for rate limits or missing data

df.to_csv('aapl_prices.csv', index=False)
```

### Rate Limits
Free tiers often limit requests per minute. If you exceed the limit, you'll get an error. Always include error handling and consider adding `time.sleep()` between requests.

### Key Takeaway
Financial APIs use bearer tokens in headers. Loop through dates to build time-series DataFrames, handle errors, and respect rate limits.

---

## 5.8 ESPN NBA Example (Multi-Endpoint Enrichment)

### Core Idea
Real workflows often require calling **multiple endpoints** to enrich datasets. This example retrieves completed NBA games from a scoreboard endpoint, then calls a summary endpoint for each game to extract detailed team statistics. The result: two DataFrames (games + team stats) ready for analysis.

### ESPN API Endpoints (No Key Required)
- **Scoreboard:** `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=YYYYMMDD`
- **Game summary:** `https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event=EVENT_ID`

**Note:** These endpoints are publicly accessible but undocumented. Always check `status_code` and inspect JSON structure.

### Step-by-Step Workflow

**Step 1: Inspect default response (includes scheduled games)**
```python
import requests

url = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
response = requests.get(url)
events = response.json().get("events", [])

# Check if games are completed or scheduled
events[0]['status']['type']['state']   # 'pre' = scheduled, 'post' = completed
```

**Step 2: Paginate backward through dates, collect only completed games**
```python
import datetime as dt
import time
import pandas as pd

BASE = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"

completed_games = []
target_n = 200
d = dt.datetime.now(dt.UTC).date()

while len(completed_games) < target_n:
    date_str = d.strftime("%Y%m%d")
    url = BASE + "?dates=" + date_str
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        for e in data.get("events", []):
            if e.get("status", {}).get("type", {}).get("state") == "post":
                completed_games.append(e)
    
    d = d - dt.timedelta(days=1)
    time.sleep(0.25)

completed_games = completed_games[:target_n]
```

**Step 3: Build games DataFrame**
```python
games_df = pd.DataFrame(columns=["event_id", "date_utc", "home_team", "away_team", "home_score", "away_score"])

for e in completed_games:
    event_id = e.get("id")
    date_utc = e.get("date")
    
    comp = e.get("competitions", [{}])[0]
    competitors = comp.get("competitors", [])
    
    home = next((c for c in competitors if c.get("homeAway") == "home"), None)
    away = next((c for c in competitors if c.get("homeAway") == "away"), None)
    
    if home and away:
        games_df.loc[len(games_df)] = [
            event_id, date_utc,
            home.get("team", {}).get("displayName"),
            away.get("team", {}).get("displayName"),
            int(home.get("score", 0)),
            int(away.get("score", 0))
        ]

games_df.to_csv("espn_nba_games_last200.csv", index=False)
```

**Step 4: Enrich with team statistics (second endpoint)**
Inspect the summary endpoint first to understand structure:
```python
event_id = games_df.loc[0, "event_id"]
summary_url = f"https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={event_id}"
summary = requests.get(summary_url).json()

team0 = summary["boxscore"]["teams"][0]
team0["team"]["displayName"], team0["statistics"][:5]   # See what stats are available
```

Then loop through all games and extract stats:
```python
team_stats_df = pd.DataFrame(columns=["event_id", "team", "points", "fg", "fg_pct", "rebounds", "assists", "turnovers"])

for idx, row in games_df.iterrows():
    event_id = row["event_id"]
    summary_url = f"https://site.web.api.espn.com/apis/site/v2/sports/basketball/nba/summary?event={event_id}"
    response = requests.get(summary_url)
    
    if response.status_code == 200:
        summary = response.json()
        teams = summary.get("boxscore", {}).get("teams", [])
        
        for t in teams:
            team_name = t.get("team", {}).get("displayName")
            stats_list = t.get("statistics", [])
            
            # Parse stats (this varies by API structure; inspect first)
            stats = {s.get("abbreviation"): s.get("displayValue") for s in stats_list}
            
            team_stats_df.loc[len(team_stats_df)] = [
                event_id, team_name,
                stats.get("PTS"), stats.get("FG"), stats.get("FG%"),
                stats.get("REB"), stats.get("AST"), stats.get("TO")
            ]
    
    time.sleep(0.35)

team_stats_df.to_csv("espn_nba_team_stats_last200.csv", index=False)
```

**Step 5: Visualize**
```python
import seaborn as sns
from matplotlib import pyplot as plt

team_stats_df["points_num"] = pd.to_numeric(team_stats_df["points"], errors="coerce")
plot_df = team_stats_df.groupby("team", as_index=False)["points_num"].mean().sort_values("points_num", ascending=False).head(20)

sns.barplot(data=plot_df, x="team", y="points_num")
plt.xticks(rotation=45, ha="right")
plt.title("ESPN NBA: Average Team Points (Last 200 Games)")
plt.show()
```

### Key Takeaway
Multi-endpoint workflows: (1) get a list of IDs from one endpoint, (2) loop through and call a detail endpoint for each ID, (3) assemble into DataFrames, (4) save and visualize. Always inspect JSON structure first.
