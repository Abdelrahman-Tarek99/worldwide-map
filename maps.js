'use strict';
const pinClasses = document.querySelectorAll(".pin");
const countryClasses = document.querySelectorAll(".Countries");
const countryCards = document.querySelectorAll(".country-cards");
const zoomOutBtn = document.querySelector("#zoomOutBtn");
let lastSelectedCard = null;
let svgElement = document.getElementById("svgMap");
const defaultViewBox = { x: 450, y: 200, width: 800, height: 340 };
let startX, startY;
let currentViewBox = { ...defaultViewBox };
let egyptSvg = document.getElementById("Egypt");
let saudiArabiaSvg = document.getElementById("SaudiArabia");
let jordonSvg = document.getElementById("Jordon");
let indiaSvg = document.getElementById("India");
let countryCardsArray = Array.from(countryCards);
let countryPinsArray = document.querySelectorAll(".pin");






function simulateClickOnCountry(defaultCountryID) {
  const countryElement = document.getElementById(defaultCountryID);
  if (countryElement) {
    let event = new MouseEvent('click', {
      bubbles: true,    
      cancelable: true,  
      view: window
    });

    // Dispatch the event
    countryElement.dispatchEvent(event);
  }
}
document.addEventListener("DOMContentLoaded", ()=>{
  simulateClickOnCountry('SaudiArabia');
})


zoomOutBtn.addEventListener("click", (event) => resetZooming(event));

document.getElementById("svgMap").addEventListener("click", (event) => {
  const targetElement = event.target;
  console.log("Target Element:", targetElement);
  switch (targetElement.id) {
    case "Egypt":
      handleCountryClick(event);
      break;
    case "SaudiArabia":
      handleCountryClick(event);
      break;
    case "Jordon":
      handleCountryClick(event);
      break;
    case "India":
      handleCountryClick(event);
      break;
    default:
      console.log("DEFAULT");
  }
});

countryCardsArray.forEach((card) => {
  card.addEventListener("click", (event) => {
    resetStyles(event);
    applySelectedStyles(event, card);
  }
  );
});
 countryPinsArray.forEach((pin) => {
  pin.addEventListener("click", (event) => {
    resetStyles(event);
    applySelectedStyles(event, pin);
  });
});

function simulateClick(element) {
  let event = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
  });
  element.dispatchEvent(event);
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
function resetStyles(event) {
  event.stopPropagation();
  countryCardsArray.forEach((card) => {
    card.classList.remove("activatePinAndCard");
  });
  countryPinsArray.forEach((pin) => (pin.style.fill = "#001081")); // Reset to default color
}
function selectedTargetCountryCards(cards, dataSetID) {
  let TargetCountryCards= countryCardsArray.filter((card) => card.dataset.country === dataSetID);
  // console.log("countryCardsArray:" , TargetCountryCards);
  countryCardsArray.forEach((card) => {
    card.classList.remove("country-cards-active");
  });
  TargetCountryCards.forEach((card) => {
    card.classList.add("country-cards-active");
  });
  if (TargetCountryCards.length > 0) {
    console.log("Target Country Card intial:", TargetCountryCards[0]);
    simulateClick(TargetCountryCards[0]);
  }
}

function applySelectedStyles(event, targetElement) {
  event.stopPropagation();
  let targetId;
  const id = targetElement.id;
  if (id.startsWith("pin-")) {
    console.log("Pin Clicked");
    targetId = id.slice(4);
    document.getElementById(targetId).classList.add("activatePinAndCard");
    targetElement.style.fill = "#4477ff"; // Change pin color
  } else {
    targetId = "pin-" + id; // Create pin ID
    document.getElementById(targetId).style.fill = "#4477ff"; // Change pin color
    targetElement.classList.add("activatePinAndCard");
  }
}

function selectedTargetCountryPins(pins, dataSetID) {
  console.log("Data Set ID:", dataSetID);
  console.log("countryPinsArray:" , pins);
  let targetCountryPins = Array.from(pins).filter(pin => pin.classList.contains(`${dataSetID}-Pins`));
   // Add the class to the first element only
   if (targetCountryPins.length > 0) {
    targetCountryPins[0].classList.add("activatePinAndCard");
  }
}
function handleCountryClick(event) {
  event.stopPropagation();
  countryClasses.forEach((country) => {
    country.style.fill = ""; 
  });
  resetStyles(event);
  const path = event.target;
  path.style.fill = "#A3A3A8";
  const dataSetID = event.target.dataset.country;
  const countryID = event.target.id;
  const bbox = path.getBBox();
  zoomOutBtn.classList.add("zoomOutBtnMapActive");
  selectedTargetCountryCards( countryCards, dataSetID);
  selectedTargetCountryPins(countryPinsArray, countryID);
  countryClasses.forEach((p) => {
    p.classList.remove("active");
    p.classList.add("Inactive");
  });
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
function resetViewBox(event) {
  // console.log("Resetting ViewBox");
  svgElement.style.cursor = "pointer";
  currentViewBox = { ...defaultViewBox };
  smoothZoom(svgElement, `${defaultViewBox.x} ${defaultViewBox.y} ${defaultViewBox.width} ${defaultViewBox.height}`, 280);
}

function resetZooming(event) {
  event.stopPropagation();
  countryCardsArray.forEach((card) => {
    card.classList.remove("country-cards-active");
  });
  countryPinsArray.forEach((pin) => {
    pin.style.fill = "#001081"; 
  });
  countryClasses.forEach((p) => {
    p.classList.remove("active");
    p.classList.remove("Inactive");
  });
  zoomOutBtn.classList.remove("zoomOutBtnMapActive");
  resetViewBox(event);
}