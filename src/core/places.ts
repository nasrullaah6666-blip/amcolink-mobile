// Copied from the Amcolink website repo, lib/places.ts at commit dde47f3b (only import paths and env names adapted). The website is the source of truth: update both together.
/**
 * Each country's own structure: country → first level (County / Region / Province / State) → cities and towns.
 * Sellers pick the first level, then a town; anything missing can still be typed with "Other".
 * Towns on a border (e.g. Moyale) appear under both. Keep existing region names unchanged: shops have them saved.
 */
export const PLACE_LEVEL: Record<string, { one: string; many: string }> = {
  KE: { one: "County", many: "Counties" },
  ET: { one: "Region", many: "Regions" },
  SO: { one: "Region", many: "Regions" },
  DJ: { one: "Region", many: "Regions" },
  UG: { one: "Region", many: "Regions" },
  TZ: { one: "Region", many: "Regions" },
  RW: { one: "Province", many: "Provinces" },
  BI: { one: "Province", many: "Provinces" },
  SS: { one: "State", many: "States" },
  ER: { one: "Region", many: "Regions" },
  CD: { one: "Province", many: "Provinces" },
};
export function levelName(code?: string | null): { one: string; many: string } {
  return (code && PLACE_LEVEL[code]) || { one: "Region", many: "Regions" };
}

export const PLACES: Record<string, Record<string, string[]>> = {
  // ───────────── Ethiopia: 12 regions + 2 city administrations ─────────────
  ET: {
    "Addis Ababa": ["Addis Ababa", "Bole", "Arada", "Kirkos", "Yeka", "Lideta", "Gulele", "Addis Ketema", "Kolfe Keranio", "Nifas Silk-Lafto", "Akaky Kaliti", "Lemi Kura", "Piassa", "Mexico", "Megenagna", "CMC", "Ayat", "Summit", "Sarbet", "Merkato", "Kality", "Gerji", "22 Mazoria", "Haya Hulet"],
    "Dire Dawa": ["Dire Dawa", "Sabian", "Kezira", "Legehare", "Melka Jebdu", "Dechatu"],
    "Somali Region": ["Jijiga", "Degahbur", "Kebridahar", "Gode", "Warder", "Moyale", "Kebri Beyah", "Togwajale", "Dolo Ado", "Dollo Bay", "Shilabo", "Fik", "Aware", "Danan", "Kelafo", "Mustahil", "Hargele", "Filtu", "Hudet", "Bokolmayo", "Shinile", "Erer", "Dembel", "Aysha", "Harshin", "Babile", "Elkere", "Qabridahar", "Gursum", "Hamaro", "Lagahida", "Segeg", "Bare", "Afder", "Galadi", "Dhuhun", "Goljano", "Ayun", "Boh", "Geladin", "Ferfer"],
    "Oromia": ["Adama", "Negele", "Moyale", "Bishoftu", "Jimma", "Shashemene", "Nekemte", "Ambo", "Asella", "Robe", "Goba", "Dodola", "Batu (Ziway)", "Mojo", "Sebeta", "Burayu", "Sululta", "Holeta", "Woliso", "Fiche", "Metu", "Gimbi", "Dembi Dolo", "Bedele", "Agaro", "Chiro", "Haramaya", "Deder", "Gelemso", "Yabelo", "Mega", "Bule Hora", "Arsi Negele", "Kofele", "Ginir", "Metehara", "Awaday", "Bedeno", "Dukem", "Gelan", "Legetafo", "Sendafa", "Chancho", "Gedo", "Shambu", "Bako", "Nejo", "Mendi", "Bore", "Hagere Mariam", "Agarfa", "Adaba", "Kibre Mengist", "Shakiso", "Huruta", "Bekoji", "Kersa"],
    "Amhara": ["Bahir Dar", "Gondar", "Dessie", "Debre Birhan", "Debre Markos", "Kombolcha", "Woldia", "Debre Tabor", "Lalibela", "Bati", "Kemise", "Debark", "Finote Selam", "Injibara", "Metema", "Shewa Robit", "Sekota", "Mota", "Bure", "Dangila", "Addis Zemen", "Woreta", "Ataye", "Majete", "Kobo", "Mersa", "Hayk", "Wereilu", "Mekane Selam", "Dejen", "Azezo", "Chagni", "Debre Werk", "Gashena", "Alem Ketema", "Enewari"],
    "Tigray": ["Mekelle", "Adigrat", "Axum", "Shire", "Adwa", "Humera", "Alamata", "Maychew", "Wukro", "Korem", "Abiy Addi", "Hawzen", "Zalambessa", "Sheraro", "Enticho", "Hagere Selam", "Mekoni", "Edaga Hamus"],
    "Afar": ["Semera", "Logiya", "Asaita", "Dubti", "Awash", "Gewane", "Mille", "Abala", "Chifra", "Afdera", "Bure Modaytu", "Dalifage", "Ewa", "Elidar", "Bidu", "Gelalo"],
    "Harari": ["Harar", "Aboker", "Jugol", "Hakim", "Shenkor"],
    "Sidama": ["Hawassa", "Yirgalem", "Aleta Wendo", "Bensa", "Hula", "Daye", "Leku", "Wondo Genet", "Chuko", "Bona", "Teferi Kela"],
    "South Ethiopia": ["Wolaita Sodo", "Arba Minch", "Dilla", "Jinka", "Konso", "Sawla", "Boditi", "Areka", "Yirgachefe", "Wenago", "Chencha", "Turmi", "Key Afer", "Bele", "Gidole", "Bulki", "Karat", "Segen"],
    "Central Ethiopia": ["Hosaena", "Butajira", "Welkite", "Worabe", "Halaba", "Durame", "Shinshicho", "Gubre", "Emdibir", "Agena", "Kibet", "Kosha", "Gimbichu", "Doyogena"],
    "South West Ethiopia": ["Bonga", "Mizan Aman", "Tepi", "Tercha", "Masha", "Tarcha", "Maji", "Gecha", "Wacha"],
    "Benishangul-Gumuz": ["Assosa", "Gilgel Beles", "Kamashi", "Bambasi", "Menge", "Sherkole", "Guba", "Dibate", "Mandura"],
    "Gambela": ["Gambela", "Itang", "Abobo", "Gog", "Pugnido", "Jor", "Lare", "Dimma"],
  },

  // ───────────── Kenya: 47 counties ─────────────
  KE: {
    "Nairobi": ["Nairobi CBD", "Eastleigh", "South C", "South B", "Westlands", "Kilimani", "Kasarani", "Embakasi", "Kawangware", "Kibera", "Githurai", "Ruaraka", "Karen", "Langata", "Donholm", "Umoja", "Kayole", "Pangani", "Parklands", "Lavington", "Kileleshwa", "Upper Hill", "Ngara", "Roysambu", "Zimmerman", "Kahawa", "Dagoretti", "Kangemi", "Buruburu", "Industrial Area", "Gigiri", "Runda", "Mathare", "Dandora", "Komarock", "Utawala", "Pipeline", "Madaraka"],
    "Mombasa": ["Mombasa", "Nyali", "Likoni", "Kisauni", "Changamwe", "Bamburi", "Shanzu", "Old Town", "Tudor", "Mikindani", "Bombolulu", "Port Reitz", "Jomvu"],
    "Kwale": ["Kwale", "Ukunda", "Diani", "Msambweni", "Kinango", "Lunga Lunga", "Shimoni", "Tiwi", "Matuga", "Mazeras"],
    "Kilifi": ["Kilifi", "Malindi", "Watamu", "Mtwapa", "Mariakani", "Kaloleni", "Rabai", "Gede", "Marafa", "Magarini", "Takaungu"],
    "Tana River": ["Hola", "Garsen", "Bura", "Madogo", "Kipini", "Bangale"],
    "Lamu": ["Lamu", "Mpeketoni", "Faza", "Mokowe", "Witu", "Kiunga", "Shela"],
    "Taita Taveta": ["Voi", "Wundanyi", "Taveta", "Mwatate", "Maungu", "Mghange"],
    "Garissa": ["Garissa", "Dadaab", "Masalani", "Bura East", "Hulugho", "Modogashe", "Balambala", "Fafi", "Ijara", "Bothai", "Liboi"],
    "Wajir": ["Wajir", "Habaswein", "Griftu", "Bute", "Eldas", "Tarbaj", "Hadado", "Khorof Harar", "Wajir Bor", "Diff", "Buna"],
    "Mandera": ["Mandera", "El Wak", "Rhamu", "Takaba", "Lafey", "Banisa", "Kotulo", "Arabia", "Fino", "Shimbir Fatuma"],
    "Marsabit": ["Marsabit", "Moyale", "Sololo", "Laisamis", "North Horr", "Loiyangalani", "Kargi", "Turbi", "Illeret", "Maikona"],
    "Isiolo": ["Isiolo", "Merti", "Garbatulla", "Kinna", "Oldonyiro", "Sericho"],
    "Meru": ["Meru", "Maua", "Nkubu", "Timau", "Mitunguu", "Kianjai", "Laare", "Kangeta", "Githongo", "Kariene", "Mikinduri"],
    "Tharaka-Nithi": ["Chuka", "Kathwana", "Marimanti", "Chogoria", "Kaanwa", "Gatunga"],
    "Embu": ["Embu", "Runyenjes", "Siakago", "Kiritiri", "Ishiara", "Manyatta", "Kianjokoma"],
    "Kitui": ["Kitui", "Mwingi", "Mutomo", "Kabati", "Kyuso", "Mutitu", "Ikutha", "Migwani", "Zombe", "Tseikuru"],
    "Machakos": ["Machakos", "Athi River", "Kangundo", "Tala", "Mlolongo", "Syokimau", "Matuu", "Masii", "Kathiani", "Mwala", "Masinga", "Kithimani", "Joska"],
    "Makueni": ["Wote", "Makindu", "Emali", "Mtito Andei", "Kibwezi", "Sultan Hamud", "Nunguni", "Mbumbuni", "Kasikeu", "Kikima"],
    "Nyandarua": ["Ol Kalou", "Engineer", "Njabini", "Ol Joro Orok", "Ndaragwa", "Mairo Inya", "Kinangop"],
    "Nyeri": ["Nyeri", "Karatina", "Othaya", "Naro Moru", "Mukurweini", "Chaka", "Endarasha", "Kiganjo", "Mweiga"],
    "Kirinyaga": ["Kerugoya", "Kutus", "Sagana", "Wang'uru", "Kagio", "Baricho", "Kianyaga", "Kagumo", "Mwea"],
    "Murang'a": ["Murang'a", "Kenol", "Kangema", "Maragua", "Kiriaini", "Kigumo", "Kandara", "Makuyu", "Saba Saba", "Kahuro"],
    "Kiambu": ["Thika", "Kiambu", "Ruiru", "Juja", "Kikuyu", "Limuru", "Githunguri", "Kabete", "Karuri", "Kiambaa", "Gatundu", "Ndenderu", "Banana", "Wangige", "Kahawa Sukari", "Kahawa Wendani", "Kamakis", "Membley", "Tatu City"],
    "Turkana": ["Lodwar", "Kakuma", "Lokichogio", "Lokichar", "Kalokol", "Lokori", "Lorugum", "Kainuk", "Lokitaung", "Kerio"],
    "West Pokot": ["Kapenguria", "Makutano", "Chepareria", "Sigor", "Alale", "Kacheliba", "Ortum"],
    "Samburu": ["Maralal", "Baragoi", "Archers Post", "Wamba", "Kisima", "Suguta Marmar"],
    "Trans Nzoia": ["Kitale", "Endebess", "Kiminini", "Saboti", "Kachibora", "Kwanza", "Maili Saba"],
    "Uasin Gishu": ["Eldoret", "Burnt Forest", "Turbo", "Moi's Bridge", "Ziwa", "Moiben", "Kesses", "Matunda", "Kapseret"],
    "Elgeyo-Marakwet": ["Iten", "Kapsowar", "Chepkorio", "Kamwosor", "Tambach", "Chesoi", "Cheptongei"],
    "Nandi": ["Kapsabet", "Nandi Hills", "Mosoriot", "Kobujoi", "Kabiyet", "Chepterwai", "Lessos", "Kaiboi"],
    "Baringo": ["Kabarnet", "Eldama Ravine", "Marigat", "Mogotio", "Chemolingot", "Kabartonjo", "Timboroa", "Kampi ya Samaki"],
    "Laikipia": ["Nanyuki", "Nyahururu", "Rumuruti", "Doldol", "Kinamba", "Sipili", "Ol Moran", "Wiyumiririe"],
    "Nakuru": ["Nakuru", "Naivasha", "Gilgil", "Molo", "Njoro", "Subukia", "Mai Mahiu", "Bahati", "Elburgon", "Salgaa", "Rongai", "Lanet", "Dundori", "Kuresoi"],
    "Narok": ["Narok", "Kilgoris", "Ololulung'a", "Nairegie Enkare", "Ntulele", "Suswa", "Lolgorian", "Talek", "Mulot"],
    "Kajiado": ["Kajiado", "Kitengela", "Ngong", "Ongata Rongai", "Namanga", "Loitokitok", "Isinya", "Kiserian", "Bissil", "Magadi", "Mashuuru", "Illasit", "Matasia"],
    "Kericho": ["Kericho", "Litein", "Londiani", "Kipkelion", "Sosiot", "Chepseon", "Fort Ternan", "Brooke"],
    "Bomet": ["Bomet", "Sotik", "Longisa", "Mogogosiek", "Silibwet", "Ndanai", "Chebunyo"],
    "Kakamega": ["Kakamega", "Mumias", "Malava", "Butere", "Lugari", "Shinyalu", "Khayega", "Likuyani", "Navakholo", "Shianda", "Ingotse"],
    "Vihiga": ["Mbale", "Luanda", "Chavakali", "Majengo", "Hamisi", "Serem", "Sabatia", "Kaimosi"],
    "Bungoma": ["Bungoma", "Webuye", "Kimilili", "Chwele", "Malakisi", "Sirisia", "Kapsokwony", "Tongaren", "Naitiri", "Kamukuywa"],
    "Busia": ["Busia", "Malaba", "Port Victoria", "Nambale", "Butula", "Funyula", "Amagoro", "Bumala", "Sio Port"],
    "Siaya": ["Siaya", "Bondo", "Ugunja", "Usenge", "Yala", "Ukwala", "Sega", "Aram", "Madiany"],
    "Kisumu": ["Kisumu", "Ahero", "Maseno", "Kombewa", "Muhoroni", "Kondele", "Nyamasaria", "Mamboleo", "Katito", "Awasi", "Chemelil", "Pap Onditi"],
    "Homa Bay": ["Homa Bay", "Mbita", "Oyugis", "Kendu Bay", "Ndhiwa", "Rangwe", "Magunga", "Sindo", "Kosele"],
    "Migori": ["Migori", "Rongo", "Awendo", "Isebania", "Kehancha", "Uriri", "Macalder", "Muhuru Bay", "Ntimaru"],
    "Kisii": ["Kisii", "Ogembo", "Keroka", "Suneka", "Nyamache", "Masimba", "Marani", "Nyamarambe", "Itumbe", "Kenyenya"],
    "Nyamira": ["Nyamira", "Keroka", "Nyansiongo", "Ekerenyo", "Nyamusi", "Magwagwa", "Kebirigo"],
  },

  // ───────────── Somalia: 18 regions (including Somaliland and Puntland) ─────────────
  SO: {
    "Banadir (Mogadishu)": ["Mogadishu", "Hodan", "Wadajir", "Dharkenley", "Karan", "Yaqshid", "Hamar Weyne", "Hamar Jajab", "Shibis", "Bondhere", "Wardhigley", "Hawl Wadag", "Waberi", "Heliwa", "Kaxda", "Daynile", "Shangani", "Abdiaziz", "Garasbaley", "Gubadley", "Kahda", "Tarabunka", "KM4", "Bakara"],
    "Woqooyi Galbeed": ["Hargeisa", "Gabiley", "Berbera", "Wajaale", "Arabsiyo", "Kalabaydh", "Salahley", "Baligubadle", "Dacarbudhuq"],
    "Awdal": ["Borama", "Zeila", "Baki", "Lughaya", "Dilla", "Lawyacado", "Amud"],
    "Togdheer": ["Burao", "Oodweyne", "Sheikh", "Buhoodle", "Duruqsi"],
    "Sanaag": ["Erigavo", "Badhan", "El Afweyn", "Las Qoray", "Maydh", "Dhahar", "Hingalol"],
    "Sool": ["Las Anod", "Taleh", "Hudun", "Ainabo", "Boocame", "Yagoori"],
    "Bari": ["Bosaso", "Qardho", "Iskushuban", "Bandarbeyla", "Alula", "Qandala", "Ufeyn", "Bargaal"],
    "Nugal": ["Garowe", "Eyl", "Burtinle", "Dangorayo", "Godobjiran", "Sinujiif"],
    "Mudug": ["Galkayo", "Hobyo", "Harardhere", "Jariban", "Goldogob", "Bacadweyn", "Galinsoor", "Wisil"],
    "Galgaduud": ["Dhusamareb", "Abudwak", "Adado", "Guriel", "Elbur", "Balanbale", "Galhareri", "Herale"],
    "Hiiraan": ["Beledweyne", "Bulo Burte", "Jalalaqsi", "Matabaan", "Mahas", "Moqokori", "Halgan"],
    "Middle Shabelle": ["Jowhar", "Balcad", "Adale", "Mahaday", "Warsheikh", "Runirgod", "Adan Yabaal"],
    "Lower Shabelle": ["Afgooye", "Marka", "Baraawe", "Wanlaweyn", "Qoryooley", "Kurtunwarey", "Sablale", "Awdheegle", "Janaale"],
    "Bay": ["Baidoa", "Burhakaba", "Dinsoor", "Qansax Dheere", "Berdale", "Awdinle"],
    "Bakool": ["Hudur", "Wajid", "Tiyeeglow", "El Barde", "Rabdhure", "Yeed"],
    "Gedo": ["Garbahaarey", "Luuq", "Dolow", "Beled Hawo", "Bardera", "El Wak", "Burdhubo", "Ceel Cadde"],
    "Middle Juba": ["Bu'aale", "Jilib", "Sakow"],
    "Lower Juba": ["Kismayo", "Afmadow", "Jamame", "Dhobley", "Badhaadhe", "Hagar", "Bilis Qooqaani"],
  },

  // ───────────── Djibouti: 6 regions ─────────────
  DJ: {
    "Djibouti City": ["Djibouti", "Balbala", "PK12", "Quartier 7", "Héron", "Plateau du Serpent", "Cité Arhiba", "Ambouli"],
    "Ali Sabieh": ["Ali Sabieh", "Holhol", "Ali Adde", "Assamo", "Dasbiyo"],
    "Arta": ["Arta", "Wea", "Damerjog", "Chabelley", "Loyada"],
    "Dikhil": ["Dikhil", "As Eyla", "Yoboki", "Gaggade", "Mouloud", "Galafi", "Abaitou"],
    "Obock": ["Obock", "Khor Angar", "Alaili Dadda", "Moulhoulé"],
    "Tadjourah": ["Tadjourah", "Randa", "Dorra", "Balho", "Ad Gueini", "Day"],
  },

  // ───────────── Uganda: 4 regions, with district towns ─────────────
  UG: {
    "Central": ["Kampala", "Entebbe", "Mukono", "Wakiso", "Masaka", "Mpigi", "Mityana", "Luweero", "Kayunga", "Mubende", "Nansana", "Kira", "Makindye", "Kawempe", "Nakawa", "Rubaga", "Bweyogerere", "Kajjansi", "Lugazi", "Buikwe", "Njeru", "Bombo", "Wobulenzi", "Nakasongola", "Nakaseke", "Kiboga", "Kyankwanzi", "Kanoni", "Gombe", "Kalangala", "Lwengo", "Lyantonde", "Rakai", "Kyotera", "Sembabule", "Bukomansimbi", "Kalungu", "Kassanda"],
    "Eastern": ["Jinja", "Mbale", "Tororo", "Soroti", "Busia", "Iganga", "Kamuli", "Kapchorwa", "Pallisa", "Kumi", "Bugiri", "Mayuge", "Luuka", "Kaliro", "Namutumba", "Buyende", "Butaleja", "Budaka", "Kibuku", "Sironko", "Manafwa", "Bududa", "Namisindwa", "Bukwo", "Kween", "Bulambuli", "Serere", "Ngora", "Bukedea", "Kaberamaido", "Kalaki", "Amuria", "Katakwi", "Kapelebyong", "Malaba"],
    "Northern": ["Gulu", "Lira", "Arua", "Kitgum", "Moroto", "Adjumani", "Pader", "Kotido", "Nebbi", "Koboko", "Yumbe", "Moyo", "Obongi", "Maracha", "Terego", "Madi-Okollo", "Zombo", "Pakwach", "Amuru", "Nwoya", "Omoro", "Lamwo", "Agago", "Apac", "Kwania", "Oyam", "Kole", "Dokolo", "Alebtong", "Otuke", "Amolatar", "Abim", "Kaabong", "Karenga", "Nakapiripirit", "Napak", "Amudat", "Nabilatuk"],
    "Western": ["Mbarara", "Fort Portal", "Kasese", "Kabale", "Hoima", "Masindi", "Bushenyi", "Ntungamo", "Rukungiri", "Kisoro", "Ibanda", "Isingiro", "Kiruhura", "Kazo", "Rwampara", "Sheema", "Mitooma", "Buhweju", "Rubirizi", "Ishaka", "Kanungu", "Rubanda", "Rukiga", "Kyenjojo", "Kyegegwa", "Kamwenge", "Kitagwenda", "Bundibugyo", "Ntoroko", "Bunyangabu", "Kibaale", "Kagadi", "Kakumiro", "Kikuube", "Buliisa"],
  },

  // ───────────── Tanzania: 31 regions (26 mainland + 5 Zanzibar) ─────────────
  TZ: {
    "Dar es Salaam": ["Dar es Salaam", "Kinondoni", "Ilala", "Temeke", "Kigamboni", "Ubungo", "Kariakoo", "Mbezi", "Sinza", "Mikocheni", "Masaki", "Oyster Bay", "Tegeta", "Kimara", "Mbagala", "Gongo la Mboto", "Kawe", "Magomeni", "Buguruni", "Tabata"],
    "Arusha": ["Arusha", "Karatu", "Monduli", "Usa River", "Mto wa Mbu", "Longido", "Namanga", "Loliondo", "Kikatiti"],
    "Dodoma": ["Dodoma", "Kondoa", "Mpwapwa", "Kongwa", "Chamwino", "Bahi", "Kibaigwa"],
    "Geita": ["Geita", "Chato", "Katoro", "Bukombe", "Nyang'hwale", "Mbogwe", "Ushirombo"],
    "Iringa": ["Iringa", "Mafinga", "Kilolo", "Ilula", "Pawaga", "Mufindi"],
    "Kagera": ["Bukoba", "Karagwe", "Muleba", "Ngara", "Biharamulo", "Kyerwa", "Missenyi", "Kayanga", "Mutukula"],
    "Katavi": ["Mpanda", "Inyonga", "Mlele", "Majimoto"],
    "Kigoma": ["Kigoma", "Kasulu", "Kibondo", "Uvinza", "Kakonko", "Buhigwe", "Ujiji"],
    "Kilimanjaro": ["Moshi", "Hai", "Same", "Rombo", "Mwanga", "Siha", "Boma Ng'ombe", "Himo", "Marangu", "Tarakea"],
    "Lindi": ["Lindi", "Nachingwea", "Kilwa Masoko", "Liwale", "Ruangwa", "Mtama"],
    "Manyara": ["Babati", "Mbulu", "Katesh", "Kiteto (Kibaya)", "Simanjiro (Orkesumet)", "Mererani"],
    "Mara": ["Musoma", "Tarime", "Bunda", "Serengeti (Mugumu)", "Rorya", "Butiama", "Sirari"],
    "Mbeya": ["Mbeya", "Tukuyu", "Chunya", "Kyela", "Mbarali (Rujewa)", "Igurusi", "Isyonje"],
    "Morogoro": ["Morogoro", "Ifakara", "Kilosa", "Gairo", "Mvomero", "Mahenge", "Malinyi", "Dumila", "Mikumi", "Turiani"],
    "Mtwara": ["Mtwara", "Masasi", "Newala", "Tandahimba", "Nanyumbu", "Mikindani"],
    "Mwanza": ["Mwanza", "Ilemela", "Sengerema", "Magu", "Kwimba (Ngudu)", "Misungwi", "Ukerewe (Nansio)", "Buswelu", "Igoma"],
    "Njombe": ["Njombe", "Makambako", "Ludewa", "Wanging'ombe", "Makete"],
    "Pwani": ["Kibaha", "Bagamoyo", "Mafia", "Chalinze", "Mkuranga", "Kisarawe", "Rufiji (Utete)", "Kibiti", "Mlandizi"],
    "Rukwa": ["Sumbawanga", "Namanyere", "Laela", "Matai", "Kasanga"],
    "Ruvuma": ["Songea", "Mbinga", "Tunduru", "Namtumbo", "Nyasa (Mbamba Bay)", "Peramiho"],
    "Shinyanga": ["Shinyanga", "Kahama", "Kishapu", "Didia", "Isaka"],
    "Simiyu": ["Bariadi", "Maswa", "Meatu", "Itilima", "Lamadi", "Busega"],
    "Singida": ["Singida", "Manyoni", "Kiomboi", "Ikungi", "Itigi", "Mkalama"],
    "Songwe": ["Vwawa", "Tunduma", "Mbozi", "Mlowo", "Ileje (Itumba)", "Momba"],
    "Tabora": ["Tabora", "Nzega", "Urambo", "Igunga", "Sikonge", "Kaliua", "Uyui (Isikizya)"],
    "Tanga": ["Tanga", "Korogwe", "Muheza", "Lushoto", "Pangani", "Handeni", "Kilindi", "Mkinga", "Horohoro"],
    "Mjini Magharibi (Zanzibar Urban West)": ["Zanzibar City", "Stone Town", "Mwanakwerekwe", "Amani", "Fumba", "Mbweni", "Bububu"],
    "Kaskazini Unguja (Zanzibar North)": ["Mkokotoni", "Nungwi", "Kendwa", "Mahonda", "Kiwengwa"],
    "Kusini Unguja (Zanzibar South)": ["Koani", "Paje", "Jambiani", "Makunduchi", "Kizimkazi", "Michamvi"],
    "Kaskazini Pemba (Pemba North)": ["Wete", "Konde", "Micheweni"],
    "Kusini Pemba (Pemba South)": ["Chake Chake", "Mkoani", "Kengeja"],
  },

  // ───────────── Rwanda: 5 provinces (incl. Kigali City), with district towns ─────────────
  RW: {
    "Kigali": ["Kigali", "Nyarugenge", "Gasabo", "Kicukiro", "Kimironko", "Remera", "Kacyiru", "Kimihurura", "Nyamirambo", "Kanombe", "Gikondo", "Kagarama", "Gisozi", "Kibagabaga", "Rebero"],
    "Northern Province": ["Musanze", "Gicumbi", "Rulindo", "Burera", "Gakenke", "Ruhengeri", "Byumba", "Base"],
    "Southern Province": ["Huye", "Muhanga", "Nyanza", "Nyamagabe", "Kamonyi", "Ruhango", "Nyaruguru", "Gisagara", "Butare", "Gitarama"],
    "Eastern Province": ["Rwamagana", "Nyagatare", "Kayonza", "Ngoma", "Kirehe", "Kibungo", "Bugesera (Nyamata)", "Gatsibo", "Kabarore"],
    "Western Province": ["Rubavu", "Rusizi", "Karongi", "Nyamasheke", "Rutsiro", "Ngororero", "Nyabihu", "Gisenyi", "Kamembe", "Kibuye"],
  },

  // ───────────── Burundi: 5 provinces (since 2025) ─────────────
  BI: {
    "Bujumbura": ["Bujumbura", "Rohero", "Ngagara", "Kinama", "Kamenge", "Buyenzi", "Bwiza", "Nyakabiga", "Musaga", "Kanyosha", "Kinindo", "Gatumba", "Isale", "Bubanza", "Cibitoke", "Rugombo", "Mpanda", "Musigati"],
    "Gitega": ["Gitega", "Karuzi", "Muramvya", "Mwaro", "Bugendana", "Mutaho", "Kayokwe", "Buhiga"],
    "Butanyerera": ["Ngozi", "Kayanza", "Kirundo", "Busoni", "Tangara", "Gahombo"],
    "Buhumuza": ["Muyinga", "Ruyigi", "Cankuzo", "Gisuru", "Kinyinya", "Giteranyi"],
    "Burunga": ["Rumonge", "Makamba", "Bururi", "Rutana", "Nyanza-Lac", "Mabanda", "Kayogoro", "Giharo"],
  },

  // ───────────── South Sudan: 10 states + 3 administrative areas ─────────────
  SS: {
    "Central Equatoria": ["Juba", "Yei", "Kajo Keji", "Morobo", "Lainya", "Terekeka", "Gumbo", "Munuki", "Gudele", "Konyo Konyo"],
    "Eastern Equatoria": ["Torit", "Kapoeta", "Nimule", "Magwi", "Ikotos", "Lafon", "Budi (Chukudum)"],
    "Western Equatoria": ["Yambio", "Maridi", "Tambura", "Nzara", "Ezo", "Mundri", "Mvolo", "Ibba"],
    "Jonglei": ["Bor", "Akobo", "Pochalla", "Ayod", "Fangak", "Waat", "Twic East (Panyagor)", "Duk"],
    "Upper Nile": ["Malakal", "Renk", "Nasir", "Melut", "Kodok", "Maban (Bunj)", "Ulang"],
    "Unity": ["Bentiu", "Rubkona", "Leer", "Mayom", "Koch", "Mayendit", "Panyijiar (Nyal)"],
    "Warrap": ["Kuajok", "Tonj", "Gogrial", "Turalei", "Warrap"],
    "Northern Bahr el Ghazal": ["Aweil", "Nyamlel", "Wanyjok", "Gok Machar", "Malualkon"],
    "Western Bahr el Ghazal": ["Wau", "Raja", "Jur River"],
    "Lakes": ["Rumbek", "Yirol", "Cueibet", "Awerial (Mingkaman)", "Wulu"],
    "Abyei Administrative Area": ["Abyei", "Agok"],
    "Greater Pibor Administrative Area": ["Pibor", "Gumuruk"],
    "Ruweng Administrative Area": ["Pariang", "Abiemnom"],
  },

  // ───────────── Eritrea: 6 regions ─────────────
  ER: {
    "Maekel": ["Asmara", "Serejeka", "Berik", "Gala Nefhi"],
    "Anseba": ["Keren", "Hagaz", "Elabered", "Habero", "Hamelmalo"],
    "Gash-Barka": ["Barentu", "Teseney", "Agordat", "Mogolo", "Haykota", "Golij", "Om Hajer"],
    "Debub": ["Mendefera", "Adi Keyh", "Dekemhare", "Senafe", "Adi Quala", "Segheneyti", "Tsorona"],
    "Northern Red Sea": ["Massawa", "Nakfa", "Ghinda", "Afabet", "Foro", "Shieb"],
    "Southern Red Sea": ["Assab", "Tio", "Edd", "Beylul"],
  },

  // ───────────── DR Congo: 26 provinces ─────────────
  CD: {
    "Kinshasa": ["Kinshasa", "Gombe", "Limete", "Ngaliema", "Lingwala", "Kintambo", "Bandalungwa", "Matete", "Masina", "Ndjili", "Kasa-Vubu", "Lemba", "Kalamu", "Barumbu", "Kimbanseke"],
    "Kongo Central": ["Matadi", "Boma", "Muanda", "Mbanza-Ngungu", "Kasangulu", "Kimpese", "Tshela", "Inkisi"],
    "Kwango": ["Kenge", "Kahemba", "Popokabaka", "Feshi"],
    "Kwilu": ["Bandundu", "Kikwit", "Bulungu", "Idiofa", "Masi-Manimba", "Gungu"],
    "Mai-Ndombe": ["Inongo", "Bolobo", "Kutu", "Mushie", "Kwamouth"],
    "Kasaï": ["Tshikapa", "Ilebo", "Luebo", "Mweka", "Kamonia"],
    "Kasaï-Central": ["Kananga", "Demba", "Dibaya", "Luiza", "Kazumba"],
    "Kasaï-Oriental": ["Mbuji-Mayi", "Tshilenge", "Miabi", "Katanda", "Lupatapata"],
    "Lomami": ["Kabinda", "Mwene-Ditu", "Ngandajika", "Lubao", "Kamiji"],
    "Sankuru": ["Lusambo", "Lodja", "Lubefu", "Katako-Kombe", "Kole"],
    "Maniema": ["Kindu", "Kasongo", "Kibombo", "Punia", "Kabambare", "Lubutu"],
    "South Kivu": ["Bukavu", "Uvira", "Kamituga", "Baraka", "Fizi", "Kabare", "Walungu", "Kalehe", "Mwenga", "Shabunda"],
    "North Kivu": ["Goma", "Butembo", "Beni", "Rutshuru", "Masisi", "Lubero", "Walikale", "Kiwanja", "Sake", "Oicha"],
    "Ituri": ["Bunia", "Aru", "Mahagi", "Mambasa", "Djugu", "Irumu", "Kasenyi"],
    "Haut-Uele": ["Isiro", "Watsa", "Durba", "Dungu", "Faradje", "Rungu"],
    "Bas-Uele": ["Buta", "Aketi", "Bondo", "Ango", "Poko", "Bambesa"],
    "Tshopo": ["Kisangani", "Basoko", "Isangi", "Yangambi", "Bafwasende", "Ubundu"],
    "Tshuapa": ["Boende", "Ikela", "Befale", "Bokungu", "Djolu"],
    "Mongala": ["Lisala", "Bumba", "Bongandanga", "Binga"],
    "Nord-Ubangi": ["Gbadolite", "Mobayi-Mbongo", "Businga", "Yakoma", "Bosobolo"],
    "Sud-Ubangi": ["Gemena", "Zongo", "Libenge", "Budjala", "Kungu"],
    "Équateur": ["Mbandaka", "Bikoro", "Basankusu", "Ingende", "Lukolela", "Bolomba"],
    "Tanganyika": ["Kalemie", "Moba", "Manono", "Kongolo", "Nyunzu", "Kabalo"],
    "Haut-Lomami": ["Kamina", "Kabongo", "Bukama", "Malemba-Nkulu", "Kaniama"],
    "Lualaba": ["Kolwezi", "Dilolo", "Kasaji", "Fungurume", "Mutshatsha", "Lubudi"],
    "Haut-Katanga": ["Lubumbashi", "Likasi", "Kipushi", "Kasumbalesa", "Kambove", "Sakania", "Pweto", "Kasenga"],
  },
};

export function regionsFor(code?: string | null): string[] {
  return code && PLACES[code] ? Object.keys(PLACES[code]) : [];
}

export function citiesFor(code: string | null | undefined, region: string): string[] {
  return (code && PLACES[code]?.[region]) || [];
}

/** First region that lists this city (used to pre-select the region when editing an old shop). */
export function regionOfCity(code: string | null | undefined, city: string): string {
  if (!code || !PLACES[code] || !city) return "";
  const c = city.trim().toLowerCase();
  for (const [region, towns] of Object.entries(PLACES[code])) {
    if (towns.some((t) => t.toLowerCase() === c)) return region;
  }
  return "";
}

/** How many first-level areas and towns we list for a country (shown in the picker). */
export function placeCounts(code?: string | null): { areas: number; towns: number } {
  const p = (code && PLACES[code]) || {};
  return { areas: Object.keys(p).length, towns: Object.values(p).reduce((n, t) => n + t.length, 0) };
}
