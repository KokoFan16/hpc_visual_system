
#include <mpi.h>
#include <iostream>
#include <string>
#include <unistd.h>
#include <ctime>
#include <stdlib.h>

int rank;
int nprocs;
int nrepeat;
int messageLen;
int aggcount;
std::string message; 

std::string gen_random(const int len);
void single_gather(std::string str);
void agg_gather(std::string str);

// Main entry
int main(int argc, char **argv)
{
	// Check the number of arguments
    if (argc != 4) {
        std::cout << argv[0] << "Usage: %s <agg_count> <nrepeat> <messageLen>" << std::endl;
        exit(-1);
    }

        // MPI Initial
    if (MPI_Init(&argc, &argv) != MPI_SUCCESS)
        printf("ERROR: MPI_Init error\n");
    if (MPI_Comm_size(MPI_COMM_WORLD, &nprocs) != MPI_SUCCESS)
        printf("ERROR: MPI_Comm_size error\n");
    if (MPI_Comm_rank(MPI_COMM_WORLD, &rank) != MPI_SUCCESS)
        printf("ERROR: MPI_Comm_rank error\n");

    aggcount = atoi(argv[1]);
    nrepeat = atoi(argv[2]);
    messageLen = atoi(argv[3]);

    srand((unsigned)time(NULL) * getpid());
    message = gen_random(messageLen);

    for (int i = 0; i < nrepeat; i++) {
         single_gather(message);
         agg_gather(message);
    }
   
    // std::cout << aggcount << std::endl;

    return 0;
}

std::string gen_random(const int len) {
    static const char alphanum[] =
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz";
    std::string tmp_s;
    tmp_s.reserve(len);

    for (int i = 0; i < len; ++i) {
        tmp_s += alphanum[rand() % (sizeof(alphanum) - 1)];
    }   
    return tmp_s;
}

// UNIFORM GATHER TO RANK 0
void single_gather(std::string str) {
    double st = MPI_Wtime();
    char* buffer = (char*)malloc( (messageLen*nprocs + 1) *sizeof(char));

	MPI_Gather((char*)message.c_str(), messageLen, MPI_CHAR, buffer, messageLen, MPI_CHAR, 0, MPI_COMM_WORLD); 
    buffer[messageLen*nprocs] = '\0';

    if (rank == 0) {
        if (strlen(buffer) != messageLen*nprocs) {
            std::cout << "GATHER ERROR!!" << std::endl;
            MPI_Abort(MPI_COMM_WORLD, -1);
        }
    }   

    double et = MPI_Wtime();
    double total = et - st;
    double max_time = 0;
    MPI_Allreduce(&total, &max_time, 1, MPI_DOUBLE, MPI_MAX, MPI_COMM_WORLD);

    if (total == max_time)
        std::cout << "sigle(" << nprocs << "): " << total << std::endl; 

    free(buffer);
}

static int myceil(int x, int y) { return (x/y + (x % y != 0)); }

void agg_gather(std::string str) {
    double st = MPI_Wtime();

    /// split communicator
    int spliter = myceil(nprocs, aggcount);
    int color = rank / spliter;

    MPI_Comm split_comm;
    MPI_Comm_split(MPI_COMM_WORLD, color, rank, &split_comm);

    int split_rank, split_size;
    MPI_Comm_rank(split_comm, &split_rank);
    MPI_Comm_size(split_comm, &split_size);
    double et = MPI_Wtime();
    double split = et - st;


    st = MPI_Wtime();
    char* buffer = (char*)malloc( (messageLen*split_size + 1) *sizeof(char));

    MPI_Gather((char*)message.c_str(), messageLen, MPI_CHAR, buffer, messageLen, MPI_CHAR, 0, split_comm); 
    buffer[messageLen*split_size] = '\0';

    if (split_rank == 0) {
        if (strlen(buffer) != messageLen*split_size) {
            std::cout << "GATHER ERROR!!" << std::endl;
            MPI_Abort(MPI_COMM_WORLD, -1);
        }
    }   
    et = MPI_Wtime();
    double gather = et - st;
    double total = split + gather;
    double max_time = 0;
    MPI_Allreduce(&total, &max_time, 1, MPI_DOUBLE, MPI_MAX, MPI_COMM_WORLD);

    if (total == max_time)
        std::cout << "aggregation(" << nprocs << "): " << total << ", " << split << ", " << gather << std::endl; 

    free(buffer);
}

