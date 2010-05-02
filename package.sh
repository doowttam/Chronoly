#!/bin/bash

# Password for testCert.pfx is test

adt -package -storetype pkcs12 -keystore testCert.pfx Chronoly.air Chronoly-app.xml root updateFramework