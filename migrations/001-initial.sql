CREATE TABLE reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    remindDate TEXT NOT NULL,
    message TEXT
);