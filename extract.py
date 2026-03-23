import string
import re
try:
    with open(r"c:\Users\chand\OneDrive\Desktop\portfolio\General CV Template (approved).doc", "rb") as f:
        data = f.read()
    printable = set(string.printable.encode('ascii'))
    text = bytes([b for b in data if b in printable]).decode('ascii')
    print(re.sub(r'\s+', ' ', text)[:5000])
except Exception as e:
    print("ERROR:", e)
