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
clk: ~2.02 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 24.14.1 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 372.32 kb  Range: 49.73 kb … 2.12 mb
  'view-ignored'.browserScan(Git)             Avg: 330.62 kb  Range: 46.84 kb … 1.63 mb
  'view-ignored'.scan(Git, inverted)          Avg: 1.10 mb    Range: 136.38 kb … 2.15 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 1.13 mb    Range: 662.92 kb … 2.48 mb
  'ignore-walk'.walk(.gitignore)              Avg: 42.95 mb   Range: 42.17 mb … 43.61 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 3.09 ms
          'view-ignored'.browserScan(Git) ┤ 2.90 ms
       'view-ignored'.scan(Git, inverted) ┤ 7.07 ms
'view-ignored'.browserScan(Git, inverted) ┤ 6.58 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.28 s
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1.07x faster than 'view-ignored'.scan(Git)
   2.27x faster than 'view-ignored'.browserScan(Git, inverted)
   2.44x faster than 'view-ignored'.scan(Git, inverted)
   442.82x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~2.02 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 24.14.1 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 528.75 kb  Range: 105.75 kb … 1.68 mb
  'view-ignored'.browserScan(NPM)              Avg: 493.99 kb  Range: 11.21 kb … 1.57 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 507.20 kb  Range: 20.76 kb … 1.83 mb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 515.53 kb  Range: 21.50 kb … 2.03 mb
  'npm-packlist'(preparedArbTree)              Avg: 45.24 mb   Range: 44.28 mb … 46.40 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 35.57 mb   Range: 10.41 mb … 42.36 mb
  'view-ignored'.resolveForPack                Avg: 14.93 kb   Range: 14.21 kb … 182.23 kb
  'npmcli/arborist'.loadActual()               Avg: 20.42 mb   Range: 7.52 mb … 23.13 mb

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 4.16 ms
           'view-ignored'.browserScan(NPM) ┤ 3.95 ms
        'view-ignored'.scan(NPM, inverted) ┤ 4.31 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 4.69 ms
           'npm-packlist'(preparedArbTree) ┤■■ 93.88 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.38 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤ 322.31 µs
            'npmcli/arborist'.loadActual() ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 867.62 ms
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM)
   1.05x faster than 'view-ignored'.scan(NPM)
   1.09x faster than 'view-ignored'.scan(NPM, inverted)
   1.19x faster than 'view-ignored'.browserScan(NPM, inverted)
   23.75x faster than 'npm-packlist'(preparedArbTree)
   349.2x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'view-ignored'.resolveForPack
   2691.86x faster than 'npmcli/arborist'.loadActual()
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
clk: ~0.98 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.3 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 86.27 kb   Range: 0.00 b … 664.00 kb
  'view-ignored'.browserScan(Git)             Avg: 54.53 kb   Range: 0.00 b … 524.00 kb
  'view-ignored'.scan(Git, inverted)          Avg: 166.97 kb  Range: 0.00 b … 1.45 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 158.35 kb  Range: 0.00 b … 1.20 mb
  'ignore-walk'.walk(.gitignore)              Avg: 3.78 mb    Range: 880.00 kb … 8.11 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 2.49 ms
          'view-ignored'.browserScan(Git) ┤ 2.49 ms
       'view-ignored'.scan(Git, inverted) ┤ 5.46 ms
'view-ignored'.browserScan(Git, inverted) ┤ 5.13 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 944.79 ms
                                          └                                            ┘

summary
  'view-ignored'.scan(Git)
   1x faster than 'view-ignored'.browserScan(Git)
   2.06x faster than 'view-ignored'.browserScan(Git, inverted)
   2.2x faster than 'view-ignored'.scan(Git, inverted)
   379.96x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~1.01 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.3 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 184.47 kb  Range: 0.00 b … 1.66 mb
  'view-ignored'.browserScan(NPM)              Avg: 106.97 kb  Range: 0.00 b … 700.00 kb
  'view-ignored'.scan(NPM, inverted)           Avg: 161.09 kb  Range: 0.00 b … 588.00 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 129.54 kb  Range: 0.00 b … 1.11 mb
  'npm-packlist'(preparedArbTree)              Avg: 2.04 mb    Range: 12.00 kb … 6.43 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 7.71 mb    Range: 1.72 mb … 23.37 mb
  'view-ignored'.resolveForPack                Avg: 12.49 kb   Range: 0.00 b … 320.00 kb
  'npmcli/arborist'.loadActual()               Avg: 8.57 mb    Range: 2.76 mb … 26.04 mb

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 3.47 ms
           'view-ignored'.browserScan(NPM) ┤ 3.33 ms
        'view-ignored'.scan(NPM, inverted) ┤ 3.40 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 3.35 ms
           'npm-packlist'(preparedArbTree) ┤■■ 79.46 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.07 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤ 177.22 µs
            'npmcli/arborist'.loadActual() ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.03 s
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM)
   1.01x faster than 'view-ignored'.browserScan(NPM, inverted)
   1.02x faster than 'view-ignored'.scan(NPM, inverted)
   1.04x faster than 'view-ignored'.scan(NPM)
   23.88x faster than 'npm-packlist'(preparedArbTree)
   321.69x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'view-ignored'.resolveForPack
   5792x faster than 'npmcli/arborist'.loadActual()
```

<!-- BENCH_BUN_LOW_END -->
