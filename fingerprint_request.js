function FingerprintRequest (serial, info) {
  this.serial               = serial;
  this.info                 = info;
  this.response             = GenericFingerprintResponse;

  this.header       = [0xEF, 0x01];
  this.adder        = [0xFF, 0xFF, 0xFF, 0xFF];
  this.pid          = [0x01];
  this.length       = [0x0, 0x0];
  this.data         = [0x0];
  this.sum          = [0x0, 0x0];

  this.type         = "COMMAND";
}

FingerprintRequest.prototype.getChecksum = function () {
  var tmp = []
    .concat(this.pid)
    .concat(this.length)
    .concat(this.data);

  return tmp.reduce(function(previous, current, index, array){
    return previous + current;
  });
}

FingerprintRequest.prototype.getBufferLength = function () {
  return []
    .concat(this.header)
    .concat(this.adder)
    .concat(this.pid)
    .concat(this.length)
    .concat(this.data)
    .concat(this.sum).length;
}

FingerprintRequest.prototype.getBuffer  = function () {
  var buffer = new ArrayBuffer(this.getBufferLength());
  var view = new Uint8Array(buffer);

  var position = 0;

  addArray(this.header)
    (this.adder)
    (this.pid)
    (this.length)
    (this.data)
    (this.sum);

  function addArray (array) {
    view.set(array, position);
    position += array.length;

    return addArray
  }

  return buffer;
}

FingerprintRequest.prototype.start = function () {
  var buffer = this.getBuffer();
  this.serial.send(this.info.connectionId, this.getBuffer(), function (data){
    // data sent
    console.log('request', new Uint8Array(buffer));
  })

  if (this.type == "DATA") {
    var sum = 0;
    console.log('----- start counting -----');
    return new Promise(function(resolve, reject){
      var dataSize = this.payloadSize;
      var data = new Uint8Array(dataSize);

      var onReceiveHandler = function(info){
        console.log('info data', new Uint8Array(info.data));

        try {
          data.set( new Uint8Array(info.data), Math.min(dataSize, sum) );
        }
        catch (e) {
          console.log('error: ', e);
        }

        sum += new Uint8Array(info.data).length;

        console.log('sum', sum);

        var progress = (sum / dataSize);

        if ( progress == 1 ) {
          new this.response(data, function (response) {

            if (response.code == 0) {
              this.serial.onReceive.removeListener(onReceiveHandler);
              this.serial.onReceiveError.removeListener(onReceiveErrorHandler);
              resolve(response);
            }
            else {
              reject({response:response});
            }
          }.bind(this));
        }
      }.bind(this);

      var onReceiveErrorHandler = function(){
        this.serial.onReceive.removeListener(onReceiveHandler);
        this.serial.onReceiveError.removeListener(onReceiveErrorHandler);

        reject({errors:arguments});
      }.bind(this)

      this.serial.onReceive.addListener(onReceiveHandler);
      this.serial.onReceiveError.addListener(onReceiveErrorHandler);
    }.bind(this))
  }
  else {
    return new Promise(function(resolve, reject){
      var onReceiveHandler = function(info){
        new this.response(info.data, function (res) {

          if (res.code == 0) {
            this.serial.onReceive.removeListener(onReceiveHandler);
            this.serial.onReceiveError.removeListener(onReceiveErrorHandler);
            resolve({response:res});
          }
          else {
            reject({response:res});
          }
        }.bind(this));
      }.bind(this);

      var onReceiveErrorHandler = function(){
        this.serial.onReceive.removeListener(onReceiveHandler);
        this.serial.onReceiveError.removeListener(onReceiveErrorHandler);

        reject({errors:arguments});
      }.bind(this)

      this.serial.onReceive.addListener(onReceiveHandler);
      this.serial.onReceiveError.addListener(onReceiveErrorHandler);
    }.bind(this))
  }
}

FingerprintRequest.prototype.bufferForInstruction = function (id, length) {
  this.length = [0x00, length];
  this.data = [id];

  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.handshake = function () {
  this.response = GenericFingerprintResponse;
  this.length = [0x00, 0x04];
  this.data = [FingerprintInstructionCode.HANDSHAKE, 0x00];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}


FingerprintRequest.prototype.genImg = function () {
  this.length = [0x00, 0x03];
  this.data = [ FingerprintInstructionCode.GEN_IMG ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.upImage = function () {
  this.response = FingerprintUpImageResponse;
  this.length = [0x00, 0x03];
  this.data = [FingerprintInstructionCode.UP_IMAGE];
  this.sum[1] = this.getChecksum();

  this.type = "DATA";
  this.payloadSize = 40044;

  return this.getBuffer();
}

FingerprintRequest.prototype.img2Tz = function (bufferId) {
  this.length = [0x00, 0x04];
  this.data = [ FingerprintInstructionCode.IMG_2_TZ, bufferId ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.regModel = function () {
  return this.bufferForInstruction(FingerprintInstructionCode.REG_MODEL, 0x03);
}

FingerprintRequest.prototype.upChar = function (bufferId) {
  this.type   = "DATA";
  this.payloadSize = 568;
  this.length = [0x00, 0x04];
  this.data = [ FingerprintInstructionCode.UP_CHAR, bufferId ];
  this.sum[1] = this.getChecksum();


  return this.getBuffer();
}

FingerprintRequest.prototype.downChar = function (bufferId) {
  this.length = [0x00, 0x04];
  this.data = [ FingerprintInstructionCode.DOWN_CHAR, bufferId ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.store = function (bufferId, pageId) {
  this.length = [0x00, 0x06];
  this.data = [ FingerprintInstructionCode.STORE, bufferId, pageId ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.loadChar = function (bufferId, pageId) {
  this.length = [0x00, 0x06];
  this.data = [ FingerprintInstructionCode.LOAD_CHAR, bufferId, pageId ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.deletChar = function (pageId, count) {
  this.length = [0x00, 0x07];
  this.data = [ FingerprintInstructionCode.DELET_CHAR ]
    .concat(numberToByteList(pageId || 0))
    .concat(numberToByteList(count || 0));

  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.empty = function () {
  return this.bufferForInstruction(FingerprintInstructionCode.EMPTY, 0x03);
}

FingerprintRequest.prototype.regModel = function () {
  return this.bufferForInstruction(FingerprintInstructionCode.REG_MODEL, 0x03);
}

FingerprintRequest.prototype.match = function () {
  return this.bufferForInstruction(FingerprintInstructionCode.MATCH, 0x03);
}

FingerprintRequest.prototype.search = function (bufferId, startPage, pageNum) {
  this.length = [0x07, 0x00];
  this.data = [ FingerprintInstructionCode.SEARCH, bufferId ]
    .concat(numberToByteList(startPage || 0))
    .concat(numberToByteList(pageNum || 0));

  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

FingerprintRequest.prototype.getRandomCode = function () {
  this.response = FingerprintGetRandomCodeResponse;
  this.length = [0x00, 0x03];
  this.data = [ FingerprintInstructionCode.GET_RANDOM_CODE ];
  this.sum[1] = this.getChecksum();

  return this.getBuffer();
}

function numberToByteList (n) {
  return [Math.min(n, 255), n > 255 ? n % 255 : 0x00];
}
