const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function openDb() {
    return sqlite.open({
        filename: './reminderData.db',
        driver: sqlite3.Database
    });
}

async function setupDb() {
    const db = await openDb();
    await db.migrate({
        migrationsPath: './migrations', // This folder will store your migration files
        force: 'last',
    });
    return db;
}

async function addReminder(userId, remindDate, message) {
    const db = await openDb();
    const stmt = await db.prepare('INSERT INTO reminders (userId, remindDate, message) VALUES (?, ?, ?)');
    await stmt.run(userId, remindDate, message);
    await stmt.finalize();
}

async function getReminders() {
    const db = await openDb();
    return db.all('SELECT * FROM reminders WHERE remindDate <= ?', new Date().toISOString());
}

async function removeReminder(id) {
    const db = await openDb();
    await db.run('DELETE FROM reminders WHERE id = ?', id);
}

module.exports = { setupDb, addReminder, getReminders, removeReminder };