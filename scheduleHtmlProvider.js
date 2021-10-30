function scheduleHtmlProvider(
  iframeContent = "",
  frameContent = "",
  dom = document
) {
  const http = new XMLHttpRequest();
  http.open("GET", "/jsxsd/xskb/xskb_list.do", false);
  http.send();
  return http.responseText;
}
