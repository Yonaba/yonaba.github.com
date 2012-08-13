/*
KEYSHANC: KEYboard SHA-based eNCrypter
Javascript Implementation for Twitter Integration

Copyright (c) 2012 Andrew C. Reed

License: The MIT License
Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//NOTE: This script requires sha512-min.js, sha256-min.js, and sha1-min.js
//They can be obtained from http://pajhome.org.uk/crypt/md5/jshash-2.2.zip

//ALSO: KeyshancRT requires hotp.js, avail. @ github.com/adulau/hotp-js
//& 2.0.0-crypto-sha1.js & 2.0.0-hmac-min.js, avail. @ crypto-js.googlecode.com

//ALSO: decryptKeyshancRT requires encoder.js, available at
//http://strictly-software.com/scripts/downloads/encoder.js

var minutes = 1000*60;
var minuteCounter = 0;
var timestamp = new String("");

//create keys[95]
var keys = new Array(95);

//initialize keys[95]
for (x = 0; x < 95; x++) {
    keys[x] = (x + 32);
}

function keyshanc(password) {
    var i = new String(hex_sha512(password));
    var j = new String(hex_sha256(password));

    //this loop resets keys[95] prior to shuffling
    for (x = 0; x < 95; x++) {
        keys[x] = (x + 32);
    }

    //exit function if no password provided
    //this effectively turns Keyshanc OFF
    if (password.length == 0) {
        return;
    }

    var shuffleCode = new Array(95);
    var hexString = new String("");
    var numByte;

    //build the first 64 positions in shuffleCode[] with the entire SHA512 hash
    for (x = 0; x < 64; x++) {
        hexString = hexString.concat(i.charAt(x*2));
        hexString = hexString.concat(i.charAt((x*2)+1));
        numByte = parseInt(hexString, 16);
        shuffleCode[x] = numByte%95;
        hexString = "";
    }

    //build the last 31 positions in shuffleCode[] with the first 31 bytes of the SHA256 hash
    for (x = 0; x < 31; x++) {
        hexString = hexString.concat(j.charAt(x*2));
        hexString = hexString.concat(j.charAt((x*2)+1));
        numByte = parseInt(hexString, 16);
        shuffleCode[x+64] = numByte%95;
        hexString = "";
    }

    //shuffle keys[] using shuffleCode[] for swap positions
    for (x = 0; x < 95; x++) {
        var temp = keys[x];
        keys[x] = keys[shuffleCode[x]];
        keys[shuffleCode[x]] = temp;        
    }
}

//Standard decryption function (non Real-Time version)
//It pulls ciphertext from a textarea named "inText"
//and outputs plaintext to a textarea named "outText".
function decryptKeyshanc() {
    var s1 = new String(document.getElementById('inText').value);

    var s2 = new String("");

    for (x = 0; x < s1.length; x++) {
        if (s1.charCodeAt(x) >= 32 && s1.charCodeAt(x) <= 126)
        {
            for (y = 0; y < 95; y++) {
                if (s1.charAt(x) == String.fromCharCode(keys[y]))
                {
                    s2 = s2.concat(String.fromCharCode(y+32));
                    break;
                }
            }
        }
        else
        {
            s2 = s2.concat(s1.charAt(x));
        }
    }

    document.getElementById('outText').value = s2;
}

//Standard encryption function (non Real-Time version)
//It pulls plaintext from a textarea named "inText"
//and outputs ciphertext to a textarea named "outText".
function encryptKeyshanc() {
    var s1 = new String(document.getElementById('inText').value);

    var s2 = new String("");

    for (x = 0; x < s1.length; x++) {
        if (s1.charCodeAt(x) >= 32 && s1.charCodeAt(x) <= 126)
        {
            s2 = s2.concat(String.fromCharCode(keys[((s1.charCodeAt(x))-32)]));
        }
        else
        {
            s2 = s2.concat(s1.charAt(x));
        }
    }

    document.getElementById('outText').value = s2;
}

//Decrypt a message that was created using Keyshanc Real-Time
function decryptKeyshancRT(encryptedString, password) {

    encryptedString = Encoder.htmlDecode(encryptedString);

    //locate the delimiter ¥
    var findYen = encryptedString.indexOf('¥');

    if (findYen == -1)
    {
        return Encoder.htmlEncode(encryptedString, false);
    }

    //everything to the right of the timestamp is assumed to be encrypted text
    var s1 = new String(encryptedString.substring((findYen + 5)));
    
    //the timestamp is comprised of the 4 characters to the right of ¥
    var encryptedTimestamp = new String(encryptedString.substring((findYen + 1), (findYen + 5)));

    //convert the timestamp back into the number of minutes since the Unix epoch
    var decryptedTimestamp = convertTimestamp(encryptedTimestamp);

    //recompute Keyshanc based on the timestamp from the message
    var seed = createSeed(password);
    var pin = hotp(seed,decryptedTimestamp,"dec8");
    keyshanc(password.concat(pin));

    var s2 = new String("");

    for (x = 0; x < s1.length; x++) {
        if (s1.charCodeAt(x) >= 32 && s1.charCodeAt(x) <= 126)
        {
            for (y = 0; y < 95; y++) {
                if (s1.charAt(x) == String.fromCharCode(keys[y]))
                {
                    s2 = s2.concat(String.fromCharCode(y+32));
                    break;
                }
            }
        }
        else
        {
            s2 = s2.concat(s1.charAt(x));
        }
    }

    //encode the encrypted text before adding the bold tags
    s2 = Encoder.htmlEncode(s2, false);

    //add the bold tags
    s2 = "<b>" + s2 + "</b>";

    //it is assumed that if ¥ is greater than 0, then there is some plaintext
    //to the left of ¥ that should be prepended to the decrypted message
    if (findYen > 0)
    {
        var plaintext = new String(encryptedString.substring(0, findYen));
        plaintext = Encoder.htmlEncode(plaintext, false);
        return plaintext.concat(s2);
    }
    
    return s2;
}

//Encrypt messages using Keyshanc Real-Time
//It encrypts the text located in the textarea named "inText".
//Any text located in the textarea named "plainText" will not be
//encrypted.
function encryptKeyshancRT(password) {
    //update the time with every keystroke
    //time is based on the minutes since the Unix epoch
    var date = new Date();
    var tempCounter = Math.floor((date.getTime())/minutes);

    //if the time has changed, then recompute Keyshanc
    if (minuteCounter != tempCounter)
    {
        minuteCounter = tempCounter;

        //HOTP requires a seed value
        var seed = createSeed(password);

        //supplying the minuteCounter to the HOTP function
        //turns it into a TOTP function
        var pin = hotp(seed,minuteCounter,"dec8");

        //recompute Keyshanc using the (password+pin)
        //this causes the shuffle to change every minute
        keyshanc(password.concat(pin));
    }

    var s1 = new String(document.getElementById('inText').value);

    var s2 = new String("");

    for (x = 0; x < s1.length; x++) {
        if (s1.charCodeAt(x) >= 32 && s1.charCodeAt(x) <= 126)
        {
            s2 = s2.concat(String.fromCharCode(keys[((s1.charCodeAt(x))-32)]));
        }
        else
        {
            s2 = s2.concat(s1.charAt(x));
        }
    }

    //create the timestamp
    createTimestamp(minuteCounter);

    //prepend the timestamp to the encrypted text
    s2 = timestamp + s2;

    var plaintext = new String(document.getElementById('plainText').value);

    //if there is plaintext, then prepend it to the encrypted message
    if (plaintext.length != 0)
    {
        s2 = plaintext + " " + s2;
    }

    return s2;
}

//Use the password to create a seed for the HOTP function.
//The seed is created by SHA-1 hashing the password and then
//concatenating the password and hash for another round of SHA-1
//hashing. (This is how the app "Android Token" creates a seed
//from a password.)
function createSeed(password) {
    var seed = new String(hex_sha1(password));
    seed = hex_sha1(password.concat(seed.toUpperCase()));
    return seed.toUpperCase();
}

//The timestamp is encoded in Base94.
//I use ASCII characters ! thru ~ as the Base94 "digits".
//This encoding will work for 148.5 years (until June 2118).
function createTimestamp(numMinutes) {
    var power3, power2, power1, power0;

    power3 = numMinutes / (Math.pow(94, 3));
    numMinutes %= Math.pow(94, 3);

    power2 = numMinutes / (Math.pow(94, 2));
    numMinutes %= Math.pow(94, 2);

    power1 = numMinutes / (Math.pow(94, 1));
    numMinutes %= Math.pow(94, 1);

    power0 = numMinutes / (Math.pow(94, 0));
    numMinutes %= Math.pow(94, 0);

    var char3, char2, char1, char0;

    char3 = String.fromCharCode(power3 + 33);
    char2 = String.fromCharCode(power2 + 33);
    char1 = String.fromCharCode(power1 + 33);
    char0 = String.fromCharCode(power0 + 33);

    //¥ is used as a delimiter for the timestamp.
    timestamp = '¥' + char3 + char2 + char1 + char0;
}

function convertTimestamp(messageTimestamp) {
    var power3 = ((messageTimestamp.charCodeAt(0)) - 33);
    var power2 = ((messageTimestamp.charCodeAt(1)) - 33);
    var power1 = ((messageTimestamp.charCodeAt(2)) - 33);
    var power0 = ((messageTimestamp.charCodeAt(3)) - 33);
    
    var messageCounter = 0;
    messageCounter += ((Math.pow(94, 3)) * power3);
    messageCounter += ((Math.pow(94, 2)) * power2);
    messageCounter += ((Math.pow(94, 1)) * power1);
    messageCounter += ((Math.pow(94, 0)) * power0);
    return messageCounter;
}
