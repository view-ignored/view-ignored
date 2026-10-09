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
  'view-ignored'.scan(Git)                    Avg: 371.11 kb  Range: 15.28 kb … 1.94 mb
  'view-ignored'.browserScan(Git)             Avg: 323.31 kb  Range: 43.17 kb … 1.70 mb
  'view-ignored'.scan(Git, inverted)          Avg: 1.16 mb    Range: 271.72 kb … 3.02 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 1.11 mb    Range: 39.40 kb … 2.90 mb
  'ignore-walk'.walk(.gitignore)              Avg: 36.13 mb   Range: 8.44 mb … 42.54 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 3.28 ms
          'view-ignored'.browserScan(Git) ┤ 3.04 ms
       'view-ignored'.scan(Git, inverted) ┤ 7.40 ms
'view-ignored'.browserScan(Git, inverted) ┤ 6.91 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.28 s
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1.08x faster than 'view-ignored'.scan(Git)
   2.27x faster than 'view-ignored'.browserScan(Git, inverted)
   2.43x faster than 'view-ignored'.scan(Git, inverted)
   421.87x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~2.05 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 24.14.1 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 518.83 kb  Range: 187.23 kb … 1.59 mb
  'view-ignored'.browserScan(NPM)              Avg: 509.59 kb  Range: 162.01 kb … 1.81 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 520.67 kb  Range: 68.33 kb … 2.03 mb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 509.41 kb  Range: 214.31 kb … 1.50 mb
  'npm-packlist'(preparedArbTree)              Avg: 45.37 mb   Range: 44.99 mb … 46.47 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 41.40 mb   Range: 40.97 mb … 41.76 mb
  'view-ignored'.resolveForPack                Avg: 14.64 kb   Range: 9.49 kb … 185.59 kb
  'npmcli/arborist'.loadActual()               Avg: 630.95  b  Range: 310.38 b … 842.92 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 4.10 ms
           'view-ignored'.browserScan(NPM) ┤ 4.13 ms
        'view-ignored'.scan(NPM, inverted) ┤ 4.71 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 4.97 ms
           'npm-packlist'(preparedArbTree) ┤■■ 105.68 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.44 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 340.22 µs
            'npmcli/arborist'.loadActual() ┤ 375.42 ns
                                           └                                            ┘

summary
  'view-ignored'.scan(NPM)
   1.01x faster than 'view-ignored'.browserScan(NPM)
   1.15x faster than 'view-ignored'.scan(NPM, inverted)
   1.21x faster than 'view-ignored'.browserScan(NPM, inverted)
   25.77x faster than 'npm-packlist'(preparedArbTree)
   350.75x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'npmcli/arborist'.loadActual()
   906.23x faster than 'view-ignored'.resolveForPack
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
clk: ~0.96 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.3 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 101.75 kb  Range: 0.00 b … 956.00 kb
  'view-ignored'.browserScan(Git)             Avg: 65.48 kb   Range: 0.00 b … 1.24 mb
  'view-ignored'.scan(Git, inverted)          Avg: 179.16 kb  Range: 0.00 b … 1.04 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 179.19 kb  Range: 0.00 b … 1.70 mb
  'ignore-walk'.walk(.gitignore)              Avg: 4.51 mb    Range: 0.98 mb … 8.59 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 2.68 ms
          'view-ignored'.browserScan(Git) ┤ 2.73 ms
       'view-ignored'.scan(Git, inverted) ┤ 5.62 ms
'view-ignored'.browserScan(Git, inverted) ┤ 5.35 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 997.98 ms
                                          └                                            ┘

summary
  'view-ignored'.scan(Git)
   1.02x faster than 'view-ignored'.browserScan(Git)
   2x faster than 'view-ignored'.browserScan(Git, inverted)
   2.1x faster than 'view-ignored'.scan(Git, inverted)
   372.61x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~0.97 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.3 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 198.43 kb  Range: 0.00 b … 1.28 mb
  'view-ignored'.browserScan(NPM)              Avg: 187.61 kb  Range: 0.00 b … 1.06 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 139.62 kb  Range: 0.00 b … 644.00 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 85.14 kb   Range: 0.00 b … 644.00 kb
  'npm-packlist'(preparedArbTree)              Avg: 2.90 mb    Range: 300.00 kb … 7.18 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 9.31 mb    Range: 0.98 mb … 29.27 mb
  'view-ignored'.resolveForPack                Avg: 13.64 kb   Range: 0.00 b … 260.00 kb
  'npmcli/arborist'.loadActual()               Avg: 10.38  b   Range: 0.00 b … 197.00 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 3.68 ms
           'view-ignored'.browserScan(NPM) ┤ 3.69 ms
        'view-ignored'.scan(NPM, inverted) ┤ 3.73 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 3.53 ms
           'npm-packlist'(preparedArbTree) ┤■■ 88.77 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.19 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 195.96 µs
            'npmcli/arborist'.loadActual() ┤ 187.06 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.04x faster than 'view-ignored'.scan(NPM)
   1.04x faster than 'view-ignored'.browserScan(NPM)
   1.05x faster than 'view-ignored'.scan(NPM, inverted)
   25.13x faster than 'npm-packlist'(preparedArbTree)
   338.3x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'npmcli/arborist'.loadActual()
   1047.59x faster than 'view-ignored'.resolveForPack
```

<!-- BENCH_BUN_LOW_END -->
