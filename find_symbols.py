import sys
import os

def find_symbols(filepath):
    # Common symbols to replace
    symbols = ['★', '♥', '✦', '⚔', '⏱', '⚠', '✓', '✕', '👉', '✨', '⚡', '🔥']
    results = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            found = [s for s in symbols if s in line]
            if found:
                results.append((i + 1, found, line.strip()))
                
    return results

if __name__ == '__main__':
    res = find_symbols('pages/index.jsx')
    for line_num, syms, content in res:
        print(f"{line_num}: {','.join(syms)} | {content}")
