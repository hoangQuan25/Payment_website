const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
const PORT = 3000;
const DATABASE = 'cua_hang_banh_mi';
const USER = 'postgres';
const PASSWORD = 'sinhvien';

// Create database connection pool
const pool = new Pool({
    user: USER,
    host: 'localhost',
    database: DATABASE,
    password: PASSWORD,
    port: 5432,
});

// Set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile('/payment.html');
});

// Process payment
app.post('/process_payment', (req, res) => {
    const { employeeName, paymentData, totalCost } = req.body;

    // Retrieve the employee ID based on employee name
    pool.query('SELECT id FROM nhan_vien WHERE ten = $1', [employeeName], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else if (result.rows.length === 0) {
            res.status(400).send('Invalid employee name');
        } else {
            const employeeId = result.rows[0].id;

            // Insert the data into the hoa_don table
            pool.query(
                'INSERT INTO hoa_don (id_nhan_vien, thoi_gian_thanh_toan, tong_tien) VALUES ($1, NOW(), $2) RETURNING id_hoa_don',
                [employeeId, totalCost],
                (err, result) => {
                    if (err) {
                        console.error(err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        const billId = result.rows[0].id_hoa_don;

                        // Insert the data into the chi_tiet_hoa_don table
                        const query = 'INSERT INTO chi_tiet_hoa_don (id_hoa_don, id_san_pham, so_luong) VALUES ($1, $2, $3)';
                        paymentData.forEach((detail) => {
                            const { productName, quantity } = detail;
                            // Retrieve the product ID based on product name
                            pool.query('SELECT id FROM san_pham WHERE ten = $1', [productName], (err, result) => {
                                if (err) {
                                    console.error(err);
                                    res.status(500).send('Internal Server Error');
                                } else if (result.rows.length === 0) {
                                    console.error(`Invalid product name: ${productName}`);
                                } else {
                                    const productId = result.rows[0].id;
                                    // Insert the payment detail into the chi_tiet_hoa_don table
                                    pool.query(query, [billId, productId, quantity], (err) => {
                                        if (err) {
                                            console.error(err);
                                            res.status(500).send('Internal Server Error');
                                        }
                                    });
                                }
                            });
                        });

                        res.send(`Cap nhat du lieu thanh cong vao CSDL. ID hoa don: ${billId}`);
                    }
                }
            );
        }
    });
});

// ...

// Get product price
app.get('/get_product_price', (req, res) => {
    const productName = req.query.productName;

    // Retrieve the price from the 'san_pham' table based on the product name
    pool.query('SELECT gia FROM san_pham WHERE ten = $1', [productName], (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else if (result.rows.length === 0) {
            res.status(400).send(`Invalid product name: ${productName}`);
        } else {
            const price = result.rows[0].gia;
            res.json({ price });
        }
    });
});

// ...


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
