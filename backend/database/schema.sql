-- Cloud kitchen ordering database schema
-- Run this once against your Postgres database to set up tables.
-- (npm run db:setup does this automatically from the backend folder.)

CREATE TABLE IF NOT EXISTS recipes (
    id             SERIAL PRIMARY KEY,
    name           TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    price          NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    category       TEXT NOT NULL DEFAULT 'Main',
    is_available   BOOLEAN NOT NULL DEFAULT true,
    image_url      TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
    id                 SERIAL PRIMARY KEY,
    customer_name      TEXT NOT NULL,
    customer_phone     TEXT NOT NULL,
    delivery_address   TEXT NOT NULL,
    notes              TEXT NOT NULL DEFAULT '',
    status             TEXT NOT NULL DEFAULT 'received'
                         CHECK (status IN ('received', 'preparing', 'out_for_delivery', 'delivered', 'cancelled')),
    total_amount       NUMERIC(10, 2) NOT NULL DEFAULT 0,
    sms_sent           BOOLEAN NOT NULL DEFAULT false,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id             SERIAL PRIMARY KEY,
    order_id       INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    recipe_id      INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
    recipe_name    TEXT NOT NULL,          -- snapshot, so history is intact even if a recipe is edited/removed later
    unit_price     NUMERIC(10, 2) NOT NULL,
    quantity       INTEGER NOT NULL CHECK (quantity > 0),
    line_total     NUMERIC(10, 2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- A few starter menu items so the site isn't empty on first run.
-- Edit these anytime from the /admin page once the app is running.
INSERT INTO recipes (name, description, price, category)
SELECT * FROM (VALUES
    ('Paneer Butter Masala', 'Paneer cubes simmered in a rich tomato-butter gravy, served with 2 rotis.', 180.00, 'Main'),
    ('Veg Biryani', 'Basmati rice layered with spiced mixed vegetables, served with raita.', 160.00, 'Main'),
    ('Chicken Curry', 'Home-style chicken curry with 2 rotis or a side of rice.', 220.00, 'Main'),
    ('Dal Tadka', 'Yellow lentils tempered with cumin and garlic, served with rice.', 120.00, 'Main'),
    ('Gulab Jamun (2 pcs)', 'Warm milk-solid dumplings soaked in cardamom sugar syrup.', 60.00, 'Dessert')
) AS seed(name, description, price, category)
WHERE NOT EXISTS (SELECT 1 FROM recipes);
