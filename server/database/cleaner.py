import csv
wordlist = []
with open('4letter.txt') as file:
    raw = file.read().split()
    for word in raw:
        wordlist.append(word)

with open('4letter.csv', mode='w') as output:
    helper = csv.writer(output, delimiter=',',quotechar='"', )
    for word in wordlist:
        helper.writerow([word])