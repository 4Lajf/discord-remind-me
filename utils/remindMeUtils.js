function parseDuration(duration) {
    const result = { days: 0, hours: 0, minutes: 0 };
    const match = duration.match(/^(\d+)(d|h|m)$/);

    if (match) {
        const [, num, unit] = match;
        switch (unit) {
            case 'd' || 'day' || 'days':
                result.days = parseInt(num, 10);
                break;
            case 'h' || 'hour' || 'hours':
                result.hours = parseInt(num, 10);
                break;
            case 'm' || 'minute' || 'minutes':
                result.minutes = parseInt(num, 10);
                break;
        }
    } else if (duration === 'jutro') {
        result.days = 1;
    }

    return result;
}

function generateReminderDate(durationArg) {
    const { days, hours, minutes } = parseDuration(durationArg);
    const date = new Date();
    date.setDate(date.getDate() + days);
    date.setHours(date.getHours() + hours);
    date.setMinutes(date.getMinutes() + minutes);

    return date;
}

module.exports = { parseDuration, generateReminderDate };