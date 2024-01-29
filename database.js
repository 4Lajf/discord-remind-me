const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function openRemiderDb() {
    return sqlite.open({
        filename: './reminderData.db',
        driver: sqlite3.Database
    });
}

async function openStarboardDb() {
    return sqlite.open({
        filename: './starboard.db',
        driver: sqlite3.Database
    });
}

async function setupDb() {
    const db = await openRemiderDb();
    await db.migrate({
        migrationsPath: './migrations', // This folder will store your migration files
        force: 'last',
    });
    return db;
}

async function addReminder(userId, remindDate, message) {
    const db = await openRemiderDb();
    const stmt = await db.prepare('INSERT INTO reminders (userId, remindDate, message) VALUES (?, ?, ?)');
    await stmt.run(userId, remindDate, message);
    await stmt.finalize();
}

async function getReminders() {
    const db = await openRemiderDb();
    return db.all('SELECT * FROM reminders WHERE remindDate <= ?', new Date().toISOString());
}

async function removeReminder(id) {
    const db = await openRemiderDb();
    await db.run('DELETE FROM reminders WHERE id = ?', id);
}

async function isMessageOnStarboard(messageId) {
    const db = await openStarboardDb();
    return db.all(`SELECT messageId FROM starred_messages WHERE messageId = ?`, messageId);
}

async function addStarredMessage(messageId, channelId, isStarred) {
    const db = await openStarboardDb();
    await db.run(`INSERT INTO starred_messages (messageId, channelId, starred) VALUES (?, ?, ?)`,
        [messageId, channelId, isStarred]);
}

module.exports = { setupDb, addReminder, getReminders, removeReminder, addStarredMessage, isMessageOnStarboard };