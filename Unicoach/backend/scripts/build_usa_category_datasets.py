import json
import os

ALL_USA_FILE = r'c:\unicoach\verified_university_datasets\usa\all_usa_universities.json'
OUTPUT_BASE = r'c:\unicoach\verified_university_datasets\usa'
FRONTEND_USA_DIR = r'c:\unicoach\frontend\src\data\countries\usa'

def build_usa_categories():
    if not os.path.exists(ALL_USA_FILE):
        print(f"Error: {ALL_USA_FILE} not found!")
        return

    with open(ALL_USA_FILE, 'r', encoding='utf-8') as f:
        all_unis = json.load(f)

    print(f"Loaded {len(all_unis)} total USA Universities.")

    # 1. TOP CITIES
    target_cities = {
        'Chicago': 'Universities_in_Chicago.json',
        'Boston': 'Universities_in_Boston.json',
        'Philadelphia': 'Universities_in_Philadelphia.json',
        'Los Angeles': 'Universities_in_Los_Angeles.json',
        'Atlanta': 'Universities_in_Atlanta.json'
    }

    cities_dir = os.path.join(OUTPUT_BASE, 'cities')
    os.makedirs(cities_dir, exist_ok=True)

    city_data_map = {}

    for city_name, file_name in target_cities.items():
        city_unis = [u for u in all_unis if city_name.lower() in u.get('city', '').lower()]
        out_path = os.path.join(cities_dir, file_name)
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(city_unis, f, indent=2, ensure_ascii=False)
        city_data_map[city_name] = city_unis
        print(f"[CITY] {city_name}: {len(city_unis)} universities saved to {file_name}")

    # 2. TOP COURSES
    courses_dir = os.path.join(OUTPUT_BASE, 'top_courses')
    os.makedirs(courses_dir, exist_ok=True)

    # Masters in USA
    masters_all = all_unis
    with open(os.path.join(courses_dir, 'Masters_in_USA.json'), 'w', encoding='utf-8') as f:
        json.dump(masters_all, f, indent=2, ensure_ascii=False)

    # Masters in Computer Science in USA
    cs_unis = [u for u in all_unis if "Computer Science" in u.get('courses', [])]
    with open(os.path.join(courses_dir, 'Masters_in_computer_science_in_USA.json'), 'w', encoding='utf-8') as f:
        json.dump(cs_unis, f, indent=2, ensure_ascii=False)

    # Masters in Data Science in USA
    ds_unis = [u for u in all_unis if "Data Science" in u.get('courses', []) or "Artificial Intelligence" in u.get('courses', [])]
    with open(os.path.join(courses_dir, 'Masters_in_data_science_in_USA.json'), 'w', encoding='utf-8') as f:
        json.dump(ds_unis, f, indent=2, ensure_ascii=False)

    print(f"[COURSES] Masters in USA: {len(masters_all)} | Masters in CS: {len(cs_unis)} | Masters in DS: {len(ds_unis)}")

    # 3. TOP FEATURED UNIVERSITIES
    top_names = [
        "Harvard University",
        "Stanford University",
        "Northeastern University",
        "Columbia University in the City of New York",
        "Columbia University",
        "Yale University"
    ]

    top_unis = []
    for name in top_names:
        matched = [u for u in all_unis if name.lower() in u.get('name', '').lower()]
        if matched:
            top_unis.append(matched[0])

    top_path = os.path.join(OUTPUT_BASE, 'top_universities.json')
    with open(top_path, 'w', encoding='utf-8') as f:
        json.dump(top_unis, f, indent=2, ensure_ascii=False)

    print(f"[TOP UNIS] Featured Top Universities: {len(top_unis)} saved to top_universities.json")

    # 4. UPDATE FRONTEND MODULES
    # Cities module
    cities_js_path = os.path.join(FRONTEND_USA_DIR, 'cities', 'index.js')
    os.makedirs(os.path.dirname(cities_js_path), exist_ok=True)

    cities_js = f"""/**
 * TOP CITIES IN USA DATASET
 */
export const CITIES_USA = {json.dumps(city_data_map, indent=2, ensure_ascii=False)};
export default CITIES_USA;
"""
    with open(cities_js_path, 'w', encoding='utf-8') as f:
        f.write(cities_js)

    # Courses module
    courses_js_path = os.path.join(FRONTEND_USA_DIR, 'courses', 'index.js')
    os.makedirs(os.path.dirname(courses_js_path), exist_ok=True)

    courses_map = {
        'Masters in USA': len(masters_all),
        'Masters in computer science in USA': len(cs_unis),
        'Masters in data science in USA': len(ds_unis)
    }

    courses_js = f"""/**
 * TOP COURSES IN USA DATASET
 */
export const COURSES_USA = {json.dumps(courses_map, indent=2, ensure_ascii=False)};
export default COURSES_USA;
"""
    with open(courses_js_path, 'w', encoding='utf-8') as f:
        f.write(courses_js)

    print("[SUCCESS] All USA Category Datasets successfully built & updated!")

if __name__ == '__main__':
    build_usa_categories()
