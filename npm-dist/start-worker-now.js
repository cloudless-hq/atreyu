// app/src/service-worker/start-worker.js
async function startWorker({ reloadAfterInstall, workerPath = "/build/service-worker.js", isModule } = {}) {
  let regs;
  let firstStart = false;
  try {
    regs = await navigator.serviceWorker.getRegistrations();
  } catch (err) {
    console.warn(err);
    location.reload();
  }
  if (regs.length !== 1) {
    console.log(regs.length + " worker registrations", regs);
  }
  if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state) {
    if (!navigator.serviceWorker.controller.state === "activated") {
      console.warn("worker is " + navigator.serviceWorker.controller.state);
    } else {
    }
  }
  let loaded = () => {
    console.log("worker restarted");
  };
  navigator.serviceWorker.addEventListener("message", async (e) => {
    if (e.data === '{"worker":"active"}') {
      await navigator.serviceWorker.ready;
      console.log("ServiceWorker start", { reloadAfterInstall, firstStart });
      if (firstStart && reloadAfterInstall) {
        if (!window.location.search) {
          window.location.reload();
        } else {
          window.location.href = window.location.search;
        }
      } else {
        loaded(reg);
      }
    } else if (e.data.startsWith("navigate:")) {
      const href = e.data.replace("navigate:", "");
      console.log("navigating tab to " + href);
      window.location.href = href;
    }
  });
  let reg;
  if (regs.length === 0) {
    firstStart = true;
    reg = await navigator.serviceWorker.register(workerPath, {
      updateViaCache: "all",
      scope: "/",
      type: isModule ? "module" : void 0
    });
    console.log("ServiceWorker registred");
    return new Promise((resolve) => {
      loaded = resolve;
    });
  } else {
    await navigator.serviceWorker.ready;
    reg = regs[0];
    return regs[0];
  }
}

// app/src/service-worker/start-worker-now.js
startWorker({ reloadAfterInstall: true, workerPath: "./service-worker.js", isModule: true });
