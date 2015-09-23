#!/bin/bash
i=0
#lc=$(wc -l < ./list)
lc=$(cat ./list | wc -l)
let "lc += 2"
while [ $i -lt $lc ]
do
	address='http://p-v-d.org/chat/smileys/'
	fname=$(sed -n $i',1p' ./list)
	curl -O $address$fname

	i=$[$i+1]
done