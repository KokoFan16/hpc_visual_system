#ifndef PROFILER_H_
#define PROFILER_H_

#include <iostream>
#include <string>
#include <map> 
#include <vector>
#include <sstream>
#include <iterator>
#include <mpi.h>

using namespace std;

class Profiler {
	public:
		int ntimestep;
		int curTs;
		int nprocs;
		int rank;
		string namespath; // call path of functions
		map<string, string> output; // store the output dictionary

		void set_timestep(int t, int n); // set the number of timesteps and current timestep
		void set_rank(int r, int n); // set the number of processes and the current rank
		void set_namespath(string name); // set the call path of functions

		// gather info from all the processes
		int gather_info();
        void dump(std::string filename);
};

#endif /* PROFILER_H */