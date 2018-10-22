from sense_hat import SenseHat
from datetime  import datetime
sense = SenseHat()


class PressureRecord(object):
    def __init__(self, DateTime, value):
        self.DateTime = DateTime
        self.value = value
        

def GetPressure(datetime):       
        print("Getting pressure from sense hat...")  
        pressure = sense.get_pressure()       
        Record = PressureRecord(datetime, round(pressure, 2))
        return Record
              
        
