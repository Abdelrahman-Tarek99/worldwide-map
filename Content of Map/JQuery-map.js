// Select elements with jQuery
const $pinClasses = $(".pin");
const $countryClasses = $(".Countries");
const $countryCards = $(".country-cards");
const $zoomOutBtn = $("#zoomOutBtn");
let lastSelectedCard = null;
let $svgElement = $("#svgMap");
const defaultViewBox = { x: 450, y: 200, width: 800, height: 340 };
let startX, startY;
let currentViewBox = { ...defaultViewBox };

// Event listeners using jQuery
$zoomOutBtn.on("click", (event) => resetViewBox(event));
$pinClasses.on("click", function(event) {
  resetStyles(event);
  applySelectedStyles(event, $(this));
});
$("#svgMap path:not(.pin)").on("click", (event) => handleCountryClick(event));
$countryCards.on("click", function(event) {
  resetStyles(event);
  applySelectedStyles(event, $(this));
});
$(document).on("click", (event) => resetZooming(event));

// Define functions using jQuery methods
function resetStyles(event) {
  event.stopPropagation();
  console.log("Resetting Styles");
  $countryCards.removeClass("activatePinAndCard");
  $pinClasses.css('fill', "#001081"); // Reset to default color
}

function applySelectedStyles(event, element) {
  event.stopPropagation();
  const id = element.attr('id');
  console.log("Element ID:", id);
  let targetId;
  if (id.startsWith("pin-")) {
    targetId = id.slice(4);
    $("#" + targetId).addClass("activatePinAndCard");
    element.css('fill', "#4477ff"); // Change pin color
  } else {
    targetId = "pin-" + id;
    $("#" + targetId).css('fill', "#4477ff"); // Change pin color
    element.addClass("activatePinAndCard");
  }
}

function resetViewBox(event) {
  $svgElement.css('cursor', "pointer");
  currentViewBox = { ...defaultViewBox };
  $svgElement.attr("viewBox", `${defaultViewBox.x} ${defaultViewBox.y} ${defaultViewBox.width} ${defaultViewBox.height}`);
}

function selectedTargetCountryCards(card, dataSetID) {
  if (card.data("country") === dataSetID) {
    card.addClass("country-cards-active");
    console.log("country card :", card.data("country"));
  } else {
    card.removeClass("country-cards-active");
  }
}

function handleCountryClick(event) {
  event.stopPropagation();
  resetStyles(event);
  $zoomOutBtn.addClass("zoomOutBtnMapActive");
  const path = $(event.target);
  const dataSetID = path.data("country");
  $countryCards.each(function() {
    selectedTargetCountryCards($(this), dataSetID);
  });
  $countryClasses.removeClass("active").addClass("Inactive");
  $pinClasses.addClass("pinOpacityInactive");
  path.addClass("active");
  $("." + path.attr('id') + "-Pins").removeClass("pinOpacityInactive");
  const bbox = path[0].getBBox();
  const newViewBox = [
    bbox.x - 5,
    bbox.y - 5,
    bbox.width + 0,
    bbox.height + 10
  ].join(" ");
  currentViewBox = {
    x: bbox.x - 5,
    y: bbox.y - 5,
    width: bbox.width + 10,
    height: bbox.height + 10
  };
  smoothZoom($svgElement, newViewBox, 280);
}

function smoothZoom(svgElement, targetViewBox, duration) {
  let start = null;
  const initialViewBox = svgElement.attr("viewBox").split(" ").map(Number);
  const newViewBox = targetViewBox.split(" ").map(Number);

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);

    const intermediateViewBox = initialViewBox.map((start, index) => {
      const end = newViewBox[index];
      return start + (end - start) * progress; // Linear interpolation
    });

    svgElement.attr("viewBox", intermediateViewBox.join(" "));

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function resetZooming(event) {
  event.stopPropagation();
  resetStyles(event);
  $countryCards.removeClass("country-cards-active");
  $zoomOutBtn.removeClass("zoomOutBtnMapActive");
  $countryClasses.removeClass("active").removeClass("Inactive");
  $pinClasses.addClass("pinOpacityInactive");
  resetViewBox(event);
}
