import React from "react";
import { createRoot } from "react-dom/client";

const Message = () => {
  return (
    <React.Fragment>
      <a href="#">Want to buy a new car?</a>
      <p>Call +11 22 33 44 now!</p>
    </React.Fragment>
  );
};

document.body.innerHTML = "<div id='root'></div>";
const root = createRoot(document.getElementById("root"));

root.render(<Message />);
const rootElement = document.getElementById("root");
setTimeout(() => {
  console.log("Before click: " + rootElement.innerHTML);

  document.querySelector("a").click();
  setTimeout(() => {
    console.log("After click: " + rootElement.innerHTML);
  });
});
