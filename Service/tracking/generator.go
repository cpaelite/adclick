package tracking

import (
	"math/rand"
)

// randStatisKey 用来产生随机数据
func randStatisKey() AdStatisKey {
	k := AdStatisKey{}
	k.UserID = rand.Int()%10 + 1
	k.CampaignID = rand.Int()%300 + 1
	k.FlowID = rand.Int()%300 + 1
	k.LanderID = rand.Int()%300 + 1
	k.OfferID = rand.Int()%300 + 1
	k.TrafficSourceID = rand.Int()%300 + 1

	k.Language = randSelectString(languages)
	k.Model = randSelectString(models)
	k.Country = randSelectString(countries)
	k.City = randSelectString(cities)
	k.Region = randSelectString(regions)
	k.ISP = randSelectString(isps)
	k.MobileCarrier = randSelectString(mobileCarriers)
	k.Domain = randSelectString(domains)
	k.DeviceType = randSelectString(deviceTypes)
	k.Brand = randSelectString(brands)
	k.OS = randSelectString(oses)
	k.OSVersion = randSelectString(osversions)
	k.Browser = randSelectString(browsers)
	k.BrowserVersion = randSelectString(browserVersions)
	k.ConnectionType = randSelectString(connectionTypes)

	return k
}

func randSelectString(from []string) string {
	return from[rand.Int()%len(from)]
}

var languages = []string{"English", "French", "Portuguese", "Spanish/Castilian", "Arabic", "Unknown", "Turkish", "Chinese", "Korean", "Russian", "Indonesian", "Italian", "German", "Persian", "Swedish", "Hungarian", "Japanese", "Vietnamese", "Malay", "Dutch", "Polish", "Hebrew", "Croatian", "Norwegian", "Serbian", "Danish", "Ukrainian", "Urdu", "Thai", "Bengali", "FIL", "MD"}
var models = []string{
	"Sony Xperia SP LTE",
	"Asus Zenfone 6",
	"Sony Xperia T2 Ultra",
	"Asus Pegasus 3",
	"Amazon Fire HD 8",
	"Amazon Fire HD 7 (4th Gen)",
	"Alcatel Pop C3",
	"Alcatel Pixi First",
	"Sony Xperia Z3+",
	"Alcatel Pixi 3 (3.5)",
	"myPhone MY28S",
	"Alcatel One Touch POP 2",
	"Starmobile PLAY Click",
	"Alcatel One Touch Fierce",
	"Tecno L8 Plus",
	"ZTE Avid Trio",
	"Turkcell T50",
	"Acer Liquid Z205",
	"Alcatel ONE TOUCH POP 3 5.5",
	"ZTE BLADE V7 LITE",
	"ZTE Blade A1",
	"Alcatel Idol 4",
	"Alcatel Evolve 2",
	"Wiko Ridge 4G",
	"Xgody X200",
	"Motorola Moto E3 Power",
	"Motorola Droid Mini",
	"Micromax Canvas Hue",
	"Lenovo Vibe P1m",
	"Lenovo Vibe K5 Note",
	"Lenovo Vibe B",
	"Lenovo Sisley",
	"Lenovo P70-A",
	"Lenovo K1",
	"Lenovo IdeaTab A3000-H",
	"Lenovo A319",
	"OPPO A33f",
	"OPPO F1s",
	"OPPO Neo 7",
	"OPPO R7 Lite",
	"LeEco Le Pro 3",
	"OnePlus 3",
	"Lanix Illium",
	"LG Vista",
	"LG Risio",
	"LG Optimus Zone 3",
	"LG Optimus L5 II",
	"LG Magna LTE",
	"Reeder P10",
	"LG Leon 4G LTE",
	"LG L90 Dual D410",
	"LG L80",
	"Xiaomi Mi 4c",
	"HTC One mini",
	"HTC Desire Eye",
	"HTC Desire 728G dual sim",
	"ZTE Obsidian",
	"HTC Desire",
	"Samsung Galaxy Grand Prime Duos TV",
	"Gionee F103 Pro",
	"Generic Android 7.1",
	"Samsung Galaxy J5 (2016)",
	"General Mobile Discovery Elite",
	"General Mobile 5 Plus",
	"Fly Cirrus 2",
	"Evercoss Winner T",
	"EZcast Dongle",
	"Xiaomi Redmi 2A",
	"Samsung Galaxy Pocket 2 Duos",
	"Samsung Galaxy S Duos",
	"Bmobile AX650",
	"Samsung Galaxy S5 Duos",
	"BLU Touchbook G7",
	"BLU Studio C HD",
	"Samsung Galaxy SII Plus",
	"Samsung Galaxy Tab S2 8.0",
	"Samsung Galaxy Win Pro",
	"Samsung Galaxy Y Plus",
	"BLU Life One x",
	"Samsung Galaxy Young Duos",
	"AIS SUPER COMBO LAVA A1",
	"Asus T00F",
	"BLU Life 8 XL",
	"BLU Energy X 2",
	"Alcatel ONETOUCH POP Star",
	"BLU Dash X Plus",
	"HTC Desire 500",
	"Apple iPhone",
	"Amazon Fire HDX 8.9 (4th Gen)",
	"HTC 10",
	"HP Slatebook 14 PC",
	"Google Nexus S",
	"GoMobile GO984",
	"Alcatel One Touch Fierce XL",
	"Alcatel 5038A",
	"Gionee F103",
	"Advan S5M",
	"Azumi A50c Plus",
	"Generic Android 2.2",
	"Generic Android 2.0 Tablet",
	"Avvio 793",
	"Alcatel Evolve",
	"General Mobile 4G",
	"Alcatel 4060A",
	"Fly ERA Life 4",
	"Acer Liquid Jade Z",
	"Advan E3A",
	"Eton Y20",
	"Avvio 786",
	"Alcatel Pixi Pulsar",
	"Acer Liquid Z220",
	"Datawind Ubislate 7ci",
	"DOOGEE Discovery",
	"Alcatel Fierce 2",
	"Cubot P6",
	"Coolpad Mega",
	"Coolpad F1",
	"Coolpad 3300A",
	"Condor Plume P8",
	"Condor PGN517",
	"Cherry Mobile One",
	"Casper Via V5",
	"Avvio 765",
	"Bmobile AX620",
	"Avvio 750",
	"Bmobile AX535",
	"BQ Aquaris X5",
	"BLU VIVO AIR LTE",
	"Avvio 489",
	"Acer Iconia One 7",
	"BLU Studio C 5+5",
	"BLU Studio C",
	"BLU Studio 5.0K",
	"BLU STUDIO X PLUS",
	"Acer Liquid Zest",
	"Alcatel 4009A",
	"BLU Neo X",
	"Alcatel PIXI 4",
	"BLU NEO XL",
	"Alcatel One Touch X+",
	"Acer Liquid",
}

var countries = []string{
	"Canada",
	"United States",
	"Russian Federation",
	"Netherlands",
	"United Kingdom",
	"Sweden",
	"Finland",
	"Indonesia",
	"Italy",
	"Brazil",
	"Norway",
	"Poland",
	"Turkey",
	"Viet Nam",
	"Malaysia",
	"Australia",
	"China",
	"Mexico",
	"Germany",
	"Portugal",
	"India",
	"Switzerland",
	"Spain",
	"Saudi Arabia",
	"France",
}

var cities = []string{
	"Montréal",
	"Toronto",
	"Scarborough",
	"Calgary",
	"Edmonton",
	"Brampton",
	"Vancouver",
	"Mississauga",
	"Etobicoke",
	"Ottawa",
	"Laval",
	"Winnipeg",
	"North York",
	"Surrey",
	"Hamilton",
	"Québec",
	"London",
	"Kitchener",
	"Burnaby",
	"Gatineau",
	"Richmond Hill",
	"Windsor",
	"Saint-jérôme",
	"Saskatoon",
	"Markham",
	"Longueuil",
	"Unknown",
	"Trois-rivières",
	"Victoria",
	"Ajax",
	"Terrebonne",
	"Richmond",
	"Halifax",
	"Regina",
	"Verdun",
	"Pierrefonds",
	"Lasalle",
	"Guelph",
	"Port Coquitlam",
	"Barrie",
	"Woodbridge",
	"Coquitlam",
	"Abbotsford",
	"Repentigny",
	"Drummondville",
	"Sudbury",
	"St. John's",
	"Newmarket",
	"New Westminster",
	"Brandon",
	"Oakville",
	"Oshawa",
	"Moncton",
	"Red Deer",
	"Sherbrooke",
	"Saint-laurent",
	"Milton",
	"Kamloops",
	"Nepean",
	"Thunder Bay",
	"Lévis",
	"Stoney Creek",
	"Laurentides",
	"Nanaimo",
	"Saint John",
	"Langley",
	"Burlington",
	"Niagara Falls",
	"Saint-léonard",
	"Maple Ridge",
	"Courtice",
	"Chicoutimi",
	"Prince Albert",
	"Joliette",
	"Dartmouth",
	"Peterborough",
	"Vaudreuil-dorion",
	"Lethbridge",
	"Orillia",
	"Fort Mcmurray",
	"Blainville",
	"Kingston",
	"Fredericton",
	"Clifford",
	"Sorel",
	"Prince George",
	"Châteauguay",
	"Rimouski",
	"Maple",
	"Concord",
	"Belleville",
	"Grande Prairie",
	"Saint-hyacinthe",
	"Deux-montagnes",
	"Port Moody",
	"Kelowna",
	"Sarnia",
	"St Catharines",
	"Saint-jean-sur-richelieu",
	"Cambridge",
	"Saint-constant",
	"Ormstown",
	"Delta",
	"Dollard-des-ormeaux",
	"Moose Jaw",
	"Waterloo",
	"Chatham",
	"Lachine",
	"Salaberry-de-valleyfield",
	"North Vancouver",
	"Rawdon",
	"Saint-eustache",
	"Chilliwack",
	"Dorval",
	"Duncan",
	"White Rock",
	"Granby",
	"Beloeil",
	"Miramichi",
	"Brantford",
	"Pickering",
	"Brossard",
	"St Georges",
	"Welland",
	"Edmundston",
	"L'epiphanie",
	"Kirkland Lake",
	"Sherwood Park",
	"Shafford",
	"Val-d'or",
	"Boisbriand",
	"Dundas",
	"Chambly",
	"Mont-tremblant",
	"Sault Ste. Marie",
	"Medicine Hat",
	"Mascouche",
	"Wendake",
	"Jacksonville",
	"Rivière-du-loup",
	"Spruce Grove",
	"Lindsay",
	"Yorkton",
	"Cornwall",
	"Sioux Lookout",
	"Leduc",
	"Causapscal",
	"Lloydminster",
	"Charny",
	"Amsterdam",
	"Orleans",
	"Aurora",
	"Kanata",
	"Whitby",
	"Fort Saskatchewan",
	"Steinbach",
	"Jonquière",
	"Pointe-claire",
	"Keswick",
	"Candiac",
	"Saint-gilles",
	"Warman",
	"L'assomption",
	"La Prairie",
	"Alma",
	"Bolton",
	"Lavaltrie",
	"Winkler",
	"Baie-saint-paul",
	"Rouyn-noranda",
	"Campbell River",
	"Wainwright",
	"Pointe-aux-trembles",
	"Shawinigan",
	"La Tuque",
	"Lac La Biche",
	"Lac-Beauport",
	"Beaconsfield",
	"Saint-nicolas",
	"Fort Frances",
	"Orangeville",
	"Delburne",
	"Vernon",
	"Strathroy",
	"Carrot River",
	"Deep River",
	"Truro",
	"Saint-andré-avellin",
	"Watford",
	"Helsinki",
	"Windsor",
	"North Bay",
	"Campbellton",
	"Melfort",
	"Lower Sackville",
	"Saint-hubert",
	"Belcourt",
	"Whitchurch-stouffville",
	"Timmins",
	"Kaluga",
	"Comox",
	"Varennes",
	"Rosemère",
	"Baie-comeau",
	"Petawawa",
	"Ancaster",
	"Thompson",
	"Banff",
	"Rocky Mountain House",
	"Bridgewater",
	"Cranbrook",
	"Matane",
	"Bowmanville",
	"La Ronge",
	"Alliston",
	"Portage La Prairie",
	"Whistler",
	"Jakarta",
	"Okotoks",
	"Ft St John",
	"Dawson",
	"Quispamsis",
	"Hanoi",
	"Woodstock",
	"Hinton",
	"Inuvik",
	"Invermere",
	"Istanbul",
	"Collingwood",
	"Kenora",
	"Kingsville",
	"Victoriaville",
	"Charlottetown",
	"Lac-mégantic",
	"Sidney",
	"Shawinigan-sud",
	"Smiths Falls",
	"Stittsville",
	"Trenton",
	"Trail",
	"Sooke",
	"Thetford Mines",
	"Arnprior",
	"St-Georges-de-Champlain",
	"Nouvelle",
	"Oka",
	"Penticton",
	"Perth",
	"Stephenville Crossing",
	"Bruno",
	"Sunderland",
	"Summerside",
	"Riverview",
	"Princeton",
	"Stirling",
	"Raymond",
	"Eastman",
	"Montmagny",
	"Sorel-tracy",
	"Les Cèdres",
	"Cardigan",
	"Acton",
	"Sainte-adèle",
	"Boucherville",
	"Airdrie",
	"Mountain View",
	"Berwick",
	"Thornhill",
	"Powell River",
	"Waltham",
	"Aylesford",
	"Eel Ground",
	"New Dundee",
	"New Germany",
	"Baddeck",
	"The Pas",
	"King City",
	"Erickson",
	"Williams Lake",
	"Ste-anne-des-monts",
	"Stoneham",
	"Kentville",
	"Kensington",
	"Corner Brook",
	"Sydney",
	"Stratford",
	"Inverness",
	"Espanola",
	"Wetaskiwin",
	"Henryville",
	"Weyburn",
	"Courtenay",
	"Rougemont",
	"Yamachiche",
	"Sydney",
	"Alcomdale",
	"Cowansville",
	"Amos",
	"Grimsby",
	"Stratford",
	"Estevan",
	"Grand Manan",
	"Brownsburg-Chatham",
	"Port Howe",
	"Picton",
	"Amqui",
	"Piedmont",
	"Goderich",
	"Winfield",
	"Mayerthorpe",
	"Meadow Lake",
	"Meaford",
	"Camrose",
	"Maria",
	"Marathon",
	"Smithers",
	"Dominion City",
	"Pitt Meadows",
	"Mission",
	"Georgetown",
	"Tusket",
	"Salmon Arm",
	"Delson",
	"Mont-joli",
	"Mont-laurier",
	"Unionville",
	"Beamsville",
	"Shanghai",
	"Blackville",
	"Albuquerque",
	"Alder Flats",
	"Amherst",
	"Ashville",
	"Barraute",
	"Bathurst",
	"Beauharnois",
	"Bedford",
	"Beiseker",
	"Berlin",
	"Bonnyville",
	"Brockville",
	"Brooks",
	"Bécancour",
	"Caledon",
	"Caledon East",
	"Canmore",
	"Caronport",
	"Chelmsford",
	"Chesterville",
	"Clarenville",
	"Cobalt",
	"Creston",
	"Daveluyville",
	"Delhi",
	"Dosquet",
	"Fernie",
	"Fort Erie",
	"Gaspé",
	"Hanover",
	"Happy Valley-Goose Bay",
	"Havre-saint-pierre",
	"High River",
	"Hillsborough",
	"Kitimat",
	"Kuala Lumpur",
	"L'isletville",
	"La Baie",
	"Lacombe",
	"Lake Louise",
	"Langdon",
	"Leamington",
	"Louiseville",
	"Lucan",
	"Matagami",
	"Mont-royal",
	"Morinville",
	"Morley",
	"Mount Brydges",
	"Mount Pearl",
	"Nelson",
	"Niagara-on-the-Lake",
	"North Battleford",
	"Parksville",
	"Peace River",
	"Pictou",
	"Ponoka",
	"Port Hawkesbury",
	"Prince Rupert",
	"Revelstoke",
	"Rockland",
	"Rosetown",
	"Saint-basile-le-grand",
	"Saint-césaire",
	"Saint-henri-de-lévis",
	"Saint-honoré-de-témiscouata",
	"Saint-liboire",
	"Sandy Lake",
	"Seaforth",
	"Sechelt",
	"Simcoe",
	"Squamish",
	"St Petersburg",
	"St. Albert",
	"Ste-Foy",
	"Stirling",
	"Strathmore",
	"Sturgeon Falls",
	"Sylvan Lake",
	"Tampa",
	"Thorold",
	"Torbay",
	"Val-david",
	"Walkerton",
	"Whitehorse",
	"Whitewood",
	"Wilkie",
	"Wymark",
	"Yellowknife",
	"Rigaud",
	"Quesnel",
	"Puchong",
	"Port Elgin",
	"Port Dover",
	"Port Alberni",
	"Fort Qu'appelle",
	"Pont-rouge",
	"Farnham",
	"Pointe-lebel",
	"Pointe-calumet",
	"Piter",
	"Pembroke",
	"Osoyoos",
	"Norwich",
	"Exeter",
	"Bloomfield",
	"Newark",
	"New York",
	"Neuville",
	"Neepawa",
	"Nanton",
	"Blackfalds",
	"Moscow",
	"Montague",
	"Belle River",
	"Mont-saint-hilaire",
	"Monkland",
	"Mission Viejo",
	"Mildmay",
	"Mercier",
	"Manitowaning",
	"Tweed",
	"Twillingate",
	"Magog",
	"Upton",
	"Madrid",
	"Beechville",
	"Los Angeles",
	"Vanderhoof",
	"Lorraine",
	"London",
	"Vegreville",
	"Verchères",
	"Lloydminster",
	"Lewisporte",
	"La Romaine",
	"La Présentation",
	"La Malbaie",
	"Bedford",
	"L'orignal",
	"Kirkland",
	"Warsaw",
	"Warwick",
	"Kemptville",
	"Judique",
	"Jiddah",
	"Ingleside",
	"West Vancouver",
	"Westbank",
	"Humboldt",
	"Hawkesbury",
	"Hampton",
	"Hagersville",
	"Sept-Îles",
	"Sanford",
	"Sainte-martine",
	"Sainte-hélène-de-bagot",
	"Sainte-emelie-de-l'energie",
	"Sainte-claire",
	"Grand Bend",
	"Saint-lambert",
	"Saint-félicien",
	"Glentworth",
	"Saint-cuthbert",
	"Ashcroft",
	"Saint-clément",
	"Beaumont",
	"Saint-charles-de-bellechasse",
	"Roxboro",
	"Roberts Creek",
	"Zürich",
}

var regions = []string{
	"Quebec",
	"Ontario",
	"British Columbia",
	"Alberta",
	"Manitoba",
	"Saskatchewan",
	"New Brunswick",
	"Nova Scotia",
	"Unknown",
	"Newfoundland and Labrador",
	"Prince Edward Island",
	"Noord-Holland",
	"Yukon Territory",
	"Uusimaa",
	"Northwest Territories",
	"California",
	"Jakarta Raya",
	"Kaluzhskaya Oblast",
	"Istanbul",
	"Ha Noi",
	"Shanghai",
	"New South Wales",
	"Florida",
	"Delhi",
	"Wilayah Persekutuan Kuala Lump",
	"New Mexico",
	"Sankt Peterburg",
	"Berlin",
	"London",
	"Kostromskaya Oblast",
	"Zurich",
	"New Jersey",
	"New York",
	"Moskva",
	"Mazowieckie",
	"Indiana",
	"Makkah",
	"Madrid",
}

var isps = []string{
	"Bell Canada",
	"OVH SAS",
	"Rogers Cable Communications inc.",
	"Videotron",
	"Shaw Communications inc.",
	"Telus Communications inc.",
	"Amanah Tech inc.",
	"Teksavvy Solutions inc.",
	"Distributel Communications ltd.",
	"Cogeco Cable inc.",
	"Acn",
	"Primus Telecommunications Canada inc.",
	"Saskatchewan Telecommunications",
	"Cogeco Cable Holdings inc",
	"Mts inc.",
	"Bell Aliant Regional Communications inc.",
	"Amazon Technologies inc.",
	"Psinet inc.",
	"Cik Telecom inc",
	"Petersburg Internet Network ltd.",
	"Atomohost LLC",
	"EastLink",
	"Surfeasy inc",
	"Xplornet Communications inc.",
	"Stentor National Integrated Communications Network",
	"Fibernetics Corporation",
	"Carat Networks inc",
	"Start Communications",
	"Altima Telecom inc",
	"Globalive Wireless Management Corp.",
	"InnSys Incorporated",
	"Telebec",
	"Ebox",
	"Access Communications Co-operative Limited",
	"Netelligent Hosting Services inc.",
	"Persona Communications inc.",
	"Comwave Telecom inc.",
	"Iweb Technologies inc.",
	"Cogentpsi",
	"Concorde inc.",
	"Westman Communications Group",
	"Via Computer and Communications Vianet",
	"Vianettv inc",
	"Quadranet inc",
	"Oricom Internet",
	"Total Server Solutions L.L.C.",
	"KW Datacenter",
	"Nexicom inc.",
	"Cooptel Coop de Telecommunication",
	"Cipherkey Exchange Corp.",
	"Agt",
	"Shaw Telecom G.P.",
	"eSecureData",
	"Bravo Telecom",
	"Aei Internet inc.",
	"GloboTech Communications",
	"Cronomagic Canada inc.",
	"Continuum Online Services ltd.",
	"Groupe Maskatel",
	"Fibrenoire inc.",
	"B2b2c inc",
	"LeaderTelecom B.V.",
	"TBayTel",
	"Yesup Ecommerce Solutions inc.",
	"Dery Telecom inc.",
	"Videotron Telecom Ltee",
	"Northwestel inc.",
	"Softlayer Technologies inc.",
	"Openface inc.",
	"All Your Base Are Belong To Us",
	"University of Alberta",
	"Choopa Llc",
	"Corridor Communications inc.",
	"Hivelocity Ventures Corp",
	"Huron Telecommunications Cooperative Limited",
	"Source Cable ltd.",
	"Cogecodata",
	"Transit Telecom LLC",
	"Managed Network Systems inc.",
	"Alentus Internet Services",
	"SecureNet Information Services",
	"Novus Entertainment inc.",
	"Colba Net inc.",
	"Transvision Reseau inc.",
	"Radiant Communications ltd.",
	"Allstream Corp.",
	"Coextro",
	"Kingston Online Services",
	"Tinet SpA",
	"Cogeco Cable",
	"Logicweb inc.",
	"Vodalink Telecom inc.",
	"Rogers Wireless inc.",
	"Verizon Business",
	"Vaxxine Computer Systems inc.",
	"University of Toronto",
	"Golden Triangle On Line",
	"Yak Communications Canada Corp",
	"Iristel inc",
	"Execulink Telecom inc.",
	"Hurricane Electric inc.",
	"Hamilton Public Library",
	"Bandcon",
	"Cable Axion Digitel inc.",
	"Green Net co ltd",
	"Quadranet Us",
	"1651884 Ontario inc.",
	"Google inc.",
	"City West Cable Telephone Corp.",
	"Cybera inc",
	"Region40 Llc",
	"WTC Communications",
	"Radiant Communications Canada ltd.",
	"Navigue.com",
	"Targo Communications inc.",
	"Hutterian Broadband Network inc",
	"Ice Wireless inc.",
	"Idigital Internet inc.",
	"It7 Networks inc",
	"M247 Ltd",
	"Frantech Solutions",
	"Netxpoint",
	"Enmax Envision inc.",
	"EVSL",
	"Dynamic Asp inc.",
	"Packetworks inc.",
	"Delta Cable Communications ltd.",
	"Connexio.ca",
	"Reseau Picanoc.Net inc.",
	"Reseau d'Informations Scientifiques Du Quebec Risq",
	"Seaside Communications inc.",
	"Chinanet Shanghai Province Network",
	"BCnet",
	"Tera-Byte Dot Com inc.",
	"The King's University",
	"Uni-Telecom",
	"University of Calgary",
	"VELCOM",
	"Alberta Health Services",
	"WiBand Communications",
	"YISP B.V.",
	"Unknown",
	"Southern Alberta Institute of Technology",
	"Carleton University",
	"Origen",
	"Axia Connect Limited",
	"Telekom Malaysia Berhad",
	"Astute Hosting inc.",
	"ABM Integrated Solutions",
	"Terago Networks inc.",
	"Truespeed Internet Services",
	"Internap Network Services Corporation",
	"University of Guelph",
	"University of Western Ontario",
	"York University",
	"Aircomplus inc.",
	"Juce Communications inc",
	"Abc Allen Business Communications ltd",
	"eHealth Ontario",
	"Sentex Communications Corporation",
	"Wightman Telecom",
	"Sogetel inc",
	"Trusov Ilya Igorevych",
	"Internet Access Solutions ltd.",
	"Uniserve On Line",
	"University Of Waterloo",
	"Mountain Cablevision ltd.",
	"Reseau Internet Maskoutain",
	"Sasktel Wide Area Network Engineering Center",
	"Microsoft Corp",
	"Saudi Telecom Company Jsc",
	"Peer 1 Network inc.",
	"Maxis Broadband Sdn Bhd",
	"Manitoba Netset ltd.",
	"MCSNet",
	"Yourlink inc.",
	"Ottcolo inc.",
	"Bruce Municipal Telephone System",
	"Synaptica",
	"Airenet Internet Solutions",
	"Digital Ocean inc.",
	"Wolfpaw Services",
	"Pure Pages inc.",
	"Telecommunications Xittel inc.",
	"Lynxnet.ca",
	"Silo Wireless inc",
	"WaveDirect Telecommunications",
	"WesTel Telecommunications",
	"High Speed Crow inc",
	"Odynet inc",
	"Apogee Telecom inc.",
	"Nucleus Information Service inc.",
	"NCS Technologies",
	"Digital Energy Technologies Chile SpA",
}

var domains = []string{
	"onclkds.com",
	"Unknown",
	"prestoris.com",
	"go.deliverymodo.com",
	"onclickads.net",
	"04dn8g4f.space",
	"go.padsdel.com",
	"5tcgu99n.loan",
	"uonj2o6i.loan",
	"k9anf8bc.webcam",
	"go.verymuchad.com",
	"ep7kpqn8.online",
	"kzkjewg7.stream",
	"qwun46bs.review",
	"go.stirshakead.com",
	"lamiflor.xyz",
	"glaswall.online",
	"dashgreen.online",
	"bit.ly",
	"go.pushnative.com",
	"offer2.joymedia.mobi",
	"bwknu1lo.top",
	"69wnz64h.xyz",
	"r91c6tvs.science",
	"wpzka4t6.site",
	"checkapi.xyz",
	"onwatchseries.to",
	"sh.st",
	"c9snorwj.website",
	"j4y01i3o.win",
	"zx1jg.voluumtrk.com",
	"10nr6frq.cricket",
	"viid.me",
	"go.cartstick.com",
	"free.uumeiju.com",
}

var brands = []string{
	"Samsung",
	"LG",
	"Generic",
	"Motorola",
	"Google",
	"HTC",
	"Sony",
	"Huawei",
	"Alcatel",
	"UCWeb",
	"Asus",
	"Lenovo",
	"Xiaomi",
	"ZTE",
	"Opera",
	"BLU",
	"Mozilla",
	"OnePlus",
	"Vodafone",
	"Amazon",
	"Acer",
	"SonyEricsson",
	"YU",
	"Sky Devices",
	"Vivo",
	"Lava",
	"Wiko",
	"General Mobile",
	"OPPO",
	"Kyocera",
	"BlackBerry",
	"Tecno",
	"Proscan",
	"Micromax",
	"myPhone",
	"Bmobile",
	"LeTV",
	"Avvio",
	"Meizu",
	"RCA",
	"Gionee",
	"Ken Xin Da",
	"Infinix",
	"Cherry Mobile",
	"Symphony",
	"Yuntab",
	"Cloudfone",
	"Feiteng",
	"Xgody",
	"Desktop",
	"Hipstreet",
	"Fly",
	"Intex",
	"Vizio",
	"Kobo",
	"Turkcell",
	"Lanix",
	"Coolpad",
	"EZcast",
	"InnJoo",
	"K-Fone",
	"LeEco",
	"Condor",
	"Nokia",
	"Reeder",
	"Blackview",
	"Starmobile",
	"Apple",
	"Advan",
	"ZH&K",
	"iNew",
	"Evercoss",
	"Medion",
	"Sonim",
	"GoMobile",
	"Maxwest",
	"Eton",
	"Cubot",
	"true",
	"DOOGEE",
	"BQ",
	"UMI",
	"Azumi",
	"Karbonn",
	"Jiayu",
	"Walton",
	"Datawind",
	"HP",
	"AIS",
	"Philips",
	"Posh Mobile",
	"Panasonic",
	"QMobile",
	"Mlais",
	"i-mobile",
	"Casper",
	"Sendtel",
}

var oses = []string{
	"Android",
	"Unknown",
	"IOS",
	"Windows",
}

var osversions = []string{
	"Android 6.0",
	"Android 4.4",
	"Android 5.0",
	"Android 5.1",
	"Android 4.0",
	"Android 4.2",
	"Android 4.1",
	"Android 7.0",
	"Unknown",
	"Android 7.1",
	"Android 4.3",
	"Android 2.0",
	"Android 1.5",
	"Android 2.2",
	"Android 2.3",
	"Android 3.1",
	"IOS 8.4",
	"Android 2.1",
	"Windows 8.1",
}

var browsers = []string{
	"Chrome Mobile",
	"Android Browser",
	"Mobile Firefox",
	"UC Browser",
	"Opera Mini",
	"Opera Mobile",
	"Silk",
	"Chrome",
	"Mobile Safari",
	"Yandex.Browser Mobile",
	"Unknown",
}

var browserVersions = []string{
	"Chrome Mobile 55",
	"Chrome Mobile 44",
	"Android Browser 4",
	"Chrome Mobile 38",
	"Chrome Mobile 54",
	"Chrome Mobile 34",
	"Chrome Mobile 30",
	"Chrome Mobile 28",
	"Mobile Firefox 50",
	"Chrome Mobile 51",
	"UC Browser",
	"Chrome Mobile 52",
	"Chrome Mobile 50",
	"Chrome Mobile 18",
	"Chrome Mobile 53",
	"Chrome Mobile 43",
	"Chrome Mobile 45",
	"Chrome Mobile 39",
	"Chrome Mobile 33",
	"Chrome Mobile 40",
	"Chrome Mobile 42",
	"Chrome Mobile 49",
	"Chrome Mobile 37",
	"Chrome Mobile 46",
	"Opera Mobile 41",
	"Mobile Firefox 40",
	"Silk 54",
	"Chrome Mobile 47",
	"Opera Mini 21",
	"Opera Mini 7",
	"Chrome Mobile 48",
	"Mobile Safari",
	"Android Browser 3",
	"Mobile Firefox 49",
	"Chrome Mobile 36",
	"Mobile Firefox 38",
	"Chrome 55",
	"Chrome Mobile 35",
	"Opera Mini 20",
	"Chrome Mobile 41",
	"Opera Mobile 37",
	"Opera Mini 10",
	"Chrome 43",
	"Mobile Firefox 45",
	"Mobile Firefox 47",
	"Mobile Firefox 48",
	"Opera Mobile 20",
	"Mobile Firefox 51",
	"Chrome Mobile 26",
	"Chrome Mobile 25",
	"Chrome 54",
	"Mobile Firefox 46",
	"Silk 55",
	"Unknown",
	"Chrome Mobile 27",
	"Opera Mini 15",
	"Yandex.Browser Mobile 16",
	"Mobile Firefox 41",
	"Chrome Mobile 32",
	"Opera Mobile 28",
	"Chrome 51",
	"Mobile Safari 8",
	"Opera Mini 13",
	"Chrome Mobile 56",
	"Opera Mini 9",
	"Opera Mobile 27",
	"Opera Mobile 29",
	"Silk 53",
	"Opera Mini 24",
	"Chrome 18",
	"Opera Mini 11",
	"Opera Mini 14",
	"Android Browser 6",
	"Opera Mini 12",
	"Chrome 49",
	"Opera Mobile 35",
	"Chrome Mobile 31",
	"Chrome 40",
	"Mobile Firefox 44",
	"Opera Mini 17",
	"Opera Mini 18",
	"Opera Mini 19",
	"Mobile Firefox 37",
	"Chrome",
}

var connectionTypes = []string{
	"Broadband",
	"Cable",
	"Xdsl",
	"Mobile",
	"Satellite",
}

var mobileCarriers = []string{
	"Other", "3", "Bell", "China Mobile", "Eastlink", "ICE Wireless", "Maxis", "Mobily", "Rogers", "SaskTel", "Telus", "Vidéotron", "Wind Mobile", "12",
}

var deviceTypes = []string{
	"Desktop", "Mobile phone", "Unknown", "Tablet",
}
