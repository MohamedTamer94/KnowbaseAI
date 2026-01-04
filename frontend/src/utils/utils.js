export function formatDate(date) {
    if (!date) return '';
    if (!(date instanceof Date)) {
        date = new Date(date);
    }
    const formatted = new Intl.DateTimeFormat('en-UK', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
    return formatted;
}