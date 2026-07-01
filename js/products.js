/**
 * Deutsche Supermarkt-Produkte (REWE, EDEKA, Lidl, Aldi, Penny, Netto …)
 *
 * BILDER EINFÜGEN:
 * 1. Foto als 300×300 px in images/ speichern (siehe images/BILDER-LISTE.md)
 * 2. Unten bei "image" den Dateinamen anpassen, z.B. "images/oatly-barista.png"
 */
const PRODUCTS = [
  {
    brand: "Rügenwalder",
    product: "Vegetarische Bratwurst",
    image: "images/ruegenwalder-bratwurst.svg",
    aliases: {
      brand: ["ruegenwalder", "rügenwalder", "ruegenwalder muehle", "rügenwalder mühle"],
      product: ["bratwurst", "vegetarische bratwurst", "vegane bratwurst", "mühlen bratwurst"]
    }
  },
  {
    brand: "Rügenwalder",
    product: "Mühlen Frikadellen",
    image: "images/ruegenwalder-frikadellen.svg",
    aliases: {
      brand: ["ruegenwalder", "rügenwalder", "rügenwalder mühle"],
      product: ["frikadellen", "mühlen frikadellen", "muehlen frikadellen", "veggie frikadellen"]
    }
  },
  {
    brand: "Billie Green",
    product: "Green Burger",
    image: "images/billie-green-burger.svg",
    aliases: {
      brand: ["billie green", "billiegreen"],
      product: ["green burger", "burger", "plant burger", "veganer burger"]
    }
  },
  {
    brand: "Oatly",
    product: "Haferdrink Barista Edition",
    image: "images/oatly-barista.svg",
    aliases: {
      brand: ["oatly"],
      product: ["barista", "haferdrink barista", "hafermilch barista", "barista edition"]
    }
  },
  {
    brand: "Alpro",
    product: "Haferdrink Original",
    image: "images/alpro-haferdrink.svg",
    aliases: {
      brand: ["alpro"],
      product: ["haferdrink", "haferdrink original", "hafermilch", "oat drink"]
    }
  },
  {
    brand: "Violife",
    product: "Original Scheiben",
    image: "images/violife-original.svg",
    aliases: {
      brand: ["violife"],
      product: ["original", "scheiben", "original scheiben", "veganer käse", "käse scheiben"]
    }
  },
  {
    brand: "Beyond Meat",
    product: "Beyond Burger",
    image: "images/beyond-burger.svg",
    aliases: {
      brand: ["beyond meat", "beyond"],
      product: ["beyond burger", "burger", "burger patty", "burger patties"]
    }
  },
  {
    brand: "Like Meat",
    product: "Like Chicken",
    image: "images/like-meat-chicken.svg",
    aliases: {
      brand: ["like meat", "likemeat"],
      product: ["like chicken", "chicken", "hähnchen", "veganes hähnchen", "chicken pieces"]
    }
  },
  {
    brand: "Garden Gourmet",
    product: "Sensational Burger",
    image: "images/garden-gourmet-burger.svg",
    aliases: {
      brand: ["garden gourmet", "garden gormet"],
      product: ["sensational burger", "sensational", "burger", "vegan burger"]
    }
  },
  {
    brand: "No Meat Factory",
    product: "Smash Burger",
    image: "images/no-meat-factory-burger.svg",
    aliases: {
      brand: ["no meat factory", "nomeat factory"],
      product: ["smash burger", "burger", "no meat burger", "vegan burger"]
    }
  },
  {
    brand: "Vemondo",
    product: "Vegane Burger Patties",
    image: "images/vemondo-burger.svg",
    aliases: {
      brand: ["vemondo"],
      product: ["burger patties", "burger", "vegan burger", "patties", "veggie burger"]
    }
  },
  {
    brand: "MyVay",
    product: "Vegane Chicken Nuggets",
    image: "images/myvay-nuggets.svg",
    aliases: {
      brand: ["myvay", "my vay"],
      product: ["nuggets", "chicken nuggets", "vegane nuggets", "hähnchen nuggets"]
    }
  },
  {
    brand: "Simply V",
    product: "Vegane Scheiben",
    image: "images/simply-v-scheiben.svg",
    aliases: {
      brand: ["simply v", "simplyv"],
      product: ["scheiben", "veganer käse", "käse scheiben", "veggie scheiben"]
    }
  },
  {
    brand: "The Vegetarian Butcher",
    product: "Sensational Hack",
    image: "images/vegetarian-butcher-hack.svg",
    aliases: {
      brand: ["the vegetarian butcher", "vegetarian butcher"],
      product: ["hack", "sensational hack", "pflanzenhack", "veganes hack"]
    }
  },
  {
    brand: "Planted",
    product: "Planted Chicken Natur",
    image: "images/planted-chicken.svg",
    aliases: {
      brand: ["planted"],
      product: ["planted chicken", "chicken natur", "chicken", "veganes chicken", "hähnchen"]
    }
  },
  {
    brand: "Next Level",
    product: "Next Level Burger",
    image: "images/next-level-burger.svg",
    aliases: {
      brand: ["next level", "nextlevel"],
      product: ["next level burger", "burger", "vegan burger"]
    }
  },
  {
    brand: "Tofutown",
    product: "Räuchertofu",
    image: "images/tofutown-raeuchertofu.svg",
    aliases: {
      brand: ["tofutown", "tofu town", "taifun"],
      product: ["räuchertofu", "raeuchertofu", "smoked tofu", "räucher tofu"]
    }
  },
  {
    brand: "Naturli",
    product: "Veggie Hack",
    image: "images/naturli-hack.svg",
    aliases: {
      brand: ["naturli"],
      product: ["veggie hack", "hack", "pflanzenhack", "veganes hack"]
    }
  },
  {
    brand: "Endori",
    product: "Green Heroes Gyros",
    image: "images/endori-gyros.svg",
    aliases: {
      brand: ["endori"],
      product: ["gyros", "green heroes", "green heroes gyros", "veganes gyros"]
    }
  },
  {
    brand: "Happy Cheeze",
    product: "Camembert Style",
    image: "images/happy-cheeze-camembert.svg",
    aliases: {
      brand: ["happy cheeze", "happy cheese"],
      product: ["camembert", "camembert style", "veganer camembert", "käse camembert"]
    }
  }
];
