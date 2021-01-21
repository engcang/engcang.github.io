---
layout: post
title: "Ubuntu PC to PC USB to USB serial communication"
date: 2021-01-21
excerpt: "PC to PC serial communication via USB-USB"
tags: [Ubuntu, Serial, USB, UART]
post: true
project: false
legacy: false
comments: true
---

## Ubuntu PC to PC USB to USB serial communication
### Referenced [python serial library](https://pyserial.readthedocs.io/en/latest/shortintro.html) 

<br>

+ In Windows-Windows environment, data communication from PC to PC is possible by using a USB to USB bridge cable.
+ Usually in Ubuntu, some pairs like Arduino-PC, Raspberry Pi-PC, etc are used to exchange data through UART, SPI, or I2C.
+ Most of Googled sites and posts said 
  + that it is impossible to communicate via USB to USB with a general Ubuntu PC to Ubuntu PC.
  + that instead, Ethernet should be used.

<br> 

+ But I wonder if it's because RX (receiving side) and TX (sending side) are not well set for USB to USB cable.
+ I implemented it with a converter module (USB to TTL, USB to RS232, USB to UART)

<br> 

+ I checked the modules are caught as /dev/ttyUSB0 on both Ubuntu PCs, and data is exchanged with Python serial library code.
+ Plug the TX line from one side to the other RX as shown in the picture
+ In the same way, plug the RX line into the other side's TX line, it works.
+ When USB is plugged into the PC, 5V is automatically applied, so only GND is connected.
<figure>
    <img src="/assets/posting/210121_usb.jpg" style="width:100%"  onContextMenu="return false;">
</figure>

<br>

+ I tested this using the example code from [the library.](https://pyserial.readthedocs.io/en/latest/shortintro.html)
+ The receiver code is as below. 
  + It opens serial port on /dev/ttyUSB0 at 19200 baud_rate.
  + It reads and prints data in 10-byte size.
  
~~~python
#!/usr/bin/env python
import serial
import sys

if __name__== '__main__':
    ser = serial.Serial('/dev/ttyUSB0', 19200, timeout=1)
    while 1:
        try:
            d=ser.read(10)
            print(d)
        except (SystemExit, KeyboardInterrupt):
            ser.close()
            sys.exit(0)            
~~~

<br>

+ The transmitter code is as below.
  + In the same way with the receiver code, the port is set to /dev/ttyUSB0.
  + Open the serial with the <span style="color:#3399ff">**same baud_rate.**</span>
  + Every 0.2 seconds(at 5Hz), it writes 'hello'.
+ It is said that the prefix b is only needed for Python3.
~~~python
#!/usr/bin/env python
import serial
import time
import sys

if __name__ == '__main__':
  ser = serial.Serial('/dev/ttyUSB0', 19200, timeout=1)  # open serial port
  print(ser.name)         # check which port was really used
  while 1:
      try:
        ser.write(b'hello')     # write a string
        print("sent \n")
        time.sleep(0.2)
      except (SystemExit, KeyboardInterrupt) :
        ser.close()             # close port
        sys.exit(0)
~~~

<br>

+ Connect each USB to both PCs and run each code 
+ TX and RX of the converter module twinkle blue respectively, and 'hello' will be printed on the terminal of receiving side.

<br>

+ Now, I am considering to apply this to the SBC attached to the rosbot, and other PCs additionally mounted on it to communicate ROS data.
