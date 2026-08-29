(() => {
  /*
    Add photographs here when they are ready. Put each file in assets/photos,
    then copy this shape into the array:

    {
      src: "assets/photos/cape-spear.jpg",
      alt: "Waves below the Cape Spear cliffs at sunrise",
      trip: "Cape Spear · 2026",
      orientation: "landscape",
      width: 1682,
      height: 1262
    }

    Use orientation: "portrait" for a taller frame. Trip names automatically
    become filter buttons; no HTML changes are needed.
  */
  const photos = [
    {
      src: "assets/photos/newfoundland/harbour-lights.jpg",
      alt: "A harbour and hillside town glowing with lights beneath a blue evening sky",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/coastal-headland.jpg",
      alt: "A grassy trail overlooking a rugged Newfoundland headland and the Atlantic Ocean",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/morning-on-the-water.jpg",
      alt: "The bow of a blue kayak on calm water beneath an orange dawn sky",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 2549,
      height: 1239
    },
    {
      src: "assets/photos/newfoundland/outport-coast.jpg",
      alt: "Small homes lining a rocky Newfoundland cove beneath an overcast sky",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/last-light.jpg",
      alt: "Soft evening light breaking through clouds over a green coastal field",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/fog-on-the-water.jpg",
      alt: "A small waterside community fading into pale morning fog",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/red-house-by-the-sea.jpg",
      alt: "A red and white coastal house beneath a low bank of fog",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/winter-harbour-night.jpg",
      alt: "Fishing boats resting along a snowy harbour above fractured sea ice at night",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 2400,
      height: 1800
    },
    {
      src: "assets/photos/newfoundland/winter-cove.jpg",
      alt: "A snowy cove with small homes gathered beneath a wooded hillside",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/snowed-in-shoreline.jpg",
      alt: "Deep snow outside a window overlooking a cold blue shoreline",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/hillside-town.jpg",
      alt: "Colourful homes and a green church spread across a snowy coastal hillside",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/sunset-cast.jpg",
      alt: "A fishing rod pointing across calm water toward the setting sun",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/mountain-golf-course.png",
      alt: "A mountain valley and golf course beneath dramatic clouds",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/blueberries-by-the-coast.png",
      alt: "A container of blueberries held above coastal grass with the ocean beyond",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/sunny-shoreline.png",
      alt: "Sunlight sparkling across a broad bay beside a sandy shoreline",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/golf-course-by-the-bay.png",
      alt: "A golf course descending toward a bay beneath layered clouds",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/into-the-fog.png",
      alt: "A rocky mountain stream disappearing into a foggy valley",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/misty-outport.png",
      alt: "A coastal Newfoundland community beneath a misty mountain",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/weathered-field.png",
      alt: "A weathered shed in a meadow above a foggy coastal town",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/the-trail.png",
      alt: "Hikers following a grassy trail through a foggy coastal landscape",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/fogbound-coast.png",
      alt: "A foggy rocky shoreline framed by spruce trees",
      trip: "Newfoundland",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/europe/IMG_3695.jpg",
      alt: "An ornate palace entrance beyond black iron gates beneath a bright blue sky",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3702.jpg",
      alt: "A grand circular concert hall beneath towering summer clouds",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3712.jpg",
      alt: "String lights glowing above a quiet brick courtyard and picnic tables",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3725.jpg",
      alt: "The Palace of Westminster and Elizabeth Tower seen across the River Thames",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3738.jpg",
      alt: "The London skyline rising beyond boats on a grey river",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3741.jpg",
      alt: "A raven perched above a green lawn with a stone bridge beyond",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3752.jpg",
      alt: "The pale stone walls and towers of a historic riverside fortress",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3754.jpg",
      alt: "A row of Tudor-style houses facing a carefully striped green lawn",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3761.jpg",
      alt: "A castle rising above a sunlit garden and circular pond",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3777.jpg",
      alt: "A broad river and bridge viewed from a misty hillside above the city",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3787.jpg",
      alt: "A European city spread beneath a pale sky from a high garden terrace",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3792.jpg",
      alt: "People moving between stalls inside a soaring iron-and-glass market hall",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3799.jpg",
      alt: "An elaborate riverside parliament building beneath dramatic grey clouds",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3806.jpg",
      alt: "A marble staircase beneath chandeliers and an ornate painted ceiling",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3824.jpg",
      alt: "Church spires and historic buildings framing a broad cobbled square",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3830.jpg",
      alt: "Red rooftops and church towers stretching across a European city",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3838.jpg",
      alt: "A gilded interior crowned by a patterned glass dome",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3860.jpg",
      alt: "A colourful tiled church roof glowing in the late afternoon sun",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3878.jpg",
      alt: "A vast underground chamber carved from dark stone and lit by chandeliers",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3902.jpg",
      alt: "Wooden stairs descending through a warm-lit underground cavern",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3906.jpg",
      alt: "A historic market square illuminated against the night sky",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3918.jpg",
      alt: "A long quiet road leading past a wooden watchtower beneath a clear sky",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3928.jpg",
      alt: "A contemporary city plaza framed by geometric high-rise buildings",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3932.jpg",
      alt: "An old courtyard and twisting tree washed in deep red light",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3982.jpg",
      alt: "A narrow stone lane winding between weathered walls and climbing plants",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4004.jpg",
      alt: "A traveller standing at a stone overlook with layered mountains behind him",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4025.jpg",
      alt: "A river winding through a mountain valley beneath the setting sun",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4069.jpg",
      alt: "Stone fortress walls reflected in dark water at night",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4075.jpg",
      alt: "A rain-washed old town street glowing with warm café lights",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4080.jpg",
      alt: "Terracotta rooftops gathered around a blue bay ringed by mountains",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4111.jpg",
      alt: "Sunlit hills and terracotta roofs framed by weathered city walls",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4134.jpg",
      alt: "A dark rainstorm approaching a coastal city of terracotta rooftops",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4177.jpg",
      alt: "An ancient carved winged guardian displayed in a museum gallery",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0021.jpg",
      alt: "Bicycles suspended overhead in a blue and violet illuminated installation",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_0264.JPG",
      alt: "The Montreal Olympic Stadium tower rising above a sunny garden",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0281.JPG",
      alt: "A pale pink rose opening among deep green leaves",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0353.JPG",
      alt: "Giant lily pads floating in a formal garden pond",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0447.JPG",
      alt: "A crowded Montreal nightspot glowing under deep red neon light",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_0459.JPG",
      alt: "The illuminated altar and vaulted interior of Notre-Dame Basilica",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0491.JPG",
      alt: "A curious raccoon peering up from beside a stone path",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_1609.jpg",
      alt: "Saint Joseph's Oratory standing above its gardens beneath a textured blue sky",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_1656.jpg",
      alt: "A busy outdoor festival beneath dramatic gold and grey evening clouds",
      trip: "Montreal",
      orientation: "landscape"
    }
  ];

  const tripsContainer = document.querySelector("[data-photo-trips]");
  const lightbox = document.querySelector("[data-photo-lightbox]");
  const lightboxImage = lightbox?.querySelector("[data-photo-lightbox-image]");
  const lightboxCount = lightbox?.querySelector("[data-photo-lightbox-count]");
  const lightboxViewport = lightbox?.querySelector("[data-photo-lightbox-viewport]");
  const previousButton = lightbox?.querySelector("[data-photo-previous]");
  const nextButton = lightbox?.querySelector("[data-photo-next]");
  const zoomButton = lightbox?.querySelector("[data-photo-zoom]");
  const closeButton = lightbox?.querySelector("[data-photo-close]");
  let activePhotoIndex = 0;
  let lastPhotoButton = null;

  if (!tripsContainer) return;

  function makePhotoCard(photo, photoIndex) {
    const figure = document.createElement("figure");
    figure.className = "photo-card";

    const button = document.createElement("button");
    button.className = "photo-card__button";
    button.type = "button";
    button.setAttribute("aria-label", `Open photo: ${photo.alt}`);

    const image = document.createElement("img");
    image.className = "photo-card__image";
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width || 1682;
    image.height = photo.height || 1262;
    image.loading = "lazy";
    image.decoding = "async";

    button.append(image);
    button.addEventListener("click", () => openLightbox(photoIndex, button));
    figure.append(button);
    return figure;
  }

  function makeTripSection(trip) {
    const section = document.createElement("section");
    section.className = "photo-trip";
    section.dataset.trip = trip;

    const heading = document.createElement("h2");
    heading.className = "photo-trip__title";
    heading.textContent = trip;

    const grid = document.createElement("div");
    grid.className = "photo-grid";
    grid.append(...photos.map((photo, index) => ({ photo, index }))
      .filter(({ photo }) => photo.trip === trip)
      .map(({ photo, index }) => makePhotoCard(photo, index)));

    section.append(heading, grid);
    return section;
  }

  const tripOrder = ["Newfoundland", "Europe", "Montreal"];
  tripsContainer.append(...tripOrder.map(makeTripSection));

  function setZoomed(zoomed) {
    if (!lightbox || !zoomButton || !lightboxViewport) return;
    lightbox.classList.toggle("is-zoomed", zoomed);
    zoomButton.textContent = zoomed ? "Fit photo" : "Zoom in";
    zoomButton.setAttribute("aria-label", zoomed ? "Fit photo to screen" : "View photo at full size");

    requestAnimationFrame(() => {
      lightboxViewport.scrollTo({
        top: zoomed ? (lightboxViewport.scrollHeight - lightboxViewport.clientHeight) / 2 : 0,
        left: zoomed ? (lightboxViewport.scrollWidth - lightboxViewport.clientWidth) / 2 : 0
      });
    });
  }

  function showPhoto(photoIndex) {
    if (!lightboxImage || !lightboxCount) return;
    activePhotoIndex = (photoIndex + photos.length) % photos.length;
    const photo = photos[activePhotoIndex];

    setZoomed(false);
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt;
    lightboxCount.textContent = `${activePhotoIndex + 1} / ${photos.length}`;
  }

  function openLightbox(photoIndex, opener) {
    if (!lightbox) return;
    lastPhotoButton = opener;
    showPhoto(photoIndex);
    document.body.classList.add("has-photo-lightbox");

    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }

    closeButton?.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
      document.body.classList.remove("has-photo-lightbox");
      lastPhotoButton?.focus();
    }
  }

  previousButton?.addEventListener("click", () => showPhoto(activePhotoIndex - 1));
  nextButton?.addEventListener("click", () => showPhoto(activePhotoIndex + 1));
  closeButton?.addEventListener("click", closeLightbox);
  zoomButton?.addEventListener("click", () => setZoomed(!lightbox?.classList.contains("is-zoomed")));
  lightboxImage?.addEventListener("click", () => setZoomed(!lightbox?.classList.contains("is-zoomed")));

  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox?.addEventListener("close", () => {
    document.body.classList.remove("has-photo-lightbox");
    setZoomed(false);
    lastPhotoButton?.focus();
  });

  lightbox?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPhoto(activePhotoIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showPhoto(activePhotoIndex + 1);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      setZoomed(true);
    } else if (event.key === "-") {
      event.preventDefault();
      setZoomed(false);
    }
  });
})();
