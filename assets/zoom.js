function zoomBukti(element) {
  const lightbox = document.getElementById("buktiLightbox");
  const zoomedFrame = document.getElementById("zoomedFrame");
  zoomedFrame.innerHTML = element.closest(".jp-wd-frame").outerHTML;
  lightbox.classList.add("active");
}

function closeZoom() {
  const lightbox = document.getElementById("buktiLightbox");
  lightbox.classList.remove("active");
}


  const ard = document.querySelector('.ard-sosmed');
  const attention_whore = document.querySelector('.attention.whore');

  function ardFunction() {
    ard.classList.toggle("open");
    attention_whore.classList.remove("whore");
  }