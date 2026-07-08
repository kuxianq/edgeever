const params = new URLSearchParams(window.location.hash ? window.location.hash.slice(1) : window.location.search);
const returnTo = params.get("returnTo");

window.location.replace(returnTo?.startsWith("/") ? returnTo : "/");
