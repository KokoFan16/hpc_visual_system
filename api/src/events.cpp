#include "profiler.hpp"
#include "events.hpp"

void Events::constr_help(string name) {
    auto start = chrono::system_clock::now(); // get start time of a event
    start_time = start;
    if (context.namespath == "") { context.namespath += name; } // set name-path as key
    else { context.namespath += ">" + name; } // concatenate name-path (e.g., main<computation)
}

// constructors with different parameters
Events::Events(Profiler ctx, string n): context(ctx), name(n) { constr_help(n); }
Events::Events(Profiler ctx, string n, string t): context(ctx), name(n), tags(t) { constr_help(n); }
Events::Events(Profiler ctx, string n, int loop, int ite): context(ctx), name(n), is_loop(loop), loop_ite(ite) { constr_help(n); }
Events::Events(Profiler ctx, string n, string t, int loop, int ite): context(ctx), name(n), tags(t), is_loop(loop), loop_ite(ite) { constr_help(n); }
	
// destructor 
Events::~Events() {
    auto end_time = chrono::system_clock::now();
    chrono::duration<double> elapsed_seconds = end_time-start_time; // calculate duration
    elapsed_time = elapsed_seconds.count();

    string delimiter = ">";
    size_t found = context.namespath.rfind(delimiter);

    // // set value (time and tag) of each function across all the time-steps
    if (context.curTs == 0 && context.output[context.namespath] == ""){
        context.output[context.namespath] += tags + "/" + to_string(is_loop) + ";" + to_string(elapsed_time);
    }
    else {
        if (is_loop == 2) { // mode for summing up time of loop events
            if (loop_ite == 0){ context.output[context.namespath] += "-" + to_string(elapsed_time); }
            else {
                if (context.curTs == 0) { delimiter = ";"; }
                else { delimiter = "-"; }
                int pos = context.output[context.namespath].rfind(delimiter); // find the position of current time
                // calculate the sum of the loop events
                double curTime = stod(context.output[context.namespath].substr(pos+1, context.output[context.namespath].length()-pos-1)) + elapsed_time;
                context.output[context.namespath].replace(pos+1, to_string(curTime).length(), to_string(curTime));
            }
        }
        else { // mode for storing all time of loop events
            if (loop_ite == 0){ context.output[context.namespath] += "-" + to_string(elapsed_time); }
            else { context.output[context.namespath] += "+" + to_string(elapsed_time); }
        }
    }
    context.namespath = context.namespath.substr(0, found); // back to last level
}
