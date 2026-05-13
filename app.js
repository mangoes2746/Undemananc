// UndeMananc — main app logic
    // Firebase integration: auth via firebase-auth, data via Firestore
    import {
      onAuthChange, login, register, loginWithGoogle, finishGoogleRedirectLogin, logout, getDisplayName,
      reauthenticate, reauthenticateWithGoogle, deleteAccount
    } from "./auth.js";
    import {
      getFavorites, addFavorite, removeFavorite,
      getReviews as getReviewsDB, addReview, deleteUserData,
      getRestaurants, getOwnedRestaurants, saveRestaurant, createPartnerRequest, seedRestaurants,
      getRestaurantPhotos, addRestaurantPhoto
    } from "./db.js";
    import { uploadRestaurantPhoto, uploadProfilePhoto } from "./storage.js";

    // ── Restaurant seed data (used to populate Firestore on first run) ────────
    // Restaurant data sourced from publicly available listings on TripAdvisor and Google Maps.
    // Photos are from Unsplash (unsplash.com/license) — free for commercial and non-commercial use, no attribution required.
    // Coordinates from OpenStreetMap for each real address in Satu Mare.
    let restaurants = [
      {
        name: "No Pardon Pub",
        cuisine: "Pub & Bucătărie internațională",
        rating: "4.5",
        reviews: 143,
        price: "$$",
        status: "Deschis",
        tag: "Top în Satu Mare",
        category: "Restaurant",
        lat: 47.7956, lng: 22.8858,
        address: "Strada Corvinilor 11, Satu Mare",
        hours: "Deschis azi: 11:00 - 23:00",
        phone: "+40 261 768 206",
        photo: "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Cotlet de porc la grătar", "Cartofi prăjiți, salată, sos", "42 lei", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=300&q=80"],
          ["Burger clasic", "Vită, cheddar, salată, roșii", "38 lei", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"],
          ["Meniul zilei", "Supă, fel principal, desert", "35 lei", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1525268323446-0505b6fe7778?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "Le Petit Naples",
        cuisine: "Pizzerie napolitană autentică",
        rating: "4.5",
        reviews: 59,
        price: "$$",
        status: "Deschis",
        tag: "Cea mai bună pizza",
        category: "Pizza",
        lat: 47.7921, lng: 22.8812,
        address: "Strada Horea 4, Satu Mare",
        hours: "Deschis azi: 08:00 - 22:30",
        phone: "+40 261 713 579",
        photo: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Pizza Margherita", "Mozzarella fior di latte, busuioc, roșii San Marzano", "38 lei", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80"],
          ["Pizza Diavola", "Salam picant, mozzarella, ardei iute", "44 lei", "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80"],
          ["Tiramisu", "Desert italian clasic, mascarpone", "22 lei", "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "The Dome",
        cuisine: "Bucătărie europeană rafinată",
        rating: "4.4",
        reviews: 48,
        price: "$$$",
        status: "Deschis",
        tag: "Experiență premium",
        category: "Restaurant",
        lat: 47.7972, lng: 22.8791,
        address: "Strada 1 Decembrie 1918, Satu Mare",
        hours: "Deschis azi: 07:00 - 23:00",
        phone: "+40 261 710 000",
        photo: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["File de somon", "Legume la abur, sos lămâie-unt", "68 lei", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=300&q=80"],
          ["Friptură de vită", "Cartofi gratinați, sos demi-glace", "85 lei", "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80"],
          ["Cremă brûlée", "Desert clasic francez cu vanilie", "28 lei", "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "Villa Class",
        cuisine: "Bucătărie central-europeană",
        rating: "4.3",
        reviews: 87,
        price: "$$",
        status: "Deschis",
        tag: "Clasic și elegant",
        category: "Restaurant",
        lat: 47.7935, lng: 22.8843,
        address: "Strada Avram Iancu 2, Satu Mare",
        hours: "Deschis azi: 12:00 - 22:00",
        phone: "+40 261 768 100",
        photo: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Ciorbă de burtă", "Ardei, smântână, pâine proaspătă", "26 lei", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80"],
          ["Sarmale tradiționale", "Mămăligă, smântână, ardei iute", "40 lei", "https://images.unsplash.com/photo-1515516969-d4008cc6241a?auto=format&fit=crop&w=300&q=80"],
          ["Papricaș de pui", "Smântână, găluște, ardei", "38 lei", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "K10 Restaurant",
        cuisine: "Steakhouse & Bucătărie europeană",
        rating: "4.4",
        reviews: 48,
        price: "$$",
        status: "Deschis",
        tag: "Cel mai bun steak",
        category: "Restaurant",
        lat: 47.7889, lng: 22.8754,
        address: "Strada Careiului 1, Satu Mare",
        hours: "Deschis azi: 12:00 - 23:00",
        phone: "+40 261 768 010",
        photo: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Ribeye 300g", "Cartofi wedges, sos piper verde", "95 lei", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=300&q=80"],
          ["Pui la grătar", "Legume la grătar, sos chimichurri", "52 lei", "https://images.unsplash.com/photo-1598103442097-8b74394b95c3?auto=format&fit=crop&w=300&q=80"],
          ["Cheesecake New York", "Coulis de fructe de pădure", "25 lei", "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "City Bistro",
        cuisine: "Bistro european & burgeri",
        rating: "4.2",
        reviews: 44,
        price: "$$",
        status: "Deschis",
        tag: "Aproape de centru",
        category: "Burger",
        lat: 47.7919, lng: 22.8810,
        address: "Strada Horea 3, Satu Mare",
        hours: "Deschis azi: 09:00 - 22:00",
        phone: "+40 261 768 050",
        photo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Bistro Burger", "Vită Angus, cheddar, bacon, sos special", "42 lei", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"],
          ["Paste carbonara", "Pancetta, parmezan, ou, piper", "36 lei", "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=300&q=80"],
          ["Flat White", "Espresso dublu, lapte texturizat", "16 lei", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "Cosa Nostra by Al Capone",
        cuisine: "Pizzerie & Bucătărie italiană",
        rating: "4.0",
        reviews: 27,
        price: "$$",
        status: "Deschis",
        tag: "Pizza & paste",
        category: "Pizza",
        lat: 47.7948, lng: 22.8831,
        address: "Strada Maniu Iuliu 8, Satu Mare",
        hours: "Deschis azi: 12:00 - 23:00",
        phone: "+40 741 213 213",
        photo: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Pizza Quattro Stagioni", "Șuncă, ciuperci, anghinare, măsline", "46 lei", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80"],
          ["Paste Arrabiata", "Roșii, usturoi, ardei iute, busuioc", "34 lei", "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=300&q=80"],
          ["Panna cotta", "Coulis de căpșuni", "20 lei", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=300&q=80"
        ]
      },
      {
        name: "Restaurant Poesis",
        cuisine: "Bucătărie românească & internațională",
        rating: "4.3",
        reviews: 95,
        price: "$$$",
        status: "Deschis",
        tag: "Atmosferă deosebită",
        category: "Restaurant",
        lat: 47.7963, lng: 22.8876,
        address: "Strada Mircea cel Bătrân 9-11, Satu Mare",
        hours: "Deschis azi: 07:00 - 22:00",
        phone: "+40 261 767 318",
        photo: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=85",
        menu: [
          ["Ciorbă de văcuță", "Legume, smântână, pâine de casă", "28 lei", "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80"],
          ["Mușchi de vită", "Sos de vin roșu, cartofi natur", "78 lei", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=300&q=80"],
          ["Prăjitură de casă", "Tort de ciocolată, frișcă", "22 lei", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80"]
        ],
        photos: [
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=300&q=80",
          "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=300&q=80"
        ]
      }
    ];

    const osmRestaurantSources = [
      { name: "La Merișanu", amenity: "restaurant", cuisine: "regional", lat: 47.7757546, lng: 22.884389 },
      { name: "Class", amenity: "restaurant", cuisine: "regional", phone: "+40 261 715 511", lat: 47.7993658, lng: 22.871517 },
      { name: "Restaurantul Steak House", amenity: "restaurant", cuisine: "steak_house", lat: 47.7955388, lng: 22.8721411 },
      { name: "Restaurant Rigo", amenity: "restaurant", cuisine: "regional", lat: 47.8054017, lng: 22.8537747 },
      { name: "No Pardon", amenity: "restaurant", cuisine: "regional", hours: "Deschis azi: 11:30 - 23:00", lat: 47.7913432, lng: 22.8837855 },
      { name: "Borsalino", amenity: "restaurant", cuisine: "regional;pizza;burger;shawarma", phone: "+40 261 710 910", address: "Bulevardul Ion Constantin Brătianu 2, Satu Mare", lat: 47.7934232, lng: 22.8779681 },
      { name: "Pizzeria Al Capone", amenity: "restaurant", cuisine: "pizza", lat: 47.7952856, lng: 22.8729105 },
      { name: "Arezzo Bistro", amenity: "restaurant", cuisine: "italian", address: "Bulevardul Traian 8, Satu Mare", lat: 47.7930621, lng: 22.8845971 },
      { name: "KFC Shopping City", amenity: "fast_food", cuisine: "chicken", hours: "Deschis azi: 10:00 - 22:00", lat: 47.7861754, lng: 22.8711758 },
      { name: "Mesopotamia Shopping City", amenity: "fast_food", cuisine: "kebab", lat: 47.7861705, lng: 22.8713195 },
      { name: "Lean Gourmet Bakery", amenity: "restaurant", cuisine: "regional", lat: 47.793622, lng: 22.8753237 },
      { name: "Buny", amenity: "restaurant", cuisine: "regional", lat: 47.7933851, lng: 22.8783224 },
      { name: "Moara cu noroc", amenity: "restaurant", cuisine: "regional", lat: 47.7934608, lng: 22.8860452 },
      { name: "Loren'S", amenity: "restaurant", cuisine: "italian;local", phone: "+40 757 800 179", hours: "Deschis azi: 09:00 - 23:00", address: "Bulevardul Lucian Blaga 60, Satu Mare", lat: 47.7791364, lng: 22.8842152 },
      { name: "Gemeli Micro 17", amenity: "restaurant", cuisine: "pizza", lat: 47.7838647, lng: 22.8599024 },
      { name: "Bella Ciao", amenity: "restaurant", cuisine: "italian", lat: 47.7891249, lng: 22.8705909 },
      { name: "Veneția", amenity: "restaurant", cuisine: "international", lat: 47.7864828, lng: 22.8657224 },
      { name: "Terasa Miorița", amenity: "restaurant", cuisine: "regional", lat: 47.7946384, lng: 22.8769159 },
      { name: "Restaurant Pițerie La Copac", amenity: "restaurant", cuisine: "pizza", lat: 47.7883695, lng: 22.8744218 },
      { name: "ZION Brunch & Breakfast", amenity: "restaurant", cuisine: "brunch", lat: 47.7880876, lng: 22.8764313 },
      { name: "Fresh Life", amenity: "restaurant", cuisine: "healthy", lat: 47.7947816, lng: 22.877361 },
      { name: "Pizzeria Ali-Baba Terasă", amenity: "restaurant", cuisine: "pizza", lat: 47.7915022, lng: 22.8736852 },
      { name: "Pizzeria Ali-Baba Principal", amenity: "restaurant", cuisine: "pizza", lat: 47.791789, lng: 22.873777 },
      { name: "Verdi", amenity: "restaurant", cuisine: "international", lat: 47.7935909, lng: 22.8756374 },
      { name: "Restaurant LUP", amenity: "restaurant", cuisine: "international", lat: 47.7910493, lng: 22.8736361 },
      { name: "Gemeli Centru", amenity: "restaurant", cuisine: "pizza", lat: 47.7916559, lng: 22.8734726 },
      { name: "Salad Box", amenity: "restaurant", cuisine: "salad;healthy", lat: 47.7915744, lng: 22.8734565 },
      { name: "Davinci Wine&Pizza", amenity: "restaurant", cuisine: "pizza", lat: 47.7912802, lng: 22.8733902 },
      { name: "Ali-Baba Burger", amenity: "fast_food", cuisine: "burger", lat: 47.7915803, lng: 22.8736914 },
      { name: "Capricci", amenity: "restaurant", cuisine: "international", lat: 47.7860731, lng: 22.8706633 },
      { name: "RioTabak Drinks&More", amenity: "restaurant", cuisine: "bistro", address: "Piața Libertății, Satu Mare", lat: 47.7936486, lng: 22.8757954 },
      { name: "Cantină", amenity: "fast_food", cuisine: "regional", lat: 47.7740384, lng: 22.8669438 },
      { name: "KFC Careiului", amenity: "fast_food", cuisine: "chicken", hours: "Deschis azi: 09:00 - 23:00", address: "Strada Careiului 75, Satu Mare", lat: 47.7844195, lng: 22.8479649 },
      { name: "Restaurant Miorița", amenity: "restaurant", cuisine: "regional", lat: 47.7947527, lng: 22.8768732 },
      { name: "McDonald's", amenity: "fast_food", cuisine: "burger", address: "Strada Careiului 15, Satu Mare", lat: 47.7844547, lng: 22.8724835 },
      { name: "K10 Shopping City", amenity: "restaurant", cuisine: "international", lat: 47.784071, lng: 22.8741867 },
      { name: "Pizzeria Gemeli", amenity: "restaurant", cuisine: "pizza", lat: 47.7952919, lng: 22.8702043 },
      { name: "The Bull", amenity: "restaurant", cuisine: "pizza", lat: 47.7952539, lng: 22.8729255 },
      { name: "Restaurant Lorens", amenity: "restaurant", cuisine: "italian", lat: 47.7791229, lng: 22.8845287 },
      { name: "Restaurantul Pescăruș", amenity: "restaurant", cuisine: "fish;international", lat: 47.7984548, lng: 22.9011372 },
      { name: "Fresco Bistro", amenity: "restaurant", cuisine: "italian", lat: 47.784461, lng: 22.8660013 },
      { name: "Bon Appétit", amenity: "restaurant", cuisine: "international", lat: 47.7795692, lng: 22.8732594 },
      { name: "Restaurant Favorit", amenity: "restaurant", cuisine: "regional", lat: 47.7894516, lng: 22.8744322 },
      { name: "Bistro Herkules", amenity: "restaurant", cuisine: "bistro", lat: 47.790332, lng: 22.8734195 },
      { name: "Cinque Bistro", amenity: "restaurant", cuisine: "burger;pizza;seafood", phone: "+40 771 567 271", hours: "Deschis azi: 09:45 - 23:30", lat: 47.789203, lng: 22.8710802 }
    ];

    const seedAliases = new Set([
      "no-pardon",
      "le-petit-naples",
      "the-dome",
      "city-bistro",
      "k10",
      "restaurant-poesis",
      "villa-class",
      "cosa-nostra-by-al-capone"
    ]);

    const hiddenRestaurantIds = new Set([
      "sala-evenimente-monte-carlo",
      "sala-evenimente-esedra",
      "sala-evenimente-simfonia"
    ]);

    const fallbackPhotoSets = {
      Restaurant: [
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1537047902294-62a40c20a6ae?auto=format&fit=crop&q=85"
      ],
      Pizza: [
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&q=85"
      ],
      Burger: [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&q=85"
      ],
      Shaorma: [
        "https://images.unsplash.com/photo-1649789971531-59ea9b8e3935?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=85"
      ],
      FastFood: [
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&q=85"
      ],
      Healthy: [
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=85"
      ],
      Italian: [
        "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1528137871618-79d2761e3fd5?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&q=85"
      ],
      Seafood: [
        "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1559737558-2f5a35f4523b?auto=format&fit=crop&q=85"
      ],
      Brunch: [
        "https://images.unsplash.com/photo-1493770348161-369560ae357d?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=85",
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=85"
      ]
    };

    function buildSeedRestaurant(source) {
      const cuisine = String(source.cuisine || "").toLowerCase();
      const category = source.amenity === "fast_food"
        ? "FastFood"
        : cuisine.includes("pizza")
        ? "Pizza"
        : cuisine.includes("burger")
          ? "Burger"
          : cuisine.includes("kebab") || cuisine.includes("shawarma")
            ? "Shaorma"
            : cuisine.includes("healthy") || cuisine.includes("salad")
              ? "Desert"
              : cuisine.includes("bistro") || source.name.toLowerCase().includes("bistro")
                ? "Burger"
                : "Restaurant";
      const photoSet = photoSetFor(source, category);
      const photo = sizedPhoto(choosePhoto(photoSet, source.name), 1000);
      const readableCuisine = formatCuisine(source.cuisine, source.amenity);

      return {
        name: source.name,
        cuisine: readableCuisine,
        rating: source.amenity === "fast_food" ? "4.2" : "4.3",
        reviews: source.amenity === "fast_food" ? 32 : 46,
        price: source.amenity === "fast_food" ? "$" : "$$",
        status: "Deschis",
        tag: source.amenity === "fast_food" ? "Fast food" : "Local Satu Mare",
        category,
        lat: source.lat,
        lng: source.lng,
        address: source.address || "Satu Mare",
        hours: source.hours || "Program disponibil la local",
        phone: source.phone || "Telefon indisponibil",
        photo,
        menu: fallbackMenu(category),
        photos: galleryPhotos(photoSet, source.name),
        features: {
          delivery: source.amenity === "fast_food" || ["Pizza", "Burger", "Shaorma"].includes(category),
          takeaway: true,
          reservations: source.amenity !== "fast_food",
          terrace: false,
          card: true
        }
      };
    }

    function photoSetFor(source, category) {
      const cuisine = String(source.cuisine || "").toLowerCase();
      if (cuisine.includes("italian")) return fallbackPhotoSets.Italian;
      if (cuisine.includes("fish") || cuisine.includes("seafood")) return fallbackPhotoSets.Seafood;
      if (cuisine.includes("brunch")) return fallbackPhotoSets.Brunch;
      if (cuisine.includes("healthy") || cuisine.includes("salad")) return fallbackPhotoSets.Healthy;
      return fallbackPhotoSets[category] || fallbackPhotoSets.Restaurant;
    }

    function hashString(value) {
      return [...String(value)].reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0);
    }

    function choosePhoto(photos, seed, offset = 0) {
      const index = Math.abs(hashString(seed) + offset) % photos.length;
      return photos[index];
    }

    function sizedPhoto(url, width) {
      return `${url}&w=${width}`;
    }

    function galleryPhotos(photos, seed) {
      return [0, 1, 2].map(offset => sizedPhoto(choosePhoto(photos, seed, offset), 300));
    }

    function formatCuisine(cuisine, amenity) {
      const labels = {
        regional: "Bucătărie locală",
        steak_house: "Steakhouse",
        italian: "Bucătărie italiană",
        chicken: "Pui & fast food",
        kebab: "Kebab & shaorma",
        local: "Bucătărie locală",
        international: "Bucătărie internațională",
        brunch: "Brunch & breakfast",
        healthy: "Mâncare sănătoasă",
        salad: "Salate",
        events: "Restaurant evenimente",
        fish: "Pește & internațional",
        bistro: "Bistro"
      };
      const parts = String(cuisine || "")
        .split(/[;_]/)
        .map(part => labels[part] || part)
        .filter(Boolean);
      if (parts.length) return [...new Set(parts)].join(" & ");
      return amenity === "fast_food" ? "Fast food" : "Restaurant";
    }

    function fallbackMenu(category) {
      if (category === "Pizza") {
        return [
          ["Pizza casei", "Mozzarella, sos de roșii, toppinguri la alegere", "42 lei", "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80"],
          ["Paste", "Sos cremos, parmezan, verdețuri", "36 lei", "https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=300&q=80"],
          ["Desert", "Desert pregătit în casă", "22 lei", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80"]
        ];
      }
      if (category === "Burger" || category === "FastFood") {
        return [
          ["Burger", "Chiflă, carne, salată, sosul casei", "35 lei", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80"],
          ["Cartofi prăjiți", "Porție crocantă cu sos", "15 lei", "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80"],
          ["Meniu rapid", "Fel principal, garnitură, băutură", "39 lei", "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80"]
        ];
      }
      if (category === "Shaorma") {
        return [
          ["Shaorma la lipie", "Carne, cartofi, salate, sosuri", "28 lei", "https://images.unsplash.com/photo-1649789971531-59ea9b8e3935?auto=format&fit=crop&w=300&q=80"],
          ["Kebab", "Carne condimentată, legume, sos", "30 lei", "https://images.unsplash.com/photo-1633321702518-7feccafb94d5?auto=format&fit=crop&w=300&q=80"],
          ["Meniu shaorma", "Shaorma, cartofi, băutură", "38 lei", "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=300&q=80"]
        ];
      }
      if (category === "Desert") {
        return [
          ["Salată fresh", "Legume, proteine, dressing", "32 lei", "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=300&q=80"],
          ["Sandwich", "Pâine proaspătă, ingrediente la alegere", "24 lei", "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80"],
          ["Smoothie", "Fructe proaspete, iaurt", "18 lei", "https://images.unsplash.com/photo-1502741224143-90386d7f8c82?auto=format&fit=crop&w=300&q=80"]
        ];
      }
      return [
        ["Meniul zilei", "Supă, fel principal, garnitură", "35 lei", "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=300&q=80"],
        ["Specialitatea casei", "Preparat recomandat de bucătărie", "48 lei", "https://images.unsplash.com/photo-1432139555190-58524dae6a55?auto=format&fit=crop&w=300&q=80"],
        ["Desert de casă", "Prăjitură sau desert sezonier", "22 lei", "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80"]
      ];
    }

    restaurants = [
      ...restaurants,
      ...osmRestaurantSources
        .filter(source => !seedAliases.has(slugify(source.name)))
        .map(buildSeedRestaurant)
    ];

    function visibleRestaurants(items) {
      return items.filter(item => !hiddenRestaurantIds.has(item.id || slugify(item.name)));
    }

    restaurants = normalizeRestaurants(visibleRestaurants(restaurants));

    const views = {
      home: document.querySelector("#homeView"),
      search: document.querySelector("#searchView"),
      detail: document.querySelector("#detailView"),
      favorites: document.querySelector("#favoritesView"),
      profile: document.querySelector("#profileView")
    };
    const list = document.querySelector("#restaurantList");
    const favoriteList = document.querySelector("#favoriteList");
    const mapView = document.querySelector("#mapView");
    const search = document.querySelector("#search");
    const navButtons = [...document.querySelectorAll(".nav [data-tab]")];
    const chips = [...document.querySelectorAll(".chip")];
    const favorites = new Set();
    let currentCategory = "Toate";
    let currentRestaurant = restaurants[0];
    let currentUser = null; // Firebase user object
    let ownedRestaurants = [];
    let restaurantMap = null;
    let restaurantMarkerLayer = null;
    let restaurantMapMarkers = [];
    let userLocationMarker = null;
    let userAccuracyCircle = null;
    let activeRouteRestaurant = null;
    let routeLine = null;
    let routeStatusControl = null;
    let routeRequestId = 0;
    let lastRouteOrigin = null;
    let lastMapSignature = "";
    let pendingMapFocusRestaurant = null;
    const filters = {
      openNow: false,
      dailyMenu: false,
      delivery: false,
      takeaway: false,
      price: "all",
      sort: "smart",
      viewMode: "list"
    };

    function slugify(value) {
      return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }

    function normalizeRestaurants(items) {
      return items.map(item => ({
        ...item,
        id: item.id || slugify(item.name),
        menu: (item.menu || []).map(menuItem => Array.isArray(menuItem)
          ? menuItem
          : [menuItem.name, menuItem.desc, menuItem.price, menuItem.img]),
        features: {
          delivery: item.features?.delivery ?? ["Pizza", "Burger", "Shaorma"].includes(item.category),
          takeaway: item.features?.takeaway ?? true,
          reservations: item.features?.reservations ?? item.category === "Restaurant",
          terrace: item.features?.terrace ?? false,
          card: item.features?.card ?? true
        },
        dailyOffer: item.dailyOffer || inferDailyOffer(item),
        ownerId: item.ownerId || null,
        distance: item.distance || "—",
        _distMetres: item._distMetres ?? Infinity
      }));
    }

    function inferDailyOffer(item) {
      const menuItem = (item.menu || []).find(entry => {
        const name = Array.isArray(entry) ? entry[0] : entry.name;
        return String(name || "").toLowerCase().includes("meniu");
      });
      if (!menuItem) return null;
      const [title, description, price] = Array.isArray(menuItem)
        ? menuItem
        : [menuItem.name, menuItem.desc, menuItem.price];
      return { title, description, price, active: true };
    }

    function restaurantKey(restaurant) {
      return restaurant.id || slugify(restaurant.name);
    }

    function withTimeout(promise, ms = 3500) {
      return Promise.race([
        promise,
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Operațiunea a durat prea mult.")), ms);
        })
      ]);
    }

    // ── Auth helpers ──────────────────────────────────────────────────────────
    function isLoggedIn() {
      return !!currentUser;
    }

    let _loginCallback = null;

    function requireLogin(reason, callback) {
      if (isLoggedIn()) { callback(); return; }
      _loginCallback = callback;
      document.querySelector("#loginModalDesc").textContent = reason;
      document.querySelector("#authError").style.display = "none";
      document.querySelector("#authLoading").style.display = "none";
      document.querySelector("#loginModal").hidden = false;
    }

    async function finishAuth(user) {
      currentUser = user;
      await loadUserFavorites();
      loadProfile();
      renderAuthSection();
      renderOwnerSection();
      renderList();
      renderFavorites();
      document.querySelector("#loginModal").hidden = true;
      if (_loginCallback) { await _loginCallback(); _loginCallback = null; }
    }

    // ── Auth modal logic ──────────────────────────────────────────────────────
    let authMode = "login"; // "login" | "register"

    document.querySelectorAll(".auth-tab").forEach(btn => {
      btn.addEventListener("click", () => {
        authMode = btn.dataset.authTab;
        document.querySelectorAll(".auth-tab").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        document.querySelector("#authFormLogin").style.display = authMode === "login" ? "grid" : "none";
        document.querySelector("#authFormRegister").style.display = authMode === "register" ? "grid" : "none";
        document.querySelector("#loginConfirmBtn").textContent = authMode === "login" ? "Intră în cont" : "Creează cont";
        document.querySelector("#authError").style.display = "none";
      });
    });

    document.querySelector("#loginCancelBtn").addEventListener("click", () => {
      document.querySelector("#loginModal").hidden = true;
      _loginCallback = null;
    });

    document.querySelector("#loginModal").addEventListener("click", e => {
      if (e.target === document.querySelector("#loginModal")) {
        document.querySelector("#loginModal").hidden = true;
        _loginCallback = null;
      }
    });

    document.querySelector("#loginConfirmBtn").addEventListener("click", async () => {
      const errorEl = document.querySelector("#authError");
      const loadingEl = document.querySelector("#authLoading");
      errorEl.style.display = "none";
      loadingEl.style.display = "block";
      document.querySelector("#loginConfirmBtn").disabled = true;

      try {
        if (authMode === "login") {
          const email = document.querySelector("#loginEmail").value.trim();
          const password = document.querySelector("#loginPassword").value;
          if (!email || !password) throw new Error("Completează email-ul și parola.");
          currentUser = await login(email, password);
        } else {
          const name = document.querySelector("#registerName").value.trim();
          const email = document.querySelector("#registerEmail").value.trim();
          const password = document.querySelector("#registerPassword").value;
          if (!name) throw new Error("Introdu numele tău.");
          if (!email) throw new Error("Introdu adresa de email.");
          if (password.length < 6) throw new Error("Parola trebuie să aibă cel puțin 6 caractere.");
          currentUser = await register(name, email, password);
        }
        await finishAuth(currentUser);
      } catch (err) {
        const msg = firebaseErrorMessage(err.code || err.message);
        errorEl.textContent = msg;
        errorEl.style.display = "block";
      } finally {
        loadingEl.style.display = "none";
        document.querySelector("#loginConfirmBtn").disabled = false;
      }
    });

    document.querySelector("#googleLoginBtn").addEventListener("click", async () => {
      const errorEl = document.querySelector("#authError");
      const loadingEl = document.querySelector("#authLoading");
      const googleBtn = document.querySelector("#googleLoginBtn");

      errorEl.style.display = "none";

      if (location.hostname === "127.0.0.1") {
        const localUrl = new URL(location.href);
        localUrl.hostname = "localhost";
        location.href = localUrl.toString();
        return;
      }

      loadingEl.style.display = "block";
      googleBtn.disabled = true;

      try {
        const user = await loginWithGoogle();
        if (user) await finishAuth(user);
      } catch (err) {
        if (err.code !== "auth/popup-closed-by-user") {
          errorEl.textContent = firebaseErrorMessage(err.code || err.message);
          errorEl.style.display = "block";
        }
      } finally {
        loadingEl.style.display = "none";
        googleBtn.disabled = false;
      }
    });

    function firebaseErrorMessage(code) {
      const map = {
        "auth/user-not-found": "Nu există un cont cu acest email.",
        "auth/wrong-password": "Parolă incorectă.",
        "auth/email-already-in-use": "Există deja un cont cu acest email.",
        "auth/invalid-email": "Adresă de email invalidă.",
        "auth/weak-password": "Parola este prea slabă.",
        "auth/too-many-requests": "Prea multe încercări. Încearcă mai târziu.",
        "auth/invalid-credential": "Email sau parolă incorectă.",
        "auth/requires-recent-login": "Pentru siguranță, reconectează-te și încearcă din nou.",
        "auth/account-exists-with-different-credential": "Există deja un cont cu acest email. Intră cu metoda folosită inițial.",
        "auth/popup-blocked": "Browserul a blocat fereastra Google. Te redirecționăm către conectarea Google.",
        "auth/cancelled-popup-request": "Conectarea Google a fost anulată. Încearcă din nou.",
        "auth/unauthorized-domain": "Domeniul curent nu este autorizat pentru Google Auth. Pentru local folosește localhost; pentru producție adaugă domeniul în Firebase Console.",
      };
      return map[code] || code || "A apărut o eroare. Încearcă din nou.";
    }

    const icons = {
      star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3.1 1.1-6.4-4.7-4.6 6.5-.9L12 2.8Z"/></svg>',
      pin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 21s7-5.05 7-11a7 7 0 1 0-14 0c0 5.95 7 11 7 11Z" stroke="currentColor" stroke-width="2"/><path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" stroke-width="2"/></svg>',
      heart: '<svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 5.9a5.4 5.4 0 0 0-7.6 0L12 7.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
      route: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 19c3-6 9 0 12-6 1.3-2.6-.4-5-3-5H8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="m10 4-4 4 4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      phone: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.6 19.6 0 0 1-8.5-3A19.3 19.3 0 0 1 3 10.7 19.6 19.6 0 0 1 0 2.2 2 2 0 0 1 2 0h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L6 7.9a16 16 0 0 0 10.1 10.1l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" transform="translate(1 1)" stroke="currentColor" stroke-width="2"/></svg>'
    };

    function saveFavorites() {
      // no-op: favorites are saved to Firestore in toggleFavorite
    }

    function showView(name) {
      Object.values(views).forEach(view => view.classList.remove("active"));
      views[name].classList.add("active");
      navButtons.forEach(button => {
        const tab = button.dataset.tab;
        button.classList.toggle("active",
          tab === name ||
          (name === "detail" && tab === "home") ||
          (name === "search" && tab === "search")
        );
      });
      views[name].scrollTop = 0;
    }

    function matches(restaurant) {
      const query = search.value.trim().toLowerCase();
      const categoryMatch = currentCategory === "Toate"
        || restaurant.category === currentCategory
        || restaurant.cuisine.toLowerCase().includes(currentCategory.toLowerCase())
        || (currentCategory === "Desert" && restaurant.cuisine.toLowerCase().includes("desert"))
        || (currentCategory === "Meniul zilei" && restaurant.menu.some(([name]) => name.toLowerCase().includes("meniu")));
      const text = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category} ${restaurant.menu.map(item => item[0]).join(" ")} ${restaurant.dailyOffer?.title || ""}`.toLowerCase();
      return categoryMatch
        && (!query || text.includes(query))
        && (!filters.openNow || isRestaurantOpen(restaurant))
        && (!filters.dailyMenu || restaurant.dailyOffer?.active)
        && (!filters.delivery || restaurant.features?.delivery)
        && (!filters.takeaway || restaurant.features?.takeaway)
        && (filters.price === "all" || restaurant.price === filters.price);
    }

    function filteredRestaurants() {
      return restaurants
        .filter(matches)
        .sort((a, b) => {
          if (filters.sort === "distance") return a._distMetres - b._distMetres;
          if (filters.sort === "rating") return parseRating(b.rating) - parseRating(a.rating);
          if (filters.sort === "price") return a.price.length - b.price.length || parseRating(b.rating) - parseRating(a.rating);
          return smartScore(b) - smartScore(a);
        });
    }

    function smartScore(restaurant) {
      return parseRating(restaurant.rating) * 20
        + Math.min(Number(restaurant.reviews || 0), 200) / 10
        + (restaurant.dailyOffer?.active ? 8 : 0)
        + (restaurant.features?.delivery ? 3 : 0)
        - (restaurant._distMetres === Infinity ? 0 : restaurant._distMetres / 1000);
    }

    function parseRating(value) {
      const rating = Number(value);
      return Number.isFinite(rating) ? rating : 0;
    }

    function isRestaurantOpen(restaurant) {
      return restaurant.status === "Deschis";
    }

    function cardTemplate(restaurant) {
      const key = restaurantKey(restaurant);
      const active = favorites.has(key) ? " active" : "";
      const offer = restaurant.dailyOffer?.active
        ? `<span class="dot"></span><span>${restaurant.dailyOffer.price}</span>`
        : "";
      return `
        <article class="card" data-name="${restaurant.name}" tabindex="0" role="button" aria-label="Deschide ${restaurant.name}">
          <img src="${restaurant.photo}" alt="${restaurant.name}">
          <span class="tag">${icons.star}${restaurant.dailyOffer?.active ? "Meniul zilei" : restaurant.tag}</span>
          <button class="heart${active}" type="button" data-favorite="${key}" aria-label="Salvează ${restaurant.name}">${icons.heart}</button>
          <div class="card-body">
            <h2>${restaurant.name}</h2>
            <div class="subtitle">${restaurant.dailyOffer?.active ? restaurant.dailyOffer.title : restaurant.cuisine}</div>
            <div class="meta">
              <span>${icons.star}<strong>${restaurant.rating}</strong> (${restaurant.reviews})</span>
              <span class="dot"></span>
              <span>${restaurant.price}</span>
              ${offer}
              <span class="dot"></span>
              <span>${icons.pin}<span data-distance-key="${key}">${restaurant.distance}</span></span>
              <span class="dot"></span>
              <span class="status">${restaurant.status}</span>
            </div>
          </div>
        </article>
      `;
    }

    function renderList() {
      const filtered = filteredRestaurants();
      list.innerHTML = filtered.length
        ? filtered.map(cardTemplate).join("")
        : '<div class="empty">Nu am găsit restaurante pentru această căutare.</div>';
      list.hidden = filters.viewMode !== "list";
      mapView.hidden = filters.viewMode !== "map";
      if (filters.viewMode === "map") renderMap(filtered);
    }

    function renderMap(items) {
      if (!mapView) return;
      if (!items.length) {
        mapView.innerHTML = '<div class="empty" style="margin:18px">Nu există restaurante pentru hartă.</div>';
        restaurantMap = null;
        restaurantMarkerLayer = null;
        restaurantMapMarkers = [];
        return;
      }

      const validItems = items.filter(item => Number.isFinite(Number(item.lat)) && Number.isFinite(Number(item.lng)));
      if (!validItems.length) {
        mapView.innerHTML = '<div class="empty" style="margin:18px">Nu există coordonate pentru hartă.</div>';
        return;
      }

      const Leaflet = window.L;
      if (!Leaflet) {
        mapView.innerHTML = '<div class="empty" style="margin:18px">Harta nu s-a putut încărca. Verifică conexiunea la internet.</div>';
        return;
      }

      if (!restaurantMap) {
        mapView.innerHTML = "";
        restaurantMap = Leaflet.map(mapView, {
          zoomControl: true,
          attributionControl: false
        }).setView([47.792, 22.876], 13);
        restaurantMap.getContainer().style.clipPath = "inset(0 round 28px)";

        Leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: "© OpenStreetMap"
        }).addTo(restaurantMap);
        Leaflet.control.attribution({ prefix: false }).addAttribution("© OpenStreetMap").addTo(restaurantMap);
        restaurantMarkerLayer = Leaflet.layerGroup().addTo(restaurantMap);
        routeStatusControl = Leaflet.control({ position: "bottomleft" });
        routeStatusControl.onAdd = () => {
          const panel = Leaflet.DomUtil.create("div", "route-status-panel");
          panel.hidden = true;
          return panel;
        };
        routeStatusControl.addTo(restaurantMap);
        restaurantMap.on("zoomend", updateMapLabels);
      }

      restaurantMap.invalidateSize();
      const signature = validItems.map(item => restaurantKey(item)).join("|");
      if (signature !== lastMapSignature) {
        restaurantMarkerLayer.clearLayers();
        restaurantMapMarkers = validItems.map(restaurant => {
          const marker = Leaflet.marker([restaurant.lat, restaurant.lng], {
            icon: Leaflet.divIcon({
              className: "",
              html: '<div class="restaurant-map-pin"></div>',
              iconSize: [22, 22],
              iconAnchor: [11, 22],
              popupAnchor: [0, -22],
              tooltipAnchor: [0, -24]
            })
          });
          marker.bindTooltip(restaurant.name, {
            permanent: true,
            direction: "top",
            className: "restaurant-map-label"
          });
          marker._restaurantKey = restaurantKey(restaurant);
          marker.bindPopup(mapPopupHtml(restaurant));
          marker.on("click", () => renderDetail(restaurant));
          marker.addTo(restaurantMarkerLayer);
          return marker;
        });

        const bounds = Leaflet.latLngBounds(validItems.map(item => [item.lat, item.lng]));
        restaurantMap.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
        lastMapSignature = signature;
      }
      if (pendingMapFocusRestaurant) {
        focusRestaurantOnMap(pendingMapFocusRestaurant);
        pendingMapFocusRestaurant = null;
      }
      updateMapLabels();
      updateUserLocationOnMap();
    }

    function updateRouteStatus(message, detail = "") {
      const panel = routeStatusControl?.getContainer?.();
      if (!panel) return;
      panel.hidden = !message;
      panel.innerHTML = message
        ? `<strong>${message}</strong>${detail ? `<span>${detail}</span>` : ""}`
        : "";
    }

    function formatRouteDistance(metres) {
      if (!Number.isFinite(metres)) return "";
      return metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`;
    }

    function formatRouteDuration(seconds) {
      if (!Number.isFinite(seconds)) return "";
      const minutes = Math.max(1, Math.round(seconds / 60));
      if (minutes < 60) return `${minutes} min`;
      const hours = Math.floor(minutes / 60);
      const rest = minutes % 60;
      return rest ? `${hours} h ${rest} min` : `${hours} h`;
    }

    function setViewMode(mode) {
      filters.viewMode = mode;
      document.querySelectorAll("[data-view-mode]").forEach(item => {
        item.classList.toggle("active", item.dataset.viewMode === mode);
      });
      renderList();
    }

    function openRestaurantOnMap(restaurant) {
      pendingMapFocusRestaurant = restaurant;
      activeRouteRestaurant = restaurant;
      lastRouteOrigin = null;
      currentCategory = "Toate";
      chips.forEach(chip => chip.classList.toggle("active", chip.dataset.category === "Toate"));
      search.value = "";
      showView("home");
      setViewMode("map");
      requestAnimationFrame(() => {
        focusRestaurantOnMap(restaurant);
        startRouteToRestaurant(restaurant);
      });
    }

    function focusRestaurantOnMap(restaurant) {
      if (!restaurantMap || !restaurant || !Number.isFinite(Number(restaurant.lat)) || !Number.isFinite(Number(restaurant.lng))) return;
      restaurantMap.setView([restaurant.lat, restaurant.lng], Math.max(restaurantMap.getZoom(), 17), { animate: true });
      const marker = restaurantMapMarkers.find(item => {
        const pos = item.getLatLng();
        return Math.abs(pos.lat - restaurant.lat) < 0.000001 && Math.abs(pos.lng - restaurant.lng) < 0.000001;
      });
      marker?.openPopup();
      updateMapLabels();
    }

    function openRestaurantMarkerPopup(restaurant) {
      const marker = restaurantMapMarkers.find(item => {
        const pos = item.getLatLng();
        return Math.abs(pos.lat - restaurant.lat) < 0.000001 && Math.abs(pos.lng - restaurant.lng) < 0.000001;
      });
      marker?.openPopup();
      updateMapLabels();
    }

    async function startRouteToRestaurant(restaurant) {
      activeRouteRestaurant = restaurant;
      if (!restaurantMap) return;
      if (!Number.isFinite(Number(restaurant.lat)) || !Number.isFinite(Number(restaurant.lng))) {
        updateRouteStatus("Nu avem coordonate pentru traseu.");
        return;
      }
      if (userLat === null || userLng === null) {
        updateRouteStatus("Activează GPS pentru traseu", "Îți vom calcula ruta imediat ce locația este disponibilă.");
        requestGps({ recenter: true });
        return;
      }
      await drawRouteToRestaurant(restaurant);
    }

    async function drawRouteToRestaurant(restaurant) {
      if (!restaurantMap || userLat === null || userLng === null || !window.L) return;
      const origin = { lat: userLat, lng: userLng };
      if (lastRouteOrigin && haversine(lastRouteOrigin.lat, lastRouteOrigin.lng, origin.lat, origin.lng) < 25) return;
      lastRouteOrigin = origin;

      const requestId = ++routeRequestId;
      updateRouteStatus("Se calculează traseul...", restaurant.name);
      const url = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${restaurant.lng},${restaurant.lat}?overview=full&geometries=geojson&steps=false`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Routing failed");
        const data = await response.json();
        if (requestId !== routeRequestId) return;
        const route = data.routes?.[0];
        if (!route?.geometry?.coordinates?.length) throw new Error("No route");

        const Leaflet = window.L;
        const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        if (routeLine) routeLine.remove();
        routeLine = Leaflet.polyline(latLngs, {
          color: "#1d8cff",
          weight: 6,
          opacity: 0.88,
          lineCap: "round",
          lineJoin: "round"
        }).addTo(restaurantMap);

        const bounds = Leaflet.latLngBounds([[userLat, userLng], [restaurant.lat, restaurant.lng], ...latLngs]);
        restaurantMap.fitBounds(bounds, { padding: [34, 34], maxZoom: 17 });
        openRestaurantMarkerPopup(restaurant);
        updateRouteStatus(
          `Traseu spre ${restaurant.name}`,
          `${formatRouteDistance(route.distance)} · ${formatRouteDuration(route.duration)}`
        );
      } catch (error) {
        console.warn("Route could not be loaded.", error);
        updateRouteStatus("Nu am putut calcula ruta", "Încearcă din nou sau verifică conexiunea.");
      }
    }

    function updateMapLabels() {
      if (!restaurantMap) return;
      const showLabels = restaurantMap.getZoom() >= 16;
      restaurantMapMarkers.forEach(marker => {
        if (showLabels) marker.openTooltip();
        else marker.closeTooltip();
      });
    }

    function mapPopupHtml(restaurant) {
      return `<p class="restaurant-map-popup">${restaurant.name}<span>${restaurant.distance} · ${restaurant.rating}</span></p>`;
    }

    function updateDistanceDisplays() {
      document.querySelectorAll("[data-distance-key]").forEach(node => {
        const restaurant = restaurants.find(item => restaurantKey(item) === node.dataset.distanceKey);
        if (restaurant) node.textContent = restaurant.distance;
      });

      restaurantMapMarkers.forEach(marker => {
        const restaurant = restaurants.find(item => restaurantKey(item) === marker._restaurantKey);
        if (restaurant) marker.setPopupContent(mapPopupHtml(restaurant));
      });
    }

    function updateUserLocationOnMap() {
      if (!restaurantMap || userLat === null || userLng === null || !window.L) return;
      const Leaflet = window.L;
      const latLng = [userLat, userLng];
      const heading = Number.isFinite(Number(userHeading)) ? Number(userHeading) : 0;

      if (!userLocationMarker) {
        userLocationMarker = Leaflet.marker(latLng, {
          zIndexOffset: 1000,
          icon: Leaflet.divIcon({
            className: "",
            html: `<div class="user-location-marker" style="--heading:${heading}deg"><span></span></div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          })
        }).addTo(restaurantMap);
      } else {
        userLocationMarker.setLatLng(latLng);
        userLocationMarker.setIcon(Leaflet.divIcon({
          className: "",
          html: `<div class="user-location-marker" style="--heading:${heading}deg"><span></span></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 20]
        }));
      }

      if (Number.isFinite(Number(userAccuracy))) {
        if (!userAccuracyCircle) {
          userAccuracyCircle = Leaflet.circle(latLng, {
            radius: userAccuracy,
            color: "#1d8cff",
            weight: 1,
            fillColor: "#1d8cff",
            fillOpacity: 0.12,
            interactive: false
          }).addTo(restaurantMap);
        } else {
          userAccuracyCircle.setLatLng(latLng);
          userAccuracyCircle.setRadius(userAccuracy);
        }
      }
    }

    function renderFavorites() {
      if (!isLoggedIn()) {
        favoriteList.innerHTML = `
          <div class="auth-gate">
            <div class="auth-gate-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 5.9a5.4 5.4 0 0 0-7.6 0L12 7.1l-1.2-1.2a5.4 5.4 0 1 0-7.6 7.6L12 22l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
            </div>
            <h2>Salvează favorite</h2>
            <p>Conectează-te pentru a salva restaurantele preferate și a le accesa oricând.</p>
            <button class="cta primary" type="button" id="favLoginBtn" style="width:100%;margin-top:4px">Conectează-te</button>
          </div>`;
        document.querySelector("#favLoginBtn").addEventListener("click", () => {
          requireLogin("Conectează-te pentru a salva favorite.", () => renderFavorites());
        });
        return;
      }
      const saved = restaurants.filter(restaurant => favorites.has(restaurantKey(restaurant)));
      favoriteList.innerHTML = saved.length
        ? saved.map(cardTemplate).join("")
        : '<div class="empty">Nu ai restaurante favorite încă.</div>';
    }

    function renderDetail(restaurant) {
      currentRestaurant = restaurant;
      const key = restaurantKey(restaurant);
      const isFavorite = favorites.has(key);
      const photos = restaurant.photos || [];
      views.detail.innerHTML = `
        <div class="hero">
          <img src="${restaurant.photo}" alt="${restaurant.name}">
          <div class="detail-actions">
            <button class="round" type="button" data-back aria-label="Înapoi">
              <svg width="23" height="23" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m15 18-6-6 6-6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button class="round heart ${isFavorite ? "active" : ""}" type="button" data-favorite="${key}" aria-label="Favorite">${icons.heart}</button>
          </div>
        </div>
        <div class="detail-content">
          <div class="detail-panel">
            <div class="detail-title">
              <div>
                <h1>${restaurant.name}</h1>
                <div class="subtitle">${restaurant.cuisine}</div>
              </div>
              <span class="pill">${icons.star}${restaurant.rating} (${restaurant.reviews})</span>
            </div>

            <div class="info-grid">
              <div class="info">${icons.pin}<span><span data-distance-key="${key}">${restaurant.distance}</span> de tine</span></div>
              <div class="info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5 12 3l8 7.5V21H4V10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg><span>${restaurant.address}</span></div>
              <div class="info"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>${restaurant.hours}</span></div>
              <div class="info">${icons.phone}<span>${restaurant.phone}</span></div>
            </div>

            <div class="cta-grid">
              <button class="cta primary" type="button" data-route="${restaurant.name}">${icons.route}Vezi traseul</button>
              <button class="cta" type="button" data-call="${restaurant.phone}">${icons.phone}Sună restaurantul</button>
              <button class="cta wide" type="button" data-favorite="${key}">${icons.heart}${isFavorite ? "Salvat la favorite" : "Salvează la favorite"}</button>
            </div>

            <div class="tabs" role="tablist" aria-label="Detalii restaurant">
              <button class="tab active" type="button" data-tab-target="photos">Poze</button>
              <button class="tab" type="button" data-tab-target="reviews">Recenzii</button>
            </div>

            <div id="tabPhotos">
            <div class="section-title">
              <h2>Poze</h2>
              <span id="photoCount">${photos.length} poze</span>
            </div>
            <div class="photo-actions">
              <button class="cta small" type="button" data-add-photo="${key}">Adaugă poză</button>
              <input id="restaurantPhotoInput" type="file" accept="image/*" hidden>
              <span id="restaurantPhotoStatus">Doar poze făcute de tine sau pe care ai dreptul să le încarci.</span>
            </div>
            <div class="photos" id="restaurantPhotosGrid">
              ${photosTemplate(restaurant)}
            </div>
            </div>

            <div id="tabReviews" hidden>
            <div class="empty" style="margin-top:12px">Se încarcă recenziile...</div>
            </div>
          </div>
        </div>
      `;
      showView("detail");
      syncRestaurantPhotos(restaurant);

      // Tab switching
      const tabBtns = [...views.detail.querySelectorAll(".tab")];
      const tabPanels = {
        photos: views.detail.querySelector("#tabPhotos"),
        reviews: views.detail.querySelector("#tabReviews")
      };
      let reviewsLoaded = false;
      tabBtns.forEach(btn => {
        btn.addEventListener("click", async () => {
          tabBtns.forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          Object.values(tabPanels).forEach(p => p.hidden = true);
          tabPanels[btn.dataset.tabTarget].hidden = false;
          if (btn.dataset.tabTarget === "reviews" && !reviewsLoaded) {
            reviewsLoaded = true;
            tabPanels.reviews.innerHTML = await reviewsHtml(restaurantKey(restaurant));
            bindReviewsTab(restaurant);
          }
        });
      });

      const photoInput = views.detail.querySelector("#restaurantPhotoInput");
      const photoStatus = views.detail.querySelector("#restaurantPhotoStatus");
      photoInput?.addEventListener("change", () => addCustomerPhoto(restaurant, photoInput, photoStatus));
    }

    function photosTemplate(restaurant) {
      const photos = restaurant.photos || [];
      return photos.length
        ? photos.map((photo, index) => `<img src="${photo}" alt="${restaurant.name} poza ${index + 1}">`).join("")
        : '<div class="empty photo-empty">Nu sunt poze încă.</div>';
    }

    function renderPhotoGrid(restaurant) {
      const grid = views.detail.querySelector("#restaurantPhotosGrid");
      const count = views.detail.querySelector("#photoCount");
      if (!grid || !count) return;
      grid.innerHTML = photosTemplate(restaurant);
      const total = restaurant.photos?.length || 0;
      count.textContent = `${total} ${total === 1 ? "poză" : "poze"}`;
    }

    async function syncRestaurantPhotos(restaurant) {
      try {
        const uploadedPhotos = await withTimeout(getRestaurantPhotos(restaurantKey(restaurant)), 3500);
        if (restaurantKey(currentRestaurant) !== restaurantKey(restaurant)) return;
        const urls = uploadedPhotos.map(photo => photo.url).filter(Boolean);
        restaurant.photos = [...new Set([...(restaurant.photos || []), ...urls])];
        renderPhotoGrid(restaurant);
      } catch (error) {
        console.warn("Customer photos could not be loaded.", error);
      }
    }

    async function addCustomerPhoto(restaurant, input, status) {
      const file = input.files?.[0];
      if (!file) return;
      if (!currentUser) {
        input.value = "";
        requireLogin("Conectează-te pentru a încărca poze făcute de tine.", () => renderDetail(restaurant));
        return;
      }

      status.textContent = "Se încarcă poza...";
      try {
        const key = restaurantKey(restaurant);
        const url = await uploadRestaurantPhoto(currentUser.uid, key, file);
        await addRestaurantPhoto(currentUser.uid, getDisplayName(currentUser), key, url);
        restaurant.photos = [url, ...(restaurant.photos || [])].slice(0, 12);
        const index = restaurants.findIndex(item => restaurantKey(item) === key);
        if (index >= 0) restaurants[index].photos = restaurant.photos;
        renderPhotoGrid(restaurant);
        status.textContent = "Poza a fost adăugată.";
      } catch (error) {
        console.error(error);
        status.textContent = error.message || "Nu am putut încărca poza.";
      } finally {
        input.value = "";
      }
    }

    function toggleFavorite(key) {
      requireLogin(
        "Trebuie să fii conectat pentru a salva restaurante la favorite.",
        async () => {
          if (favorites.has(key)) {
            favorites.delete(key);
            await removeFavorite(currentUser.uid, key);
          } else {
            favorites.add(key);
            await addFavorite(currentUser.uid, key);
          }
          renderList();
          renderFavorites();
          if (views.search.classList.contains("active")) renderSearchResults(searchViewInput.value);
          if (restaurantKey(currentRestaurant) === key) renderDetail(currentRestaurant);
        }
      );
    }

    chips.forEach(chip => {
      chip.addEventListener("click", () => {
        chips.forEach(item => item.classList.remove("active"));
        chip.classList.add("active");
        currentCategory = chip.dataset.category;
        renderList();
      });
    });

    document.querySelectorAll("[data-filter]").forEach(button => {
      button.addEventListener("click", () => {
        const key = button.dataset.filter;
        filters[key] = !filters[key];
        button.classList.toggle("active", filters[key]);
        renderList();
      });
    });

    document.querySelector("#priceFilter").addEventListener("change", event => {
      filters.price = event.target.value;
      renderList();
    });

    document.querySelector("#sortSelect").addEventListener("change", event => {
      filters.sort = event.target.value;
      renderList();
    });

    document.querySelectorAll("[data-view-mode]").forEach(button => {
      button.addEventListener("click", () => {
        setViewMode(button.dataset.viewMode);
      });
    });

    search.addEventListener("input", renderList);

    document.addEventListener("click", event => {
      const back = event.target.closest("[data-back]");
      if (back) {
        showView("home");
        return;
      }

      const routeButton = event.target.closest("[data-route]");
      if (routeButton) {
        const restaurant = restaurants.find(item => item.name === routeButton.dataset.route) || currentRestaurant;
        openRestaurantOnMap(restaurant);
        return;
      }

      const addPhotoButton = event.target.closest("[data-add-photo]");
      if (addPhotoButton) {
        if (!currentUser) {
          requireLogin("Conectează-te pentru a încărca poze făcute de tine.", () => renderDetail(currentRestaurant));
          return;
        }
        const input = views.detail.querySelector("#restaurantPhotoInput");
        input?.click();
        return;
      }

      const callButton = event.target.closest("[data-call]");
      if (callButton) {
        window.location.href = `tel:${callButton.dataset.call.replace(/[^\d+]/g, "")}`;
        return;
      }

      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        event.stopPropagation();
        toggleFavorite(favoriteButton.dataset.favorite);
        return;
      }

      const marker = event.target.closest("[data-map-restaurant]");
      if (marker) {
        const restaurant = restaurants.find(item => item.name === marker.dataset.mapRestaurant);
        if (restaurant) renderDetail(restaurant);
        return;
      }

      const card = event.target.closest(".card");
      if (card) {
        const restaurant = restaurants.find(item => item.name === card.dataset.name);
        if (restaurant) renderDetail(restaurant);
      }
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        const card = event.target.closest(".card");
        if (card) {
          const restaurant = restaurants.find(item => item.name === card.dataset.name);
          if (restaurant) renderDetail(restaurant);
        }
      }
    });

    navButtons.forEach(button => {
      button.addEventListener("click", () => {
        const tab = button.dataset.tab;
        if (tab === "home") showView("home");
        if (tab === "search") {
          showView("search");
          document.querySelector("#searchViewInput").focus();
        }
        if (tab === "favorites") {
          renderFavorites();
          showView("favorites");
        }
        if (tab === "profile") showView("profile");
      });
    });

    // ── Search view ──────────────────────────────────────────────────────────
    const searchViewInput = document.querySelector("#searchViewInput");
    const searchResultsList = document.querySelector("#searchResultsList");

    function renderSearchResults(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        searchResultsList.innerHTML = '<div class="empty">Scrie ceva pentru a căuta...</div>';
        return;
      }
      const filtered = restaurants.filter(r => {
        const text = `${r.name} ${r.cuisine} ${r.category} ${r.menu.map(item => item[0]).join(" ")}`.toLowerCase();
        return text.includes(q);
      });
      searchResultsList.innerHTML = filtered.length
        ? filtered.map(cardTemplate).join("")
        : '<div class="empty">Nu am găsit restaurante pentru această căutare.</div>';
    }

    searchViewInput.addEventListener("input", () => renderSearchResults(searchViewInput.value));

    searchResultsList.addEventListener("click", event => {
      const favoriteButton = event.target.closest("[data-favorite]");
      if (favoriteButton) {
        event.stopPropagation();
        toggleFavorite(favoriteButton.dataset.favorite);
        renderSearchResults(searchViewInput.value);
        return;
      }
      const card = event.target.closest(".card");
      if (card) {
        const restaurant = restaurants.find(item => item.name === card.dataset.name);
        if (restaurant) renderDetail(restaurant);
      }
    });

    // ── Account settings ─────────────────────────────────────────────────────
    const accountNameDisplay = document.querySelector("#accountNameDisplay");
    const accountEmailDisplay = document.querySelector("#accountEmailDisplay");
    const avatarDisplay = document.querySelector("#avatarDisplay");
    const editProfileBtn = document.querySelector("#editProfileBtn");
    const avatarUploadBtn = document.querySelector("#avatarUploadBtn");
    const avatarUploadInput = document.querySelector("#avatarUploadInput");
    const editProfileForm = document.querySelector("#editProfileForm");
    const cancelEditBtn = document.querySelector("#cancelEditBtn");
    const saveProfileBtn = document.querySelector("#saveProfileBtn");
    const inputName = document.querySelector("#inputName");
    const inputEmail = document.querySelector("#inputEmail");
    const toggleNotifications = document.querySelector("#toggleNotifications");
    const deleteAccountModal = document.querySelector("#deleteAccountModal");
    const deletePassword = document.querySelector("#deletePassword");
    const deleteAccountError = document.querySelector("#deleteAccountError");
    const deleteAccountLoading = document.querySelector("#deleteAccountLoading");
    const deleteCancelBtn = document.querySelector("#deleteCancelBtn");
    const deleteConfirmBtn = document.querySelector("#deleteConfirmBtn");

    function loadProfile() {
      const user = currentUser;
      const name = user ? getDisplayName(user) : "";
      const email = user?.email || "";
      const notif = localStorage.getItem("undemananc:notifications");

      accountNameDisplay.textContent = name || "Utilizator";
      accountEmailDisplay.textContent = email || "—";
      inputName.value = name;
      inputEmail.value = email;
      toggleNotifications.checked = notif === null ? true : notif === "1";

      if (user?.photoURL) {
        avatarDisplay.innerHTML = `<img src="${user.photoURL}" alt="Poza de profil">`;
        avatarDisplay.style.fontSize = "";
        avatarDisplay.style.fontWeight = "";
      } else if (name) {
        const initials = name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join("");
        avatarDisplay.textContent = initials;
        avatarDisplay.style.fontSize = "22px";
        avatarDisplay.style.fontWeight = "900";
      } else {
        avatarDisplay.innerHTML = '<svg width="38" height="38" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
        avatarDisplay.style.fontSize = "";
      }

      // Show/hide edit form fields based on login state
      if (editProfileForm) editProfileForm.hidden = true;
      if (editProfileBtn) editProfileBtn.hidden = !user;
      if (avatarUploadBtn) avatarUploadBtn.hidden = !user;
    }

    editProfileBtn.addEventListener("click", () => {
      editProfileForm.hidden = false;
      editProfileBtn.hidden = true;
      inputName.focus();
    });

    cancelEditBtn.addEventListener("click", () => {
      editProfileForm.hidden = true;
      editProfileBtn.hidden = false;
      loadProfile();
    });

    saveProfileBtn.addEventListener("click", async () => {
      const name = inputName.value.trim();
      const email = inputEmail.value.trim();
      if (!name) { inputName.style.borderColor = "var(--red)"; return; }
      inputName.style.borderColor = "";
      saveProfileBtn.disabled = true;
      saveProfileBtn.textContent = "Se salvează...";
      try {
        const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const { updateUserProfile } = await import("./db.js");
        await updateProfile(currentUser, { displayName: name });
        await updateUserProfile(currentUser.uid, { name, email });
        editProfileForm.hidden = true;
        editProfileBtn.hidden = false;
        loadProfile();
      } catch (e) {
        console.error(e);
      } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.textContent = "Salvează";
      }
    });

    avatarUploadBtn.addEventListener("click", () => {
      if (!currentUser) return;
      avatarUploadInput.click();
    });

    avatarUploadInput.addEventListener("change", async () => {
      const file = avatarUploadInput.files?.[0];
      if (!file || !currentUser) return;
      avatarUploadBtn.disabled = true;
      try {
        const { updateProfile } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
        const { updateUserProfile } = await import("./db.js");
        const photoURL = await uploadProfilePhoto(currentUser.uid, file);
        await updateProfile(currentUser, { photoURL });
        await updateUserProfile(currentUser.uid, { photoURL });
        loadProfile();
      } catch (error) {
        console.error(error);
      } finally {
        avatarUploadInput.value = "";
        avatarUploadBtn.disabled = false;
      }
    });

    toggleNotifications.addEventListener("change", () => {
      localStorage.setItem("undemananc:notifications", toggleNotifications.checked ? "1" : "0");
    });

    function openDeleteAccountModal() {
      if (!currentUser) return;
      const googleAccount = usesGoogleAuth();
      deletePassword.value = "";
      deletePassword.style.borderColor = "";
      deleteAccountError.hidden = true;
      deleteAccountLoading.hidden = true;
      deleteConfirmBtn.disabled = false;
      deleteConfirmBtn.textContent = googleAccount ? "Confirmă cu Google" : "Șterge definitiv";
      document.querySelector("#deleteAccountDesc").textContent = googleAccount
        ? "Confirmă cu Google pentru a șterge profilul, favoritele și recenziile tale. Acțiunea nu poate fi anulată."
        : "Această acțiune șterge profilul, favoritele și recenziile tale. Nu poate fi anulată.";
      document.querySelector(".delete-password-label").hidden = googleAccount;
      deleteAccountModal.hidden = false;
      if (!googleAccount) deletePassword.focus();
    }

    function closeDeleteAccountModal() {
      deleteAccountModal.hidden = true;
      deletePassword.value = "";
    }

    deleteCancelBtn.addEventListener("click", closeDeleteAccountModal);

    deleteAccountModal.addEventListener("click", event => {
      if (event.target === deleteAccountModal) closeDeleteAccountModal();
    });

    deleteConfirmBtn.addEventListener("click", async () => {
      const password = deletePassword.value;
      const googleAccount = usesGoogleAuth();
      deleteAccountError.hidden = true;
      deletePassword.style.borderColor = "";

      if (!googleAccount && !password) {
        deletePassword.style.borderColor = "var(--red)";
        deleteAccountError.textContent = "Introdu parola pentru a confirma ștergerea contului.";
        deleteAccountError.hidden = false;
        return;
      }

      deleteConfirmBtn.disabled = true;
      deleteConfirmBtn.textContent = "Se șterge...";
      deleteAccountLoading.hidden = false;

      try {
        const uid = currentUser.uid;
        if (googleAccount) {
          await reauthenticateWithGoogle();
        } else {
          await reauthenticate(password);
        }
        await deleteUserData(uid);
        await deleteAccount();
        favorites.clear();
        closeDeleteAccountModal();
        showView("home");
        renderList();
        renderFavorites();
      } catch (error) {
        console.error(error);
        deleteAccountError.textContent = firebaseErrorMessage(error.code || error.message);
        deleteAccountError.hidden = false;
      } finally {
        deleteAccountLoading.hidden = true;
        deleteConfirmBtn.disabled = false;
        deleteConfirmBtn.textContent = googleAccount ? "Confirmă cu Google" : "Șterge definitiv";
      }
    });

    function usesGoogleAuth() {
      return currentUser?.providerData?.some(provider => provider.providerId === "google.com");
    }

    // ── Auth section in profile ───────────────────────────────────────────────
    function renderAuthSection() {
      const section = document.querySelector("#authSection");
      if (!section) return;
      if (isLoggedIn()) {
        section.innerHTML = `
          <div class="settings-label">Cont</div>
          <div class="settings-row">
            <div class="settings-row-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="settings-row-body">
              <div class="settings-row-title">Deconectare</div>
              <div class="settings-row-sub">Ieși din contul tău</div>
            </div>
            <button class="cta small" type="button" id="logoutBtn" style="color:var(--red);border-color:var(--red)">Ieși</button>
          </div>
          <div class="settings-row danger">
            <div class="settings-row-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M9 10v7M15 10v7M6 6l1 15h10l1-15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="settings-row-body">
              <div class="settings-row-title">Șterge contul</div>
              <div class="settings-row-sub">Elimină profilul, favoritele și recenziile tale</div>
            </div>
            <button class="cta danger small" type="button" id="deleteAccountBtn">Șterge</button>
          </div>`;
        document.querySelector("#logoutBtn").addEventListener("click", async () => {
          await logout();
          // onAuthChange handles the rest
        });
        document.querySelector("#deleteAccountBtn").addEventListener("click", openDeleteAccountModal);
      } else {
        section.innerHTML = `
          <div class="settings-label">Cont</div>
          <div class="settings-row">
            <div class="settings-row-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
            <div class="settings-row-body">
              <div class="settings-row-title">Conectează-te</div>
              <div class="settings-row-sub">Intră în cont pentru favorite și recenzii</div>
            </div>
            <button class="cta primary small" type="button" id="profileLoginBtn">Intră</button>
          </div>`;
        document.querySelector("#profileLoginBtn").addEventListener("click", () => {
          requireLogin("Conectează-te pentru a accesa toate funcțiile.", () => {});
        });
      }
    }

    async function renderOwnerSection() {
      const section = document.querySelector("#ownerSection");
      if (!section) return;

      if (!isLoggedIn()) {
        section.innerHTML = `
          <div class="partner-card">
            <div class="partner-hero">
              <div class="partner-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5 12 3l8 7.5V21H4V10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 21v-7h8v7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
              </div>
              <div>
                <div class="partner-kicker">Pentru restaurante</div>
                <h2>Devino partener</h2>
                <p>Publică meniul zilei, oferte și informații actualizate după ce contul restaurantului este verificat.</p>
              </div>
            </div>
            <button class="cta primary" type="button" id="partnerLoginBtn">Conectează-te ca partener</button>
          </div>`;
        document.querySelector("#partnerLoginBtn").addEventListener("click", () => {
          requireLogin("Conectează-te pentru a trimite o cerere de parteneriat.", () => renderOwnerSection());
        });
        return;
      }

      try {
        ownedRestaurants = await withTimeout(getOwnedRestaurants(currentUser.uid));
      } catch (error) {
        console.warn("Owned restaurants could not be loaded.", error);
        ownedRestaurants = restaurants.filter(item => item.ownerId === currentUser.uid);
      }

      const activeOfferCount = restaurants.filter(item => item.dailyOffer?.active).length;
      if (!ownedRestaurants.length) {
        section.innerHTML = partnerRequestTemplate();
        document.querySelector("#sendPartnerRequestBtn").addEventListener("click", sendPartnerRequest);
        return;
      }

      section.innerHTML = `
        <div class="partner-card owner-card verified">
          <div class="partner-hero compact">
            <div class="partner-icon">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m9 12 2 2 4-5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/></svg>
            </div>
            <div>
              <div class="partner-kicker">Partener verificat</div>
              <h2>Manager restaurant</h2>
              <p>Actualizează rapid oferta de azi și datele vizibile în aplicație.</p>
            </div>
          </div>
          <div class="owner-stats">
            <div class="owner-stat"><strong>${ownedRestaurants.length}</strong>Locații</div>
            <div class="owner-stat"><strong>${activeOfferCount}</strong>Oferte azi</div>
            <div class="owner-stat"><strong>${favorites.size}</strong>Favorite</div>
          </div>
          <div class="owner-grid">
            <label class="field-label wide">Nume restaurant
              <input class="field-input" id="ownerRestaurantName" type="text" placeholder="Ex: Bistro Central">
            </label>
            <label class="field-label wide">Adresă
              <input class="field-input" id="ownerRestaurantAddress" type="text" placeholder="Strada, număr, oraș">
            </label>
            <label class="field-label">Categorie
              <input class="field-input" id="ownerRestaurantCategory" type="text" placeholder="Pizza">
            </label>
            <label class="field-label">Preț
              <input class="field-input" id="ownerRestaurantPrice" type="text" placeholder="$$">
            </label>
            <label class="field-label">Telefon
              <input class="field-input" id="ownerRestaurantPhone" type="tel" placeholder="+40...">
            </label>
            <label class="field-label">Poză URL
              <input class="field-input" id="ownerRestaurantPhoto" type="url" placeholder="https://...">
            </label>
            <label class="field-label wide">Încarcă poză
              <input class="field-input" id="ownerRestaurantPhotoFile" type="file" accept="image/*">
            </label>
            <label class="field-label wide">Meniul zilei
              <input class="field-input" id="ownerDailyTitle" type="text" placeholder="Supă + fel principal">
            </label>
            <label class="field-label wide">Descriere meniu
              <input class="field-input" id="ownerDailyDescription" type="text" placeholder="Ce include oferta de azi">
            </label>
            <label class="field-label">Preț meniu
              <input class="field-input" id="ownerDailyPrice" type="text" placeholder="35 lei">
            </label>
            <label class="field-label">Livrare
              <select class="field-input" id="ownerDelivery">
                <option value="true">Da</option>
                <option value="false">Nu</option>
              </select>
            </label>
          </div>
          <button class="cta primary" type="button" id="saveRestaurantBtn">Publică restaurantul</button>
          <div id="ownerStatus" class="form-note" hidden></div>
        </div>`;

      const firstOwned = ownedRestaurants[0];
      if (firstOwned) fillOwnerForm(firstOwned);
      document.querySelector("#saveRestaurantBtn").addEventListener("click", saveOwnerRestaurant);
    }

    function partnerRequestTemplate() {
      return `
        <div class="partner-card">
          <div class="partner-hero">
            <div class="partner-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 10.5 12 3l8 7.5V21H4V10.5Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M8 21v-7h8v7" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>
            </div>
            <div>
              <div class="partner-kicker">Restaurantul tău aici</div>
              <h2>Devino partener</h2>
              <p>Primești acces la meniu zilnic, oferte, poze și date de contact după verificare.</p>
            </div>
          </div>
          <div class="partner-benefits">
            <div><strong>Meniu zilnic</strong><span>Publică oferta de prânz în câteva secunde.</span></div>
            <div><strong>Vizibilitate locală</strong><span>Apari în filtrele pe distanță, livrare și buget.</span></div>
            <div><strong>Date actuale</strong><span>Controlezi poze, program și telefon.</span></div>
          </div>
          <div class="owner-grid">
            <label class="field-label wide">Nume restaurant
              <input class="field-input" id="partnerRestaurantName" type="text" placeholder="Ex: Bistro Central">
            </label>
            <label class="field-label">Persoană contact
              <input class="field-input" id="partnerContactName" type="text" placeholder="Nume">
            </label>
            <label class="field-label">Telefon
              <input class="field-input" id="partnerPhone" type="tel" placeholder="+40...">
            </label>
            <label class="field-label wide">Mesaj
              <textarea class="field-input partner-textarea" id="partnerMessage" placeholder="Spune-ne cum putem verifica restaurantul."></textarea>
            </label>
          </div>
          <button class="cta primary" type="button" id="sendPartnerRequestBtn">Trimite cererea</button>
          <div id="partnerRequestStatus" class="form-note" hidden></div>
        </div>`;
    }

    async function sendPartnerRequest() {
      const status = document.querySelector("#partnerRequestStatus");
      const button = document.querySelector("#sendPartnerRequestBtn");
      const restaurantName = document.querySelector("#partnerRestaurantName").value.trim();
      const contactName = document.querySelector("#partnerContactName").value.trim();
      const phone = document.querySelector("#partnerPhone").value.trim();
      const message = document.querySelector("#partnerMessage").value.trim();

      if (!restaurantName || !phone) {
        status.textContent = "Completează numele restaurantului și telefonul.";
        status.hidden = false;
        return;
      }

      button.disabled = true;
      button.textContent = "Se trimite...";
      status.hidden = true;

      try {
        await withTimeout(createPartnerRequest(currentUser.uid, {
          restaurantName,
          contactName,
          phone,
          message,
          email: currentUser.email || ""
        }), 5000);
        status.textContent = "Cererea a fost trimisă. Te contactăm pentru verificare.";
        status.hidden = false;
        button.textContent = "Cerere trimisă";
      } catch (error) {
        console.error(error);
        status.textContent = "Nu am putut trimite cererea acum. Încearcă din nou.";
        status.hidden = false;
        button.disabled = false;
        button.textContent = "Trimite cererea";
      }
    }

    function fillOwnerForm(restaurant) {
      document.querySelector("#ownerRestaurantName").value = restaurant.name || "";
      document.querySelector("#ownerRestaurantAddress").value = restaurant.address || "";
      document.querySelector("#ownerRestaurantCategory").value = restaurant.category || "";
      document.querySelector("#ownerRestaurantPrice").value = restaurant.price || "$$";
      document.querySelector("#ownerRestaurantPhone").value = restaurant.phone || "";
      document.querySelector("#ownerRestaurantPhoto").value = restaurant.photo || "";
      document.querySelector("#ownerDailyTitle").value = restaurant.dailyOffer?.title || "";
      document.querySelector("#ownerDailyDescription").value = restaurant.dailyOffer?.description || "";
      document.querySelector("#ownerDailyPrice").value = restaurant.dailyOffer?.price || "";
      document.querySelector("#ownerDelivery").value = String(!!restaurant.features?.delivery);
    }

    async function saveOwnerRestaurant() {
      const status = document.querySelector("#ownerStatus");
      const saveBtn = document.querySelector("#saveRestaurantBtn");
      const name = document.querySelector("#ownerRestaurantName").value.trim();
      const address = document.querySelector("#ownerRestaurantAddress").value.trim();
      if (!name || !address) {
        status.textContent = "Completează cel puțin numele și adresa.";
        status.hidden = false;
        return;
      }

      saveBtn.disabled = true;
      saveBtn.textContent = "Se publică...";
      status.hidden = true;

      const existing = ownedRestaurants.find(item => item.name.toLowerCase() === name.toLowerCase());
      const restaurant = normalizeRestaurants([{
        ...(existing || {}),
        id: existing?.id || slugify(name),
        ownerId: currentUser.uid,
        name,
        address,
        cuisine: document.querySelector("#ownerRestaurantCategory").value.trim() || "Restaurant local",
        category: document.querySelector("#ownerRestaurantCategory").value.trim() || "Restaurant",
        price: document.querySelector("#ownerRestaurantPrice").value.trim() || "$$",
        phone: document.querySelector("#ownerRestaurantPhone").value.trim() || "",
        photo: document.querySelector("#ownerRestaurantPhoto").value.trim() || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=85",
        rating: existing?.rating || "Nou",
        reviews: existing?.reviews || 0,
        status: "Deschis",
        tag: "Nou în aplicație",
        lat: existing?.lat || 47.7929,
        lng: existing?.lng || 22.8857,
        hours: existing?.hours || "Actualizează programul",
        photos: existing?.photos || [],
        menu: existing?.menu?.length ? existing.menu : [],
        features: {
          delivery: document.querySelector("#ownerDelivery").value === "true",
          takeaway: true,
          reservations: true,
          terrace: false,
          card: true
        },
        dailyOffer: {
          title: document.querySelector("#ownerDailyTitle").value.trim() || "Oferta zilei",
          description: document.querySelector("#ownerDailyDescription").value.trim() || "Actualizează oferta pentru azi.",
          price: document.querySelector("#ownerDailyPrice").value.trim() || "",
          active: true
        }
      }])[0];

      try {
        const photoFile = document.querySelector("#ownerRestaurantPhotoFile").files[0];
        if (photoFile) {
          restaurant.photo = await uploadRestaurantPhoto(currentUser.uid, restaurant.id, photoFile);
          restaurant.photos = [restaurant.photo, ...(restaurant.photos || []).filter(Boolean)].slice(0, 6);
        }
        await withTimeout(saveRestaurant(restaurant), 5000);
        const index = restaurants.findIndex(item => restaurantKey(item) === restaurantKey(restaurant));
        if (index >= 0) restaurants[index] = restaurant;
        else restaurants.unshift(restaurant);
        applyDistances();
        renderList();
        await renderOwnerSection();
      } catch (error) {
        console.error(error);
        status.textContent = "Nu am putut publica restaurantul. Verifică permisiunile Firebase.";
        status.hidden = false;
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = "Publică restaurantul";
      }
    }

    // ── Dark / Light mode toggle ──────────────────────────────────────────────
    const toggleDark = document.querySelector("#toggleDark");

    function applyTheme(dark) {
      if (dark) {
        document.documentElement.removeAttribute("data-theme");
      } else {
        document.documentElement.setAttribute("data-theme", "light");
      }
      toggleDark.checked = dark;
      const statusEl = document.querySelector("#darkModeStatus");
      if (statusEl) statusEl.textContent = dark ? "Mod întunecat activ" : "Mod luminos activ";
    }

    // Load saved preference; default is dark
    const savedTheme = localStorage.getItem("undemananc:theme");
    applyTheme(savedTheme === null ? true : savedTheme === "dark");

    toggleDark.addEventListener("change", () => {
      const dark = toggleDark.checked;
      localStorage.setItem("undemananc:theme", dark ? "dark" : "light");
      applyTheme(dark);
    });

    // ── Reviews system ────────────────────────────────────────────────────────
    function starsHtml(rating, interactive = false) {
      return [1, 2, 3, 4, 5].map(i => `
        <svg class="star-icon${interactive ? " star-pick" : ""}${!interactive && i <= rating ? " filled" : ""}"
          data-star="${interactive ? i : ""}"
          width="18" height="18" viewBox="0 0 24 24"
          fill="${!interactive && i <= rating ? "var(--amber)" : "none"}"
          stroke="${!interactive && i <= rating ? "var(--amber)" : "currentColor"}"
          stroke-width="1.8" aria-hidden="true">
          <path d="m12 2.8 2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.6l-5.8 3.1 1.1-6.4-4.7-4.6 6.5-.9L12 2.8Z"/>
        </svg>`).join("");
    }

    function reviewItemHtml(r) {
      const initial = r.userName ? r.userName[0].toUpperCase() : "?";
      const date = r.createdAt?.toDate
        ? r.createdAt.toDate().toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })
        : r.date || "";
      return `
        <div class="review-item">
          <div class="review-header">
            <div class="review-avatar">${initial}</div>
            <div>
              <div class="review-name">${r.userName || "Anonim"}</div>
              <div class="review-stars">${starsHtml(r.rating)}</div>
            </div>
            <div class="review-date">${date}</div>
          </div>
          <p class="review-text">${r.text}</p>
        </div>`;
    }

    async function reviewsHtml(restaurantId) {
      let reviews = [];
      let loadError = false;
      try {
        reviews = await getReviewsDB(restaurantId);
      } catch (error) {
        console.warn("Reviews could not be loaded.", error);
        loadError = true;
      }
      const reviewsBlock = reviews.length
        ? reviews.map(reviewItemHtml).join("")
        : loadError
          ? '<div class="empty" style="margin-top:12px">Recenziile nu pot fi încărcate momentan.</div>'
        : '<div class="empty" style="margin-top:12px">Fii primul care lasă o recenzie!</div>';

      const formHtml = isLoggedIn()
        ? `<div class="review-form" id="reviewForm">
            <div class="review-form-title">Lasă o recenzie</div>
            <div class="star-picker" id="starPicker" data-selected="0" aria-label="Selectează rating">
              ${starsHtml(0, true)}
            </div>
            <textarea class="review-textarea" id="reviewText" placeholder="Scrie experiența ta..." rows="3"></textarea>
            <button class="cta primary" id="submitReview" type="button" style="margin-top:10px;width:100%">Trimite recenzia</button>
          </div>`
        : `<div class="auth-gate" style="margin-top:14px">
            <div class="auth-gate-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
            <h2>Lasă o recenzie</h2>
            <p>Conectează-te pentru a putea scrie o recenzie.</p>
            <button class="cta primary" type="button" id="reviewLoginBtn" style="width:100%;margin-top:4px">Conectează-te</button>
          </div>`;

      return `${formHtml}<div class="reviews-list" id="reviewsList">${reviewsBlock}</div>`;
    }

    function bindReviewsTab(restaurant) {
      const loginBtn = document.querySelector("#reviewLoginBtn");
      if (loginBtn) {
        loginBtn.addEventListener("click", () => {
          requireLogin("Conectează-te pentru a lăsa o recenzie.", async () => {
            document.querySelector("#tabReviews").innerHTML = await reviewsHtml(restaurantKey(restaurant));
            bindReviewsTab(restaurant);
          });
        });
        return;
      }

      const starPicker = document.querySelector("#starPicker");
      const submitBtn = document.querySelector("#submitReview");
      if (!starPicker || !submitBtn) return;

      let selectedRating = 0;

      starPicker.addEventListener("click", e => {
        const star = e.target.closest(".star-pick");
        if (!star) return;
        selectedRating = parseInt(star.dataset.star, 10);
        starPicker.dataset.selected = selectedRating;
        [...starPicker.querySelectorAll(".star-pick")].forEach((s, i) => {
          const filled = i < selectedRating;
          s.setAttribute("fill", filled ? "var(--amber)" : "none");
          s.setAttribute("stroke", filled ? "var(--amber)" : "currentColor");
        });
      });

      submitBtn.addEventListener("click", async () => {
        const text = document.querySelector("#reviewText").value.trim();
        if (!text) {
          document.querySelector("#reviewText").style.borderColor = "var(--red)";
          return;
        }
        if (selectedRating === 0) {
          starPicker.style.outline = "2px solid var(--red)";
          starPicker.style.borderRadius = "8px";
          return;
        }
        starPicker.style.outline = "";
        document.querySelector("#reviewText").style.borderColor = "";
        submitBtn.disabled = true;
        submitBtn.textContent = "Se trimite...";
        try {
          const userName = getDisplayName(currentUser);
          await addReview(currentUser.uid, userName, restaurantKey(restaurant), selectedRating, text);
          // Reload reviews
          const updated = await getReviewsDB(restaurantKey(restaurant));
          document.querySelector("#reviewsList").innerHTML = updated.length
            ? updated.map(reviewItemHtml).join("")
            : '<div class="empty" style="margin-top:12px">Fii primul care lasă o recenzie!</div>';
          document.querySelector("#reviewText").value = "";
          selectedRating = 0;
          starPicker.dataset.selected = 0;
          [...starPicker.querySelectorAll(".star-pick")].forEach(s => {
            s.setAttribute("fill", "none");
            s.setAttribute("stroke", "currentColor");
          });
        } catch (e) {
          console.error(e);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Trimite recenzia";
        }
      });
    }
    let userLat = null;
    let userLng = null;
    let userHeading = null;
    let userAccuracy = null;
    let geoWatchId = null;
    let lastUserPosition = null;
    let lastReverseGeocodePosition = null;
    let lastReverseGeocodeAt = 0;

    // Haversine formula — returns distance in metres between two lat/lng points
    function haversine(lat1, lng1, lat2, lng2) {
      const R = 6371000; // Earth radius in metres
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2
        + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    function bearingBetween(lat1, lng1, lat2, lng2) {
      const toRad = deg => deg * Math.PI / 180;
      const toDeg = rad => rad * 180 / Math.PI;
      const phi1 = toRad(lat1);
      const phi2 = toRad(lat2);
      const deltaLng = toRad(lng2 - lng1);
      const y = Math.sin(deltaLng) * Math.cos(phi2);
      const x = Math.cos(phi1) * Math.sin(phi2)
        - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLng);
      return (toDeg(Math.atan2(y, x)) + 360) % 360;
    }

    // Format metres to human-readable string
    function formatDist(metres) {
      if (metres < 1000) return `${Math.round(metres / 10) * 10} m`;
      return `${(metres / 1000).toFixed(1)} km`;
    }

    // Attach computed distance to each restaurant and sort list by proximity
    function applyDistances() {
      restaurants.forEach(r => {
        r.distance = userLat !== null
          ? formatDist(haversine(userLat, userLng, r.lat, r.lng))
          : "—";
        r._distMetres = userLat !== null
          ? haversine(userLat, userLng, r.lat, r.lng)
          : Infinity;
      });
      restaurants.sort((a, b) => a._distMetres - b._distMetres);
    }

    // Reverse-geocode with Nominatim (OpenStreetMap, free, no key needed)
    function reverseGeocode(lat, lng) {
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=ro`)
        .then(r => r.json())
        .then(data => {
          const city = data.address?.city
            || data.address?.town
            || data.address?.village
            || data.address?.county
            || "Locația ta";
          locationSpan.textContent = city;
        })
        .catch(() => {
          locationSpan.textContent = "Locația ta";
        });
    }

    function maybeReverseGeocode(lat, lng) {
      const now = Date.now();
      const moved = lastReverseGeocodePosition
        ? haversine(lastReverseGeocodePosition.lat, lastReverseGeocodePosition.lng, lat, lng)
        : Infinity;
      if (now - lastReverseGeocodeAt < 60000 && moved < 500) return;
      lastReverseGeocodeAt = now;
      lastReverseGeocodePosition = { lat, lng };
      reverseGeocode(lat, lng);
    }

    const gpsModal = document.querySelector("#gpsModal");
    const gpsAllowBtn = document.querySelector("#gpsAllowBtn");
    const gpsDenyBtn = document.querySelector("#gpsDenyBtn");
    const locateBtn = document.querySelector("#locateBtn");
    const requestGpsBtn = document.querySelector("#requestGpsBtn");
    const locationStatus = document.querySelector("#locationStatus");
    const locationSpan = document.querySelector(".location span");

    function updateGpsStatus(status) {
      if (status === "granted") {
        locationStatus.textContent = "Locație activă";
        locationStatus.style.color = "var(--green)";
        requestGpsBtn.textContent = "Activat";
        requestGpsBtn.disabled = true;
        requestGpsBtn.style.opacity = "0.5";
      } else if (status === "denied") {
        locationStatus.textContent = "Acces refuzat";
        locationStatus.style.color = "var(--red)";
        requestGpsBtn.textContent = "Refuzat";
        requestGpsBtn.disabled = false;
        requestGpsBtn.style.opacity = "1";
      } else {
        locationStatus.textContent = "Permisiune necunoscută";
        locationStatus.style.color = "";
        requestGpsBtn.textContent = "Activează";
        requestGpsBtn.disabled = false;
        requestGpsBtn.style.opacity = "1";
      }
    }

    function handlePosition(position, { recenter = false } = {}) {
      const nextLat = position.coords.latitude;
      const nextLng = position.coords.longitude;
      const nextHeading = Number(position.coords.heading);

      if (Number.isFinite(nextHeading)) {
        userHeading = nextHeading;
      } else if (lastUserPosition && haversine(lastUserPosition.lat, lastUserPosition.lng, nextLat, nextLng) > 3) {
        userHeading = bearingBetween(lastUserPosition.lat, lastUserPosition.lng, nextLat, nextLng);
      }

      userLat = nextLat;
      userLng = nextLng;
      userAccuracy = position.coords.accuracy;
      lastUserPosition = { lat: nextLat, lng: nextLng };
      updateGpsStatus("granted");
      maybeReverseGeocode(userLat, userLng);
      applyDistances();
      renderList();
      renderFavorites();
      if (views.search.classList.contains("active")) renderSearchResults(searchViewInput.value);
      updateDistanceDisplays();
      updateUserLocationOnMap();

      if (recenter && restaurantMap) {
        restaurantMap.setView([userLat, userLng], Math.max(restaurantMap.getZoom(), 16));
      }
      if (activeRouteRestaurant) drawRouteToRestaurant(activeRouteRestaurant);
    }

    function startLiveLocation({ recenter = false } = {}) {
      if (!("geolocation" in navigator)) {
        updateGpsStatus("denied");
        return;
      }
      locationSpan.textContent = "Se detectează...";
      navigator.geolocation.getCurrentPosition(
        position => {
          gpsModal.hidden = true;
          handlePosition(position, { recenter });
        },
        () => {
          updateGpsStatus("denied");
          gpsModal.hidden = true;
          locationSpan.textContent = "Satu Mare";
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 12000 }
      );

      if (geoWatchId !== null) return;
      geoWatchId = navigator.geolocation.watchPosition(
        position => handlePosition(position),
        error => {
          console.warn("Live location update failed.", error);
          if (userLat === null) updateGpsStatus("denied");
        },
        { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
      );
    }

    function requestGps(options) {
      startLiveLocation(options);
    }

    function openGpsModal() {
      gpsModal.hidden = false;
    }

    locateBtn.addEventListener("click", openGpsModal);
    requestGpsBtn.addEventListener("click", openGpsModal);

    gpsAllowBtn.addEventListener("click", () => {
      gpsModal.hidden = true;
      requestGps({ recenter: true });
    });

    gpsDenyBtn.addEventListener("click", () => {
      gpsModal.hidden = true;
      updateGpsStatus("denied");
    });

    // Close modal on backdrop click
    gpsModal.addEventListener("click", event => {
      if (event.target === gpsModal) {
        gpsModal.hidden = true;
      }
    });

    async function loadRestaurantData() {
      applyDistances();
      renderList();
      try {
        await withTimeout(seedRestaurants(restaurants), 3500);
        const remoteRestaurants = await withTimeout(getRestaurants(), 3500);
        if (remoteRestaurants.length) {
          restaurants = normalizeRestaurants(visibleRestaurants(remoteRestaurants));
          currentRestaurant = restaurants[0];
        }
      } catch (error) {
        console.warn("Restaurant data will use local fallback.", error);
      } finally {
        applyDistances();
      }
    }

    async function loadUserFavorites() {
      favorites.clear();
      if (!currentUser) return;

      try {
        const savedFavorites = await withTimeout(getFavorites(currentUser.uid), 3500);
        savedFavorites.forEach(item => favorites.add(item));
      } catch (error) {
        console.warn("Favorites could not be loaded.", error);
      }
    }

    onAuthChange(async user => {
      currentUser = user;
      await loadUserFavorites();
      loadProfile();
      renderAuthSection();
      renderOwnerSection();
      renderList();
      renderFavorites();
    });

    async function initializeAppShell() {
      applyDistances();
      renderList();
      favoriteList.innerHTML = '<div class="empty">Se încarcă favoritele...</div>';
      try {
        const redirectedUser = await withTimeout(finishGoogleRedirectLogin(), 2500);
        if (redirectedUser) currentUser = redirectedUser;
      } catch (error) {
        console.warn("Google redirect login could not be completed.", error);
      }
      await loadRestaurantData();
      await loadUserFavorites();
      loadProfile();
      renderAuthSection();
      renderOwnerSection();
      renderList();
      renderFavorites();
    }

    // Check existing permission on load — if already granted, fetch position silently
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then(result => {
        updateGpsStatus(result.state);
        if (result.state === "granted") requestGps();
        result.addEventListener("change", () => {
          updateGpsStatus(result.state);
          if (result.state === "granted") requestGps();
        });
      });
    }

    initializeAppShell();
