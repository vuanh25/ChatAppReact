"use strict";
exports.__esModule = true;
var crypto = require("crypto");
var ErrorCode;

function generateToken04(
  appId,
  userId,
  secret,
  effectiveTimeInSeconds,
  payload
) {
  if (!appId || typeof appId !== "number") {
    throw {
      errorCode: ErrorCode.appIDInvalid,
      errorMessage: "appID invalid",
    };
  }
  if (!userId || typeof userId !== "string") {
    throw {
      errorCode: ErrorCode.userIDInvalid,
      errorMessage: "userId invalid",
    };
  }
  if (!secret || typeof secret !== "string" || secret.length !== 32) {
    throw {
      errorCode: ErrorCode.secretInvalid,
      errorMessage: "secret must be a 32 byte string",
    };
  }
  if (!effectiveTimeInSeconds || typeof effectiveTimeInSeconds !== "number") {
    throw {
      errorCode: ErrorCode.effectiveTimeInSecondsInvalid,
      errorMessage: "effectiveTimeInSeconds invalid",
    };
  }
  var createTime = Math.floor(new Date().getTime() / 1000);
  var tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: makeNonce(),
    ctime: createTime,
    expire: createTime + effectiveTimeInSeconds,
    payload: payload || "",
  };
  // Convert token information into json
  var plaintText = JSON.stringify(tokenInfo);
  console.log("plain text: ", plaintText);
  // A randomly generated 16-byte string is used as an AES encryption vector, and it is placed in front of the ciphertext and encoded with Base64 to generate the final token
  var iv = makeRandomIv();
  console.log("iv", iv);
  /// encrypt
  var encryptBuf = aesEncrypt(plaintText, secret, iv);
  // token = binary splicing expiration time + Base64(iv length + iv + encrypted information length + encrypted information)
  var _a = [new Uint8Array(8), new Uint8Array(2), new Uint8Array(2)],
    b1 = _a[0],
    b2 = _a[1],
    b3 = _a[2];
  new DataView(b1.buffer).setBigInt64(0, BigInt(tokenInfo.expire), false);
  new DataView(b2.buffer).setUint16(0, iv.length, false);
  new DataView(b3.buffer).setUint16(0, encryptBuf.byteLength, false);
  var buf = Buffer.concat([
    Buffer.from(b1),
    Buffer.from(b2),
    Buffer.from(iv),
    Buffer.from(b3),
    Buffer.from(encryptBuf),
  ]);
  var dv = new DataView(Uint8Array.from(buf).buffer);
  // packed data
  // console.log('-----------------');
  // console.log('-------getBigInt64----------', dv.getBigInt64(0));
  // console.log('-----------------');
  // console.log('-------getUint16----------', dv.getUint16(8));
  // console.log('-----------------');
  return "04" + Buffer.from(dv.buffer).toString("base64");
}
exports.generateToken04 = generateToken04;
