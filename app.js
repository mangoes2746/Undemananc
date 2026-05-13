// UndeMananc — main app logic
    // Firebase integration: auth via firebase-auth, data via Firestore
    import {
      onAuthChange, login, register, loginWithGoogle, finishGoogleRedirectLogin, logout, getDisplayName,
      reauthenticate, reauthenticateWithGoogle, deleteAccount
    } from "./auth.js";
    import {
      getFavorites, addFavorite, removeFavorite,
      getReviews as getReviewsDB, addReview, deleteUserData,
      getRestaurants, seedRestaurants
    } from "./db.js";

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

    restaurants = normalizeRestaurants(restaurants);

    const views = {
      home: document.querySelector("#homeView"),
      search: document.querySelector("#searchView"),
      detail: document.querySelector("#detailView"),
      favorites: document.querySelector("#favoritesView"),
      profile: document.querySelector("#profileView")
    };
    const list = document.querySelector("#restaurantList");
    const favoriteList = document.querySelector("#favoriteList");
    const search = document.querySelector("#search");
    const navButtons = [...document.querySelectorAll(".nav [data-tab]")];
    const chips = [...document.querySelectorAll(".chip")];
    const favorites = new Set();
    let currentCategory = "Toate";
    let currentRestaurant = restaurants[0];
    let currentUser = null; // Firebase user object

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
        distance: item.distance || "—",
        _distMetres: item._distMetres ?? Infinity
      }));
    }

    function restaurantKey(restaurant) {
      return restaurant.id || slugify(restaurant.name);
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
      const text = `${restaurant.name} ${restaurant.cuisine} ${restaurant.category} ${restaurant.menu.map(item => item[0]).join(" ")}`.toLowerCase();
      return categoryMatch && (!query || text.includes(query));
    }

    function cardTemplate(restaurant) {
      const key = restaurantKey(restaurant);
      const active = favorites.has(key) ? " active" : "";
      return `
        <article class="card" data-name="${restaurant.name}" tabindex="0" role="button" aria-label="Deschide ${restaurant.name}">
          <img src="${restaurant.photo}" alt="${restaurant.name}">
          <span class="tag">${icons.star}${restaurant.tag}</span>
          <button class="heart${active}" type="button" data-favorite="${key}" aria-label="Salvează ${restaurant.name}">${icons.heart}</button>
          <div class="card-body">
            <h2>${restaurant.name}</h2>
            <div class="subtitle">${restaurant.cuisine}</div>
            <div class="meta">
              <span>${icons.star}<strong>${restaurant.rating}</strong> (${restaurant.reviews})</span>
              <span class="dot"></span>
              <span>${restaurant.price}</span>
              <span class="dot"></span>
              <span>${icons.pin}${restaurant.distance}</span>
              <span class="dot"></span>
              <span class="status">${restaurant.status}</span>
            </div>
          </div>
        </article>
      `;
    }

    function renderList() {
      const filtered = restaurants.filter(matches);
      list.innerHTML = filtered.length
        ? filtered.map(cardTemplate).join("")
        : '<div class="empty">Nu am găsit restaurante pentru această căutare.</div>';
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
              <div class="info">${icons.pin}<span>${restaurant.distance} de tine</span></div>
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
              <button class="tab active" type="button" data-tab-target="menu">Meniu</button>
              <button class="tab" type="button" data-tab-target="photos">Poze</button>
              <button class="tab" type="button" data-tab-target="reviews">Recenzii</button>
            </div>

            <div id="tabMenu">
            <div class="section-title">
              <h2>Meniu popular</h2>
              <span>Vezi tot</span>
            </div>
            <div class="menu-list">
              ${restaurant.menu.map(([name, desc, price, img]) => `
                <div class="menu-item">
                  <img src="${img}" alt="${name}">
                  <div>
                    <h3>${name}</h3>
                    <p>${desc}</p>
                  </div>
                  <div class="price">${price}</div>
                </div>
              `).join("")}
            </div>
            </div>

            <div id="tabPhotos" hidden>
            <div class="section-title">
              <h2>Poze</h2>
              <span>${restaurant.photos.length} poze</span>
            </div>
            <div class="photos">
              ${restaurant.photos.map((photo, index) => `<img src="${photo}" alt="${restaurant.name} poza ${index + 1}">`).join("")}
            </div>
            </div>

            <div id="tabReviews" hidden>
            <div class="empty" style="margin-top:12px">Se încarcă recenziile...</div>
            </div>
          </div>
        </div>
      `;
      showView("detail");

      // Tab switching
      const tabBtns = [...views.detail.querySelectorAll(".tab")];
      const tabPanels = {
        menu: views.detail.querySelector("#tabMenu"),
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
        const destination = encodeURIComponent(`${restaurant.address}, Satu Mare`);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank", "noopener");
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

      if (name) {
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

    function requestGps() {
      if (!("geolocation" in navigator)) {
        updateGpsStatus("denied");
        return;
      }
      locationSpan.textContent = "Se detectează...";
      navigator.geolocation.getCurrentPosition(
        position => {
          userLat = position.coords.latitude;
          userLng = position.coords.longitude;
          updateGpsStatus("granted");
          gpsModal.hidden = true;
          reverseGeocode(userLat, userLng);
          applyDistances();
          renderList();
          renderFavorites();
        },
        () => {
          updateGpsStatus("denied");
          gpsModal.hidden = true;
          locationSpan.textContent = "Satu Mare";
        }
      );
    }

    function openGpsModal() {
      gpsModal.hidden = false;
    }

    locateBtn.addEventListener("click", openGpsModal);
    requestGpsBtn.addEventListener("click", openGpsModal);

    gpsAllowBtn.addEventListener("click", () => {
      gpsModal.hidden = true;
      requestGps();
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
      try {
        await seedRestaurants(restaurants);
        const remoteRestaurants = await getRestaurants();
        if (remoteRestaurants.length) {
          restaurants = normalizeRestaurants(remoteRestaurants);
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
        const savedFavorites = await getFavorites(currentUser.uid);
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
      renderList();
      renderFavorites();
    });

    async function initializeAppShell() {
      list.innerHTML = '<div class="empty">Se încarcă restaurantele...</div>';
      favoriteList.innerHTML = '<div class="empty">Se încarcă favoritele...</div>';
      try {
        const redirectedUser = await finishGoogleRedirectLogin();
        if (redirectedUser) currentUser = redirectedUser;
      } catch (error) {
        console.warn("Google redirect login could not be completed.", error);
      }
      await loadRestaurantData();
      await loadUserFavorites();
      loadProfile();
      renderAuthSection();
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
