var db = window.openDatabase("NDKStore", "1.0", "NDK Store", 200000);

function initialize_database() {
    db.transaction(function (tx) {
        var query = `CREATE TABLE IF NOT EXISTS city (
                          id INTEGER PRIMARY KEY,
                          name TEXT UNIQUE NOT NULL)`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('city'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS district (
                          id INTEGER PRIMARY KEY,
                          name TEXT UNIQUE NOT NULL,
                          city_id INTEGER NOT NULL,
                          FOREIGN KEY (city_id) REFERENCES city(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('district'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS ward (
                          id INTEGER PRIMARY KEY,
                          name TEXT UNIQUE NOT NULL,
                          district_id INTEGER NOT NULL,
                          FOREIGN KEY (district_id) REFERENCES district(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('ward'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS category (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          name TEXT UNIQUE NOT NULL,
                          description TEXT NULL,
                          parent_id INTEGER NULL,
                          FOREIGN KEY (parent_id) REFERENCES category(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('category'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS product (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          name TEXT UNIQUE NOT NULL,
                          description TEXT NULL,
                          price REAL NOT NULL,
                          image TEXT NULL,
                          category_id INTEGER NOT NULL,
                          FOREIGN KEY (category_id) REFERENCES category(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('product'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS cart (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          account_id INTEGER NOT NULL,
                          product_id INTEGER NOT NULL,
                          quantity INTEGER NOT NULL,
                          FOREIGN KEY (account_id) REFERENCES account(id),
                          FOREIGN KEY (product_id) REFERENCES product(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('cart'),
            transaction_fail
        );

        query = `CREATE TABLE IF NOT EXISTS account (
                          id INTEGER PRIMARY KEY AUTOINCREMENT,
                          username TEXT UNIQUE NOT NULL,
                          password TEXT NOT NULL,
                          firstname TEXT NULL,
                          lastname TEXT NULL,
                          birthday REAL NULL,
                          phone TEXT NULL,
                          ward_id INTEGER NULL,
                          district_id INTEGER NULL,
                          city_id INTEGER NULL,
                          status INTEGER NOT NULL,
                          FOREIGN  KEY (city_id) REFERENCES city(id),
                          FOREIGN  KEY (ward_id) REFERENCES ward(id),
                          FOREIGN  KEY (district_id) REFERENCES district(id))`;

        tx.executeSql(
            query,
            [],
            table_transaction_success('account'),
            transaction_fail
        );
    });
}

function fetch_database() {
    db.transaction(function (tx) {
        var query = `INSERT INTO category (name, description) VALUES (?, ?)`;

        tx.executeSql(query, ['Large Cake', "Cake is sold as a whole"], insert_transaction_success('Large Cake'), transaction_fail);
        tx.executeSql(query, ['Piece of Cake', "Cakes are cut into small pieces when sold"], insert_transaction_success('Piece of Cake'), transaction_fail);

        query = `INSERT INTO product (name, price, category_id, image) VALUES (?, ?, ?, ?)`;
        tx.executeSql(query, ['Chocolate', 20000, '2', '/img/menu/chocolate.jpg'], insert_transaction_success('Product 01'), transaction_fail);
        tx.executeSql(query, ['Cupcake', 20000, '1', '/img/menu/cupcake.jpg'], insert_transaction_success('Product 02'), transaction_fail);
        tx.executeSql(query, ['Tiramisu', 55000, '1', '/img/menu/menu-1.jpg'], insert_transaction_success('Product 03'), transaction_fail);
        tx.executeSql(query, ['Cheese Cake with Strawberry', 35000, '2', '/img/menu/cheesecakewithstrawberry.jpg'], insert_transaction_success('Product 04'), transaction_fail);
        tx.executeSql(query, ['Santa Cake', 120000, '1', '/img/menu/santa-cake.jpg'], insert_transaction_success('Product 05'), transaction_fail);
        tx.executeSql(query, ['Pancake', 45000, '1', '/img/menu/pancake.jpg'], insert_transaction_success('Product 06'), transaction_fail);
        tx.executeSql(query, ['Strawberry Cake', 35000, '2', '/img/menu/strawberrycake.jpg'], insert_transaction_success('Product 07'), transaction_fail);
        tx.executeSql(query, ['Oreo Cake', 120000, '1', '/img/menu/oreocake.jpg'], insert_transaction_success('Product 08'), transaction_fail);


        query = `INSERT INTO account (username, password, status) VALUES (?, ?, ?)`;
        tx.executeSql(query, ['dangkhoa0310', '123', 1], insert_transaction_success('dangkhoa0310'), transaction_fail);
    });
};

function insert_transaction_success(name) {
    log(`INFO`, `Insert ${name} successfully.`)
};

function table_transaction_success(table_name) {
    log(`INFO`, `Create table ${table_name} successfully.`)
};

function log(type, message) {
    var current_time = new Date();
    console.log(`${current_time} [${type}] ${message}`);
};

function transaction_fail(tx, error) {
    log(`ERROR`, `SQL Error ${error.code}: ${error.message}.`);
};
