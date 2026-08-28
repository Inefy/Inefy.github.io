(() => {
  /*
    Add photographs here when they are ready. Put each file in assets/photos,
    then copy this shape into the array:

    {
      src: "assets/photos/cape-spear.jpg",
      alt: "Waves below the Cape Spear cliffs at sunrise",
      title: "First light",
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
      title: "Harbour lights",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/coastal-headland.jpg",
      alt: "A grassy trail overlooking a rugged Newfoundland headland and the Atlantic Ocean",
      title: "Coastal headland",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/morning-on-the-water.jpg",
      alt: "The bow of a blue kayak on calm water beneath an orange dawn sky",
      title: "Morning on the water",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 2549,
      height: 1239
    },
    {
      src: "assets/photos/newfoundland/outport-coast.jpg",
      alt: "Small homes lining a rocky Newfoundland cove beneath an overcast sky",
      title: "Outport coast",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/last-light.jpg",
      alt: "Soft evening light breaking through clouds over a green coastal field",
      title: "Last light",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/fog-on-the-water.jpg",
      alt: "A small waterside community fading into pale morning fog",
      title: "Fog on the water",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/red-house-by-the-sea.jpg",
      alt: "A red and white coastal house beneath a low bank of fog",
      title: "By the sea",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/winter-harbour-night.jpg",
      alt: "Fishing boats resting along a snowy harbour above fractured sea ice at night",
      title: "Winter harbour",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 2400,
      height: 1800
    },
    {
      src: "assets/photos/newfoundland/winter-cove.jpg",
      alt: "A snowy cove with small homes gathered beneath a wooded hillside",
      title: "Winter cove",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/snowed-in-shoreline.jpg",
      alt: "Deep snow outside a window overlooking a cold blue shoreline",
      title: "Snowed in",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/hillside-town.jpg",
      alt: "Colourful homes and a green church spread across a snowy coastal hillside",
      title: "Hillside town",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/newfoundland/sunset-cast.jpg",
      alt: "A fishing rod pointing across calm water toward the setting sun",
      title: "Sunset cast",
      trip: "Newfoundland",
      orientation: "landscape",
      width: 1682,
      height: 1262
    },
    {
      src: "assets/photos/europe/IMG_3695.jpg",
      alt: "An ornate palace entrance beyond black iron gates beneath a bright blue sky",
      title: "Beyond the gates",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3702.jpg",
      alt: "A grand circular concert hall beneath towering summer clouds",
      title: "Summer overture",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3712.jpg",
      alt: "String lights glowing above a quiet brick courtyard and picnic tables",
      title: "Courtyard lights",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3725.jpg",
      alt: "The Palace of Westminster and Elizabeth Tower seen across the River Thames",
      title: "Across the Thames",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3738.jpg",
      alt: "The London skyline rising beyond boats on a grey river",
      title: "River skyline",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3741.jpg",
      alt: "A raven perched above a green lawn with a stone bridge beyond",
      title: "The raven",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3752.jpg",
      alt: "The pale stone walls and towers of a historic riverside fortress",
      title: "Old stone towers",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3754.jpg",
      alt: "A row of Tudor-style houses facing a carefully striped green lawn",
      title: "The green",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3761.jpg",
      alt: "A castle rising above a sunlit garden and circular pond",
      title: "Castle garden",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3777.jpg",
      alt: "A broad river and bridge viewed from a misty hillside above the city",
      title: "Above the river",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3787.jpg",
      alt: "A European city spread beneath a pale sky from a high garden terrace",
      title: "City overlook",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3792.jpg",
      alt: "People moving between stalls inside a soaring iron-and-glass market hall",
      title: "Market hall",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3799.jpg",
      alt: "An elaborate riverside parliament building beneath dramatic grey clouds",
      title: "Parliament square",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3806.jpg",
      alt: "A marble staircase beneath chandeliers and an ornate painted ceiling",
      title: "Grand staircase",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3824.jpg",
      alt: "Church spires and historic buildings framing a broad cobbled square",
      title: "Old Town square",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3830.jpg",
      alt: "Red rooftops and church towers stretching across a European city",
      title: "Rooftops",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3838.jpg",
      alt: "A gilded interior crowned by a patterned glass dome",
      title: "Under the dome",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3860.jpg",
      alt: "A colourful tiled church roof glowing in the late afternoon sun",
      title: "Tiled roof",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3878.jpg",
      alt: "A vast underground chamber carved from dark stone and lit by chandeliers",
      title: "Below ground",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3902.jpg",
      alt: "Wooden stairs descending through a warm-lit underground cavern",
      title: "The descent",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3906.jpg",
      alt: "A historic market square illuminated against the night sky",
      title: "After dark",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3918.jpg",
      alt: "A long quiet road leading past a wooden watchtower beneath a clear sky",
      title: "The long road",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3928.jpg",
      alt: "A contemporary city plaza framed by geometric high-rise buildings",
      title: "New city lines",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3932.jpg",
      alt: "An old courtyard and twisting tree washed in deep red light",
      title: "Red courtyard",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_3982.jpg",
      alt: "A narrow stone lane winding between weathered walls and climbing plants",
      title: "Stone lane",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4004.jpg",
      alt: "A traveller standing at a stone overlook with layered mountains behind him",
      title: "Mountain overlook",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4025.jpg",
      alt: "A river winding through a mountain valley beneath the setting sun",
      title: "River valley",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4069.jpg",
      alt: "Stone fortress walls reflected in dark water at night",
      title: "Fortress at night",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4075.jpg",
      alt: "A rain-washed old town street glowing with warm café lights",
      title: "Evening rain",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4080.jpg",
      alt: "Terracotta rooftops gathered around a blue bay ringed by mountains",
      title: "The bay",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4111.jpg",
      alt: "Sunlit hills and terracotta roofs framed by weathered city walls",
      title: "Along the walls",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4134.jpg",
      alt: "A dark rainstorm approaching a coastal city of terracotta rooftops",
      title: "Storm over the city",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/europe/IMG_4177.jpg",
      alt: "An ancient carved winged guardian displayed in a museum gallery",
      title: "Winged guardian",
      trip: "Europe",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0021.jpg",
      alt: "Bicycles suspended overhead in a blue and violet illuminated installation",
      title: "Blue wheels",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_0264.JPG",
      alt: "The Montreal Olympic Stadium tower rising above a sunny garden",
      title: "Olympic lines",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0281.JPG",
      alt: "A pale pink rose opening among deep green leaves",
      title: "Garden rose",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0353.JPG",
      alt: "Giant lily pads floating in a formal garden pond",
      title: "Lily pond",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0447.JPG",
      alt: "A crowded Montreal nightspot glowing under deep red neon light",
      title: "Neon night",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_0459.JPG",
      alt: "The illuminated altar and vaulted interior of Notre-Dame Basilica",
      title: "Basilica glow",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_0491.JPG",
      alt: "A curious raccoon peering up from beside a stone path",
      title: "Curious visitor",
      trip: "Montreal",
      orientation: "portrait",
      width: 947,
      height: 1262
    },
    {
      src: "assets/photos/montreal/IMG_1609.jpg",
      alt: "Saint Joseph's Oratory standing above its gardens beneath a textured blue sky",
      title: "The Oratory",
      trip: "Montreal",
      orientation: "landscape"
    },
    {
      src: "assets/photos/montreal/IMG_1656.jpg",
      alt: "A busy outdoor festival beneath dramatic gold and grey evening clouds",
      title: "Festival sunset",
      trip: "Montreal",
      orientation: "landscape"
    }
  ];

  const tripsContainer = document.querySelector("[data-photo-trips]");

  if (!tripsContainer) return;

  function makePhotoCard(photo) {
    const figure = document.createElement("figure");
    figure.className = "photo-card";

    const image = document.createElement("img");
    image.className = "photo-card__image";
    image.src = photo.src;
    image.alt = photo.alt;
    image.width = photo.width || 1682;
    image.height = photo.height || 1262;
    image.loading = "lazy";
    image.decoding = "async";

    figure.append(image);
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
    grid.append(...photos.filter((photo) => photo.trip === trip).map(makePhotoCard));

    section.append(heading, grid);
    return section;
  }

  const tripOrder = ["Newfoundland", "Europe", "Montreal"];
  tripsContainer.append(...tripOrder.map(makeTripSection));
})();
