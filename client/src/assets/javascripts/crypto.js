// generate a random key and IV
// Note: a key size of 16 bytes will use AES-128, 24 => AES-192, 32 => AES-256

/* alternatively, generate a password-based 16-byte key
var salt = forge.random.getBytesSync(128);
var key = forge.pkcs5.pbkdf2('password', salt, numIterations, 16);
*/

// encrypt some bytes using CBC mode
// (other modes include: ECB, CFB, OFB, CTR, and GCM)
// Note: CBC and ECB modes use PKCS#7 padding as default

//var rideCrypt = module.exports ;
var rideCrypt ={};

//rideCrypt.salt = forge.random.getBytesSync(128);
rideCrypt.salt_hex ="d043f85493366994d4e73441e2bd387be856c815a924ffb295ee53125df26d8b";
rideCrypt.salt = forge.util.hexToBytes(rideCrypt.salt_hex);
//rideCrypt.salt = forge.random.getBytesSync(32);
rideCrypt.numIterations = 10;
rideCrypt.key = forge.pkcs5.pbkdf2('password', rideCrypt.salt, rideCrypt.numIterations, 16);
rideCrypt.iv =forge.util.hexToBytes(rideCrypt.salt_hex);
//rideCrypt.iv =forge.random.getBytesSync(16);
//rideCrypt.key = forge.random.getBytesSync(128);

rideCrypt.encrypt = function (content)
{
	var cipher = forge.cipher.createCipher('AES-CBC', rideCrypt.key);
	cipher.start({iv: rideCrypt.iv});
	cipher.update(forge.util.createBuffer(content));
	cipher.finish();
	var encrypted = cipher.output;
	//var raw = encrypted.toString('binary');
	var hex = encrypted.toHex()
	//var hex=rideCrypt.byteToHexString(raw) ;
	// outputs encrypted hex
	console.info('201808171902 rideCrypt.encrypt() encrypted_hex='+ hex);
	console.info('201808171902 rideCrypt.encrypt() salt='+ forge.util.bytesToHex(rideCrypt.salt));
	return hex;
};

rideCrypt.decrypt= function (encrypted_hex)
{
	// decrypt some bytes using CBC mode
	// (other modes include: CFB, OFB, CTR, and GCM)
//rideCrypt.key = forge.pkcs5.pbkdf2('password', rideCrypt.salt, rideCrypt.numIterations, 16);
//rideCrypt.iv =forge.random.getBytesSync(16);
	//
	

	//let salt_hex ="d043f85493366994d4e73441e2bd387be856c815a924ffb295ee53125df26d8b";
	//rideCrypt.salt = forge.util.hexToBytes(salt_hex);
	//rideCrypt.key = forge.pkcs5.pbkdf2('password', rideCrypt.salt, rideCrypt.numIterations, 16);  // same key can be regenerate from the same password, salt, iteration and key length in bytes
	var encrypted=forge.util.hexToBytes(encrypted_hex);
	//var encrypted=rideCrypt.hexStringToByte(encrypted_hex) ;
	var buffer = forge.util.createBuffer(encrypted);

	var decipher = forge.cipher.createDecipher('AES-CBC', rideCrypt.key);
	decipher.start({iv: rideCrypt.iv});
	decipher.update(buffer);
	var result = decipher.finish(); // check 'result' for true/false
	// outputs decrypted hex
	//decrypted = decipher.output.toString('raw') ;
	decrypted = decipher.output.toString('utf8') ;
	console.log("201808171500 rideCrypt.decrypt() decrypted=" + decrypted);
	return decrypted;
};

rideCrypt.byteToHexString= function (uint8arr) {
	if (!uint8arr) {
		return '';
	}
	  
	var hexStr = '';
	for (var i = 0; i < uint8arr.length; i++) {
		var hex = (uint8arr[i] & 0xff).toString(16);
		hex = (hex.length === 1) ? '0' + hex : hex;
		hexStr += hex;
	}
	  
	return hexStr.toUpperCase();
};

rideCrypt.hexStringToByte= function (str) {
	if (!str) {
		      return new Uint8Array();
	}
	var a = [];
	for (var i = 0, len = str.length; i < len; i+=2) {
		a.push(parseInt(str.substr(i,2),16));
	}
	return new Uint8Array(a);
};

rideCrypt.dummy=function (){
// decrypt bytes using CBC mode and streaming
// Performance can suffer for large multi-MB inputs due to buffer
// manipulations. Stream processing in chunks can offer significant
// improvement. CPU intensive update() calls could also be performed with
// setImmediate/setTimeout to avoid blocking the main browser UI thread (not
// shown here). Optimal block size depends on the JavaScript VM and other
// factors. Encryption can use a simple technique for increased performance.
var encryptedBytes = encrypted.bytes();
var decipher = forge.cipher.createDecipher('AES-CBC', key);
decipher.start({iv: iv});
var length = encryptedBytes.length;
var chunkSize = 1024 * 64;
var index = 0;
var decrypted = '';
do {
  decrypted += decipher.output.getBytes();
  var buf = forge.util.createBuffer(encryptedBytes.substr(index, chunkSize));
  decipher.update(buf);
  index += chunkSize;
} while(index < length);
var result = decipher.finish();
assert(result);
decrypted += decipher.output.getBytes();
console.log(forge.util.bytesToHex(decrypted));

// encrypt some bytes using GCM mode
var cipher = forge.cipher.createCipher('AES-GCM', key);
cipher.start({
  iv: iv, // should be a 12-byte binary-encoded string or byte buffer
  additionalData: 'binary-encoded string', // optional
  tagLength: 128 // optional, defaults to 128 bits
});
cipher.update(forge.util.createBuffer(someBytes));
cipher.finish();
var encrypted = cipher.output;
var tag = cipher.mode.tag;
// outputs encrypted hex
console.log(encrypted.toHex());
// outputs authentication tag
console.log(tag.toHex());

// decrypt some bytes using GCM mode
var decipher = forge.cipher.createDecipher('AES-GCM', key);
decipher.start({
  iv: iv,
  additionalData: 'binary-encoded string', // optional
  tagLength: 128, // optional, defaults to 128 bits
  tag: tag // authentication tag from encryption
});
decipher.update(encrypted);
var pass = decipher.finish();
// pass is false if there was a failure (eg: authentication tag didn't match)
if(pass) {
  // outputs decrypted hex
  console.log(decipher.output.toHex());
}
};
