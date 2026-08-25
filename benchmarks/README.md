# `view-ignored` / benchmarks

### Node

<!-- BENCH_NODE_START -->

```txt
$ node --expose-gc benchmarks/git.js && node --expose-gc benchmarks/npm.js

Git target benchmark
clk: ~3.31 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: node 26.7.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 960.58 kb  Range: 48.65 kb … 2.33 mb
  'view-ignored'.browserScan(Git)             Avg: 937.77 kb  Range: 137.38 kb … 2.67 mb
  'view-ignored'.scan(Git, inverted)          Avg: 1.00 mb    Range: 427.01 kb … 1.57 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 1.00 mb    Range: 684.46 kb … 1.33 mb
  'ignore-walk'.walk(.gitignore)              Avg: 12.32 mb   Range: 11.79 mb … 14.59 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤■ 1.87 ms
          'view-ignored'.browserScan(Git) ┤ 1.69 ms
       'view-ignored'.scan(Git, inverted) ┤■ 1.89 ms
'view-ignored'.browserScan(Git, inverted) ┤■ 1.91 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 10.11 ms
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1.1x faster than 'view-ignored'.scan(Git)
   1.11x faster than 'view-ignored'.scan(Git, inverted)
   1.12x faster than 'view-ignored'.browserScan(Git, inverted)
   5.96x faster than 'ignore-walk'.walk(.gitignore)

Git Init benchmark
clk: ~3.41 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: node 26.7.0 (x64-linux)

Memory Usage:
  'view-ignored'.Git.init   Avg: 36.58 kb   Range: 1.02 kb … 1.00 mb

                             ┌                                            ┐
     'view-ignored'.Git.init ┤ 544.27 µs
                             └                                            ┘

NPM target benchmark
clk: ~3.42 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: node 26.7.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 446.22 kb  Range: 21.57 kb … 1.52 mb
  'view-ignored'.browserScan(NPM)              Avg: 432.02 kb  Range: 155.20 kb … 1.54 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 426.40 kb  Range: 30.87 kb … 1.01 mb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 424.85 kb  Range: 29.66 kb … 878.98 kb
  'npm-packlist'(preparedArbTree)              Avg: 612.84 kb  Range: 136.00 b … 11.50 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 12.30 mb   Range: 12.22 mb … 13.00 mb
  'npmcli/arborist'.loadActual()               Avg: 470.91  b  Range: 134.59 b … 742.35 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 1.29 ms
           'view-ignored'.browserScan(NPM) ┤ 1.23 ms
        'view-ignored'.scan(NPM, inverted) ┤ 1.23 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 1.24 ms
           'npm-packlist'(preparedArbTree) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 21.87 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■ 10.02 ms
                                           └                                            ┘
                                           ┌                                            ┐
            'npmcli/arborist'.loadActual() ┤ 143.72 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM)
   1x faster than 'view-ignored'.scan(NPM, inverted)
   1.01x faster than 'view-ignored'.browserScan(NPM, inverted)
   1.05x faster than 'view-ignored'.scan(NPM)
   8.16x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
   17.82x faster than 'npm-packlist'(preparedArbTree)

NPM Init benchmark
clk: ~3.42 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: node 26.7.0 (x64-linux)

Memory Usage:
  'view-ignored'.NPM.init   Avg: 25.26 kb   Range: 0.00 b … 603.03 kb

                             ┌                                            ┐
     'view-ignored'.NPM.init ┤ 147.19 µs
                             └                                            ┘
```

<!-- BENCH_NODE_END -->

#### Low-end

<!-- BENCH_NODE_LOW_START -->

```txt
$ node --expose-gc benchmarks/git.js && node --expose-gc benchmarks/npm.js



Git target benchmark
clk: ~1.27 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 26.7.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 1.04 mb    Range: 294.34 kb … 1.82 mb
  'view-ignored'.browserScan(Git)             Avg: 1.10 mb    Range: 907.16 kb … 2.25 mb
  'view-ignored'.scan(Git, inverted)          Avg: 1.14 mb    Range: 164.21 kb … 2.99 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 1.17 mb    Range: 934.54 kb … 3.70 mb
  'ignore-walk'.walk(.gitignore)              Avg: 7.48 mb    Range: 6.51 mb … 8.05 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 19.46 ms
          'view-ignored'.browserScan(Git) ┤ 14.73 ms
       'view-ignored'.scan(Git, inverted) ┤ 12.14 ms
'view-ignored'.browserScan(Git, inverted) ┤ 14.94 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.44 s
                                          └                                            ┘

summary
  'view-ignored'.scan(Git, inverted)
   1.21x faster than 'view-ignored'.browserScan(Git)
   1.23x faster than 'view-ignored'.browserScan(Git, inverted)
   1.6x faster than 'view-ignored'.scan(Git)
   118.89x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~1.95 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 26.7.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 503.08 kb  Range: 1.65 kb … 1.63 mb
  'view-ignored'.browserScan(NPM)              Avg: 469.07 kb  Range: 130.77 kb … 1.00 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 500.61 kb  Range: 22.28 kb … 1.65 mb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 494.41 kb  Range: 142.12 kb … 2.20 mb
  'npm-packlist'(preparedArbTree)              Avg: 12.47 mb   Range: 11.37 mb … 18.63 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 9.00 mb    Range: 7.99 mb … 11.58 mb
  'npmcli/arborist'.loadActual()               Avg: 454.09  b  Range: 82.22 b … 738.42 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 5.11 ms
           'view-ignored'.browserScan(NPM) ┤ 4.78 ms
        'view-ignored'.scan(NPM, inverted) ┤ 5.00 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 4.72 ms
           'npm-packlist'(preparedArbTree) ┤■■ 87.11 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.26 s
                                           └                                            ┘
                                           ┌                                            ┐
            'npmcli/arborist'.loadActual() ┤ 347.15 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.01x faster than 'view-ignored'.browserScan(NPM)
   1.06x faster than 'view-ignored'.scan(NPM, inverted)
   1.08x faster than 'view-ignored'.scan(NPM)
   18.45x faster than 'npm-packlist'(preparedArbTree)
   266.24x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_NODE_LOW_END -->

### Bun

<!-- BENCH_BUN_START -->

```txt
$ bun run --expose-gc benchmarks/git.js && bun run --expose-gc benchmarks/npm.js

Git target benchmark
clk: ~1.72 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: bun 1.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 48.92 kb   Range: 0.00 b … 1.00 mb
  'view-ignored'.browserScan(Git)             Avg: 10.47 kb   Range: 0.00 b … 768.00 kb
  'view-ignored'.scan(Git, inverted)          Avg: 10.17 kb   Range: 0.00 b … 896.00 kb
  'view-ignored'.browserScan(Git, inverted)   Avg: 10.11 kb   Range: 0.00 b … 768.00 kb
  'ignore-walk'.walk(.gitignore)              Avg: 161.25 kb  Range: 0.00 b … 3.25 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 1.10 ms
          'view-ignored'.browserScan(Git) ┤ 1.05 ms
       'view-ignored'.scan(Git, inverted) ┤■ 1.20 ms
'view-ignored'.browserScan(Git, inverted) ┤■ 1.16 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 8.40 ms
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1.05x faster than 'view-ignored'.scan(Git)
   1.11x faster than 'view-ignored'.browserScan(Git, inverted)
   1.14x faster than 'view-ignored'.scan(Git, inverted)
   8.03x faster than 'ignore-walk'.walk(.gitignore)

Git Init benchmark
clk: ~3.41 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: bun 1.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.Git.init   Avg: 2.48 kb    Range: 0.00 b … 256.00 kb

                             ┌                                            ┐
     'view-ignored'.Git.init ┤ 203.44 µs
                             └                                            ┘

NPM target benchmark
clk: ~3.39 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: bun 1.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 45.55 kb   Range: 0.00 b … 640.00 kb
  'view-ignored'.browserScan(NPM)              Avg: 21.17 kb   Range: 0.00 b … 512.00 kb
  'view-ignored'.scan(NPM, inverted)           Avg: 23.67 kb   Range: 0.00 b … 512.00 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 2.46 kb    Range: 0.00 b … 384.00 kb
  'npm-packlist'(preparedArbTree)              Avg: 677.93 kb  Range: 0.00 b … 5.63 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 217.21 kb  Range: 0.00 b … 6.38 mb
  'npmcli/arborist'.loadActual()               Avg: 3.97  b    Range: 0.00 b … 128.00 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 744.86 µs
           'view-ignored'.browserScan(NPM) ┤ 711.79 µs
        'view-ignored'.scan(NPM, inverted) ┤ 719.24 µs
 'view-ignored'.browserScan(NPM, inverted) ┤ 696.22 µs
           'npm-packlist'(preparedArbTree) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 23.30 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■ 9.78 ms
                                           └                                            ┘
                                           ┌                                            ┐
            'npmcli/arborist'.loadActual() ┤ 91.37 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.02x faster than 'view-ignored'.browserScan(NPM)
   1.03x faster than 'view-ignored'.scan(NPM, inverted)
   1.07x faster than 'view-ignored'.scan(NPM)
   14.05x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
   33.47x faster than 'npm-packlist'(preparedArbTree)

NPM Init benchmark
clk: ~3.40 GHz
cpu: INTEL(R) XEON(R) PLATINUM 8573C
runtime: bun 1.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.NPM.init   Avg: 4.26 kb    Range: 0.00 b … 256.00 kb

                             ┌                                            ┐
     'view-ignored'.NPM.init ┤ 60.22 µs
                             └                                            ┘
```

<!-- BENCH_BUN_END -->

#### Low-end

<!-- BENCH_BUN_LOW_START -->

```txt
$ bun run --expose-gc benchmarks/git.js && bun run --expose-gc benchmarks/npm.js



Git target benchmark
clk: ~0.99 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 116.12 kb  Range: 0.00 b … 1.21 mb
  'view-ignored'.browserScan(Git)             Avg: 38.25 kb   Range: 0.00 b … 892.00 kb
  'view-ignored'.scan(Git, inverted)          Avg: 86.60 kb   Range: 0.00 b … 1.00 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 124.58 kb  Range: 0.00 b … 1.21 mb
  'ignore-walk'.walk(.gitignore)              Avg: 3.42 mb    Range: 1.30 mb … 10.84 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 4.17 ms
          'view-ignored'.browserScan(Git) ┤ 4.16 ms
       'view-ignored'.scan(Git, inverted) ┤ 4.51 ms
'view-ignored'.browserScan(Git, inverted) ┤ 4.39 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 936.14 ms
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1x faster than 'view-ignored'.scan(Git)
   1.06x faster than 'view-ignored'.browserScan(Git, inverted)
   1.09x faster than 'view-ignored'.scan(Git, inverted)
   225.28x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~1.02 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 108.50 kb  Range: 0.00 b … 552.00 kb
  'view-ignored'.browserScan(NPM)              Avg: 95.38 kb   Range: 0.00 b … 436.00 kb
  'view-ignored'.scan(NPM, inverted)           Avg: 130.57 kb  Range: 0.00 b … 780.00 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 81.94 kb   Range: 0.00 b … 520.00 kb
  'npm-packlist'(preparedArbTree)              Avg: 1.15 mb    Range: 348.00 kb … 2.86 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 5.32 mb    Range: 652.00 kb … 9.83 mb
  'npmcli/arborist'.loadActual()               Avg: 8.21  b    Range: 0.00 b … 85.00 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 3.34 ms
           'view-ignored'.browserScan(NPM) ┤ 3.34 ms
        'view-ignored'.scan(NPM, inverted) ┤ 3.49 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 3.28 ms
           'npm-packlist'(preparedArbTree) ┤■■■ 86.45 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.06 s
                                           └                                            ┘
                                           ┌                                            ┐
            'npmcli/arborist'.loadActual() ┤ 183.70 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.02x faster than 'view-ignored'.scan(NPM)
   1.02x faster than 'view-ignored'.browserScan(NPM)
   1.06x faster than 'view-ignored'.scan(NPM, inverted)
   26.35x faster than 'npm-packlist'(preparedArbTree)
   323.31x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_BUN_LOW_END -->
