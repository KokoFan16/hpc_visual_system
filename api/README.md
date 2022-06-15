# Viveka Profiler -  An end-to-end lightweight and scalable system for profiling MPI-enabled parallel applications.

Viveka Profilier is a lightweight -- a header only library, that enables
profiling of parallel large-scale MPI applications. 

## Usage (API)

1. Include the header.
```cpp
#include "logging_api.h"
```

2. Set the profiler settings.

- `set_rank` sets the total number of processes and the corresponding rank.
```cpp
set_rank(int r, int n);
```

- `set_timestep`
```cpp
set_timestep(int t, int n);
```

- `set_namespath`
```cpp
set_namespath(std::string name);
```

3. Instrument the code using `Events` API.
`Event` is ... There are 4 different ways to instrument an `Event` in the code.

```cpp
Events(std::string n): name(n)
Events(std::string n, std::string t): name(n), tags(t)
Events(std::string n, int loop, int ite): name(n), is_loop(loop), loop_ite(ite)
Events(std::string n, std::string t, int loop, int ite): name(n), tags(t), is_loop(loop), loop_ite(ite)
```

For a sample program, please refer the example folder.


## Format
The profiled runtimes are dumped into a `.csv` file in the directory where the
program was run from.

## Building the example - LifeGame

Requirements: mpicc

```bash
mpic++ lifegame_mpi.cpp -std=c++11 -o lifegame_mpi
```

### Running on a single rank

```bash
./lifegame_mpi <N> <max_generation>
```

### Running on N ranks

```bash
mpirun -n 4 ./lifegame_mpi <N> <max_generation>
```

## Data Format

We dump the collected runtimes in a csv-formatted file as show below. In this
example, the run times collected across the 4 processes is separated by `|`.
```
id,tag,is_loop,times
main,,0,2.743293|2.742943|2.743141|2.743302
main>Pre,,0,0.019408|0.016093|0.018070|0.019397
main>Pre>InitBoard,COMP,0,0.013345|0.013320|0.013294|0.013389
main>Pre>calCounts,COMP,0,0.000007|0.000007|0.000009|0.000006
main>Pre>scatter,COMP,0,0.006028|0.002737|0.004730|0.005974
main>gather,COMP,0,0.000000|0.000001|0.000000|0.000000
main>lifeChange,,0,2.721909|2.725220|2.723262|2.721924
main>lifeChange>BoardChange,COMP,2,2.676076|2.681007|2.673346|2.683844
main>lifeChange>exchange,COMM,2,0.006298|0.010473|0.010510|0.008360
main>lifeChange>statusCheck,COMP,2,0.023682|0.018316|0.024029|0.014409
```