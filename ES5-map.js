var pinClasses = document.querySelectorAll(".pin");
var countryClasses = document.querySelectorAll(".Countries");
var countryCards = document.querySelectorAll(".country-cards");
var zoomOutBtn = document.querySelector("#zoomOutBtn");
var lastSelectedCard = null;
var svgElement = document.getElementById("svgMap");
var defaultViewBox = { x: 450, y: 200, width: 800, height: 340 };
var startX, startY;
var currentViewBox = {
  x: defaultViewBox.x,
  y: defaultViewBox.y,
  width: defaultViewBox.width,
  height: defaultViewBox.height
};
zoomOutBtn.addEventListener("click", function(event) {
  resetViewBox(event);
});
Array.prototype.forEach.call(pinClasses, function(pin) {
  pin.addEventListener("click", function(event) {
    resetStyles(event);
    applySelectedStyles(event, pin);
  });
});
Array.prototype.forEach.call(document.querySelectorAll("#svgMap path:not(.pin)"), function(path) {
  path.addEventListener("click", function(event) {
    handleCountryClick(event);
  });
});
Array.prototype.forEach.call(countryCards, function(card) {
  card.addEventListener("click", function(event) {
    resetStyles(event);
    applySelectedStyles(event, card);
  });
});
document.addEventListener("click", function(event) {
  resetZooming(event);
});

function resetStyles(event) {
  event.stopPropagation();
  Array.prototype.forEach.call(countryCards, function(card) {
    card.classList.remove("activatePinAndCard");
  });
  Array.prototype.forEach.call(pinClasses, function(pin) {
    pin.style.fill = "#001081"; // Reset to default color
  });
}

function applySelectedStyles(event, element) {
  event.stopPropagation();
  var id = element.id;
  var targetId;
  if (id.indexOf("pin-") === 0) {
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
  svgElement.style.cursor = "pointer";
  currentViewBox = {
    x: defaultViewBox.x,
    y: defaultViewBox.y,
    width: defaultViewBox.width,
    height: defaultViewBox.height
  };
  svgElement.setAttribute("viewBox", defaultViewBox.x + " " + defaultViewBox.y + " " + defaultViewBox.width + " " + defaultViewBox.height);
}

function selectedTargetCountryCards(card, dataSetID) {
  if (card.dataset.country === dataSetID) {
    card.classList.add("country-cards-active");
  } else {
    card.classList.remove("country-cards-active");
  }
}

function handleCountryClick(event) {
  event.stopPropagation();
  resetStyles(event);
  zoomOutBtn.classList.add("zoomOutBtnMapActive");
  var path = event.target;
  var dataSetID = path.dataset.country;
  Array.prototype.forEach.call(countryCards, function(card) {
    selectedTargetCountryCards(card, dataSetID);
  });
  Array.prototype.forEach.call(countryClasses, function(p) {
    p.classList.remove("active");
    p.classList.add("Inactive");
  });
  Array.prototype.forEach.call(pinClasses, function(pin) {
    pin.classList.add("pinOpacityInactive"); // Inactivate all non-related pins
  });
  path.classList.add("active");
  Array.prototype.forEach.call(document.querySelectorAll("." + path.id + "-Pins"), function(pin) {
    pin.classList.remove("pinOpacityInactive");
  });
  var bbox = path.getBBox();
  var newViewBox = [
    bbox.x - 5,
    bbox.y - 5,
    bbox.width + 10,
    bbox.height + 10
  ].join(" ");
  currentViewBox = {
    x: bbox.x - 5,
    y: bbox.y - 5,
    width: bbox.width + 10,
    height: bbox.height + 10
  };
  smoothZoom(svgElement, newViewBox, 280);
}

function smoothZoom(svgElement, targetViewBox, duration) {
  var start = null;
  var initialViewBox = svgElement.getAttribute("viewBox").split(" ").map(Number);
  var newViewBox = targetViewBox.split(" ").map(Number);

  function step(timestamp) {
    if (!start) start = timestamp;
    var progress = Math.min((timestamp - start) / duration, 1);

    var intermediateViewBox = initialViewBox.map(function(start, index) {
      var end = newViewBox[index];
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
  Array.prototype.forEach.call(countryCards, function(card) {
    card.classList.remove("country-cards-active");
  });
  zoomOutBtn.classList.remove("zoomOutBtnMapActive");
  Array.prototype.forEach.call(countryClasses, function(p) {
    p.classList.remove("active");
    p.classList.remove("Inactive");
  });
  Array.prototype.forEach.call(pinClasses, function(pin) {
    pin.classList.add("pinOpacityInactive"); // Make all pins less visible
  });
  resetViewBox(event);
}
