# 🧮 bloom-filter-uuid

A Bloom filter for UUIDs.

## 🎯 Motivation

This filter is a variant of a Bloom filter optimized for work with UUIDs.
It has variants for various desired amounts of data and false positive probabilities.

## ✨ Features

- Easy in use
- Optimized for UUIDs
- Able to allocate arbitrary huge amount of memory
- Space-efficient
- Clear and predictable behavior

## 📝 Usage

```js
const BloomFilter = require('@vadym.gidulian/bloom-filter-uuid');

// Print help
BloomFilter.printHelp();
/*
A Bloom filter is a space-efficient probabilistic data structure, that is used to test whether an element is a member of a set.
False positive matches are possible, but false negatives are not – in other words, a query returns either "possibly in set" or "definitely not in set".
Elements can be added to the set, but not removed; the more items added, the larger the probability of false positives.

                                   Max. number of inserted elements for desired false positive probability                                   
Variant |   Memory   |  0.001%  |   0.01%  |   0.1%   |    1%    |    3%    |    5%    |    10%   |    15%   |    20%   |    25%   |    50%  
--------+------------+----------+----------+----------+----------+----------+----------+----------+----------+----------+----------+---------
   40   | 384    GiB |  23.9  B |  52.3  B | 116    B | 267    B | 409    B | 505    B | 686    B | 833    B | 966    B |   1.09 T |   1.74 T
   39   | 192    GiB |  12    B |  26.1  B |  57.9  B | 133    B | 205    B | 253    B | 343    B | 417    B | 483    B | 547    B | 868    B
   38   |  96    GiB |   5.99 B |  13.1  B |  29    B |  66.7  B | 102    B | 126    B | 172    B | 208    B | 242    B | 273    B | 434    B
   37   |  48    GiB |   2.99 B |   6.53 B |  14.5  B |  33.3  B |  51.1  B |  63.2  B |  85.8  B | 104    B | 121    B | 137    B | 217    B
   36   |  24    GiB |   1.5  B |   3.27 B |   7.24 B |  16.7  B |  25.6  B |  31.6  B |  42.9  B |  52.1  B |  60.4  B |  68.3  B | 108    B
   35   |  12    GiB | 748    M |   1.63 B |   3.62 B |   8.34 B |  12.8  B |  15.8  B |  21.4  B |  26    B |  30.2  B |  34.2  B |  54.2  B
   34   |   6    GiB | 374    M | 817    M |   1.81 B |   4.17 B |   6.39 B |   7.89 B |  10.7  B |  13    B |  15.1  B |  17.1  B |  27.1  B
   33   |   3    GiB | 187    M | 408    M | 905    M |   2.08 B |   3.2  B |   3.95 B |   5.36 B |   6.51 B |   7.55 B |   8.54 B |  13.6  B
   32   |   2    GiB | 249    M | 453    M | 841    M |   1.63 B |   2.31 B |   2.75 B |   3.55 B |   4.18 B |   4.75 B |   5.27 B |   7.9  B
   31   |   1    GiB | 124    M | 226    M | 420    M | 816    M |   1.16 B |   1.38 B |   1.77 B |   2.09 B |   2.37 B |   2.64 B |   3.95 B
   30   | 512    MiB |  62.1  M | 113    M | 210    M | 408    M | 578    M | 688    M | 887    M |   1.05 B |   1.19 B |   1.32 B |   1.97 B
   29   | 256    MiB |  31.1  M |  56.6  M | 105    M | 204    M | 289    M | 344    M | 444    M | 523    M | 593    M | 659    M | 987    M
   28   | 128    MiB |  15.5  M |  28.3  M |  52.6  M | 102    M | 144    M | 172    M | 222    M | 261    M | 297    M | 330    M | 493    M
   27   |  64    MiB |   7.77 M |  14.1  M |  26.3  M |  51    M |  72.2  M |  85.9  M | 111    M | 131    M | 148    M | 165    M | 247    M
   26   |  32    MiB |   3.88 M |   7.07 M |  13.1  M |  25.5  M |  36.1  M |  43    M |  55.5  M |  65.3  M |  74.1  M |  82.4  M | 123    M
   25   |  20    MiB |   3.54 M |   5.79 M |   9.71 M |  17    M |  23    M |  26.7  M |  33.4  M |  38.7  M |  43.3  M |  47.6  M |  68.6  M
   24   |  10    MiB |   1.77 M |   2.9  M |   4.85 M |   8.52 M |  11.5  M |  13.4  M |  16.7  M |  19.3  M |  21.6  M |  23.8  M |  34.3  M
   23   |   5    MiB | 884    K |   1.45 M |   2.43 M |   4.26 M |   5.75 M |   6.68 M |   8.36 M |   9.67 M |  10.8  M |  11.9  M |  17.2  M
   22   |   2.5  MiB | 442    K | 724    K |   1.21 M |   2.13 M |   2.87 M |   3.34 M |   4.18 M |   4.84 M |   5.41 M |   5.95 M |   8.58 M
   21   |   1.5  MiB | 333    K | 509    K | 797    K |   1.31 M |   1.71 M |   1.96 M |   2.4  M |   2.74 M |   3.03 M |   3.31 M |   4.65 M
   20   | 768    KiB | 166    K | 254    K | 399    K | 654    K | 855    K | 979    K |   1.2  M |   1.37 M |   1.52 M |   1.66 M |   2.32 M
   19   | 384    KiB |  83.2  K | 127    K | 199    K | 327    K | 427    K | 490    K | 600    K | 684    K | 759    K | 828    K |   1.16 M
   18   | 224    KiB |  56.2  K |  81.9  K | 122    K | 191    K | 244    K | 277    K | 333    K | 377    K | 415    K | 450    K | 619    K
   17   | 112    KiB |  28.1  K |  40.9  K |  61.1  K |  95.6  K | 122    K | 138    K | 167    K | 188    K | 207    K | 225    K | 310    K
   16   |  64    KiB |  17.7  K |  24.9  K |  35.9  K |  54.2  K |  67.9  K |  76.3  K |  90.8  K | 102    K | 112    K | 120    K | 163    K
   15   |  32    KiB |   8.87 K |  12.5  K |  17.9  K |  27.1  K |  33.9  K |  38.1  K |  45.4  K |  51    K |  55.8  K |  60.2  K |  81.6  K
   14   |  18    KiB |   5.34 K |   7.3  K |  10.2  K |  15    K |  18.5  K |  20.7  K |  24.4  K |  27.2  K |  29.6  K |  31.9  K |  42.6  K
   13   |   9    KiB |   2.67 K |   3.65 K |   5.11 K |   7.5  K |   9.27 K |  10.3  K |  12.2  K |  13.6  K |  14.8  K |  15.9  K |  21.3  K
   12   |   5    KiB |   1.56 K |   2.08 K |   2.85 K |   4.08 K |   4.99 K |   5.54 K |   6.48 K |   7.19 K |   7.81 K |   8.37 K |  11.1  K
   11   |   2.75 KiB | 886      |   1.16 K |   1.56 K |   2.2  K |   2.66 K |   2.94 K |   3.41 K |   3.77 K |   4.08 K |   4.37 K |   5.73 K
   10   |   1.5  KiB | 495      | 639      | 846      |   1.17 K |   1.41 K |   1.55 K |   1.79 K |   1.97 K |   2.13 K |   2.27 K |   2.95 K
    9   | 896      B | 296      | 374      | 483      | 651      | 772      | 843      | 966      |   1.06 K |   1.14 K |   1.21 K |   1.55 K
    8   | 512      B | 171      | 212      | 268      | 355      | 416      | 452      | 514      | 561      | 601      | 637      | 809     
    7   | 288      B |  96      | 117      | 146      | 191      | 222      | 240      | 271      | 295      | 315      | 333      | 419     
    6   | 168      B |  55      |  66      |  81      | 104      | 120      | 129      | 145      | 157      | 167      | 176      | 219     
    5   | 100      B |  32      |  38      |  45      |  57      |  65      |  70      |  78      |  84      |  89      |  93      | 115     
    4   |  64      B |  19      |  22      |  26      |  32      |  36      |  39      |  43      |  46      |  48      |  51      |  61     
    3   |  42      B |  11      |  13      |  15      |  18      |  20      |  21      |  23      |  25      |  26      |  27      |  33     
    2   |  32      B |   7      |   8      |   9      |  11      |  12      |  12      |  13      |  14      |  15      |  15      |  18     
*/

// Get information about a variant
const variant = BloomFilter.describeVariant(12);
/*
{
	k: 10,            // Number of hash functions
	m: 40960,         // Number of bits
	bufferSize: 5120, // Size in memory
	calcE, calcN
}
*/
// Calculate approximate false positive probability of the variant
// with specified desired number of inserted elements
variant.calcE(5_000); // 0.03032...
// Calculate approximate number of elements that could be inserted
// with specified desired false positive probability of the variant
variant.calcN(2_500); // 4083


const bf = new BloomFilter(12);
bf.variant; // 12
bf.buffers; // Array of buffers storing the set

// Add an element to the set
bf.add('01234567-89ab-cdef-0123-456789abcdef');
bf.add('...');
bf.add('...');

// Test whether an element is in the set
bf.has('01234567-89ab-cdef-0123-456789abcdef'); // true, with probability of `1 - variant.calcE(3)`
bf.has('fedcba98-7654-3210-fedc-ba9876543210'); // definitely false
```
