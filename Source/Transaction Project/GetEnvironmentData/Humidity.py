from sense_hat import SenseHat
from datetime  import datetime
sense = SenseHat()


class HumidityRecord(object):
    def __init__(self, DateTime, value):
        self.DateTime = DateTime
        self.value = value
        

def GetHumidity(datetime):       
        print("Getting humidity from sense hat...")
        humidity = 0
        while humidity == 0:
            humidity = sense.get_humidity()
        print(humidity)
        Record = HumidityRecord(datetime, round(humidity, 2))
        return Record
              
        