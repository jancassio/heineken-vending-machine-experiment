chrome.app.runtime.onLaunched.addListener(function(){
  chrome.app.window.create('window.html',{
    'outerBounds': {
      'width': 720,
      'height': 1280
    }
  })
})
