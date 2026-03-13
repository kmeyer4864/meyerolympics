export interface GeodleCountry {
  id: string
  name: string
  // 6 hints from hardest to easiest
  hints: [string, string, string, string, string, string]
}

export const countries: GeodleCountry[] = [
  {
    id: 'japan',
    name: 'Japan',
    hints: [
      "This country's trains are so punctual that delays of more than one minute require an official apology slip.",
      "This island nation sits at the meeting point of four tectonic plates in the Pacific Ring of Fire.",
      "With over 125 million people, this country has one of the world's oldest populations with 28% over age 65.",
      "Home to Mount Fuji, this country has over 100 active volcanoes and experiences about 1,500 earthquakes yearly.",
      "The capital of this country is the most populous metropolitan area in the world.",
      "This country's flag features a red circle on a white background, symbolizing the sun."
    ]
  },
  {
    id: 'brazil',
    name: 'Brazil',
    hints: [
      "This country has a law requiring voting for all literate citizens between 18 and 70 years old.",
      "This nation spans three time zones and shares borders with every South American country except two.",
      "Home to the largest rainforest on Earth, covering about 60% of its territory.",
      "This country has won the FIFA World Cup more times than any other nation.",
      "The capital was purpose-built in the 1960s and is shaped like an airplane when viewed from above.",
      "This is the only country in South America where Portuguese is the official language."
    ]
  },
  {
    id: 'egypt',
    name: 'Egypt',
    hints: [
      "This country's ancient writing system wasn't deciphered until the Rosetta Stone was found in 1799.",
      "Located where Africa meets Asia, this nation controls a crucial man-made waterway connecting two seas.",
      "97% of this country's population lives on just 4% of its land, along a famous river.",
      "This country is home to one of the Seven Wonders of the Ancient World that still stands today.",
      "The capital is the largest city in Africa and the Arab world.",
      "This country's flag features an eagle and the colors red, white, and black."
    ]
  },
  {
    id: 'australia',
    name: 'Australia',
    hints: [
      "This country lost a war against emus in 1932 - the birds won.",
      "This nation is both a country and a continent, with unique wildlife found nowhere else.",
      "80% of the animals here are found nowhere else on Earth, including the platypus and echidna.",
      "Home to the world's largest coral reef system, visible from space.",
      "The capital is neither Sydney nor Melbourne, but a planned city built between them.",
      "This country appears on its own continent, surrounded by the Pacific and Indian Oceans."
    ]
  },
  {
    id: 'france',
    name: 'France',
    hints: [
      "This country has a law making it illegal to name a pig Napoleon.",
      "This hexagon-shaped nation has coastlines on both the Atlantic Ocean and Mediterranean Sea.",
      "The most visited country in the world, welcoming over 89 million tourists annually.",
      "Home to the most visited museum in the world and a famous iron lattice tower.",
      "This country's capital is divided by a river with two islands at its heart.",
      "This country's flag features three vertical stripes: blue, white, and red."
    ]
  },
  {
    id: 'india',
    name: 'India',
    hints: [
      "This country has a postal service that delivers mail by boat to a floating post office on a lake.",
      "This nation is home to the largest democracy in the world with over 900 million eligible voters.",
      "22 official languages are recognized here, though hundreds more are spoken.",
      "Home to both the Himalayas and tropical beaches, this country has extreme geographic diversity.",
      "The Taj Mahal, one of the New Seven Wonders, is located here.",
      "This country's flag features a 24-spoke wheel (Ashoka Chakra) on a tricolor of saffron, white, and green."
    ]
  },
  {
    id: 'canada',
    name: 'Canada',
    hints: [
      "This country has more lakes than the rest of the world combined.",
      "The second-largest country by area, yet only about 38 million people live here.",
      "This nation shares the world's longest undefended border with its southern neighbor.",
      "Famous for maple syrup, this country produces 71% of the world's supply.",
      "The capital shares its name with a famous indigenous word meaning 'to trade'.",
      "This country's flag features a distinctive red maple leaf on a white background."
    ]
  },
  {
    id: 'italy',
    name: 'Italy',
    hints: [
      "This country has more UNESCO World Heritage Sites than any other nation.",
      "Shaped like a boot, this peninsula extends into the Mediterranean Sea.",
      "Home to an ancient empire that once controlled most of Europe, North Africa, and the Middle East.",
      "Vatican City, the world's smallest country, is entirely surrounded by this nation.",
      "The capital was built on seven hills and features the Colosseum.",
      "This country's flag features three vertical stripes: green, white, and red."
    ]
  },
  {
    id: 'mexico',
    name: 'Mexico',
    hints: [
      "This country introduced chocolate, chilies, and corn to the rest of the world.",
      "Ancient pyramids here rival those of Egypt, built by Aztec and Mayan civilizations.",
      "This nation shares its northern border with the United States across nearly 2,000 miles.",
      "The Day of the Dead is a famous holiday celebrated here each November.",
      "The capital was built on the ruins of the ancient Aztec city of Tenochtitlan.",
      "This country's flag features green, white, and red stripes with an eagle eating a snake."
    ]
  },
  {
    id: 'germany',
    name: 'Germany',
    hints: [
      "This country has over 1,500 types of sausages and 5,000 varieties of beer.",
      "Located in Central Europe, this nation shares borders with nine countries.",
      "The world's first printed book was created here using movable type in the 1450s.",
      "The Berlin Wall divided this country's capital for nearly 30 years.",
      "Famous for its autobahn highways with sections having no speed limit.",
      "This country's flag features three horizontal stripes: black, red, and gold."
    ]
  },
  {
    id: 'china',
    name: 'China',
    hints: [
      "This country invented paper, gunpowder, the compass, and printing.",
      "Home to the world's largest population until recently surpassed by India.",
      "The only man-made structure here visible from low Earth orbit spans over 13,000 miles.",
      "Giant pandas are found naturally only in the bamboo forests of this country.",
      "The capital hosted both the Summer and Winter Olympics.",
      "This country's flag features a large yellow star with four smaller stars on a red background."
    ]
  },
  {
    id: 'uk',
    name: 'United Kingdom',
    hints: [
      "The London Underground here was the world's first underground railway, opening in 1863.",
      "This island nation once ruled an empire covering a quarter of the world's land.",
      "Tea time is a cultural institution, with residents drinking over 100 million cups daily.",
      "Home to the world's oldest continuous parliamentary democracy.",
      "Big Ben, Tower Bridge, and Buckingham Palace are all located in the capital.",
      "This country's flag combines three crosses: St. George, St. Andrew, and St. Patrick."
    ]
  },
  {
    id: 'russia',
    name: 'Russia',
    hints: [
      "This country spans 11 time zones, more than any other nation.",
      "The largest country in the world by area, spanning two continents.",
      "Lake Baikal here contains 20% of the world's unfrozen fresh water.",
      "The Trans-Siberian Railway connects Moscow to Vladivostok across 5,772 miles.",
      "The capital is known for Red Square and colorful onion-domed churches.",
      "This country's flag features three horizontal stripes: white, blue, and red."
    ]
  },
  {
    id: 'south-korea',
    name: 'South Korea',
    hints: [
      "This country has the fastest average internet speed in the world.",
      "Located on a peninsula, this nation technically remains at war with its northern neighbor.",
      "K-pop and Korean dramas from here have become a global cultural phenomenon.",
      "Samsung, Hyundai, and LG are all companies from this country.",
      "The capital is home to over 25 million people in its metropolitan area.",
      "This country's flag features a red and blue yin-yang symbol with four trigrams."
    ]
  },
  {
    id: 'spain',
    name: 'Spain',
    hints: [
      "This country takes a daily nap called 'siesta' so seriously that shops close for it.",
      "Located on the Iberian Peninsula, this nation has coasts on both the Atlantic and Mediterranean.",
      "The running of the bulls in Pamplona is a famous tradition here.",
      "Home to famous artists like Picasso, Dalí, and Gaudí.",
      "The capital is located almost exactly in the geographic center of the country.",
      "This country's flag features red and yellow horizontal stripes with a coat of arms."
    ]
  },
  {
    id: 'greece',
    name: 'Greece',
    hints: [
      "The Olympic Games originated in this country in 776 BC.",
      "This nation consists of a mainland and about 6,000 islands, of which 227 are inhabited.",
      "Democracy, philosophy, and Western theater all originated here.",
      "The Parthenon, a temple to Athena, still stands atop a hill in the capital.",
      "This country's capital is one of the oldest cities in the world, continuously inhabited for 3,400 years.",
      "This country's flag features blue and white horizontal stripes with a cross."
    ]
  },
  {
    id: 'thailand',
    name: 'Thailand',
    hints: [
      "This is the only Southeast Asian country that was never colonized by Europeans.",
      "Known as the 'Land of Smiles,' this country is famous for its hospitality.",
      "The official calendar here is based on Buddha's birth, making the year about 543 years ahead.",
      "Famous for ornate temples, street food, and tropical beaches.",
      "The capital's full ceremonial name is 168 letters long, the longest city name in the world.",
      "This country's flag features five horizontal stripes: red, white, blue, white, and red."
    ]
  },
  {
    id: 'argentina',
    name: 'Argentina',
    hints: [
      "The tango dance originated in the working-class neighborhoods of this country's capital.",
      "This nation stretches from subtropical regions to sub-Antarctic climates.",
      "Home to both the highest and lowest points in South America.",
      "The southernmost city in the world, Ushuaia, is located here.",
      "The capital was once called the 'Paris of South America' for its European architecture.",
      "This country's flag features light blue and white stripes with a golden sun."
    ]
  },
  {
    id: 'norway',
    name: 'Norway',
    hints: [
      "This country has more fjords than any other nation in the world.",
      "Located in Scandinavia, much of this country lies within the Arctic Circle.",
      "The Northern Lights (Aurora Borealis) are frequently visible here.",
      "This nation has the highest Human Development Index in the world.",
      "The capital is home to the Nobel Peace Prize ceremony.",
      "This country's flag features a blue cross with white borders on a red background."
    ]
  },
  {
    id: 'kenya',
    name: 'Kenya',
    hints: [
      "This country produces some of the world's fastest marathon runners.",
      "The Great Rift Valley, a massive geological feature, runs through this nation.",
      "Home to the Maasai Mara, famous for the annual wildebeest migration.",
      "Mount Kenya, Africa's second-highest peak, is located here.",
      "The capital sits at an altitude of over 5,500 feet above sea level.",
      "This country's flag features black, red, and green stripes with a Maasai shield."
    ]
  },
  {
    id: 'iceland',
    name: 'Iceland',
    hints: [
      "This country has no army, navy, or air force.",
      "Despite its name, this island nation has a surprisingly mild climate due to the Gulf Stream.",
      "Home to more than 130 volcanoes, with about 30 being active.",
      "The world's oldest parliament, the Althing, was established here in 930 AD.",
      "The capital is the northernmost capital of a sovereign state in the world.",
      "This country's flag features a red cross with white borders on a blue background."
    ]
  },
  {
    id: 'new-zealand',
    name: 'New Zealand',
    hints: [
      "This country was the first to give women the right to vote in 1893.",
      "Located in the southwestern Pacific Ocean, this nation consists of two main islands.",
      "The Maori people are the indigenous Polynesian population here.",
      "The Lord of the Rings films were entirely shot in this country.",
      "The capital is one of the southernmost capitals in the world.",
      "This country's flag features the Southern Cross constellation on a blue background."
    ]
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    hints: [
      "This country has three capital cities for different branches of government.",
      "Located at the southern tip of Africa, where the Atlantic and Indian Oceans meet.",
      "Nelson Mandela was imprisoned here for 27 years before becoming president.",
      "Home to the Big Five: lion, leopard, rhinoceros, elephant, and Cape buffalo.",
      "Table Mountain overlooks one of its most famous cities.",
      "This country's flag features six colors: black, yellow, green, white, red, and blue."
    ]
  },
  {
    id: 'vietnam',
    name: 'Vietnam',
    hints: [
      "This country is the world's second-largest coffee exporter after Brazil.",
      "Shaped like an 'S', this nation stretches along the eastern coast of the Indochinese Peninsula.",
      "The country was divided into North and South from 1954 to 1976.",
      "Ha Long Bay here features over 1,600 limestone islands and islets.",
      "The capital is located in the northern part of the country.",
      "This country's flag features a large yellow star on a red background."
    ]
  },
  {
    id: 'peru',
    name: 'Peru',
    hints: [
      "The potato was first domesticated here about 8,000 years ago.",
      "This South American nation has coastline on the Pacific Ocean and shares the Andes mountains.",
      "Home to more than half of the world's alpaca population.",
      "Machu Picchu, the ancient Incan citadel, is located high in the mountains here.",
      "The capital is one of the driest capital cities in the world, located on the coast.",
      "This country's flag features red and white vertical stripes with a coat of arms."
    ]
  }
]

export function getCountryById(id: string): GeodleCountry | undefined {
  return countries.find(c => c.id === id)
}

export function getRandomCountry(exclude: string[] = []): GeodleCountry {
  const available = countries.filter(c => !exclude.includes(c.id))
  if (available.length === 0) {
    // If all excluded, just pick randomly from all
    return countries[Math.floor(Math.random() * countries.length)]
  }
  return available[Math.floor(Math.random() * available.length)]
}

export function getAllCountryNames(): string[] {
  return countries.map(c => c.name)
}

export function getAllCountryIds(): string[] {
  return countries.map(c => c.id)
}
