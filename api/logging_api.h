/*
 * logging_api.h
 *
 * Get timing info from HPC applications
 */

#ifndef LOGGING_API_H_
#define LOGGING_API_H_

#include <stdio.h>
#include <iostream>
#include <string>
#include <vector>
#include <chrono>
#include <typeinfo>
#include <sstream>
#include <iterator>
#include <map>

#include "csvWrite.h"

//#include <json/writer.h>

int ntimestep = 1;
int curTs = 0;
int nprocs = 1;
int curRank = 0;
std::string namespath = ""; // call path of functions


void set_timestep(int t, int n) {curTs = t; ntimestep = n;} // set the number of timesteps and current timestep
void set_rank(int r, int n) {curRank = r; nprocs = n;} // set the number of processes and the current rank
void set_namespath(std::string name) {namespath = name;} // set the call path of functions

std::map<std::string, std::string> output; // store the output dictionary

// the class to collect timing info
class Events
{
private:
	std::chrono::time_point<std::chrono::system_clock> start_time;
	double elapsed_time = 0;
	std::string name;
	std::string tags;
	bool is_loop = 0;
	int loop_ite = 0;

public:
	Events(std::string name, std::string tags, bool loop=0, int ite=0);
	~Events();
};

Events::Events(std::string n, std::string t, bool loop, int ite)
{
	name = n;
	tags = t;
	is_loop = loop;
	loop_ite = ite;
	auto start = std::chrono::system_clock::now();
	start_time = start; // get start time
	if (namespath == "") { namespath += name; } // set name-path as key
	else { namespath += "-" + name; }

//	output[namespath] += "";
}

Events::~Events()
{
	auto end_time = std::chrono::system_clock::now();
	std::chrono::duration<double> elapsed_seconds = end_time-start_time; // calculate duration
	elapsed_time = elapsed_seconds.count();

	std::string delimiter = "-";
	std::size_t found = namespath.rfind(delimiter);

	// set value (time and tag) of each function across all the time-steps
	if (curTs == 0 && output[namespath] == ""){
		output[namespath] += tags + "-" + std::to_string(is_loop) + ";" + std::to_string(elapsed_time);
	}
	else {
		if (loop_ite == 0){ output[namespath] += "-" + std::to_string(elapsed_time); }
		else { output[namespath] += "+" + std::to_string(elapsed_time); }
	}
	namespath = namespath.substr(0, found); // back to last level
}

// gather info from all the processes
void gather_info()
{
	std::map<std::string, std::string> ::iterator p1; // map pointer
	std::vector<std::string> events; // get all the events
	std::string message = ""; // merged message for sending
	int strLen = 0;
	// merging all the times across all the time-steps for each process
	for (p1 = output.begin(); p1 != output.end(); p1++)  {
		events.push_back(p1->first);
		std::size_t found = p1->second.rfind(";");
		std::string times = p1->second.substr(found+1, p1->second.length()-found-1);
		message += times + ' ';
	}
	message.pop_back();
	message += ','; // add comma sat the end of each message
	strLen = message.length();

	int max_strLen = 0; // maximum length of messages
	MPI_Allreduce(&strLen, &max_strLen, 1, MPI_INT, MPI_MAX, MPI_COMM_WORLD);

	// padding with spaces for messages whose length are less than the maximum one
	if (strLen < max_strLen) { message += std::string((max_strLen-strLen), ' '); }

	// gather messages from processes to rank 0
	char* gather_buffer = (char*)malloc(max_strLen*nprocs);
	MPI_Gather((char*)message.c_str(), max_strLen, MPI_CHAR, gather_buffer, max_strLen, MPI_CHAR, 0, MPI_COMM_WORLD);
	gather_buffer[max_strLen*nprocs-1] = '\0'; // end symbol of string
	std::string gather_message = std::string(gather_buffer); // convert it to string
	free(gather_buffer);

	if (curRank == 0)
	{
		// ignore the message of rank 0
		std::size_t pos = gather_message.find(',');
		gather_message.erase(0, pos+1);

		for (int i = 1; i < nprocs; i++) // loop all the processes expect rank 0
		{
			std::string pmessage = gather_message.substr(0, pos); // message from a process
			std::size_t found;
			for (int j = 0; j < events.size(); j++) // loop all the events
			{
				found = pmessage.find(' ');
				output[events[j]] += '|' + pmessage.substr(0, found); // add to corresponding event
				pmessage.erase(0, found+1);
			}
			pos = gather_message.find(',');
			gather_message.erase(0, pos+1);
		}
	}
}

void write_output(std::string filename)
{
	gather_info(); // gather info from all the processes

	if (curRank == 0) // rank 0 writes csv file
	{
		std::string filePath = "../code/" + filename + ".csv"; // create file path
		csvfile csv(filePath); // open CSV file

		// set CSV file Hearer
		csv << "id" << "parent" << "tag" << "is_loop" << "time" << endrow;

		std::map<std::string, std::string> ::iterator p1;
		std::size_t found;
		// set CSV file content
		for (p1 = output.begin(); p1 != output.end(); p1++)  {
			std::size_t found = p1->first.rfind("-");
			std::string parent, value, times, tag, loop;
			// get parent
			if (found != std::string::npos) { parent = p1->first.substr(0, found); }
			else { parent = "null"; }

			// get tag and times
			found = p1->second.find(';');
			value = p1->second.substr(0, found);
			times = p1->second.substr(found+1, p1->second.length()-found-1);

			found = value.find('-');
			tag = value.substr(0, found);
			loop = value.substr(found+1, 1);

//			std::cout << p1->first << ", " << tag << ", " << loop << ", " << times << std::endl;

			// set CSV file content
			csv << p1->first << parent << tag << loop << times << endrow;
		}
	}
}

#endif /* LOGGING_API_H_ */
