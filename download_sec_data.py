import requests
import os
import time

# 1. Setup: Define our targets
# CIK codes are the unique IDs assigned by the SEC
COMPANIES = {
    "MSFT": "0000789019",
    "GOOGL": "0001652044",
    "NVDA": "0001045810"
}

# We want the last 3 years of reports
TARGET_YEARS = [2022, 2023, 2024]

# 2. Headers: The SEC is VERY strict. You MUST provide a User-Agent.
# Format: "Sample Company Name admin@sample.com"
HEADERS = {
    "User-Agent": "BennettUniversityStudent sanika@bennett.edu.in",
    "Accept-Encoding": "gzip, deflate",
    "Host": "data.sec.gov"
}

def get_filing_metadata(cik):
    """Fetch the full filing history for a company from SEC EDGAR."""
    url = f"https://data.sec.gov/submissions/CIK{cik}.json"
    
    # We try to get the data. If it fails, we print the error.
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status() # Raises an error if the status is 400 or 500
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for {cik}: {e}")
        return None

def download_filing(company, year, accession_number, primary_doc):
    """Construct the URL and download the file."""
    # SEC URL pattern: https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{primary_doc}
    
    # 1. Clean the CIK (remove leading zeros) and Accession Number (remove hyphens)
    cik = COMPANIES[company].lstrip("0") 
    accession_no_hyphen = accession_number.replace("-", "")
    
    url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession_no_hyphen}/{primary_doc}"
    
    # We need a slightly different header for the actual file download (Host is different)
    download_headers = {
        "User-Agent": "BennettUniversityStudent sanika@bennett.edu.in",
        "Host": "www.sec.gov"
    }
    
    try:
        response = requests.get(url, headers=download_headers)
        response.raise_for_status()
        
        # 2. Save to a data folder
        folder = "data"
        if not os.path.exists(folder):
            os.makedirs(folder)
            
        filename = f"{folder}/{company}_{year}_10K.html"
        
        # 'wb' means write binary (good for keeping encoding safe)
        with open(filename, "wb") as f:
            f.write(response.content)
            
        print(f"✅ Downloaded: {filename}")
        return True
    except requests.exceptions.RequestException as e:
        print(f"❌ Failed to download {company} {year}: {e}")
        return False

def main():
    print("🚀 Starting SEC Downloader...")
    for company, cik in COMPANIES.items():
        print(f"\n--- Processing {company} ---")
        data = get_filing_metadata(cik)
        
        if not data:
            continue

        # The 'filings' key contains the lists of data
        filings = data['filings']['recent']
        
        found_years = []
        
        # Loop through the filings to find 10-Ks
        for i, form in enumerate(filings['form']):
            if form == '10-K':
                # Extract the year from the filing date (YYYY-MM-DD)
                date = filings['filingDate'][i]
                year = int(date.split("-")[0])
                
                if year in TARGET_YEARS and year not in found_years:
                    accession = filings['accessionNumber'][i]
                    primary_doc = filings['primaryDocument'][i]
                    
                    print(f"Found 10-K for {year} (Filed: {date})")
                    
                    success = download_filing(company, year, accession, primary_doc)
                    
                    if success:
                        found_years.append(year)
                        # Sleep for 0.2 seconds to be polite to SEC servers
                        time.sleep(0.2)
            
            # Stop once we have all 3 years for this company
            if len(found_years) == 3:
                break
    
    print("\n✨ All downloads complete!")

if __name__ == "__main__":
    main()