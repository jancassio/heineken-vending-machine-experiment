var Fingerprint = function (serial, info) {
  this.serial = serial;
  this.info = info;

  this.serial.onReceiveError.addListener(function(){
    console.log('[ Fingerprint.SerialOnReceiveError:GLOBAL ]', arguments);
  });
}

Fingerprint.IMAGE_WIDTH = 256;
Fingerprint.IMAGE_HEIGHT = 288;
Fingerprint.IMAGE_BUFER_SIZE = Fingerprint.IMAGE_WIDTH * Fingerprint.IMAGE_HEIGHT;
Fingerprint.PAGE_SIZE = 32;
Fingerprint.MAX_PAGES = 16;

Fingerprint.prototype.getSignals = function () {
  this.serial.getControlSignals(this.info.connectionId, function (signals){
    console.log('signals', signals);
  })
}


Fingerprint.prototype.handshake = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.handshake();
  return request.start();
}

Fingerprint.prototype.genImg = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.genImg();

  return request.start();
}

Fingerprint.prototype.upImage = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.upImage();

  return request.start();
};

Fingerprint.prototype.img2Tz = function (bufferId) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.img2Tz(bufferId);

  return request.start();
};

Fingerprint.prototype.regModel = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.regModel();

  return request.start();
};

Fingerprint.prototype.upChar = function (bufferId) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.upChar(bufferId);

  return request.start();
};

Fingerprint.prototype.downChar = function (bufferId) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.downChar(bufferId);

  return request.start();
};

Fingerprint.prototype.store = function (bufferId, pageId) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.store(bufferId, pageId);

  return request.start();
};

Fingerprint.prototype.loadChar = function (bufferId, pageId) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.loadChar(bufferId, pageId);

  return request.start();
};

Fingerprint.prototype.deletChar = function (pageId, count) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.deletChar(pageId, count);

  return request.start();
};

Fingerprint.prototype.empty = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.empty();

  return request.start();
};

Fingerprint.prototype.match = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.match();

  return request.start();
};

Fingerprint.prototype.search = function (bufferId, startPage, pageNum) {
  var request = new FingerprintRequest(this.serial, this.info);
  request.search(bufferId, startPage, pageNum);

  return request.start();
};

Fingerprint.prototype.getRandomCode = function () {
  var request = new FingerprintRequest(this.serial, this.info);
  request.getRandomCode();

  return request.start();
}


function GenericFingerprintResponse (buffer, next) {
  this.view = new Uint8Array(buffer);

  this.header   = this.view.slice(0, 2);
  this.addr     = this.view.slice(2, 6);
  this.pid      = this.view.slice(6, 7)[0];
  this.len      = this.view.slice(7,9);
  this.code     = this.view.slice(9, 10)[0];
  this.sum      = this.view.slice(this.view.length - 3, this.view.length - 1);

  next(this);
}

GenericFingerprintResponse.prototype.TYPE == "COMMAND";

function GenericFingerprintDataResponse (buffer, next) {
  this.buffer     = buffer;
  this.position   = this.buffer.length;
  this.size       = size;
  this.timeout    = 3000;

  next(this);
}


function FingerprintGetRandomCodeResponse (buffer, next) {
  GenericFingerprintResponse.call(this, buffer);

  this.randomNumber = this.view.slice(10, 14).reduce(function(previous, current, index, array){
    return previous + current;
  });

  next(this);
}

FingerprintGetRandomCodeResponse.prototype = Object.create(GenericFingerprintResponse.prototype);
FingerprintGetRandomCodeResponse.prototype.constructor = FingerprintGetRandomCodeResponse;

function FingerprintUpImageResponse (view, next) {
  this.header   = view.slice(0, 2);
  this.addr     = view.slice(2, 6);
  this.pid      = view.slice(6, 7)[0];
  this.len      = view.slice(7,9);
  this.code     = view.slice(9, 10)[0];
  this.sum      = view.slice(view.length - 3, view.length - 1);

  this.packet = view.slice(12, 21);
  this.image = view.slice(21, view.length);

  next(this);
}

FingerprintUpImageResponse.prototype = Object.create(GenericFingerprintResponse.prototype);
FingerprintUpImageResponse.prototype.constructor = FingerprintUpImageResponse;
FingerprintUpImageResponse.TYPE == "DATA";
