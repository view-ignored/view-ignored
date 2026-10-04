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
clk: ~2.04 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 24.14.1 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 441.61 kb  Range: 808.00 b … 2.77 mb
  'view-ignored'.browserScan(Git)             Avg: 356.88 kb  Range: 21.20 kb … 1.01 mb
  'view-ignored'.scan(Git, inverted)          Avg: 1.54 mb    Range: 266.78 kb … 3.29 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 1.49 mb    Range: 1.04 mb … 2.87 mb
  'ignore-walk'.walk(.gitignore)              Avg: 14.43 mb   Range: 13.36 mb … 15.24 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 3.20 ms
          'view-ignored'.browserScan(Git) ┤ 2.92 ms
       'view-ignored'.scan(Git, inverted) ┤ 7.29 ms
'view-ignored'.browserScan(Git, inverted) ┤ 6.61 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.31 s
                                          └                                            ┘

summary
  'view-ignored'.browserScan(Git)
   1.1x faster than 'view-ignored'.scan(Git)
   2.27x faster than 'view-ignored'.browserScan(Git, inverted)
   2.5x faster than 'view-ignored'.scan(Git, inverted)
   449.66x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~1.84 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 24.14.1 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 721.94 kb  Range: 231.01 kb … 2.04 mb
  'view-ignored'.browserScan(NPM)              Avg: 664.38 kb  Range: 56.25 kb … 1.79 mb
  'view-ignored'.scan(NPM, inverted)           Avg: 650.89 kb  Range: 365.56 kb … 948.51 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 656.76 kb  Range: 259.32 kb … 1.78 mb
  'npm-packlist'(preparedArbTree)              Avg: 46.97 mb   Range: 46.53 mb … 47.85 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 14.08 mb   Range: 13.73 mb … 14.55 mb
  'view-ignored'.resolveForPack                Avg: 14.70 kb   Range: 13.82 kb … 484.05 kb
  'npmcli/arborist'.loadActual()               Avg: 630.02  b  Range: 186.90 b … 866.94 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 6.44 ms
           'view-ignored'.browserScan(NPM) ┤ 5.70 ms
        'view-ignored'.scan(NPM, inverted) ┤ 5.41 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 5.17 ms
           'npm-packlist'(preparedArbTree) ┤■■ 97.84 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.38 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 354.92 µs
            'npmcli/arborist'.loadActual() ┤ 371.61 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.05x faster than 'view-ignored'.scan(NPM, inverted)
   1.1x faster than 'view-ignored'.browserScan(NPM)
   1.24x faster than 'view-ignored'.scan(NPM)
   18.91x faster than 'npm-packlist'(preparedArbTree)
   266.85x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'npmcli/arborist'.loadActual()
   955.08x faster than 'view-ignored'.resolveForPack
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
clk: ~0.94 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.2 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git)                    Avg: 154.99 kb  Range: 0.00 b … 864.00 kb
  'view-ignored'.browserScan(Git)             Avg: 164.71 kb  Range: 0.00 b … 1.24 mb
  'view-ignored'.scan(Git, inverted)          Avg: 766.90 kb  Range: 72.00 kb … 1.45 mb
  'view-ignored'.browserScan(Git, inverted)   Avg: 319.91 kb  Range: 4.00 kb … 1.38 mb
  'ignore-walk'.walk(.gitignore)              Avg: 3.86 mb    Range: 744.00 kb … 9.60 mb

                                          ┌                                            ┐
                 'view-ignored'.scan(Git) ┤ 5.19 ms
          'view-ignored'.browserScan(Git) ┤ 6.42 ms
       'view-ignored'.scan(Git, inverted) ┤ 20.42 ms
'view-ignored'.browserScan(Git, inverted) ┤ 14.14 ms
           'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.12 s
                                          └                                            ┘

summary
  'view-ignored'.scan(Git)
   1.24x faster than 'view-ignored'.browserScan(Git)
   2.72x faster than 'view-ignored'.browserScan(Git, inverted)
   3.93x faster than 'view-ignored'.scan(Git, inverted)
   216.47x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~0.88 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.2 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM)                     Avg: 309.22 kb  Range: 0.00 b … 1.09 mb
  'view-ignored'.browserScan(NPM)              Avg: 219.25 kb  Range: 0.00 b … 860.00 kb
  'view-ignored'.scan(NPM, inverted)           Avg: 299.37 kb  Range: 0.00 b … 800.00 kb
  'view-ignored'.browserScan(NPM, inverted)    Avg: 231.08 kb  Range: 0.00 b … 864.00 kb
  'npm-packlist'(preparedArbTree)              Avg: 976.80 kb  Range: 60.00 kb … 3.82 mb
  'ignore-walk'.walk(.gitignore, .npmignore)   Avg: 5.04 mb    Range: 1.03 mb … 9.79 mb
  'view-ignored'.resolveForPack                Avg: 12.99 kb   Range: 0.00 b … 160.00 kb
  'npmcli/arborist'.loadActual()               Avg: 16.70  b   Range: 0.00 b … 271.00 b

                                           ┌                                            ┐
                  'view-ignored'.scan(NPM) ┤ 5.81 ms
           'view-ignored'.browserScan(NPM) ┤ 4.39 ms
        'view-ignored'.scan(NPM, inverted) ┤ 4.22 ms
 'view-ignored'.browserScan(NPM, inverted) ┤ 3.95 ms
           'npm-packlist'(preparedArbTree) ┤■■■ 91.68 ms
'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.09 s
                                           └                                            ┘
                                           ┌                                            ┐
             'view-ignored'.resolveForPack ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 185.58 µs
            'npmcli/arborist'.loadActual() ┤ 208.80 ns
                                           └                                            ┘

summary
  'view-ignored'.browserScan(NPM, inverted)
   1.07x faster than 'view-ignored'.scan(NPM, inverted)
   1.11x faster than 'view-ignored'.browserScan(NPM)
   1.47x faster than 'view-ignored'.scan(NPM)
   23.23x faster than 'npm-packlist'(preparedArbTree)
   276.5x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
summary
  'npmcli/arborist'.loadActual()
   888.8x faster than 'view-ignored'.resolveForPack
```

<!-- BENCH_BUN_LOW_END -->
