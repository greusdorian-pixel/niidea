import re

def main():
    with open('pages/index.jsx', 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    emoji_pattern = re.compile(
        u"([\\U00002600-\\U000027BF]|[\\U0001f300-\\U0001f64F]|[\\U0001f680-\\U0001f6FF])"
        "+", flags=re.UNICODE)
        
    for i, line in enumerate(lines):
        if emoji_pattern.search(line):
            print(f"{i+1}: {line.strip()}")

if __name__ == '__main__':
    main()
