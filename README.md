# Demokrati

## Installera saker som behövs

### Mac

1. Installera [Homebrew](https://brew.sh/) enligt instruktionerna på hemsidan
2. Installera [Node](https://nodejs.org/en/), npm enligt instruktionerna på hemsidan
3. Installera Postgres. Kör `brew install postgresql` i terminalen.
4. Klona repot `git clone https://github.com/loopmania/demokrati.git` 
    1. kör sedan `cd demokrati && npm install` 
    2. Därefter kör `npm run install:all` Både **server** och **client** installeras genom det kommandot.
5. Lägg till nycklarna. I terminalen kör `cd server && mkdir ssl` Extrahera ut innehållet ur **ssl-mappen**.
6. Lägg till .env i **server-rooten**
7. Starta Postgres. Kör `brew services start postgresql`
    1. Du behöver manuellt stänga av den, när du inte använder den. Kör `brew services stop postgresql`
8. Skapa user till databasen. Kör `psql` i terminalen. Sedan `CREATE ROLE [user] WITH LOGIN PASSWORD '[pass]'` 
    1. Parametrarna **user** och **pass** byts ut till det som är givet.
9. Importera databasen. Gå till **server-rooten** och kör `pg_dump -U [user] -W -F p demokrati > /ssl/pgexport.pgsql`
10. Frivilligt, men kan vara trevligt. Installera [pgAdmin](https://www.pgadmin.org/).

## Struktur

### Client

Vuex | Socket.io-client | Vue-router | vuetify

På clientsidan är det en server som lyssnar på port `8443` och sköter proxyn till port `5000`

Designmönstret är SPA med fokus på components.

**components/**

Här ligger alla olika komponenter.

**Alerter.vue**

Detta är en [snackbar](https://vuetifyjs.com/en/components/snackbars/) som väcks genom [socket.io](http://socket.io)-anropet `refresh` eller commit-anropet `alertClient` 

**Logout.vue**

En redirection för att förstöra JWT-tokens. - Saknar API-callet `/api/logout`

**Navbar.vue**

Själva navet av appen.

**plugins/vuetify.js**

Ett styling plugin. Bra dokumentation finns på deras hemsida: [https://vuetifyjs.com/en/getting-started/quick-start/](https://vuetifyjs.com/en/getting-started/quick-start/)

**router/index.js**

Här finns alla olika "länkar".

När det blir dags att **[guarda](https://router.vuejs.org/guide/advanced/navigation-guards.html)** olika views, så görs det härifrån.

**store/index.js**

Här är hjärnan av frontenden. Går att se den som scope för angular eller som state för react.

Alla funktioner som används av fler componenter skrivs här. 

Bra dokumentation finns här:

[https://vuex.vuejs.org/guide/](https://vuex.vuejs.org/guide/)

**views/**

**Actions.vue**

Är tänkt som en startsida för att se mötets handlingar.

**Admin.vue**

Adminsidan av appen

**Login.vue**

Loginsidan av appen

**Vote.vue**

Röstningsidan av appen

### Server

JWT | JOI | Sequelize | Nodemailer | Socket.io

På serversidan är det två servrar, samt [socket.io](http://socket.io) som är kopplad till ena av servrarna. Ena servern lyssnar på port `5000` och är den säkra. Den andra lyssnar på port `8080` och redirectar till den säkra. Denna funktionalitet går att ta bort. Det är den säkra servern som har all funktionalitet.

Designmönstret som används är MVC + managers. Där controllers inte har implementeras på vanligt vis. De är delvis inkopplade i managers.

**database/db.js**

Körs genom [Sequelize](https://sequelize.org/) - inget kommer behöva ändras här

**managers/**

**Mailer.js**

Körs genom [Nodemailer](https://nodemailer.com/about/) - inget kommer behöva ändras här

**MsgHandler.js**

Är en enkel manager av de olika response-meddelanden som finns. - Här läggs nya meddelanden till, när nya API skrivs. *Kan behöva översättas till Svenska.*
```javascript
    // Används på följande vis:
    MsgHandler(res, id, Optional: [{args}])
```
**Validator.js**

Körs genom [Joi](https://github.com/hapijs/joi) - Här läggs nya validitets-regler på backend sidan till.

**models - körs genom Sequelize**

De operationer som man kan göra på respektive modell skall skriva i respektive modell.

**Members.js**

Här kommer medlemsregistret finnas.
```javascript
    // De olika columnerna
    id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
    email: {
        type: Sequelize.STRING
    },
    temp_pass: {
        type: Sequelize.STRING
    },
    amount_of_times: {
        type: Sequelize.INTEGER
    },
    present: {
        type: Sequelize.BOOLEAN
    },
    signed_in: {
        type: Sequelize.BOOLEAN
    },
    admin: {
        type: Sequelize.BOOLEAN
    },
    refresh_token: {
        type: Sequelize.STRING
    },
    has_voted: {
        type: Sequelize.BOOLEAN
    }
```

**Polls.js**

Här kommer alla omröstningar finnas. 
```javascript
    // De olika columnerna
    id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    candidates: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false
    },
    active: {
        type: Sequelize.BOOLEAN
    }
```

**Votes.js**

Här kommer alla röster finnas.
```javascript
    // De olika columnerna
    id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
    pollId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: 'polls',
        referencesKey: 'pollId'
    },
    vote: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
```

**Words.js**

Detta är en modell för att generera en temporär kod för att verifiera en medlems access till sin mail.

**routes/**

**api/**

**admin/**

**rest.js**

API-filen för de olika requests för admin-delen.

**rest.js**

API-filen för de olika requests för medlemmar

**auth/**

Kan diskuteras om detta ska flyttas till **controller**

**token.js**

Körs genom [Jsonwebtokens](https://jwt.io/) (JWT) - Är ett middleware för alla requests i medlems-API:et som kontrollerar att deras token är **valid** och att de är en **medlem**.