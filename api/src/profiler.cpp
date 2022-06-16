#include "profiler.hpp"
#include "csv_writer.hpp"


void Profiler::set_timestep(int t, int n) { curTs = t; ntimestep = n; } // set the number of timesteps and current timestep
void Profiler::set_rank(int r, int n) { rank = r; nprocs = n;} // set the number of processes and the current rank
void Profiler::set_namespath(std::string name) { namespath = name; } // set the call path of functions

// gather info from all the processes
int Profiler::gather_info() {
    double total_start = MPI_Wtime();

    double max_start = MPI_Wtime();
    std::map<std::string, std::string> ::iterator p1; // map pointer
    std::string message = ""; // merged message for sending
    int strLen = 0, keyLen = 0;

    // calculate total size of events ( e.g., "main" + " " + "comm")
    for (p1 = output.begin(); p1 != output.end(); p1++)
        keyLen += p1->first.size() + 1;

    // find the max total size of events among all processes and the corrsponding rank
    int elocal[2] = {keyLen, rank};
    int eglobal[2];
    MPI_Allreduce(elocal, eglobal, 1, MPI_2INT, MPI_MAXLOC, MPI_COMM_WORLD);
    double max_end = MPI_Wtime();

    double bcast_start = MPI_Wtime();
    std::string events = "";
    if (rank == eglobal[1]) { // concatenate events to a string for bcast
        for (p1 = output.begin(); p1 != output.end(); p1++)
            events += (p1->first) + ' ';
    }
    events.resize(eglobal[0]);
    // bcast the events string from the rank with max events to others
    MPI_Bcast((char*)events.c_str(), eglobal[0], MPI_CHAR, eglobal[1], MPI_COMM_WORLD);
    double bcast_end = MPI_Wtime();

    double pad_start = MPI_Wtime();
    std::vector<std::string> maxEvents;
    std::istringstream f(events);
    std::string s;
    p1 = output.begin();
    while (std::getline(f, s, ' ') && p1 != output.end()) {
        std::string times;
        // loop all the events, and set the time of this event to be "0.000000" if a process doesn't have it
        if ( s != p1->first) {
            times = "0.000000";
            for (int t = 1; t < ntimestep; t++) {times += "-0.000000";}
        }
        else { // else calculate times for all events
            std::size_t found = p1->second.rfind(";");
            times = p1->second.substr(found+1, p1->second.length()-found-1);
            p1++;
        }
        message += times + ' ';
        maxEvents.push_back(s);
    }
    message.pop_back();
    message += ','; // add comma sat the end of each message
    strLen = message.length();
    double pad_end = MPI_Wtime();

    double gather_start = MPI_Wtime();
    long long totalLen = strLen * nprocs + 1;
    char* gather_buffer = (char*)malloc(totalLen * sizeof(char));
    MPI_Gather((char*)message.c_str(), strLen, MPI_CHAR, gather_buffer, strLen, MPI_CHAR, eglobal[1], MPI_COMM_WORLD);
    double gather_end = MPI_Wtime();

    double filter_start = MPI_Wtime();
    if (rank == eglobal[1]) {
        for (p1 = output.begin(); p1 != output.end(); p1++) {
            std::size_t loc = p1->second.find(';');
            p1->second.erase(loc+1, p1->second.size()-loc-1);
        }

        gather_buffer[totalLen-1] = '\0'; // end symbol of string
        std::string gather_message = std::string(gather_buffer); // convert it to string

        std::size_t pos;
        for (int i = 0; i < nprocs; i++) { // loop all the processes expect rank 0 
            pos = gather_message.find(',');
            std::string pmessage = gather_message.substr(0, pos); // message from a process
            std::size_t found;
            for (int j = 0; j < maxEvents.size(); j++) { // loop all the events
                found = pmessage.find(' ');
                output[maxEvents[j]] += pmessage.substr(0, found) + "|"; // add to corresponding event
                pmessage.erase(0, found+1);
            }
            gather_message.erase(0, pos+1);
        }
    }
    double filter_end = MPI_Wtime();

    double total_end = MPI_Wtime();
    double total_time = total_end - total_start;
    double max_time;
    MPI_Allreduce(&total_time, &max_time, 1, MPI_DOUBLE, MPI_MAX, MPI_COMM_WORLD);
    
    // if (total_time == max_time) {
        std::cout << rank << ": total: " << total_time << ", " << 
            "findMaxE: " << (max_end - max_start) << ", " <<
            "bcast: " << (bcast_end - bcast_start) << ", " <<
            "padE: " << (pad_end - pad_start) << ", " <<
            "gather: " << (gather_end - gather_start) << ", " <<
            "filter: " << (filter_end - filter_start) << std::endl;
    // }

    free(gather_buffer);
    return eglobal[1];
}

/// write csv file out
void Profiler::dump(std::string filename) {
    int master = gather_info(); // gather info from all the processes

    if (rank == master) { // rank 0 writes csv file
        std::string filePath = filename + "_" + std::to_string(ntimestep) + "_" + std::to_string(nprocs) + ".csv"; // create file path
        CSVWrite csv(filePath); // open CSV file

        // set CSV file Hearer
        csv << "id" << "tag" << "is_loop" << "times" << endrow;

        std::map<std::string, std::string> ::iterator p1;
        std::size_t found;
        // set CSV file content
        for (p1 = output.begin(); p1 != output.end(); p1++)  {
            std::string value, tag, loop, times;

            // get tag and times
            found = p1->second.find(';');
            value = p1->second.substr(0, found);
            times = p1->second.substr(found+1, p1->second.length()-found-2);

            found = value.find('/');
            tag = value.substr(0, found);
            loop = value.substr(found+1, 1);

            // set CSV file content
            csv << p1->first << tag << loop << times << endrow;
        }
    }

    output.clear();
}
