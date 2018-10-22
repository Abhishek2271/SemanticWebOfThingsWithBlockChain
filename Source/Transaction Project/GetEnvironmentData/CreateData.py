from sense_hat import SenseHat
from datetime  import datetime
from enum import Enum
import intro 
import os
import time
import sys
import Humidity
import Pressure
import Temperature

#temp = sense.get_temperature()
#sense.low_light= True
#print(temp)
#sense.show_message("%.1f C" %temp, text_colour=[0,140,255])
                  
  
# Date:  8 May 2018
# Purpose: Get data from sense hat and save it on the disk.
#			Inputs: Specify time diff in which data should be fetched
#					Specify time diff in which the data should be written in the disk from memory
#			Outputs:Show logs 
#					Create physical files

class sensortypes(Enum):
    Temperature = 1
    Pressure = 2
    Humidity = 3
    
#Dump data to disk
#TODO: It would be better to implement this in another py file so code becomes more modular :)
#Arguments: List -> List of data to write
#			filename 	-> 	Full file path
#			writemode 	-> 	This is append  ('a') for writing data on the same file for the same day
#						 	This is write   ('w') for creating new file, after every 2 hours.
#			sensortypes ->	'H' prefix for humidity, 'P' for pressure, 'T'	for temperature.	 
def writetodisc(List, filename, writemode, sensortypes):    
    path = "/home/pi/Documents/EnvironmentData/" 
    fullpath = path + filename
    dump_to_disc(List, fullpath, writemode, sensortypes)
    del List[:]  
     

#Create/ edit the specified file
#Arguments: List -> List of data to write
#			Temp_List 	-> 	Content to write.
#			filepath 	-> 	Full file path.
#			Writemode	->	append or create file.
def dump_to_disc(Temp_List, filepath, writemode, sensortypes):    
    with open(filepath, writemode) as file_handler:
       for item in Temp_List:
            file_handler.write("%s" % item.DateTime)
            if sensortypes == sensortypes.Temperature:
                file_handler.write("    %s" % item.value + chr(176) + "C")
            if sensortypes == sensortypes.Humidity:
                file_handler.write("    %s %%" % item.value)
            if sensortypes == sensortypes.Pressure:
                file_handler.write("    %s" % item.value + " Millibars")
            file_handler.write("\n")

#Main function. Integrates everything.
def main():
    current_time = datetime.now().minute
    current_day = datetime.now().day
    previous_day = current_day
    last_time = current_time
    
    Temp_List = []				#In-memory list to store temperature
    Humidity_List = []			#In-memory list to store humidity
    Pressure_List = []			#In-memory list to store pressure
    
    while 1:
        current_time = datetime.now().minute		#Current time (only mins)
        current_day = datetime.now().day			#Current time (day)
        #Get temperature every 10 min
        timediff = current_time - last_time			#Time diff (minute)
        
        if(timediff != 0):
            print(timediff)
            
		#Get data in the defined interval
        if abs(timediff) >= 1:
            print("Get wheather data...")
            last_time = current_time            
            #sense.show_message("%.1f C" %calc_temp, text_colour=[0,140,255])
            formatted_date = datetime.now().strftime("%I:%M:%S %p %a %d %B, %Y")
            #Get data and write to memory
            Temp_List.append(Temperature.GetTemperature(formatted_date))      	#Get temp.      
            Humidity_List.append(Humidity.GetHumidity(formatted_date))			#Get humidity
            Pressure_List.append(Pressure.GetPressure(formatted_date))			#Get pressure
        
        #Create new file each day.
        if current_day != previous_day:            
            print("Create a new file for new day...")
            writemode = 'w' 	                    
			#Write data to disc. For now, don't create .txt files, just files with no extension. Should be editable and readable from text editors.
            writetodisc(Temp_List, "TData_" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Temperature)	#Write Temp data to disc in format TData_2018-06-12
            writetodisc(Humidity_List, "HData_" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Humidity)	#Write Temp data to disc in format HData_2018-06-12
            writetodisc(Pressure_List, "PData_" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Pressure)	#Write Temp data to disc in format PData_2018-06-12
            
        #for now just hardcode this and using hours seperately is not necessary
        #TODO: Use hours count instead of counting in-memory entry count. 
		#Count the number of entries in the Temp_list and write to data so for 24 hours and hourly data read, it should be 24. 	
        if len(Temp_List) >= 1:  
            writemode = 'a'
			
            writetodisc(Temp_List, "TData__" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Temperature)
            writetodisc(Humidity_List, "HData__" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Humidity)
            writetodisc(Pressure_List, "PData__" + datetime.now().strftime("%Y-%m-%d"), writemode, sensortypes.Pressure)
                 
#call main. and define the api.
try:
    
    sense = SenseHat()
    sense.clear()
    intro.count()
    #Define interval in which the reading should be taken (in minutes). NOT USED now but making interval dynamic was one of the objectives :(
    interval = 1
    #Define interval in which the data should be dumped to disc
    threshold = 6
    #So interval 10 and threshold 6 means that every 10 mins reading is taken and the data is dumped every hour
    
    main()    
except:
    print("There was error while reading temp from sense hat.", sys.exc_info()[0])
    sys.exit()
    
    