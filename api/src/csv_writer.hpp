#ifndef CSV_WRITER_H_
#define CSV_WRITER_H_

#include <iostream>
#include <string>
#include <fstream>

using namespace std;

class CSVWrite {

private:
    std::ofstream fs;
    const std::string delimiter;
    bool begin;


    /// write string
	CSVWrite& write (const string & val) {
		if (!begin){ fs << delimiter; }
		else { begin = false; }
		fs << val;
		return *this;
    }

public:
	CSVWrite(const string filename, const string deli = ","): fs(), delimiter(deli), begin(true) {
        fs.exceptions(ios::failbit | ios::badbit);
        fs.open(filename); // open file
    }

    ~CSVWrite() { fs.flush(); fs.close(); } // flush and close file

	void endrow() { fs << endl; begin = true; } // end of each line

	CSVWrite& operator << ( CSVWrite& (* val)(CSVWrite&)) { return val(*this); } // overwrite operator <<

	CSVWrite& operator << (const std::string & val) { return write(val); } // write string
};

inline static CSVWrite& endrow(CSVWrite& file) {
    file.endrow();
    return file;
}

#endif /* CSV_WRITER_H */