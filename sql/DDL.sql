CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Addresses (
    address_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Agents (
    user_id INTEGER PRIMARY KEY,
    job_title VARCHAR(100),
    agency VARCHAR(100),
    contact_info VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE ProspectiveRenters (
    user_id INTEGER PRIMARY KEY,
    move_in_date DATE,
    preferred_location VARCHAR(100),
    budget DECIMAL(10,2),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE CreditCards (
    credit_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    card_number VARCHAR(20) UNIQUE,
    exp_date DATE,
    name VARCHAR(100),
    address TEXT,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

CREATE TABLE Property (
    prop_id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(100),
    description TEXT,
    availability BOOLEAN DEFAULT TRUE,
    type VARCHAR(50)
);

CREATE TABLE House (
    prop_id INTEGER PRIMARY KEY,
    rooms INTEGER,
    sq_ft INTEGER,
    FOREIGN KEY (prop_id) REFERENCES Property(prop_id)
);

CREATE TABLE Apartment (
    prop_id INTEGER PRIMARY KEY,
    rooms INTEGER,
    sq_ft INTEGER,
    building_type VARCHAR(100),
    FOREIGN KEY (prop_id) REFERENCES Property(prop_id)
);

CREATE TABLE CommercialBuilding (
    prop_id INTEGER PRIMARY KEY,
    sq_ft INTEGER,
    business_type VARCHAR(100),
    FOREIGN KEY (prop_id) REFERENCES Property(prop_id)
);

CREATE TABLE Price (
    price_id SERIAL PRIMARY KEY,
    prop_id INTEGER NOT NULL,
    amount DECIMAL(10,2),
    FOREIGN KEY (prop_id) REFERENCES Property(prop_id)
);

CREATE TABLE Booking (
    book_id SERIAL PRIMARY KEY,
    prop_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    credit_id INTEGER NOT NULL,
    start DATE,
    "end" DATE,
    status VARCHAR(50),
    FOREIGN KEY (prop_id) REFERENCES Property(prop_id),
    FOREIGN KEY (user_id) REFERENCES ProspectiveRenters(user_id),
    FOREIGN KEY (credit_id) REFERENCES CreditCards(credit_id)
);

CREATE INDEX idx_property_availability ON Property(availability);
CREATE INDEX idx_property_type ON Property(type);
CREATE INDEX idx_property_city ON Property(city);
CREATE INDEX idx_booking_user ON Booking(user_id);
CREATE INDEX idx_creditcard_user ON CreditCards(user_id);