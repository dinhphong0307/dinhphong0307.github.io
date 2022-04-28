var db = window.openDatabase("NDKStore", "1.0", "NDK_Store", 200000);

window.onload = on_load;

function on_load() {
    update_cart_quantity();
    var account_id = localStorage.getItem("account_id");
    if (account_id != "") {
        login_success();
    } else {
        logout();
    }
};

function get_products() {
    db.transaction(function (tx) {
        var query = `SELECT * FROM product`;

        tx.executeSql(
            query,
            [],
            function (tx, result) {
                log(`INFO`, `Get a list of product successfully.`)
                show_product(result.rows);
            },
            transaction_fail
        );
    });
};

function show_product(products) {
    var product_list = document.getElementById("product-list");

    for (var product of products) {
        product_list.innerHTML += `<div class="product col-6 col-sm-12 col-lg-6 ">
                                        <div class="product-img">
                                            <img src="${product.image}" alt="Product $(product.ID)"></img>
                                        </div>
                                        <div class="product-caption">
                                            <div class="product-name"><strong>${product.name}</strong></div>
                                            <div class="product-price">${product.price} VND</div>

                                            <div class="text-end">
                                                <button onclick="add_to_cart(this.id)" id="${product.id}" class="btn-sm btn-footer">Add to Cart</button>
                                            </div>
                                        </div>
                                    </div>`;
    }
};

function add_to_cart(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `SELECT quantity FROM cart WHERE account_id = ? AND product_id = ?`;

        tx.executeSql(
            query,
            [account_id, product_id],
            function (tx, result) {
                if (result.rows[0]) {
                    update_cart_database(product_id, result.rows[0].quantity + 1);
                } else {
                    add_cart_database(product_id);
                }
            },
            transaction_fail
        );
    });

};

function add_cart_database(product_id) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `INSERT INTO cart (account_id, product_id, quantity) VALUES (?, ?, ?)`;
        tx.executeSql(
            query,
            [account_id, product_id, 1],
            function (tx, result) {
                log(`INFO`, `Insert cart successfully.`);
                update_cart_quantity();
            },
            transaction_fail
        );
    });
};

function update_cart_database(product_id, quantity) {
    var account_id = localStorage.getItem("account_id");

    db.transaction(function (tx) {
        var query = `UPDATE cart SET quantity = ? WHERE account_id = ? AND product_id = ?`;
        tx.executeSql(
            query,
            [quantity, account_id, product_id],
            function (tx, result) {
                log(`INFO`, `Update cart successfully.`);
                update_cart_quantity();
            },
            transaction_fail
        );
    });
};

function update_cart_quantity() {
    var account_id = localStorage.getItem("account_id")
    db.transaction(function (tx) {
        var query = `SELECT SUM(quantity) AS total_quantity FROM cart WHERE account_id = ?`;

        tx.executeSql(
            query,
            [account_id],
            function (tx, result) {
                if (result.rows[0].total_quantity) {
                    document.getElementById("cart-quantity").innerText = result.rows[0].total_quantity;
                } else {
                    document.getElementById("cart-quantity").innerText = 0;
                }
            },
            transaction_fail
        );
    });
};

var frm_login = document.getElementById("frm-login");

frm_login.onsubmit = login;

function login(e) {
    e.preventDefault();

    // Get value from <input>
    var username_login = document.getElementById("username").value;
    var password_login = document.getElementById("password").value;

    db.transaction(function (tx) {
        var query = `SELECT * FROM account WHERE username = ? AND password = ?`

        tx.executeSql(
            query,
            [username_login, password_login],
            function (tx, result) {
                if (result.rows[0]) {
                    $("#frm-login").modal("hide");
                    localStorage.setItem("account_id", result.rows[0].id);
                    localStorage.setItem("account_username", result.rows[0].username);
                    login_success();
                } else {

                    alert('Login failed');
                }
            },
            transaction_fail
        );
    });
};

function login_success() {
    var username = localStorage.getItem("account_username");
    var account_info = document.getElementById("account-info");
    account_info.innerHTML = `
                        <button class="btn ms-3 text-dark disabled">Hello ${username}</button>
                        <button onclick="logout()" id="btn-logout" class="btn btn-outline-dark ms-3">Logout</button>`;
};

function logout() {
    localStorage.setItem("account_id", "");
    localStorage.setItem("account_username", "");
    var account_info = document.getElementById("account-info");
    account_info.innerHTML = `
                        <button id="btn-login" class="btn btn-outline-dark" data-bs-toggle="modal"
                            data-bs-target="#frm-login">
                            Login
                        </button>`;
};

var frm_sign_up = document.getElementById("frm-signup");
frm_sign_up.onsubmit = register;

function register(e) {
    e.preventDefault();

    // Get input from user
    var username_signup = document.getElementById("username_signup").value;
    var password_signup = document.getElementById("password_signup").value;

    db.transaction(function (tx) {
        var query = "INSERT INTO account(username, password, status) VALUES (?,?,1)";

        tx.executeSql(query, [username_signup, password_signup], function (tx, result) {
            localStorage.setItem("account_id", result.rows.id);
            localStorage.setItem("account_username", result.rows.username);

            alert("Register successfully.")
        }, function (tx, error) {
            alert("Register failed, username already exists.")
            transaction_error;
        })
    });
}

function get_cart_list() {
    var account_id = localStorage.getItem("account_id");
    db.transaction(function (tx) {
        var query = `
                SELECT p.id, c.quantity, p.name, p.price
                FROM product p, cart c
                WHERE p.id = c.product_id AND c.account_id = ?`

        tx.executeSql(
            query,
            [account_id],
            function (tx, result) {
                log(`INFO`, `Get a list of products in cart successfully.`);
                show_cart_list(result.rows);
            },
            transaction_fail
        );
    });
};

function show_cart_list(products) {
    var total = 0;
    var cart_list = document.getElementById("cart-list");

    for (var product of products) {
        var amount = product.quantity * product.price;
        total += amount;
        cart_list.innerHTML += `<tr id="cart-list-item-${product.id}">
                                        <td></td>
                                        <td  class="text-start" id="cart-list-name-${product.id}">${product.name}</td>
                                        <td class="text-start" >${product.quantity}</td>
                                        <td class="text-start" >${product.price}</td>
                                        <td class="text-start" >${amount}</td>
                                        <td class="text-start">
                                            <button onclick="delete_cart_item(this.id)" id="${product.id}" class="btn-danger btn-sm">Delete</button>
                                        </td>
                                    </tr>`;
    };
    cart_list.innerHTML += `<tr>
                                <td><strong>Total</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td class="text-start"><strong>${total}</td>
                                <td></td>
                            </tr>`;
};

function delete_cart_item(product_id) {
    var account_id = localStorage.getItem("account_id");
    db.transaction(function (tx) {
        var query = `DELETE FROM cart WHERE account_id = ? AND product_id = ?`;

        tx.executeSql(
            query,
            [account_id, product_id],
            function (tx, result) {
                var product_row = document.getElementById(`cart-list-item-${product_id}`);
                var product_name = document.getElementById(`cart-list-name-${product_id}`);
                var message = `Delete ${product_name.innerText} successfully.`;

                product_row.outerHTML = "";

                log(`INFO`, message);
                alert(message);

                update_cart_quantity();
            },
            transaction_fail
        );
    });
};


