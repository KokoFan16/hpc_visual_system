#!/bin/bash

file=./fileName.txt
if [ -e "$file" ]; then
    echo "delete previous $file and create a new one"
    rm -f $file
    echo $1 >> $file
else 
    echo "create $file"
    echo $1 >> $file
fi 

