# `view-ignored` / benchmarks

### Node

<!-- BENCH_NODE_START -->

```txt
$ node --expose-gc benchmarks/git.js && node --expose-gc benchmarks/npm.js

Git target benchmark
clk: ~3.01 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: node 26.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(Git, skipInternal)          Avg: 308.56 kb  Range: 11.96 kb … 1.70 mb
  'view-ignored'.browserScan(Git, skipInternal)   Avg: 273.80 kb  Range: 15.57 kb … 2.29 mb
  'view-ignored'.scan(Git)                        Avg: 848.77 kb  Range: 2.78 kb … 2.19 mb
  'view-ignored'.browserScan(Git)                 Avg: 857.56 kb  Range: 20.66 kb … 2.43 mb
  'ignore-walk'.walk(.gitignore)                  Avg: 7.70 mb    Range: 7.06 mb … 8.35 mb

                                              ┌                                            ┐
       'view-ignored'.scan(Git, skipInternal) ┤ 1.62 ms
'view-ignored'.browserScan(Git, skipInternal) ┤ 1.59 ms
                     'view-ignored'.scan(Git) ┤■■■■ 2.49 ms
              'view-ignored'.browserScan(Git) ┤■■■■ 2.50 ms
               'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 9.00 ms
                                              └                                            ┘

summary
  'view-ignored'.browserScan(Git, skipInternal)
   1.02x faster than 'view-ignored'.scan(Git, skipInternal)
   1.57x faster than 'view-ignored'.scan(Git)
   1.58x faster than 'view-ignored'.browserScan(Git)
   5.67x faster than 'ignore-walk'.walk(.gitignore)

Git Init benchmark
clk: ~3.08 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: node 26.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.Git.init   Avg: 26.97 kb   Range: 56.00 b … 994.90 kb

                             ┌                                            ┐
     'view-ignored'.Git.init ┤ 193.96 µs
                             └                                            ┘

NPM target benchmark
clk: ~3.09 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: node 26.4.0 (x64-linux)

Memory Usage:
  'view-ignored'.scan(NPM, skipInternal)          Avg: 308.33 kb  Range: 49.97 kb … 1.67 mb
  'view-ignored'.browserScan(NPM, skipInternal)   Avg: 272.47 kb  Range: 135.01 kb … 1.34 mb
  'view-ignored'.scan(NPM)                        Avg: 917.72 kb  Range: 128.08 kb … 2.46 mb
  'view-ignored'.browserScan(NPM)                 Avg: 934.74 kb  Range: 61.52 kb … 3.88 mb
  'ignore-walk'.walk(.gitignore, .npmignore)      Avg: 7.71 mb    Range: 4.78 mb … 10.17 mb

                                              ┌                                            ┐
       'view-ignored'.scan(NPM, skipInternal) ┤ 1.10 ms
'view-ignored'.browserScan(NPM, skipInternal) ┤ 1.02 ms
                     'view-ignored'.scan(NPM) ┤■■■■■■■ 2.67 ms
              'view-ignored'.browserScan(NPM) ┤■■■■■■■■ 2.71 ms
   'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 8.71 ms
                                              └                                            ┘

summary
  'view-ignored'.browserScan(NPM, skipInternal)
   1.08x faster than 'view-ignored'.scan(NPM, skipInternal)
   2.63x faster than 'view-ignored'.scan(NPM)
   2.67x faster than 'view-ignored'.browserScan(NPM)
   8.58x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_NODE_END -->

#### Low-end

<!-- BENCH_NODE_LOW_START -->

```txt
$ node --expose-gc benchmarks/git.js && node --expose-gc benchmarks/npm.js



Git target benchmark
clk: ~2.02 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 26.7.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git, skipInternal)          Avg: 310.50 kb  Range: 50.30 kb … 1.83 mb
  'view-ignored'.browserScan(Git, skipInternal)   Avg: 264.05 kb  Range: 46.11 kb … 932.00 kb
  'view-ignored'.scan(Git)                        Avg: 8.34 mb    Range: 8.02 mb … 9.31 mb
  'view-ignored'.browserScan(Git)                 Avg: 8.29 mb    Range: 8.23 mb … 8.38 mb
  'view-ignored'.scan(Git, inverted)              Avg: 9.83 mb    Range: 9.34 mb … 11.67 mb
  'view-ignored'.browserScan(Git, inverted)       Avg: 9.66 mb    Range: 9.64 mb … 9.75 mb
  'ignore-walk'.walk(.gitignore)                  Avg: 4.93 mb    Range: 361.95 kb … 8.42 mb

                                              ┌                                            ┐
       'view-ignored'.scan(Git, skipInternal) ┤ 2.82 ms
'view-ignored'.browserScan(Git, skipInternal) ┤ 2.48 ms
                     'view-ignored'.scan(Git) ┤ 17.35 ms
              'view-ignored'.browserScan(Git) ┤ 16.57 ms
           'view-ignored'.scan(Git, inverted) ┤■ 26.64 ms
    'view-ignored'.browserScan(Git, inverted) ┤■ 25.04 ms
               'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.11 s
                                              └                                            ┘

summary
  'view-ignored'.browserScan(Git, skipInternal)
   1.14x faster than 'view-ignored'.scan(Git, skipInternal)
   6.68x faster than 'view-ignored'.browserScan(Git)
   6.99x faster than 'view-ignored'.scan(Git)
   10.09x faster than 'view-ignored'.browserScan(Git, inverted)
   10.74x faster than 'view-ignored'.scan(Git, inverted)
   448.98x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~1.67 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: node 26.7.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM, skipInternal)          Avg: 293.00 kb  Range: 110.02 kb … 1.74 mb
  'view-ignored'.browserScan(NPM, skipInternal)   Avg: 262.15 kb  Range: 143.57 kb … 1.52 mb
  'view-ignored'.scan(NPM)                        Avg: 9.25 mb    Range: 777.68 kb … 11.78 mb
  'view-ignored'.browserScan(NPM)                 Avg: 10.12 mb   Range: 9.96 mb … 10.59 mb
  'view-ignored'.scan(NPM, inverted)              Avg: 10.96 mb   Range: 10.94 mb … 11.00 mb
  'view-ignored'.browserScan(NPM, inverted)       Avg: 10.93 mb   Range: 10.88 mb … 10.99 mb
  'npm-packlist'(preparedArbTree)                 Avg: 11.62 mb   Range: 10.50 mb … 16.63 mb
  'ignore-walk'.walk(.gitignore, .npmignore)      Avg: 4.27 mb    Range: 2.82 mb … 15.09 mb
  'npmcli/arborist'.loadActual()                  Avg: 453.98  b  Range: 142.39 b … 738.42 b

                                              ┌                                            ┐
       'view-ignored'.scan(NPM, skipInternal) ┤ 3.21 ms
'view-ignored'.browserScan(NPM, skipInternal) ┤ 2.89 ms
                     'view-ignored'.scan(NPM) ┤■ 56.71 ms
              'view-ignored'.browserScan(NPM) ┤■ 54.06 ms
           'view-ignored'.scan(NPM, inverted) ┤■ 59.89 ms
    'view-ignored'.browserScan(NPM, inverted) ┤■ 58.64 ms
              'npm-packlist'(preparedArbTree) ┤■■ 91.31 ms
   'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.34 s
                                              └                                            ┘
                                              ┌                                            ┐
               'npmcli/arborist'.loadActual() ┤ 347.20 ns
                                              └                                            ┘

summary
  'view-ignored'.browserScan(NPM, skipInternal)
   1.11x faster than 'view-ignored'.scan(NPM, skipInternal)
   18.73x faster than 'view-ignored'.browserScan(NPM)
   19.65x faster than 'view-ignored'.scan(NPM)
   20.32x faster than 'view-ignored'.browserScan(NPM, inverted)
   20.75x faster than 'view-ignored'.scan(NPM, inverted)
   31.64x faster than 'npm-packlist'(preparedArbTree)
   463.86x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_NODE_LOW_END -->

### Bun

<!-- BENCH_BUN_START -->

```txt
$ bun run --expose-gc benchmarks/git.js && bun run --expose-gc benchmarks/npm.js

Git target benchmark
clk: ~1.57 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: bun 1.3.14 (x64-linux)

Memory Usage:
  'view-ignored'.scan(Git, skipInternal)          Avg: 31.17 kb   Range: 0.00 b … 1.13 mb
  'view-ignored'.browserScan(Git, skipInternal)   Avg: 9.72 kb    Range: 0.00 b … 640.00 kb
  'view-ignored'.scan(Git)                        Avg: 22.90 kb   Range: 0.00 b … 768.00 kb
  'view-ignored'.browserScan(Git)                 Avg: 9.45 kb    Range: 0.00 b … 256.00 kb
  'ignore-walk'.walk(.gitignore)                  Avg: 137.28 kb  Range: 0.00 b … 2.00 mb

                                              ┌                                            ┐
       'view-ignored'.scan(Git, skipInternal) ┤ 969.75 µs
'view-ignored'.browserScan(Git, skipInternal) ┤ 875.69 µs
                     'view-ignored'.scan(Git) ┤■■■ 1.68 ms
              'view-ignored'.browserScan(Git) ┤■■■ 1.63 ms
               'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 9.16 ms
                                              └                                            ┘

summary
  'view-ignored'.browserScan(Git, skipInternal)
   1.11x faster than 'view-ignored'.scan(Git, skipInternal)
   1.87x faster than 'view-ignored'.browserScan(Git)
   1.92x faster than 'view-ignored'.scan(Git)
   10.46x faster than 'ignore-walk'.walk(.gitignore)

Git Init benchmark
clk: ~1.58 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: bun 1.3.14 (x64-linux)

Memory Usage:
  'view-ignored'.Git.init   Avg: 1.99 kb    Range: 0.00 b … 3.38 mb

                             ┌                                            ┐
     'view-ignored'.Git.init ┤ 70.94 µs
                             └                                            ┘

NPM target benchmark
clk: ~3.11 GHz
cpu: AMD EPYC 7763 64-Core Processor
runtime: bun 1.3.14 (x64-linux)

Memory Usage:
  'view-ignored'.scan(NPM, skipInternal)          Avg: 25.51 kb   Range: 0.00 b … 3.13 mb
  'view-ignored'.browserScan(NPM, skipInternal)   Avg: 16.77 kb   Range: 0.00 b … 1.25 mb
  'view-ignored'.scan(NPM)                        Avg: 41.21 kb   Range: 0.00 b … 1.25 mb
  'view-ignored'.browserScan(NPM)                 Avg: 11.13 kb   Range: 0.00 b … 640.00 kb
  'ignore-walk'.walk(.gitignore, .npmignore)      Avg: 113.16 kb  Range: 0.00 b … 2.75 mb

                                              ┌                                            ┐
       'view-ignored'.scan(NPM, skipInternal) ┤ 807.13 µs
'view-ignored'.browserScan(NPM, skipInternal) ┤ 728.20 µs
                     'view-ignored'.scan(NPM) ┤■■■■■■ 2.33 ms
              'view-ignored'.browserScan(NPM) ┤■■■■■■ 2.28 ms
   'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 9.27 ms
                                              └                                            ┘

summary
  'view-ignored'.browserScan(NPM, skipInternal)
   1.11x faster than 'view-ignored'.scan(NPM, skipInternal)
   3.13x faster than 'view-ignored'.browserScan(NPM)
   3.19x faster than 'view-ignored'.scan(NPM)
   12.73x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_BUN_END -->

#### Low-end

<!-- BENCH_BUN_LOW_START -->

```txt
$ bun run --expose-gc benchmarks/git.js && bun run --expose-gc benchmarks/npm.js



Git target benchmark
clk: ~0.93 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(Git, skipInternal)          Avg: 56.20 kb   Range: 0.00 b … 304.00 kb
  'view-ignored'.browserScan(Git, skipInternal)   Avg: 54.87 kb   Range: 0.00 b … 564.00 kb
  'view-ignored'.scan(Git)                        Avg: 732.00 kb  Range: 8.00 kb … 8.25 mb
  'view-ignored'.browserScan(Git)                 Avg: 791.45 kb  Range: 4.00 kb … 7.04 mb
  'view-ignored'.scan(Git, inverted)              Avg: 1.35 mb    Range: 40.00 kb … 8.09 mb
  'view-ignored'.browserScan(Git, inverted)       Avg: 944.73 kb  Range: 0.00 b … 3.00 mb
  'ignore-walk'.walk(.gitignore)                  Avg: 3.27 mb    Range: 160.00 kb … 9.55 mb

                                              ┌                                            ┐
       'view-ignored'.scan(Git, skipInternal) ┤ 2.10 ms
'view-ignored'.browserScan(Git, skipInternal) ┤ 2.17 ms
                     'view-ignored'.scan(Git) ┤■ 19.52 ms
              'view-ignored'.browserScan(Git) ┤■ 20.82 ms
           'view-ignored'.scan(Git, inverted) ┤■ 24.38 ms
    'view-ignored'.browserScan(Git, inverted) ┤■ 24.52 ms
               'ignore-walk'.walk(.gitignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.03 s
                                              └                                            ┘

summary
  'view-ignored'.scan(Git, skipInternal)
   1.03x faster than 'view-ignored'.browserScan(Git, skipInternal)
   9.29x faster than 'view-ignored'.scan(Git)
   9.9x faster than 'view-ignored'.browserScan(Git)
   11.6x faster than 'view-ignored'.scan(Git, inverted)
   11.67x faster than 'view-ignored'.browserScan(Git, inverted)
   488.72x faster than 'ignore-walk'.walk(.gitignore)

NPM target benchmark
clk: ~0.91 GHz
cpu: Intel(R) Pentium(R) Silver N6000 @ 1.10GHz
runtime: bun 1.4.0 (x64-win32)

Memory Usage:
  'view-ignored'.scan(NPM, skipInternal)          Avg: 103.75 kb  Range: 0.00 b … 1.38 mb
  'view-ignored'.browserScan(NPM, skipInternal)   Avg: 80.60 kb   Range: 0.00 b … 408.00 kb
  'view-ignored'.scan(NPM)                        Avg: 2.09 mb    Range: 120.00 kb … 6.39 mb
  'view-ignored'.browserScan(NPM)                 Avg: 1.52 mb    Range: 12.00 kb … 7.44 mb
  'view-ignored'.scan(NPM, inverted)              Avg: 4.44 mb    Range: 192.00 kb … 9.34 mb
  'view-ignored'.browserScan(NPM, inverted)       Avg: 6.06 mb    Range: 872.00 kb … 9.81 mb
  'npm-packlist'(preparedArbTree)                 Avg: 4.34 mb    Range: 56.00 kb … 21.84 mb
  'ignore-walk'.walk(.gitignore, .npmignore)      Avg: 6.16 mb    Range: 956.00 kb … 10.42 mb
  'npmcli/arborist'.loadActual()                  Avg: 17.14  b   Range: 0.00 b … 178.00 b

                                              ┌                                            ┐
       'view-ignored'.scan(NPM, skipInternal) ┤ 2.40 ms
'view-ignored'.browserScan(NPM, skipInternal) ┤ 2.26 ms
                     'view-ignored'.scan(NPM) ┤■ 49.99 ms
              'view-ignored'.browserScan(NPM) ┤■■ 51.41 ms
           'view-ignored'.scan(NPM, inverted) ┤■■ 61.07 ms
    'view-ignored'.browserScan(NPM, inverted) ┤■■ 61.94 ms
              'npm-packlist'(preparedArbTree) ┤■■■ 97.99 ms
   'ignore-walk'.walk(.gitignore, .npmignore) ┤■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■ 1.11 s
                                              └                                            ┘
                                              ┌                                            ┐
               'npmcli/arborist'.loadActual() ┤ 210.92 ns
                                              └                                            ┘

summary
  'view-ignored'.browserScan(NPM, skipInternal)
   1.06x faster than 'view-ignored'.scan(NPM, skipInternal)
   22.14x faster than 'view-ignored'.scan(NPM)
   22.77x faster than 'view-ignored'.browserScan(NPM)
   27.05x faster than 'view-ignored'.scan(NPM, inverted)
   27.44x faster than 'view-ignored'.browserScan(NPM, inverted)
   43.4x faster than 'npm-packlist'(preparedArbTree)
   490.97x faster than 'ignore-walk'.walk(.gitignore, .npmignore)
```

<!-- BENCH_BUN_LOW_END -->
