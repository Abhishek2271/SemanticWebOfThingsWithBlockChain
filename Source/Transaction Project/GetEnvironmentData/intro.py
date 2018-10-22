from sense_hat import SenseHat
import time

sense = SenseHat()
def count():
    sense.clear()
    sense.show_letter("3",text_colour=[255, 0, 0])
    time.sleep(0.5)
    sense.show_letter("2",text_colour=[0, 0, 255])
    time.sleep(0.5)
    sense.show_letter("1",text_colour=[0, 255, 0])
    time.sleep(0.5)
    sense.clear()
