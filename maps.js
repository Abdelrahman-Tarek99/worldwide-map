const pinClasses = document.querySelectorAll(".pin");
const countryClasses = document.querySelectorAll(".Countries");
const countryCards = document.querySelectorAll(".country-cards");
const zoomOutBtn = document.querySelector("#zoomOutBtn");
let lastSelectedCard = null;
let svgElement = document.getElementById("svgMap");
const defaultViewBox = { x: 450, y: 200, width: 800, height: 340 };
let startX, startY;
let currentViewBox = { ...defaultViewBox };
zoomOutBtn.addEventListener("click", (event) => resetViewBox(event));
pinClasses.forEach((pin) => {
  pin.addEventListener("click", (event) => {
    resetStyles(event);
    applySelectedStyles(event, pin);
  });
});
document.querySelectorAll("#svgMap path:not(.pin)").forEach((path) => {
  path.addEventListener("click", (event) => handleCountryClick(event));
});
countryCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    resetStyles(event);
    applySelectedStyles(event, card);
  });
});
document.addEventListener("click", (event) => resetZooming(event));
function resetStyles(event) {
  event.stopPropagation();
  console.log("Resetting Styles");
  countryCards.forEach((card) => {
    card.classList.remove("activatePinAndCard");
  });
  pinClasses.forEach((pin) => (pin.style.fill = "#001081")); // Reset to default color
}
function applySelectedStyles(event, element) {
  event.stopPropagation();
  const id = element.id;
  console.log("Element ID:", id);
  let targetId;
  if (id.startsWith("pin-")) {
    targetId = id.slice(4);
    document.getElementById(targetId).classList.add("activatePinAndCard");
    element.style.fill = "#4477ff"; // Change pin color
  } else {
    targetId = "pin-" + id; // Create pin ID
    document.getElementById(targetId).style.fill = "#4477ff"; // Change pin color
    element.classList.add("activatePinAndCard");
  }
}
function resetViewBox(event) {
  // console.log("EVEN TARGET", event.target);
  // console.log("Resetting ViewBox");
  svgElement.style.cursor = "pointer";
  currentViewBox = { ...defaultViewBox };
  svgElement.setAttribute(
    "viewBox",
    `${defaultViewBox.x} ${defaultViewBox.y} ${defaultViewBox.width} ${defaultViewBox.height}`
  );
}
function selectedTargetCountryCards(card, dataSetID) {
  if (card.dataset.country === dataSetID) {
    card.classList.add("country-cards-active");
    console.log("country card :", card.dataset.country);
  }
  else{
    card.classList.remove("country-cards-active");
  }
}
function handleCountryClick(event) {
  event.stopPropagation();
  resetStyles(event);
  zoomOutBtn.classList.add("zoomOutBtnMapActive");
  const path = event.target;
  const dataSetID = event.target.dataset.country;
  countryCards.forEach((card) => {
    selectedTargetCountryCards(card, dataSetID);
  });
  countryClasses.forEach((p) => {
    p.classList.remove("active");
    p.classList.add("Inactive");
  });
  pinClasses.forEach((pin) => {
    pin.classList.add("pinOpacityInactive"); // Inactivate all non related pins
  });
  event.target.classList.add("active");
  document.querySelectorAll(`.${event.target.id}-Pins`).forEach((pin) => {
    pin.classList.remove("pinOpacityInactive");
  });
  const bbox = path.getBBox();
  const newViewBox = [
    bbox.x - 5,
    bbox.y - 5,
    bbox.width + 0,
    bbox.height + 10,
  ].join(" ");
  currentViewBox = {
    x: bbox.x - 5,
    y: bbox.y - 5,
    width: bbox.width + 10,
    height: bbox.height + 10,
  };
  smoothZoom(document.getElementById("svgMap"), newViewBox, 280);
}
function smoothZoom(svgElement, targetViewBox, duration) {
  let start = null;
  const initialViewBox = svgElement
    .getAttribute("viewBox")
    .split(" ")
    .map(Number);
  const newViewBox = targetViewBox.split(" ").map(Number);

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    const intermediateViewBox = initialViewBox.map((start, index) => {
      const end = newViewBox[index];
      return start + (end - start) * progress; // Linear interpolation
    });

    svgElement.setAttribute("viewBox", intermediateViewBox.join(" "));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
function resetZooming(event) {
  event.stopPropagation();
  resetStyles(event);
  countryCards.forEach((card) => {
    card.classList.remove("country-cards-active");
  });
  zoomOutBtn.classList.remove("zoomOutBtnMapActive");
  countryClasses.forEach((p) => {
    p.classList.remove("active");
    p.classList.remove("Inactive");
  });
  pinClasses.forEach((pin) => {
    pin.classList.add("pinOpacityInactive"); // Make all pins less visible
  });
  resetViewBox(event);
}
