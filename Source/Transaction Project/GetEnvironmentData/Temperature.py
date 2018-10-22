from sense_hat import SenseHat
from datetime  import datetime
import os
sense = SenseHat()



class TemperatureRecord(object):
    def __init__(self, DateTime, value):
        self.DateTime = DateTime
        self.value = value
        
def get_cpu_temp():
    # ref. from https://www.raspberrypi.org/forums/viewtopic.php?f=104&t=111457
    # executes a command at the OS to get the CPU temperature
    res = os.popen('vcgencmd measure_temp').readline()
    return float(res.replace("temp=", "").replace("'C\n", ""))

def get_corrected_temp():
    # Get temp readings from both sensors
    t1 = sense.get_temperature_from_humidity()
    t2 = sense.get_temperature_from_pressure()
    # t becomes the average of the temperatures from both sensors
    t = (t1 + t2) / 2
    # Now, get the CPU temperature
    t_cpu = get_cpu_temp()
    
    t_corr = t - ((t_cpu - t) / 1.5)
    if(t_corr <= 5):
        return t1
    else:
        return t_corr


def GetTemperature(datetime):       
        print("Getting temperature from sense hat...")  
        calc_temp = get_corrected_temp()  
        Record = TemperatureRecord(datetime, round(calc_temp, 2))
        return Record