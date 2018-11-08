var fingerprint;

var fingerprintData = [0xFF, 0x00, 0xF2, 0xCC];

function getAvailableDevices () {
  chrome.serial.getDevices(function(ports){
    for (var i = 0; i < ports.length; i++) {
      writePort(ports[i]);
    }
  });
}

function newButton (name, callback) {
  var btn = document.createElement('button');
  btn.innerHTML = name;
  btn.onclick = callback;

  return btn;
}

function writePort (port) {
  var list = document.querySelector('.ports-list');
  var p = document.createElement('p');

  var connectBtn = newButton('Connect', function (event) {
    connect(port);
  });

  var handshakeBtn = newButton('Handshake', function (event) {
    handshake();
  });

  var genImgButton = newButton("Generate Image", function (event){
    genImg();
  });

  var upImageButton = newButton("Up Image", function (event){
    upImage();
  });

  var img2Tz1 = newButton("Img2Tz 1", function (event){
    img2Tz(1);
  });

  var img2Tz2 = newButton("Img2Tz 2", function (event){
    img2Tz(2);
  });

  var regModelBtn = newButton("RegModel", function (event){
    regModel();
  });

  var upChar1Btn = newButton("UpChar 1", function (event){
    upChar(1);
  });

  var upChar2Btn = newButton("UpChar 2", function (event){
    upChar(2);
  });

  var downChar1Btn = newButton("DownChar 1", function (event){
    downChar(1);
  });

  var downChar2Btn = newButton("DownChar 2", function (event){
    downChar(2);
  });

  var store1Btn = newButton("Store 1", function (event){
    store(1, 1);
  });

  var store2Btn = newButton("Store 2", function (event){
    store(2, 2);
  });

  var loadChar1Btn = newButton("LoadChar 1", function (event){
    loadChar(1, 1);
  });

  var loadChar2Btn = newButton("LoadChar 2", function (event){
    loadChar(2, 2);
  });

  var deletChar1Btn = newButton("DeletChar 1", function (event){
    deletChar(1, 1);
  });

  var deletChar2Btn = newButton("DeletChar 2", function (event){
    deletChar(2, 1);
  });

  var emptyBtn = newButton("Empty", function (event){
    empty();
  });

  var matchBtn = newButton("Match", function (event){
    match();
  });

  var searchBtn = newButton("Search", function (event){
    search(1, 0, 100);
  });

  var getRandomCodeBtn = newButton("Random Code", function (event) {
    getRandomCode();
  });

  p.innerHTML = "path: " + port.path + " | Actions: ";

  p.appendChild(connectBtn);
  p.appendChild(document.createElement('hr'));
  p.appendChild(handshakeBtn);
  p.appendChild(document.createElement('hr'));
  p.appendChild(genImgButton);
  p.appendChild(upImageButton);
  p.appendChild(img2Tz1);
  p.appendChild(img2Tz2);
  p.appendChild(regModelBtn);
  p.appendChild(upChar1Btn);
  p.appendChild(upChar2Btn);
  p.appendChild(downChar1Btn);
  p.appendChild(downChar2Btn);
  p.appendChild(store1Btn);
  p.appendChild(store2Btn);
  p.appendChild(loadChar1Btn);
  p.appendChild(loadChar2Btn);
  p.appendChild(deletChar1Btn);
  p.appendChild(deletChar2Btn);
  p.appendChild(emptyBtn);
  p.appendChild(document.createElement('hr'));
  p.appendChild(matchBtn);
  p.appendChild(searchBtn);
  p.appendChild(document.createElement('hr'));
  p.appendChild(getRandomCodeBtn);

  list.appendChild(p);

  var hr = document.createElement('hr');
}

function connect (port) {
  var options = {
    bitrate: 57600
  };

  try {
    chrome.serial.connect(port.path, options, function(info){
      for (key in info) {
        writeConnectionResult(key + " = " + info[key]);
      }

      fingerprint = new Fingerprint(chrome.serial, info);
    })
  }
  catch (e) {
    console.log('error', e);
  }
}

function writeConnectionResult (message) {
  var output = document.querySelector('.connection-result');
  output.innerHTML += message + '<br />';
}

function handshake () {
  fingerprint.handshake()
    .then(function(result){
      console.log('handshake success!');
    })
    .catch(function(result){
      console.log('result', result);
      if (result.response) {
        console.log('handshake.error.response', result.response);
      }
      else {
        console.log('handshake.errors', result.errors);
      }
    })
}

function genImg () {
  fingerprint.genImg()
    .then(function(result){
      console.log("Fingerprint generated with success!");
    })
    .catch(function(result){
      if (result.response) {
        if (result.response.code == 2) {
          genImg();
        }
      }
      else {
        console.log('genImg.errors', result.errors);
      }
    })
}

function upImage () {
  var data;

  fingerprint.upImage()
    .then(function(result){
      console.log('image received and stored in local var named \'fingerprintData\'');
      fingerprintData = result.image;
    })
    .catch(function(result){
      if (result.response) {
        console.log('upImage.error.response', result.response);
      }
      else {
        console.log('upImage.errors', result.errors);
      }
    })
}

function img2Tz (bufferId) {
  fingerprint.img2Tz(bufferId)
    .then(function(result){
      console.log('current image stored at buffer id %i with success', bufferId);
    })
    .catch(function(result){
      if (result.response) {
        console.log('img2Tz.error.response', result.response);
      }
      else {
        console.log('img2Tz.errors', result.errors);
      }
    })
}

function regModel () {
  fingerprint.regModel()
    .then(function(result){
      console.log('model registered with success and available at CharBuffer1 and CharBuffer2');
    })
    .catch(function(result){
      if (result.response) {
        console.log('regModel.error.response', result.response);
      }
      else {
        console.log('regModel.errors', result.errors);
      }
    })
}

function upChar (bufferId) {
  fingerprint.upChar(bufferId)
    .then(function(result){
      console.log('CharBuffer%i received with success', bufferId);
    })
    .catch(function(result){
      if (result.response) {
        console.log('upChar.error.response', result.response);
      }
      else {
        console.log('upChar.errors', result.errors);
      }
    })
}

function downChar (bufferId) {
  fingerprint.downChar(bufferId)
    .then(function(result){
      console.log('downChar.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('downChar.error.response', result.response);
      }
      else {
        console.log('downChar.errors', result.errors);
      }
    })
}

function store (bufferId, pageId) {
  fingerprint.store(bufferId, pageId)
    .then(function(result){
      console.log('store.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('store.error.response', result.response);
      }
      else {
        console.log('store.errors', result.errors);
      }
    })
}

function loadChar (bufferId, pageId) {
  fingerprint.loadChar(bufferId, pageId)
    .then(function(result){
      console.log('loadChar.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('loadChar.error.response', result.response);
      }
      else {
        console.log('loadChar.errors', result.errors);
      }
    })
}

function deletChar (pageId, count) {
  fingerprint.deletChar(pageId, count)
    .then(function(result){
      console.log('deletChar.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('deletChar.error.response', result.response);
      }
      else {
        console.log('deletChar.errors', result.errors);
      }
    })
}

function empty () {
  fingerprint.empty()
    .then(function(result){
      console.log('empty.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('empty.error.response', result.response);
      }
      else {
        console.log('empty.errors', result.errors);
      }
    })
}

function match () {
  fingerprint.match()
    .then(function(result){
      console.log('match.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('match.error.response', result.response);
      }
      else {
        console.log('match.errors', result.errors);
      }
    })
}

function search (bufferId, startPage, pageNum) {
  fingerprint.search(bufferId, startPage, pageNum)
    .then(function(result){
      console.log('search.response', result.response);
    })
    .catch(function(result){
      if (result.response) {
        console.log('search.error.response', result.response);
      }
      else {
        console.log('search.errors', result.errors);
      }
    })
}

function getRandomCode () {
  fingerprint.getRandomCode()
    .then(function(result){
      console.log('Random number', result.randomNumber);
    })
    .catch(function(result){
      if (result.response) {
        console.log('getRandomCode.error.response', result.response);
      }
      else {
        console.log('getRandomCode.errors', result.errors);
      }
    })
}


getAvailableDevices();
