def partitions(s):
    if s:
        for i in range(1, len(s) + 1):
            for p in partitions(s[i:]):
                yield [s[:i]] + p
    else:
        yield []

list(partitions("123"))

def partitions(s, minLength=1):
    if len(s) >= minLength:
        for i in range(minLength, len(s) + 1):
            for p in partitions(s[i:], 1 if i > 1 else 2):
                yield [s[:i]] + p
    elif not s:
        yield []



def subs(l):
    if l == []:
        return [[]]

    x = subs(l[1:])

    return x + [[l[0]] + y for y in x]





def partitions(n):
    if n == 0:
        yield []
    else:
        for partial_partition in partitions(my_list[n-1]):
            for i in range(len(partial_partition)):
                copy_partition = partial_partition[:]
                copy_partition[i] += (my_list[n],)
                yield copy_partition
            yield partial_partition + [(my_list[n],)]


https://stackoverflow.com/questions/19169678/finding-all-possible-combination-of-all-possible-subsets-of-lists

def partitions(myList):
   if not myList:
       yield []
   else:
       for partial_partition in partitions(myList[:-1]):
           for i in range(len(partial_partition)):
               copy_partition = partial_partition[:]
               copy_partition[i] += (myList[-1],)
               yield copy_partition
           yield partial_partition + [(myList[-1],)]

result = list(partitions(['1', '2', '3']))