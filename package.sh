#!/bin/bash

# Password for testCert.pfx is test

adt -package -storetype pkcs12 -keystore testCert.pfx PunchClock.air PunchClock-app.xml PunchClock.html punchclock.css js
