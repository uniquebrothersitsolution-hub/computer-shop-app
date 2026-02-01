import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename) => {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Data');

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, `${filename}.xlsx`);
};

const formatDataForExport = (data, fields) => {
    return data.map(item => {
        const formatted = {
            'Date': new Date(item.date).toLocaleDateString('en-IN')
        };

        fields.forEach(field => {
            formatted[field.fieldName] = item[field.fieldName] || '-';
        });

        formatted['Entered By'] = item.enteredBy?.username || 'N/A';
        return formatted;
    });
};

export const exportDailyData = (allData, fields = []) => {
    // Get today's date at midnight for proper comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayData = allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= today && itemDate < tomorrow;
    });

    if (todayData.length === 0) {
        alert('No data available for today!');
        return;
    }

    const formattedData = fields.length > 0 ? formatDataForExport(todayData, fields) : todayData;
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Daily_Sales_${dateStr}`;
    exportToExcel(formattedData, filename);
};

export const exportMonthlyData = (allData, fields = []) => {
    // Get current month's start and end dates
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    monthEnd.setHours(23, 59, 59, 999);

    const monthData = allData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= monthStart && itemDate <= monthEnd;
    });

    if (monthData.length === 0) {
        alert('No data available for this month!');
        return;
    }

    const formattedData = fields.length > 0 ? formatDataForExport(monthData, fields) : monthData;
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[now.getMonth()];
    const year = now.getFullYear();
    const filename = `Monthly_Sales_${monthName}_${year}`;

    exportToExcel(formattedData, filename);
};

export const exportAllData = (allData, fields = []) => {
    if (allData.length === 0) {
        alert('No data available to export!');
        return;
    }

    const formattedData = fields.length > 0 ? formatDataForExport(allData, fields) : allData;
    const filename = `All_Sales_Data_${new Date().toISOString().split('T')[0]}`;
    exportToExcel(formattedData, filename);
};
