onmessage = async function (e) {
  console.log(e);
  console.log((await fetch("http://dev.local.ask-joe.co/")));
  // console.log(window)

  // postMessage(e)

  // workerClose()
};

addEventListener('fetch', (event) => {
  console.log(event);
  console.log('test');
});

// dispatch(new Event('fetch'));
